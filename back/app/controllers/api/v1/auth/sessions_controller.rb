class Api::V1::Auth::SessionsController < DeviseTokenAuth::SessionsController
  skip_before_action :set_user, only: [:create]

  def index
    if current_api_v1_user
      render json: {
        logged_in: true,
        user: current_api_v1_user
      }
    else
      render json: {
        logged_in: false,
        message: "ユーザーが存在しません"
      }, status: :unauthorized
    end
  end
end
