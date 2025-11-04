require "test_helper"

class UserTest < ActiveSupport::TestCase
  setup do
    @student = users(:student)
    @teacher = users(:teacher)
    @another_user = users(:another)
    @math_club = organizations(:math_club)
    @chess_club = organizations(:chess_club)
  end

  test "global_leaderboard returns all users with score" do
    leaderboard = User.global_leaderboard

    assert_kind_of Array, leaderboard
    assert_operator leaderboard.length, :>, 0

    # Each entry should have required fields
    leaderboard.each do |entry|
      assert entry.key?(:id)
      assert entry.key?(:name)
      assert entry.key?(:email)
      assert entry.key?(:score)
      assert_kind_of Integer, entry[:score]
    end
  end

  test "global_leaderboard orders by score descending" do
    quest = quests(:math_quest)
    
    # Give student multiple completions
    3.times { Completion.create!(user: @student, quest: quest) }
    
    leaderboard = User.global_leaderboard
    scores = leaderboard.map { |entry| entry[:score] }
    
    # Scores should be in descending order
    assert_equal scores, scores.sort.reverse
  end

  test "global_leaderboard breaks ties alphabetically by name" do
    # Create two users with same completion count
    alice = User.create!(name: "Alice", email: "alice@test.com", role: :student, password: "password123")
    bob = User.create!(name: "Bob", email: "bob@test.com", role: :student, password: "password123")
    
    quest = quests(:math_quest)
    Completion.create!(user: alice, quest: quest, status: 'approved', completed_at: Time.current)
    Completion.create!(user: bob, quest: quest, status: 'approved', completed_at: Time.current)

    leaderboard = User.global_leaderboard
    
    alice_entry = leaderboard.find { |e| e[:id] == alice.id }
    bob_entry = leaderboard.find { |e| e[:id] == bob.id }
    
    # Both should have same score
    assert_equal alice_entry[:score], bob_entry[:score]
    
    # Alice should appear before Bob
    alice_index = leaderboard.index(alice_entry)
    bob_index = leaderboard.index(bob_entry)
    assert_operator alice_index, :<, bob_index
  end

  test "global_leaderboard includes users with zero completions" do
    # Ensure another_user has no completions
    @another_user.completions.destroy_all
    
    leaderboard = User.global_leaderboard
    another_entry = leaderboard.find { |e| e[:id] == @another_user.id }
    
    assert_not_nil another_entry
    assert_equal 0, another_entry[:score]
  end

  test "leaderboard_for_organization returns only active members" do
    leaderboard = User.leaderboard_for_organization(@math_club.id)
    user_ids = leaderboard.map { |entry| entry[:id] }

    # Math club has student and teacher as active members
    assert_includes user_ids, @student.id
    assert_includes user_ids, @teacher.id
    
    # another_user is not a member
    assert_not_includes user_ids, @another_user.id
  end

  test "leaderboard_for_organization excludes pending members" do
    # Teacher has pending membership in chess_club
    leaderboard = User.leaderboard_for_organization(@chess_club.id)
    user_ids = leaderboard.map { |entry| entry[:id] }

    # Should include student (active admin)
    assert_includes user_ids, @student.id
    
    # Should not include teacher (pending)
    assert_not_includes user_ids, @teacher.id
  end

  test "leaderboard_for_organization orders by score descending" do
    quest = quests(:math_quest)
    
    # Give student more completions than teacher
    3.times { Completion.create!(user: @student, quest: quest) }
    
    leaderboard = User.leaderboard_for_organization(@math_club.id)
    
    # Student should be first
    assert_equal @student.id, leaderboard.first[:id]
    
    # Scores should be descending
    scores = leaderboard.map { |entry| entry[:score] }
    assert_equal scores, scores.sort.reverse
  end

  test "leaderboard_for_organization includes members with zero completions" do
    # Create user with no completions but is member of organization
    zero_user = User.create!(
      name: "Zero User",
      email: "zero@test.com",
      role: :student,
      password: "password123"
    )
    OrganizationMembership.create!(
      user: zero_user,
      organization: @math_club,
      role: "member",
      status: "active"
    )

    leaderboard = User.leaderboard_for_organization(@math_club.id)
    zero_entry = leaderboard.find { |e| e[:id] == zero_user.id }
    
    assert_not_nil zero_entry
    assert_equal 0, zero_entry[:score]
  end

  test "leaderboard_for_organization returns empty array for organization with no members" do
    empty_org = Organization.create!(name: "Empty Org", description: "No members")
    
    leaderboard = User.leaderboard_for_organization(empty_org.id)
    
    assert_equal [], leaderboard
  end
end
