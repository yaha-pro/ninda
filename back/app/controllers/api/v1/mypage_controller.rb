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
  def update_profile_image
    if current_api_v1_user.update(profile_image_params)
      render json: { profile_image_url: current_api_v1_user.profile_image.url }, status: :ok
    else
      render json: { errors: current_api_v1_user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def profile_image_params
    params.require(:user).permit(:profile_image)
  end
end
