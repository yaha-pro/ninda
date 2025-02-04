# frozen_string_literal: true

class User < ActiveRecord::Base
  # :confirmable, :lockable, :timeoutable, :trackable
  extend Devise::Models
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :omniauthable
  include DeviseTokenAuth::Concerns::User

  # バリデーション
  validates :name, presence: true, uniqueness: true
  validates :email, presence: true, uniqueness: true
end
