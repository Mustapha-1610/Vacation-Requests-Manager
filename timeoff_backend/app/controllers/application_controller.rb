# app/controllers/application_controller.rb

class ApplicationController < ActionController::API
  before_action :authenticate_user
  
  private
  
  def authenticate_user
    token = request.headers['Authorization']&.split(' ')&.last
    return render json: { error: 'No token provided' }, status: :unauthorized unless token
    
    begin
      decoded_token = JWT.decode(token, 'secret_key', true, algorithm: 'HS256')
      user_id = decoded_token[0]['user_id']
      @current_user = User.find(user_id)
    rescue JWT::DecodeError => e
      render json: { error: 'Invalid token' }, status: :unauthorized
    rescue => e
      render json: { error: 'User not found' }, status: :unauthorized
    end
  end
  
  def current_user
    @current_user
  end
  
  def require_admin
    return render json: { error: 'Admin access required' }, status: :forbidden unless current_user.admin?
  end
end