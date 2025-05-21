class Api::V1::MypageController < ApplicationController
  before_action :authenticate_api_v1_user!

  def typing_results
    @typing_games = current_api_v1_user.typing_games
    render json: @typing_games
  end
end
