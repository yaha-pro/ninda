class Api::V1::LikesController < ApplicationController
  before_action :authenticate_api_v1_user!
  before_action :set_post

  # 投稿にいいねしているユーザーの一覧を取得
  def users
    users = @post.likes.includes(:user).map(&:user).map do |user|
      {
        id: user.id,
        name: user.name,
        profile_image: user.profile_image
      }
    end
    render json: users, status: :ok
  end

  # 投稿にいいねする
  def create
    like = current_api_v1_user.likes.build(post: @post)

    if like.save
      render json: { success: true, likes_count: @post.reload.likes_count }
    else
      render json: { success: false, message: like.errors.full_messages.join(", "), likes_count: @post.likes_count }, status: :unprocessable_entity
    end
  end

  # 投稿からいいねを外す
  def destroy
    like = current_api_v1_user.likes.find_by(post: @post)

    if like
      like.destroy
      render json: { success: true, likes_count: @post.reload.likes_count }
    else
      render json: { success: false, message: "いいねが見つかりません" }, status: :not_found
    end
  end

  private

  def set_post
    @post = Post.find(params[:post_id])
  end
end
