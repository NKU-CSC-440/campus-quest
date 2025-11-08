require "test_helper"

class Api::V1::CompletionsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @student = users(:student)
    @teacher = users(:teacher)
    @quest = quests(:math_quest)
    @quest.update!(creator: @teacher)

    # Set passwords for fixture users
    @student.update!(password: "password123", password_confirmation: "password123")
    @teacher.update!(password: "password123", password_confirmation: "password123")
  end

  test "should create completion with pending status" do
    login_as(@student)

    post api_v1_completions_url, params: {
      completion: { quest_id: @quest.id }
    }, as: :json

    assert_response :created

    json_response = JSON.parse(response.body)
    assert_equal "pending", json_response["status"]
    assert_nil json_response["completed_at"]
  end

  test "should not allow user to complete own quest" do
    login_as(@teacher)

    post api_v1_completions_url, params: {
      completion: { quest_id: @quest.id }
    }, as: :json

    assert_response :forbidden
    json_response = JSON.parse(response.body)
    assert_equal "You cannot complete your own quest", json_response["error"]
  end

  test "should approve completion" do
    login_as(@teacher)

    completion = Completion.create!(
      user: @student,
      quest: @quest,
      status: "pending"
    )

    patch api_v1_completion_url(completion), params: {
      completion: { status: "approved" }
    }, as: :json

    assert_response :success

    json_response = JSON.parse(response.body)
    assert_equal "approved", json_response["status"]
    assert_not_nil json_response["completed_at"]
  end

  test "should reject completion" do
    login_as(@teacher)

    completion = Completion.create!(
      user: @student,
      quest: @quest,
      status: "pending"
    )

    patch api_v1_completion_url(completion), params: {
      completion: { status: "rejected" }
    }, as: :json

    assert_response :success

    json_response = JSON.parse(response.body)
    assert_equal "rejected", json_response["status"]
  end

  test "should not allow non-creator to approve completion" do
    other_teacher = User.create!(
      name: "Other Teacher",
      email: "other@test.com",
      role: :teacher,
      password: "password123"
    )

    login_as(other_teacher)

    completion = Completion.create!(
      user: @student,
      quest: @quest,
      status: "pending"
    )

    patch api_v1_completion_url(completion), params: {
      completion: { status: "approved" }
    }, as: :json

    assert_response :forbidden
  end

  test "should batch create completions" do
    login_as(@teacher)

    other_student = User.create!(
      name: "Other Student",
      email: "other@test.com",
      role: :student,
      password: "password123"
    )

    third_student = User.create!(
      name: "Third Student",
      email: "third@test.com",
      role: :student,
      password: "password123"
    )

    post completions_batch_api_v1_quest_url(@quest), params: {
      completion: { user_ids: [ other_student.id, third_student.id ] }
    }, as: :json

    assert_response :created

    json_response = JSON.parse(response.body)
    assert_equal 2, json_response["created_count"]
    assert_equal 2, json_response["completions"].count

    # Check that all are approved
    json_response["completions"].each do |completion|
      assert_equal "approved", completion["status"]
      assert_not_nil completion["completed_at"]
    end
  end

  test "should not allow non-creator to batch create completions" do
    other_teacher = User.create!(
      name: "Other Teacher",
      email: "other@test.com",
      role: :teacher,
      password: "password123"
    )

    login_as(other_teacher)

    post completions_batch_api_v1_quest_url(@quest), params: {
      completion: { user_ids: [ @student.id ] }
    }, as: :json

    assert_response :forbidden
  end

  test "should get pending completions for quest" do
    login_as(@teacher)

    Completion.create!(user: @student, quest: @quest, status: "pending")
    Completion.create!(user: @student, quest: @quest, status: "approved", completed_at: Time.current)

    get completions_pending_api_v1_quest_url(@quest)

    assert_response :success
    json_response = JSON.parse(response.body)

    # Should only return pending completions
    assert_equal 1, json_response.count
    assert_equal "pending", json_response.first["status"]
  end

  test "should not allow non-creator to view pending completions" do
    other_teacher = User.create!(
      name: "Other Teacher",
      email: "other@test.com",
      role: :teacher,
      password: "password123"
    )

    login_as(other_teacher)

    get completions_pending_api_v1_quest_url(@quest)

    assert_response :forbidden
  end

  test "batch create should skip duplicate completions" do
    login_as(@teacher)

    # Create existing completion
    Completion.create!(
      user: @student,
      quest: @quest,
      status: "approved",
      completed_at: Time.current
    )

    other_student = User.create!(
      name: "Other Student",
      email: "other@test.com",
      role: :student,
      password: "password123"
    )

    post completions_batch_api_v1_quest_url(@quest), params: {
      completion: { user_ids: [ @student.id, other_student.id ] }
    }, as: :json

    assert_response :created

    json_response = JSON.parse(response.body)
    assert_equal 1, json_response["created_count"]
    assert_equal 1, json_response["errors"].count
    assert_match(/already has a completion/, json_response["errors"].first)
  end

  private

    def login_as(user)
      post api_v1_login_url, params: { email: user.email, password: "password123" }
    end
end
