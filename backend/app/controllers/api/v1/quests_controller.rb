class Api::V1::QuestsController < ApplicationController
  before_action :authenticate_user!
  # GET /api/v1/quests
  def index
	quests = Quest.all
	render json: quests
  end

  # GET /api/v1/quests/:id
  def show
	quest = Quest.find(params[:id])
	render json: quest, include: :users
  end

  # POST /api/v1/quests
  def create
	quest = Quest.new(quest_params)
	if quest.save
	  render json: quest, status: :created
	else
	  render json: { errors: quest.errors.full_messages }, status: :unprocessable_entity
	end
  end

  private

  def quest_params
	params.require(:quest).permit(:title, :description)
  end
end
