# frozen_string_literal: true

class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  include DeviseTokenAuth::Concerns::User

  has_many :posts, dependent: :destroy # ユーザーが削除されたら、関連する投稿も削除
  has_many :typing_games, dependent: :destroy # ユーザーが削除されたら、タイピング成績も削除
  has_many :likes, dependent: :destroy # ユーザーが削除されたら、いいねも削除
  has_many :liked_posts, through: :likes, source: :post # いいねした投稿
  has_many :comments, dependent: :destroy # ユーザーが削除されたら、コメントも削除

  # プロフィール画像のアップローダー
  mount_uploader :profile_image, ProfileImageUploader

  # バリデーション
  validates :name, presence: true, uniqueness: true
  validates :email, presence: true, uniqueness: true
  validates :bio, length: { maximum: 500 }, allow_blank: true

  # コールバック
  before_destroy :remove_profile_image_file
  before_update  :remember_old_profile_image
  after_update   :remove_old_profile_image

  private

  # アカウント削除時にプロフィール画像を削除
  def remove_profile_image_file
    profile_image.remove!
  rescue => e
    Rails.logger.error("Failed to remove profile image on destroy: #{e.message}")
  end

  # プロフィール画像更新前に古いファイルを保持
  def remember_old_profile_image
    @old_profile_image = profile_image if saved_change_to_profile_image?
  end

  # 更新後に古いファイルを削除
  def remove_old_profile_image
    @old_profile_image.remove! if @old_profile_image && @old_profile_image != profile_image
  rescue => e
    Rails.logger.error("Failed to remove old profile image: #{e.message}")
  end
end
