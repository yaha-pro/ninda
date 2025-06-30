Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins "http://127.0.0.1:4000",
            "http://localhost:4000",
            "https://ninda.vercel.app"

    resource "*",
      headers: :any,
      expose: [ "access-token", "expiry", "token-type", "uid", "client" ],
      methods: [ :get, :post, :put, :patch, :delete, :options, :head ],
      credentials: true
  end
end
