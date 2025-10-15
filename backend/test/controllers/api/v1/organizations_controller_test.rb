require "test_helper"

class Api::V1::OrganizationsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @organization = organizations(:math_club)
    @user = users(:teacher)
    post api_v1_login_url, params: { email: @user.email, password: 'password123' }
  end

  test "should get index" do
    get api_v1_organizations_url
    assert_response :success
    
    response_body = JSON.parse(response.body)
    assert_equal Organization.count, response_body.length
    assert_includes response_body.map { |org| org['name'] }, 'Math Club'
  end

  test "should show organization" do
    get api_v1_organization_url(@organization)
    assert_response :success
    
    response_body = JSON.parse(response.body)
    assert_equal @organization.name, response_body['name']
    assert_equal @organization.description, response_body['description']
    assert_includes response_body.keys, 'admins'
    assert_includes response_body.keys, 'members'
  end

  test "should create organization" do
    assert_difference('Organization.count') do
      post api_v1_organizations_url, params: {
        organization: {
          name: 'Programming Club',
          description: 'A club for coding enthusiasts'
        }
      }
    end

    assert_response :created
    
    # Verify the creator is an admin
    organization = Organization.last
    assert @user.admin_of?(organization)
  end

  test "should not create organization when not logged in" do
    delete api_v1_logout_url
    
    assert_no_difference('Organization.count') do
      post api_v1_organizations_url, params: {
        organization: {
          name: 'Programming Club',
          description: 'A club for coding enthusiasts'
        }
      }
    end

    assert_response :unauthorized
  end

  test "should not create organization with duplicate name" do
    assert_no_difference('Organization.count') do
      post api_v1_organizations_url, params: {
        organization: {
          name: @organization.name,
          description: 'Different description'
        }
      }
    end

    assert_response :unprocessable_content
  end
end
