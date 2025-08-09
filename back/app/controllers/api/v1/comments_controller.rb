class Api::V1::CommentsController < ApplicationController
  before_action :authenticate_api_v1_user!
  before_action :set_post, only: [:index, :create]
  before_action :set_comment, only: [:update, :destroy]

  # コメント一覧
  def index
    comments = @post.comments.includes(:user).order(created_at: :desc)
    render json: comments, include: { user: { only: [:id, :name] } }
  end

  # コメント作成
  def create
    comment = @post.comments.build(comment_params.merge(user: current_api_v1_user))
    if comment.save
      render json: comment, status: :created
    else
      render json: { errors: comment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # コメント更新
  def update
    if @comment.user == current_api_v1_user && @comment.update(comment_params)
      render json: @comment
    else
      render json: { error: "権限がありません" }, status: :forbidden
    end
  end

  # コメント削除
  def destroy
    if @comment.user == current_api_v1_user && @comment.destroy
      head :no_content
    else
      render json: { error: "権限がありません" }, status: :forbidden
    end
  end

  private

  def set_post
    @post = Post.find(params[:post_id])
  end

  def set_comment
    @comment = Comment.find(params[:id])
  end

  def comment_params
    params.require(:comment).permit(:content)
  end
end
