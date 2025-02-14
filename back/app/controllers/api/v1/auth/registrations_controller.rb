class Api::V1::Auth::RegistrationsController < DeviseTokenAuth::RegistrationsController
  skip_before_action :set_user, only: [:create]
  private

  def sign_up_params
    params.permit(:email, :password, :password_confirmation, :name, :bio)
  end

  def account_update_params
    params.permit(:email, :password, :password_confirmation, :name, :bio)
  end
end
