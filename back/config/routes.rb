Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      mount_devise_token_auth_for 'User', at: 'auth', controllers: {
        registrations: 'api/v1/auth/registrations',
        sessions:      'api/v1/auth/sessions'
      }

      resource :user, only: [:show] # ユーザー情報取得のエンドポイント
    end
  end
end