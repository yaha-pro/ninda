class HealthController < ApplicationController
  def show
    render json: { status: 'UP' }, status: :ok
  end
end
