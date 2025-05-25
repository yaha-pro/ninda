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
      SELECT *
      FROM (
        SELECT
          typing_games.post_id,
          typing_games.user_id,
          users.name AS user_name,
          typing_games.accuracy,
          typing_games.play_time,
          RANK() OVER (
            PARTITION BY typing_games.post_id
            ORDER BY typing_games.accuracy DESC, typing_games.play_time ASC
          ) AS rank
        FROM typing_games
        INNER JOIN users ON users.id = typing_games.user_id
        WHERE typing_games.post_id = #{ActiveRecord::Base.sanitize_sql(params[:post_id])}
      ) AS ranked
      WHERE rank <= 100
    SQL

    records = ActiveRecord::Base.connection.exec_query(ranking_sql)
    render json: records.to_a, status: :ok
  end

  private

  def typing_game_params
    params.require(:typing_game).permit(:post_id, :play_time, :accuracy, :mistake_count, :score)
  end
end