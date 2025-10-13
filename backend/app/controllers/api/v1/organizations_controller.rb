class Api::V1::OrganizationsController < ApplicationController
  before_action :set_organization, only: [ :show, :pending_applications, :my_membership ]
  before_action :authenticate_user!, except: [ :index, :show ]
  before_action :authorize_admin!, only: [ :pending_applications ]

  def index
    @organizations = Organization.all
    render json: @organizations
  end

  def show
    render json: @organization.as_json(include: {
      admins: { only: [ :id, :name, :email ] },
      members: { only: [ :id, :name, :email ] }
    })
  end

  def create
    @organization = Organization.new(organization_params)

    if @organization.save
      # Make the creator an admin
      OrganizationMembership.create!(
        user: current_user,
        organization: @organization,
        role: "admin",
        status: "active"
      )
      render json: @organization, status: :created
    else
      render json: { errors: @organization.errors.full_messages }, status: :unprocessable_content
    end
  end

  def my_organizations
    @memberships = current_user.organization_memberships.includes(:organization).where(status: 'active')
    render json: @memberships.map { |m| m.organization.as_json.merge(role: m.role, membership_id: m.id) }
  end

  def my_pending_applications
    @memberships = current_user.organization_memberships.includes(:organization).where(status: 'pending')
    render json: @memberships.map { |m| m.organization }
  end

  def my_rejected_applications
    @memberships = current_user.organization_memberships.includes(:organization).where(status: 'rejected')
    render json: @memberships.map { |m| m.organization }
  end

  def pending_applications
    @memberships = @organization.organization_memberships.includes(:user).where(status: 'pending')
    render json: @memberships.map { |m| m.as_json(include: { user: { only: [:id, :name, :email] } }) }
  end

  def my_membership
    @membership = @organization.organization_memberships.find_by(user: current_user)
    if @membership
      render json: @membership.as_json(include: { user: { only: [:id, :name, :email] } })
    else
      render json: { error: "Membership not found" }, status: :not_found
    end
  end

  private

    def set_organization
      @organization = Organization.find(params[:id])
    end

    def organization_params
      params.require(:organization).permit(:name, :description)
    end

    def authorize_admin!
      unless current_user.admin_of?(@organization)
        render json: { error: "Not authorized" }, status: :forbidden
      end
    end
end
