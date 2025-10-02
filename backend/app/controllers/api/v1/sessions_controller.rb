module Api
  module V1
    class SessionsController < ApplicationController
      def create
        user = User.find_by(email: params[:email])
        if user&.authenticate(params[:password])
          session[:user_id] = user.id
          render json: { user: user }, status: :ok
        else
          render json: { error: "Invalid email or password" }, status: :unauthorized
        end
      end

      def destroy
        session[:user_id] = nil
        render json: { message: "Logged out" }, status: :ok
      end

      def show
        if session[:user_id]
          user = User.find_by(id: session[:user_id])
          render json: { user: user }, status: :ok
        else
          render json: { error: "Not logged in" }, status: :unauthorized
        end
      end
    end
  end
end
