class Api::V1::CompletionsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_completion, only: [:update]
  before_action :authorize_quest_creator!, only: [:update, :batch_create, :pending]
  
  # GET /api/v1/completions
  def index
    completions = current_user.completions.includes(:quest)
    render json: completions
  end

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
      status: 'pending'
    )
    
    if completion.save
      render json: completion, status: :created
    else
      render json: { errors: completion.errors.full_messages }, status: :unprocessable_content
    end
  end

  # PATCH /api/v1/completions/:id
  def update
    status = completion_update_params[:status]
    
    case status
    when 'approved'
      @completion.approve!
      render json: @completion
    when 'rejected'
      @completion.reject!
      render json: @completion
    else
      render json: { error: "Invalid status" }, status: :unprocessable_content
    end
  end

  # POST /api/v1/quests/:id/completions/batch
  def batch_create
    quest = Quest.find(params.expect(:id))
    user_ids = batch_create_params[:user_ids]
    
    completions = []
    errors = []
    
    user_ids.each do |user_id|
      user = User.find_by(id: user_id)
      unless user
        errors << "User #{user_id} not found"
        next
      end
      
      # Check if completion already exists
      if quest.completions.exists?(user_id: user_id)
        errors << "#{user.name} already has a completion for this quest"
        next
      end
      
      completion = quest.completions.create(
        user_id: user_id,
        status: 'approved',
        completed_at: Time.current
      )
      
      if completion.persisted?
        completions << completion
      else
        errors << "Failed to create completion for #{user.name}: #{completion.errors.full_messages.join(', ')}"
      end
    end
    
    render json: { 
      completions: completions,
      errors: errors,
      created_count: completions.count
    }, status: :created
  end

  # GET /api/v1/quests/:id/completions/pending
  def pending
    quest = Quest.find(params.expect(:id))
    completions = quest.completions.pending.includes(:user)
    render json: completions, include: :user
  end

  # GET /api/v1/completions/pending_for_creator
  def pending_for_creator
    # Get all quests created by the current user
    quest_ids = current_user.created_quests.pluck(:id)
    
    # Get all pending completions for those quests
    completions = Completion.pending
                            .where(quest_id: quest_ids)
                            .includes(:user, :quest)
                            .order('created_at DESC')
    
    render json: completions, include: [:user, :quest]
  end

  private

    def set_completion
      @completion = Completion.find(params[:id])
    end

    def authorize_quest_creator!
      quest = if params[:id] && !@completion
        Quest.find(params.expect(:id))
      elsif @completion
        @completion.quest
      end
      
      unless quest && quest.creator_id == current_user.id
        render json: { error: "Only the quest creator can perform this action" }, status: :forbidden
      end
    end

    def completion_params
      params.require(:completion).permit(:quest_id)
    end

    def completion_update_params
      params.require(:completion).permit(:status)
    end

    def batch_create_params
      params.require(:completion).permit(user_ids: [])
    end
end
