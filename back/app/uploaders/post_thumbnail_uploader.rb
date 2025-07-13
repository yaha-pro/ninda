class PostThumbnailUploader < CarrierWave::Uploader::Base
  include CarrierWave::MiniMagick

  # 画像ファイルの保存ディレクトリをモデルごとに整理
  def store_dir
    "uploads/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
  end

  # アップロード時の画像加工
  process resize_to_limit: [ 1280, 720 ]

  # 画像のEXIF情報など不要なメタデータを削除
  # process :strip

  # すべての画像をJPEG形式に統一（容量削減、互換性向上）
  # process convert: 'jpg'

  # Provide a default URL as a default if there hasn't been a file uploaded:
  # def default_url(*args)
  #   # For Rails 3.1+ asset pipeline compatibility:
  #   # ActionController::Base.helpers.asset_path("fallback/" + [version_name, "default.png"].compact.join('_'))
  #
  #   "/images/fallback/" + [version_name, "default.png"].compact.join('_')
  # end

  # Process files as they are uploaded:
  # process scale: [200, 300]
  #
  # def scale(width, height)
  #   # do something
  # end

  # 一覧表示用の軽量サムネイル版
  version :thumb do
    process resize_to_fill: [ 320, 180 ]
  end

  # アップロード可能なファイル拡張子を制限
  def extension_allowlist
    %w[jpg jpeg gif png]
  end

  # アップロード可能なファイルサイズの範囲を制限
  def size_range
    1.byte..2.megabytes
  end

  # 保存時のファイル名を固定
  def filename
    "profile.jpg" if original_filename
  end
end
