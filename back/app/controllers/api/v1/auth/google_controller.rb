class Api::V1::Auth::GoogleController < ApplicationController
  skip_before_action :authenticate_api_v1_user!, raise: false

  def callback
    id_token = params[:id_token]
    if id_token.blank?
      return render json: { error: 'IDトークンがありません' }, status: :unprocessable_entity
    end

    # 署名検証
    validator = GoogleIDToken::Validator.new
    begin
      payload = validator.check(id_token, ENV['GOOGLE_CLIENT_ID'])
    rescue GoogleIDToken::ValidationError => e
      return render json: { error: "Invalid ID token: #{e}" }, status: :unauthorized
    end

    # 署名が正しい、かつaud(client_id)も正しい時だけ通過

    # 必要な情報をpayloadから直接抜き出す
    google_uid = payload['sub']
    email      = payload['email']
    name       = payload['name']
    image      = payload['picture']

    # provider, uidでユーザー検索・作成
    user = User.find_or_initialize_by(provider: "google_oauth2", uid: google_uid)
    if user.new_record?
      user.email = email
      user.name  = name
      user.profile_image = image
      user.password = Devise.friendly_token[0, 20]
      user.save!
    end

    token = user.create_new_auth_token
    response.headers.merge!(token)

    render json: {
      data: user,
      token: token
    }, status: :ok
  end
end