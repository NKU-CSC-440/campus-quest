class Api::V1::LeaderboardController < ApplicationController
  def show
    # Fetch leaderboard data efficiently with a single query
    leaderboard = if params[:organization_id].present?
      # Organization-specific leaderboard
      organization_id = params.expect(:organization_id)
      User.leaderboard_for_organization(organization_id)
    else
      # Global leaderboard
      User.global_leaderboard
    end

    render json: leaderboard
  end
end
