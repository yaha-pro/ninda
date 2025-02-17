Rails.application.routes.draw do
  get "health/show"
  namespace :api do
    namespace :v1 do
      mount_devise_token_auth_for 'User', at: 'auth', controllers: {
        registrations: 'api/v1/auth/registrations',
        sessions: 'api/v1/auth/sessions'
      }

      devise_scope :api_v1_user do
        namespace :auth do
          resources :sessions, only: %i[index]
        end
      end

      resources :users, only: [:show] # ユーザー情報取得のエンドポイント
      resources :posts, only: [:index, :show, :create, :update, :destroy]

    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
