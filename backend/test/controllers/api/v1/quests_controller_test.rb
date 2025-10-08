require "test_helper"

class Api::V1::QuestsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.create!(name: "Test User", email: "test@example.com", password: "password123", password_confirmation: "password123", role: :student)
    @quest = Quest.create!(title: "Test Quest", description: "A quest for testing.")
  end

  test "should not allow unauthenticated access to index" do
    get api_v1_quests_url
    assert_response :unauthorized
    assert_includes @response.body, "Not authorized"
  end

  test "should allow authenticated access to index" do
    post api_v1_login_url, params: { email: @user.email, password: "password123" }
    get api_v1_quests_url
    assert_response :success
    assert_includes @response.body, @quest.title
  end

  test "should not allow unauthenticated access to show" do
    get api_v1_quest_url(@quest)
    assert_response :unauthorized
    assert_includes @response.body, "Not authorized"
  end

  test "should allow authenticated access to show" do
    post api_v1_login_url, params: { email: @user.email, password: "password123" }
    get api_v1_quest_url(@quest)
    assert_response :success
    assert_includes @response.body, @quest.title
  end

  test "should not allow unauthenticated quest creation" do
    post api_v1_quests_url, params: { quest: { title: "New Quest", description: "Should fail." } }
    assert_response :unauthorized
    assert_includes @response.body, "Not authorized"
  end

  test "should allow authenticated quest creation" do
    post api_v1_login_url, params: { email: @user.email, password: "password123" }
    post api_v1_quests_url, params: { quest: { title: "New Quest", description: "Should succeed." } }
    assert_response :created
    assert_includes @response.body, "New Quest"
  end

  test "should not create quest with invalid params" do
    post api_v1_login_url, params: { email: @user.email, password: "password123" }
    post api_v1_quests_url, params: { quest: { title: "" } }
    assert_response :unprocessable_content
    assert_includes @response.body, "can't be blank"
  end
end
