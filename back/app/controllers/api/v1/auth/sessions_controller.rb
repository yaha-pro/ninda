class Api::V1::Auth::SessionsController < DeviseTokenAuth::SessionsController
  def index
    if current_user
      render json: {
        logged_in: true,
        user: current_user
      }
    else
      render json: {
        logged_in: false,
        message: "ユーザーが存在しません"
      }, status: :unauthorized
    end
  end
end
