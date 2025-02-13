require "test_helper"

class HealthControllerTest < ActionDispatch::IntegrationTest
  test "should get show" do
    get health_show_url
    assert_response :success
  end
end
