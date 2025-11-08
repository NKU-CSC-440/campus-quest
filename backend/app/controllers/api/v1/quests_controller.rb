class Api::V1::QuestsController < ApplicationController
  before_action :authenticate_user!

  # GET /api/v1/quests
  def index
    page = params[:page]&.to_i || 1
    per_page = params[:per_page]&.to_i || 10
    per_page = [ per_page, 100 ].min # Cap at 100 items per page

    # Handle sorting
    sort_field = params[:sort_field] || "created_at"
    sort_order = params[:sort_order]&.downcase == "asc" ? :asc : :desc

    # Whitelist sortable fields to prevent SQL injection
    allowed_sort_fields = %w[id title created_at updated_at]
    sort_field = "created_at" unless allowed_sort_fields.include?(sort_field)

    quests = Quest.includes(:category)
                  .order(sort_field => sort_order)
                  .limit(per_page)
                  .offset((page - 1) * per_page)

    total_count = Quest.count

    render json: {
      quests: quests.as_json(include: :category),
      pagination: {
        current_page: page,
        per_page: per_page,
        total_count: total_count,
        total_pages: (total_count.to_f / per_page).ceil
      }
    }
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
