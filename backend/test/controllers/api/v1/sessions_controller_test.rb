require "test_helper"

class SessionsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.create!(name: "Test User", email: "test@example.com", password: "password123", password_confirmation: "password123", role: :student)
  end

  test "should login with valid credentials" do
    post api_v1_login_url, params: { email: @user.email, password: "password123" }
    assert_response :success
    assert_includes @response.body, @user.email
  end

  test "should not login with invalid credentials" do
    post api_v1_login_url, params: { email: @user.email, password: "wrongpassword" }
    assert_response :unauthorized
    assert_includes @response.body, "Invalid email or password"
  end

  test "should not login with missing email" do
    post api_v1_login_url, params: { password: "password123" }
    assert_response :unauthorized
    assert_includes @response.body, "Invalid email or password"
  end

  test "should not login with missing password" do
    post api_v1_login_url, params: { email: @user.email }
    assert_response :unauthorized
    assert_includes @response.body, "Invalid email or password"
  end

  test "should not login with non-existent user" do
    post api_v1_login_url, params: { email: "nouser@example.com", password: "password123" }
    assert_response :unauthorized
    assert_includes @response.body, "Invalid email or password"
  end

  test "should show current user when logged in" do
    post api_v1_login_url, params: { email: @user.email, password: "password123" }
    get api_v1_me_url
    assert_response :success
    assert_includes @response.body, @user.email
  end

  test "should not show current user when not logged in" do
    get api_v1_me_url
    assert_response :unauthorized
    assert_includes @response.body, "Not logged in"
  end

  test "should logout user" do
    post api_v1_login_url, params: { email: @user.email, password: "password123" }
    delete api_v1_logout_url
    assert_response :success
    assert_includes @response.body, "Logged out"
  end

  test "should logout when not logged in" do
    delete api_v1_logout_url
    assert_response :success
    assert_includes @response.body, "Logged out"
  end

  test "should persist session across requests" do
    post api_v1_login_url, params: { email: @user.email, password: "password123" }
    assert_response :success
    get api_v1_me_url
    assert_response :success
    assert_includes @response.body, @user.email
  end

  test "should switch session between users" do
    user2 = User.create!(name: "Other User", email: "other@example.com", password: "otherpass", password_confirmation: "otherpass", role: :teacher)
    post api_v1_login_url, params: { email: @user.email, password: "password123" }
    assert_response :success
    post api_v1_login_url, params: { email: user2.email, password: "otherpass" }
    assert_response :success
    get api_v1_me_url
    assert_response :success
    assert_includes @response.body, user2.email
  end
end
