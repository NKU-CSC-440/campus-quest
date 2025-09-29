class Api::V1::CompletionsController < ApplicationController
  # POST /api/v1/completions
  def create
	completion = Completion.new(completion_params)
	if completion.save
	  render json: completion, status: :created
	else
	  render json: { errors: completion.errors.full_messages }, status: :unprocessable_entity
	end
  end

  private

  def completion_params
	params.require(:completion).permit(:user_id, :quest_id, :completed_at)
  end
end
