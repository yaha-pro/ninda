class Api::V1::UsersController < ApplicationController
  # ユーザー情報を取得
  def show
    user = User.find(params[:id])
    render json: user, status: :ok
  rescue ActiveRecord::RecordNotFound
    render json: { error: "ユーザーが見つかりません" }, status: :not_found
  end

  # 全ユーザー情報を取得
  def index
    users = User.select(:id, :name, :profile_image, :bio, :total_play_count, :posts_count, :created_at).order(created_at: :desc)

    render json: users, status: :ok
  end

  # ユーザーの投稿を取得
  def posts
    user = User.find_by(id: params[:id])

    if user
      posts = user.posts.includes(:likes).order(created_at: :desc)
      render json: posts.map { |post| post_response(post) }, status: :ok
    else
      render json: { error: "User not found" }, status: :not_found
    end
  end

  # ユーザーのタイピング結果を取得
  def user_typing_results
    user = User.find_by(id: params[:id])

    if user
      typing_results = TypingGame
        .select("DISTINCT ON (post_id) *")
        .where(user_id: user.id)
        .order("post_id, accuracy DESC, play_time ASC")

      render json: typing_results, status: :ok
    else
      render json: { error: "User not found" }, status: :not_found
    end
  end

  # ユーザーのいいねした投稿を取得
  def liked_posts
    user = User.find_by(id: params[:id])

    if user
      posts = user.likes.includes(post: :likes).map(&:post)
      render json: posts.map { |post| post_response(post) }, status: :ok
    else
      render json: { error: "User not found" }, status: :not_found
    end
  end
end
