class Api::V1::OrganizationsController < ApplicationController
  before_action :set_organization, only: [ :show ]
  before_action :authenticate_user!, except: [ :index, :show ]

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

  private

    def set_organization
      @organization = Organization.find(params[:id])
    end

    def organization_params
      params.require(:organization).permit(:name, :description)
    end
end
