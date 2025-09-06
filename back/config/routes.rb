Rails.application.routes.draw do
  get "health/show"
  namespace :api do
    namespace :v1 do
      mount_devise_token_auth_for "User", at: "auth", controllers: {
        registrations: "api/v1/auth/registrations",
        sessions: "api/v1/auth/sessions"
      }

      devise_scope :api_v1_user do
        namespace :auth do
          resources :sessions, only: %i[index]

          # Googleログイン用のAPIエンドポイント
          post "google", to: "google#callback"
        end
      end

      # マイページのエンドポイント
      get "mypage/posts", to: "mypage#posts"
      get "mypage/typing_results", to: "mypage#typing_results"
      get "mypage/liked_posts", to: "mypage#liked_posts"
      put "mypage/profile_image", to: "mypage#update_profile_image"

      # ユーザー情報取得のエンドポイント
      resources :users, only: [ :show, :index ] do
        member do
          get "posts", to: "users#posts"
          get "user_typing_results", to: "users#user_typing_results"
          get "liked_posts", to: "users#liked_posts"
        end
      end

      # 投稿のエンドポイント
      resources :posts, only: [ :index, :show, :create, :update, :destroy ] do
        member do
          post "upload_thumbnail", to: "posts#upload_thumbnail"
        end

        # likeのエンドポイント
        resource :like, only: [ :create, :destroy ] do
          get :users, on: :collection
        end

        # commentのエンドポイント
        resources :comments, only: [:index, :create]
      end

      # commentの更新と削除
      resources :comments, only: [:update, :destroy]

      # タイピングゲームのエンドポイント
      resources :typing_games, only: [ :index, :create ] do
        collection do
          get "ranking", to: "typing_games#ranking"
          get "pseudo_rank", to: "typing_games#pseudo_rank"
        end
      end
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
