class Api::V1::PostsController < ApplicationController
  before_action :authenticate_api_v1_user!, only: [:create, :update, :destroy]

  # 全投稿の取得
  def index
    posts = Post.includes(:likes, :user).all
    render json: posts.map { |post| post_response(post) }
  end

  # 特定の投稿を取得
  def show
    post = Post.includes(:likes, :user).find(params[:id])
    render json: post_response(post)
  end

  # 新規投稿の作成
  def create
    post = current_api_v1_user.posts.new(post_params)

    if post.save
      render json: { message: "Post created successfully", post: post_response(post) }, status: :created
    else
      render json: { errors: post.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # 投稿の更新
  def update
    post = current_api_v1_user.posts.find(params[:id])

    if post.update(post_params)
      render json: { message: "Post updated successfully", post: post_response(post) }, status: :ok
    else
      render json: { errors: post.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # 投稿の削除
  def destroy
    post = current_api_v1_user.posts.find(params[:id])

    if post
      post.destroy
      render json: { message: "Post deleted successfully" }, status: :ok
    else
      render json: { error: "Post not found or not authorized to delete" }, status: :not_found
    end
  end

  def upload_thumbnail
    post = current_api_v1_user.posts.find(params[:id])

    if post.update(thumbnail_image: params[:thumbnail_image])
      render json: { thumbnail_url: post.thumbnail_image.url }, status: :ok
    else
      render json: { error: "画像のアップロードに失敗しました" }, status: :unprocessable_entity
    end
  end

  private

  def post_params
    params.require(:post).permit(:title, :description, :display_text, :typing_text, :thumbnail_image, :remote_thumbnail_image_url)
  end
end
