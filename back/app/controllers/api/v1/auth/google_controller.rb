class Api::V1::Auth::GoogleController < ApplicationController
  # devise_token_auth を利用するので token を返す
  # ログイン不要
  skip_before_action :authenticate_api_v1_user!

  def callback
    id_token = params[:id_token]

    validator = GoogleIDToken::Validator.new
    begin
      payload = validator.check(id_token, ENV['GOOGLE_CLIENT_ID'])
    rescue GoogleIDToken::ValidationError => e
      return render json: { error: "Invalid ID token: #{e}" }, status: :unauthorized
    end

    # Googleから取得できるユーザー情報
    google_uid = payload['sub']
    email = payload['email']
    name  = payload['name']
    image = payload['picture']

    # provider と uid を使ってユーザーを検索 or 作成
    user = User.find_or_initialize_by(provider: "google_oauth2", uid: google_uid)
    if user.new_record?
      user.email = email
      user.name  = name
      user.profile_image = image
      user.password = Devise.friendly_token[0, 20] # ランダムパスワード
      user.save!
    end

    # devise_token_auth のトークンを発行
    token = user.create_new_auth_token

    render json: {
      data: user,
      token: token
    }, status: :ok
  end
end