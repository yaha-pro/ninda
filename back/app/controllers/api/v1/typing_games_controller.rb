class Api::V1::TypingGamesController < ApplicationController
  before_action :authenticate_api_v1_user!, only: [:create]

  def index
    @typing_games = TypingGame.all
    render json: @typing_games
  end

  def create
    @typing_game = TypingGame.new(typing_game_params)
    @typing_game.user = current_api_v1_user

    if @typing_game.save
      render json: @typing_game, status: :created
    else
      render json: @typing_game.errors, status: :unprocessable_entity
    end
  end

  def ranking
    post_id = params[:post_id]
    unless post_id.present?
      render json: { error: "post_id is required" }, status: :bad_request and return
    end

    ranking_sql = ActiveRecord::Base.send(:sanitize_sql_array, [<<-SQL, post_id])
      SELECT
        ranked.post_id,
        ranked.user_id,
        ranked.user_name,
        ranked.accuracy,
        ranked.play_time,
        RANK() OVER (
          ORDER BY ranked.accuracy DESC, ranked.play_time ASC
        ) AS rank
      FROM (
        SELECT DISTINCT ON (tg.user_id)
          tg.post_id,
          tg.user_id,
          u.name AS user_name,
          tg.accuracy,
          tg.play_time
        FROM typing_games tg
        INNER JOIN users u ON u.id = tg.user_id
        WHERE tg.post_id = ?
        ORDER BY tg.user_id, tg.accuracy DESC, tg.play_time ASC
      ) AS ranked
      LIMIT 100
    SQL

    records = ActiveRecord::Base.connection.exec_query(ranking_sql)
    render json: records.to_a, status: :ok
  end

  # プレイ後のランキング／プレイトータル人数を取得
  def my_rank
    typing_game_id = params[:typing_game_id]
    unless typing_game_id.present?
      render json: { error: "typing_game_id is required" }, status: :bad_request and return
    end

    game = TypingGame.find_by(id: typing_game_id)
    unless game
      render json: { error: "Typing game not found" }, status: :not_found and return
    end

    post_id = game.post_id
    user_id = game.user_id

    ranking_sql = <<-SQL
      WITH ranked AS (
        SELECT
          tg.user_id,
          tg.post_id,
          MAX(tg.accuracy) AS accuracy,
          MIN(tg.play_time) AS play_time
        FROM typing_games tg
        WHERE tg.post_id = $1
        GROUP BY tg.user_id, tg.post_id
      ),
      ranked_with_order AS (
        SELECT
          *,
          RANK() OVER (ORDER BY accuracy DESC, play_time ASC) AS rank
        FROM ranked
      )
      SELECT
        r.rank,
        r.accuracy,
        r.play_time,
        (SELECT COUNT(*) FROM ranked) AS total_players
      FROM ranked_with_order r
      WHERE r.user_id = $2
      LIMIT 1
    SQL

    records = ActiveRecord::Base.connection.exec_query(
      ranking_sql,
      "SQL for my_rank",
      [[nil, post_id], [nil, user_id]]
    )

    record = records.first

    if record
      render json: record, status: :ok
    else
      render json: { error: "Ranking not found" }, status: :not_found
    end
  end

  private

  def typing_game_params
    params.require(:typing_game).permit(:post_id, :play_time, :accuracy, :mistake_count, :score)
  end
end