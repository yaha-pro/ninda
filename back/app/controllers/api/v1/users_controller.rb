class Api::V1::UsersController < ApplicationController

  # ユーザー情報を取得
  def show
    user = User.find(params[:id])
    render json: user, status: :ok
  rescue ActiveRecord::RecordNotFound
    render json: { error: "ユーザーが見つかりません" }, status: :not_found
  end

  def index
    users = User.select(:id, :name, :profile_image, :total_play_count, :posts_count, :created_at).order(created_at: :desc)

    render json: users, status: :ok
  end
end
