class Api::V1::UsersController < ApplicationController
  before_action :authenticate_api_v1_user! # ログインユーザーのみアクセス可能

  # ユーザー情報を取得
  def show
    Rails.logger.info "current_api_v1_user: #{current_api_v1_user.inspect}"
    user = User.find_by(id: params[:id])

    if user
      render json: user, status: :ok
    else
      render json: { errors: ["ユーザーが見つかりません"] }, status: :not_found
    end
  end
end
