class Api::V1::CategoriesController < ApplicationController
  before_action :authenticate_user!

  # GET /api/v1/categories
  def index
    categories = Category.order(:name)
    render json: categories
  end

  # GET /api/v1/categories/:id
  def show
    category = Category.find(params[:id])
    render json: category, include: :quests
  end
end
