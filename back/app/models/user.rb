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

  # プロフィール画像のアップローダー
  mount_uploader :profile_image, ProfileImageUploader

  # バリデーション
  validates :name, presence: true, uniqueness: true
  validates :email, presence: true, uniqueness: true
  validates :bio, length: { maximum: 500 }, allow_blank: true
end
