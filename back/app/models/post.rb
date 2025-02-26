class Post < ApplicationRecord
  belongs_to :user
  has_many :typing_games, dependent: :destroy

  validates :title, presence: true, length: { maximum: 40 }
  validates :description, length: { maximum: 500 }, allow_blank: true
  validates :display_text, length: { maximum: 50 }
  validates :typing_text, presence: true
  validates :thumbnail_image, format: { with: URI::DEFAULT_PARSER.make_regexp, allow_blank: true }
end
