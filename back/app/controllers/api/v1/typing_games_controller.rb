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

    ranking_sql = <<-SQL
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
        WHERE tg.post_id = #{ActiveRecord::Base.sanitize_sql(params[:post_id])}
        ORDER BY tg.user_id, tg.accuracy DESC, tg.play_time ASC
      ) AS ranked
      LIMIT 100
    SQL

    records = ActiveRecord::Base.connection.exec_query(ranking_sql)
    render json: records.to_a, status: :ok
  end

  private

  def typing_game_params
    params.require(:typing_game).permit(:post_id, :play_time, :accuracy, :mistake_count, :score)
  end
end