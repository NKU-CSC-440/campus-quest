class ApplicationController < ActionController::API
	# Returns the currently logged-in user, if any
	def current_user
		@current_user ||= User.find_by(id: session[:user_id]) if session[:user_id]
	end

	# Before_action helper to require authentication
	def authenticate_user!
		render json: { error: 'Not authorized' }, status: :unauthorized unless current_user
	end
end
