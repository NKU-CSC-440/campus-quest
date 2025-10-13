class Api::V1::OrganizationMembershipsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_organization, only: [ :create ]
  before_action :set_membership, only: [ :update, :destroy ]
  before_action :authorize_admin!, only: [ :update ]
  before_action :authorize_member!, only: [ :destroy ]

  def create
    # Apply to join an organization
    @membership = OrganizationMembership.new(
      user: current_user,
      organization: @organization
    )

    if @membership.save
      render json: @membership, status: :created
    else
      render json: { errors: @membership.errors.full_messages }, status: :unprocessable_content
    end
  end

  def update
    if @membership.update(membership_params)
      render json: @membership
    else
      render json: { errors: @membership.errors.full_messages }, status: :unprocessable_content
    end
  end

  def destroy
    @membership.update(status: 'inactive')
    head :no_content
  end

  private

    def set_organization
      @organization = Organization.find(params[:organization_id])
    end

    def set_membership
      @membership = OrganizationMembership.find(params[:id])
    end

    def membership_params
      params.require(:organization_membership).permit(:status)
    end

    def authorize_admin!
      unless current_user.admin_of?(@membership.organization)
        render json: { error: "Not authorized" }, status: :forbidden
      end
    end

    def authorize_member!
      unless @membership.user == current_user
        render json: { error: "Not authorized" }, status: :forbidden
      end
    end
end
