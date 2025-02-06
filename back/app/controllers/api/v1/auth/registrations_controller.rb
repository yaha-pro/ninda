class Api::V1::Auth::RegistrationsController < DeviseTokenAuth::RegistrationsController
  private

  def sign_up_params
    params.require(:registration).permit(:email, :password, :password_confirmation, :name, :bio)
  end

  def account_update_params
    params.require(:registration).permit(:email, :password, :password_confirmation, :name, :bio)
  end
end
