require "carrierwave/storage/abstract"
require "carrierwave/storage/file"
require "carrierwave/storage/fog"

CarrierWave.configure do |config|
  if ENV["USE_S3"] == "true"
    config.fog_provider = "fog/aws"
    config.fog_credentials = {
      provider: "AWS",
      aws_access_key_id: ENV["AWS_ACCESS_KEY_ID"],
      aws_secret_access_key: ENV["AWS_SECRET_ACCESS_KEY"],
      region: ENV["AWS_REGION"],
      path_style: true
    }
    config.fog_directory = ENV["AWS_S3_BUCKET"]
    config.fog_public = false
    config.storage = :fog
  else
    config.storage = :file
    config.enable_processing = !Rails.env.test? # テスト環境で加工を無効にする
  end
end
