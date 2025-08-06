class Api::V1::MypageController < ApplicationController
  before_action :authenticate_api_v1_user!

  # 自分のタイピング結果を取得
  def typing_results
    @typing_games = TypingGame
      .select("DISTINCT ON (post_id) *")
      .where(user_id: current_api_v1_user.id)
      .order("post_id, accuracy DESC, play_time ASC")

    render json: @typing_games
  end

  # 自分の投稿を取得
  def posts
    posts = current_api_v1_user.posts.includes(:likes)
    render json: posts.map { |post| post_response(post) }, status: :ok
  end

  # いいねした投稿を取得
  def liked_posts
    posts = current_api_v1_user.likes.includes(post: [ :user, :likes ]).map(&:post)
    render json: posts.map { |post| post_response(post) }, status: :ok
  end

  # 自分のプロフィール画像を更新
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
