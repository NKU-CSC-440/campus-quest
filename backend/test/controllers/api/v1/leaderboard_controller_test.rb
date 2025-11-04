require "test_helper"

class Api::V1::LeaderboardControllerTest < ActionDispatch::IntegrationTest
  setup do
    @student = users(:student)
    @teacher = users(:teacher)
    @another_user = users(:another)
    @math_club = organizations(:math_club)
    @chess_club = organizations(:chess_club)
  end

  test "should get global leaderboard" do
    get api_v1_leaderboard_url
    assert_response :success

    json_response = JSON.parse(response.body)
    assert_kind_of Array, json_response
    
    # Check that users are returned with required fields
    json_response.each do |entry|
      assert entry.key?("id")
      assert entry.key?("name")
      assert entry.key?("email")
      assert entry.key?("score")
    end
  end

  test "should order global leaderboard by score descending" do
    # Create additional completions to establish clear ranking
    quest = quests(:math_quest)
    
    # Give student 3 total completions
    Completion.create!(user: @student, quest: quest)
    Completion.create!(user: @student, quest: quest)
    
    # Give teacher 1 total completion (already has one from fixtures)
    # Give another_user 0 completions
    
    get api_v1_leaderboard_url
    assert_response :success

    json_response = JSON.parse(response.body)
    
    # Student should be first with highest score
    assert_equal @student.id, json_response.first["id"]
    assert_operator json_response.first["score"], :>, 1
    
    # Scores should be in descending order
    scores = json_response.map { |entry| entry["score"] }
    assert_equal scores, scores.sort.reverse
  end

  test "should get organization-specific leaderboard" do
    get api_v1_organization_leaderboard_url(organization_id: @math_club.id)
    assert_response :success

    json_response = JSON.parse(response.body)
    assert_kind_of Array, json_response
    
    # Should only include active members of math_club (student and teacher)
    user_ids = json_response.map { |entry| entry["id"] }
    assert_includes user_ids, @student.id
    assert_includes user_ids, @teacher.id
    assert_not_includes user_ids, @another_user.id, "Should not include non-members"
  end

  test "should not include pending members in organization leaderboard" do
    get api_v1_organization_leaderboard_url(organization_id: @chess_club.id)
    assert_response :success

    json_response = JSON.parse(response.body)
    user_ids = json_response.map { |entry| entry["id"] }
    
    # Student is active member of chess_club
    assert_includes user_ids, @student.id
    
    # Teacher has pending status in chess_club, should not appear
    assert_not_includes user_ids, @teacher.id, "Should not include pending members"
  end

  test "should return empty array for organization with no members" do
    # Create organization with no active members
    empty_org = Organization.create!(name: "Empty Org", description: "No members")
    
    get api_v1_organization_leaderboard_url(organization_id: empty_org.id)
    assert_response :success

    json_response = JSON.parse(response.body)
    assert_equal [], json_response
  end

  test "should include users with zero completions in global leaderboard" do
    get api_v1_leaderboard_url
    assert_response :success

    json_response = JSON.parse(response.body)
    user_ids = json_response.map { |entry| entry["id"] }
    
    # All users should appear, even with 0 completions
    assert_includes user_ids, @another_user.id
    
    # Find another_user in response and verify score is 0
    another_entry = json_response.find { |entry| entry["id"] == @another_user.id }
    assert_equal 0, another_entry["score"]
  end

  test "should include users with zero completions in organization leaderboard" do
    # Create a user with no completions but is member of math_club
    zero_completion_user = User.create!(
      name: "Zero User",
      email: "zero@example.com",
      role: :student,
      password: "password123"
    )
    OrganizationMembership.create!(
      user: zero_completion_user,
      organization: @math_club,
      role: "member",
      status: "active"
    )

    get api_v1_organization_leaderboard_url(organization_id: @math_club.id)
    assert_response :success

    json_response = JSON.parse(response.body)
    user_ids = json_response.map { |entry| entry["id"] }
    
    assert_includes user_ids, zero_completion_user.id
    
    zero_entry = json_response.find { |entry| entry["id"] == zero_completion_user.id }
    assert_equal 0, zero_entry["score"]
  end

  test "should break ties by name alphabetically" do
    # Create two users with same completion count
    alice = User.create!(name: "Alice", email: "alice@example.com", role: :student, password: "password123")
    bob = User.create!(name: "Bob", email: "bob@example.com", role: :student, password: "password123")
    
    quest = quests(:math_quest)
    Completion.create!(user: alice, quest: quest)
    Completion.create!(user: bob, quest: quest)

    get api_v1_leaderboard_url
    assert_response :success

    json_response = JSON.parse(response.body)
    
    # Find Alice and Bob in the results
    alice_index = json_response.index { |entry| entry["id"] == alice.id }
    bob_index = json_response.index { |entry| entry["id"] == bob.id }
    
    # Alice should come before Bob (alphabetically)
    assert_operator alice_index, :<, bob_index
  end
end
