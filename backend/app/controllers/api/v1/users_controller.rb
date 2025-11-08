class Api::V1::UsersController < ApplicationController
  before_action :authenticate_user!, only: [ :index ]

  def index
    users = User.all
    render json: users
  end

  def new
    @user = User.new
  end

  def create
    user = User.new(user_params)
    if user.save
      render json: user, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_content
    end
  end

  private

    def user_params
      params.require(:user).permit(:name, :email, :password, :password_confirmation, :role)
    end
end
