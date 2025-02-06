class Api::V1::UsersController < ApplicationController
  before_action :authenticate_api_v1_user! # ログインユーザーのみアクセス可能
  before_action :set_user, only: [:show]

  # ログイン中のユーザー情報を返す
  def show
    render json: { user: @user }
  end

  private

  # 現在のログインユーザーをセット
  def set_user
    @user = current_api_v1_user
  end
end
