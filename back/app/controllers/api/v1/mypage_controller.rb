class Api::V1::MypageController < ApplicationController
  before_action :authenticate_api_v1_user!

  def typing_results
    @typing_games = TypingGame
      .select("DISTINCT ON (post_id) *")
      .where(user_id: current_api_v1_user.id)
      .order("post_id, accuracy DESC, play_time ASC")

    render json: @typing_games
  end
  def posts
    @posts = current_api_v1_user.posts.order(created_at: :desc)
    render json: @posts
  end
end
