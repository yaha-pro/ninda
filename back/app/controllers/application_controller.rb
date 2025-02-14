class ApplicationController < ActionController::API
  before_action :set_user, except: [:create]
  include DeviseTokenAuth::Concerns::SetUserByToken

  private

  def set_user
    @user = current_api_v1_user
    Rails.logger.info "current_api_v1_user: #{current_api_v1_user.inspect}"
    Rails.logger.info "Set user: #{@user.inspect}"
    if @user.nil?
      render json: { error: '認証されていません' }, status: :unauthorized
    end
  end
end
