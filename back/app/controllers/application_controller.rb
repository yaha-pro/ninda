class ApplicationController < ActionController::API
  before_action :set_user_if_authenticated
  include DeviseTokenAuth::Concerns::SetUserByToken

  private

  def set_user_if_authenticated
    if current_api_v1_user
      set_user
    else
      Rails.logger.info "ユーザーは認証されていません"
    end
  end

  def set_user
    @user = current_api_v1_user
    Rails.logger.info "current_api_v1_user: #{current_api_v1_user.inspect}"
    Rails.logger.info "Set user: #{@user.inspect}"
    if @user.nil?
      render json: { error: '認証されていません' }, status: :unauthorized
    end
  end
end
