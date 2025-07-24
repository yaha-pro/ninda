class ProfileImageUploader < CarrierWave::Uploader::Base
  include CarrierWave::MiniMagick

  # 画像ファイルの保存ディレクトリをモデルごとに整理
  def store_dir
    "uploads/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
  end

  # webpに変換することで軽量化
  process convert: "webp"

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
    "profile.webp" if original_filename
  end

  # S3に保存する際にACLの指定を外す
  def fog_attributes
    { "x-amz-acl" => nil }
  end
end
