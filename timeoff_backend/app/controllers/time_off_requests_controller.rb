# app/controllers/time_off_requests_controller.rb

class TimeOffRequestsController < ApplicationController
  before_action :require_admin, only: [:index, :update_status]
  
  def index
    # Admin can see all requests
    requests = TimeOffRequest.all
    render json: requests.map { |req| format_request(req) }
  end
  
  def create
    request = TimeOffRequest.new(
      user_id: current_user.id,
      start_date: params[:start_date],
      end_date: params[:end_date],
      reason: params[:reason],
      status: 'pending'
    )
    
    render json: format_request(request), status: :created
  end
  
  def my_requests
    # User can see their own requests
    requests = current_user.time_off_requests.sort_by(&:created_at).reverse
    render json: requests.map { |req| format_request(req) }
  end
  
  def update_status
    request = TimeOffRequest.find(params[:id])
    
    if request.update(status: params[:status], admin_note: params[:admin_note])
      render json: format_request(request)
    else
      render json: { error: 'Failed to update request' }, status: :unprocessable_entity
    end
  end
  
  private
  
  def format_request(request)
    {
      id: request.id,
      user_name: request.user.name,
      user_email: request.user.email,
      start_date: request.start_date,
      end_date: request.end_date,
      reason: request.reason,
      status: request.status,
      admin_note: request.admin_note,
      created_at: request.created_at
    }
  end
end