require_relative "boot"

require "rails/all"

Bundler.require(*Rails.groups)

module App
  class Application < Rails::Application
    config.load_defaults 7.2
    config.autoload_lib(ignore: %w[assets tasks])
    config.api_only = true
    config.time_zone = "Tokyo"
    config.active_record.default_timezone = :local
    config.i18n.default_locale = :ja
    config.i18n.available_locales = [:en, :ja]
  end
end
