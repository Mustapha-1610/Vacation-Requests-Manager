# app/controllers/auth_controller.rb

class AuthController < ApplicationController
  skip_before_action :authenticate_user, only: [:login, :register, :debug_users, :make_admin]
  
  def login
    user = User.find_by_email(params[:email])
    
    if user && user.authenticate(params[:password])
      token = generate_token(user)
      render json: { 
        token: token, 
        user: { id: user.id, name: user.name, email: user.email, role: user.role } 
      }
    else
      render json: { error: 'Invalid email or password' }, status: :unauthorized
    end
  end
  
  def register
    # Check if email already exists
    if User.find_by_email(params[:email])
      return render json: { error: 'Email already exists' }, status: :unprocessable_entity
    end
    
    user = User.new(
      name: params[:name],
      email: params[:email],
      password: params[:password],
      role: 'employee'
    )
    
    token = generate_token(user)
    render json: { 
      token: token, 
      user: { id: user.id, name: user.name, email: user.email, role: user.role } 
    }
  end
  
  def me
    render json: { 
      user: { id: current_user.id, name: current_user.name, email: current_user.email, role: current_user.role } 
    }
  end
  
  def debug_users
    users = User.all.map { |u| { id: u.id, name: u.name, email: u.email, role: u.role } }
    render json: { users: users, count: users.length }
  end
  
  def make_admin
    user = User.find_by_email(params[:email])
    if user
      user.role = 'admin'
      render json: { message: "#{user.name} is now an admin" }
    else
      render json: { error: 'User not found' }, status: :not_found
    end
  end
  
  private
  
  def generate_token(user)
    JWT.encode({ user_id: user.id }, 'secret_key', 'HS256')
  end
end