class Api::V1::QuestsController < ApplicationController
  before_action :authenticate_user!

  # GET /api/v1/quests
  def index
    quests = Quest.includes(:category).all
    render json: quests, include: :category
  end

  # GET /api/v1/quests/:id
  def show
    quest = Quest.find(params[:id])
    render json: quest, include: [ :users, :category ]
  end

  # POST /api/v1/quests
  def create
    quest = current_user.created_quests.build(quest_params)
    if quest.save
      render json: quest, status: :created
    else
      render json: { errors: quest.errors.full_messages }, status: :unprocessable_content
    end
  end

  private

    def quest_params
      permitted = params.require(:quest).permit(:title, :description, :category_id, :categoryId)
      # Handle both category_id and categoryId (frontend sends camelCase)
      permitted[:category_id] = permitted.delete(:categoryId) if permitted[:categoryId].present?
      permitted
    end
end
