# frozen_string_literal: true

class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  include DeviseTokenAuth::Concerns::User

  # バリデーション
  validates :name, presence: true, uniqueness: true
  validates :email, presence: true, uniqueness: true
  validates :bio, length: { maximum: 500 }, allow_blank: true
end
