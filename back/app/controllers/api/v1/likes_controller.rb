class Api::V1::LikesController < ApplicationController
  before_action :authenticate_api_v1_user!

  # 投稿にいいねしているユーザーの一覧を取得
  def index
    post = Post.find(params[:post_id])
    users = post.likes.includes(:user).map(&:user)
    render json: users, status: :ok
  end

  # 投稿にいいねする
  def create
    post = Post.find(params[:post_id])
    like = current_api_v1_user.likes.build(post: post)

    if like.save
      render json: { success: true, likes_count: post.reload.likes_count }
    else
      render json: { success: false, message: like.errors.full_messages.join(", "), likes_count: post.likes_count }, status: :unprocessable_entity
    end
  end

  # 投稿からいいねを外す
  def destroy
    post = Post.find(params[:post_id])
    like = current_api_v1_user.likes.find_by(post: post)

    if like
      like.destroy
      render json: { success: true, likes_count: post.reload.likes_count }
    else
      render json: { success: false, message: "いいねが見つかりません" }, status: :not_found
    end
  end
end
