class Api::V1::CompletionsController < ApplicationController
  before_action :authenticate_user!
  
  # POST /api/v1/completions
  def create
    quest = Quest.find(completion_params[:quest_id])
    
    # Validate user is not completing their own quest
    if quest.creator_id && quest.creator_id == current_user.id
      render json: { error: "You cannot complete your own quest" }, status: :forbidden
      return
    end
    
    completion = current_user.completions.build(
      quest_id: completion_params[:quest_id],
      completed_at: completion_params[:completed_at] || Time.current
    )
    
    if completion.save
      render json: completion, status: :created
    else
      render json: { errors: completion.errors.full_messages }, status: :unprocessable_content
    end
  end

  private

    def completion_params
      params.require(:completion).permit(:quest_id, :completed_at)
    end
end
