class Post < ApplicationRecord
  belongs_to :user
  
  has_many :typing_games, dependent: :destroy # 削除時に関連するタイピングゲームも同時に削除
  has_many :likes, dependent: :destroy # 削除時に関連するいいねも同時に削除
  has_many :liked_users, through: :likes, source: :user # いいねしたユーザーを取得

  validates :title, presence: true, length: { maximum: 40 }
  validates :description, length: { maximum: 500 }, allow_blank: true
  validates :display_text, length: { maximum: 50 }
  validates :typing_text, presence: true

  mount_uploader :thumbnail_image, PostThumbnailUploader

  # コールバック
  before_destroy :remove_thumbnail_file # 投稿削除時にサムネイルファイルも削除
  before_update  :remember_old_thumbnail # サムネイル変更前に古いファイルのパスを記憶
  after_update   :remove_old_thumbnail # サムネイル変更後に古いファイルを削除

  # 投稿削除時にサムネイル画像をストレージから削除
  def remove_thumbnail_file
    thumbnail_image.remove!
  rescue => e
    Rails.logger.error("Failed to remove thumbnail on destroy: #{e.message}")
  end

  private

  # サムネイル画像が更新される場合、旧ファイルをインスタンス変数で保持
  def remember_old_thumbnail
    @old_thumbnail = thumbnail_image if saved_change_to_thumbnail_image?
  end

  # サムネイル画像更新後、古いファイルを削除（現サムネイルと異なる場合のみ）
  def remove_old_thumbnail
    @old_thumbnail.remove! if @old_thumbnail && @old_thumbnail != thumbnail_image
  rescue => e
    Rails.logger.error("Failed to remove old thumbnail: #{e.message}")
  end
end
