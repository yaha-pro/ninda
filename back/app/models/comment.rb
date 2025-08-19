class Comment < ApplicationRecord
  belongs_to :user
  belongs_to :post, counter_cache: true  # comments_count自動更新
  validates :content, presence: true
end
