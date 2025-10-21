class Api::V1::LeaderboardController < ApplicationController
  def show
    # Get top users by completion count
    top_users = User
      .left_joins(:completions)
      .group(:id)
      .select('users.id, users.name, COUNT(completions.id) AS score')
      .order('score DESC')
      .limit(10)

    render json: top_users.map { |u| { id: u.id, name: u.name, score: u.score.to_i } }
  end
end