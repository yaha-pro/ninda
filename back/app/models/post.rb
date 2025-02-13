class Post < ApplicationRecord
  belongs_to :user

  validates :title, presence: true, length: { maximum: 40 }
  validates :description, length: { maximum: 500 }, allow_blank: true
  validates :display_text, length: { maximum: 500 }
  validates :typing_text, presence: true
  validates :thumbnail_image, format: { with: URI::DEFAULT_PARSER.make_regexp, allow_blank: true }
end
