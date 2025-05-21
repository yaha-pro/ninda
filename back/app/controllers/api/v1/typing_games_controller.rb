class Api::V1::TypingGamesController < ApplicationController
  before_action :authenticate_api_v1_user!, only: [:create, :user_results]

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

  private

  def typing_game_params
    params.require(:typing_game).permit(:post_id, :play_time, :accuracy, :mistake_count, :score)
  end
end