class Api::V1::UsersController < ApplicationController
  before_action :authenticate_api_v1_user! # ログインユーザーのみアクセス可能

  # ユーザー情報を取得
  def show
    user = User.find(params[:id])
    render json: user, status: :ok
  rescue ActiveRecord::RecordNotFound
    render json: { error: "ユーザーが見つかりません" }, status: :not_found
  end
end
