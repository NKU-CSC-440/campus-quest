require "test_helper"

class Api::V1::OrganizationMembershipsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @organization = organizations(:chess_club)
    @membership = organization_memberships(:chess_club_pending)
    @admin = users(:student) # admin of chess_club
    @applicant = users(:teacher) # has pending application to chess_club
    @new_user = users(:another) # user with no existing memberships
  end

  test "should create membership application" do
    sign_in_as(@new_user)
    
    assert_difference('OrganizationMembership.count') do
      post api_v1_organization_organization_memberships_url(@organization), as: :json
    end

    assert_response :created
    membership = OrganizationMembership.last
    assert_equal 'pending', membership.status
    assert_equal 'member', membership.role
  end

  test "should not create duplicate membership" do
    sign_in_as(@applicant)
    
    assert_no_difference('OrganizationMembership.count') do
      post api_v1_organization_organization_memberships_url(@organization), as: :json
    end

    assert_response :unprocessable_content
  end

  test "admin should be able to approve membership" do
    sign_in_as(@admin)
    
    patch api_v1_organization_membership_url(@membership), params: {
      organization_membership: { status: 'active' }
    }, as: :json

    assert_response :success
    @membership.reload
    assert_equal 'active', @membership.status
  end

  test "non-admin should not be able to approve membership" do
    sign_in_as(@applicant)
    
    patch api_v1_organization_membership_url(@membership), params: {
      organization_membership: { status: 'active' }
    }, as: :json

    assert_response :forbidden
    @membership.reload
    assert_equal 'pending', @membership.status
  end

  test "should not update membership when not logged in" do
    patch api_v1_organization_membership_url(@membership), params: {
      organization_membership: { status: 'active' }
    }, as: :json

    assert_response :unauthorized
    @membership.reload
    assert_equal 'pending', @membership.status
  end

  test "admin should be able to reject membership" do
    sign_in_as(@admin)
    
    patch api_v1_organization_membership_url(@membership), params: {
      organization_membership: { status: 'inactive' }
    }, as: :json

    assert_response :success
    @membership.reload
    assert_equal 'inactive', @membership.status
  end

  test "should not allow updating role through API" do
    sign_in_as(@admin)
    
    patch api_v1_organization_membership_url(@membership), params: {
      organization_membership: { role: 'admin' }
    }, as: :json

    assert_response :success
    @membership.reload
    assert_equal 'member', @membership.role
  end

  private

  def sign_in_as(user)
    post api_v1_login_url, params: { email: user.email, password: 'password123' }
  end
end
