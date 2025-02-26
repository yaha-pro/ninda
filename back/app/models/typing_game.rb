class TypingGame < ApplicationRecord
  belongs_to :user
  belongs_to :post

  validates :play_time, presence: true, numericality: { greater_than: 0 }
  validates :accuracy, presence: true, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 100 }
  validates :mistake_count, presence: true, numericality: { greater_than_or_equal_to: 0 }
end
