class Api::V1::UsersController < ApplicationController

  # ユーザー情報を取得
  def show
    user = User.find(params[:id])
    render json: user, status: :ok
  rescue ActiveRecord::RecordNotFound
    render json: { error: "ユーザーが見つかりません" }, status: :not_found
  end

  def index
    users = User.select(:id, :name, :profile_image, :bio, :total_play_count, :posts_count, :created_at).order(created_at: :desc)

    render json: users, status: :ok
  end

  def posts
    puts "Requested User ID: #{params[:id]}" # ログ確認
    user = User.find_by(id: params[:id])

    if user
      posts = user.posts.order(created_at: :desc) # 最新の投稿を先に表示
      render json: posts, status: :ok
    else
      render json: { error: "User not found" }, status: :not_found
    end
  end

  def user_typing_results
    user = User.find_by(id: params[:id])

    if user
      typing_results = TypingGame
        .select('DISTINCT ON (post_id) *')
        .where(user_id: user.id)
        .order('post_id, accuracy DESC, play_time ASC')

      render json: typing_results, status: :ok
    else
      render json: { error: "User not found" }, status: :not_found
    end
  end
end
