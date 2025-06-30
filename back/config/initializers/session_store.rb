if Rails.env.production?
  Rails.application.config.session_store :cookie_store, key: "_ninda_session", expire_after: 2.weeks
else
  Rails.application.config.session_store :cookie_store, key: "_ninda_session", domain: "localhost"
end
