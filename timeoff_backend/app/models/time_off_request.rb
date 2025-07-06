# app/models/time_off_request.rb

class TimeOffRequest
  attr_accessor :id, :user_id, :start_date, :end_date, :reason, :status, :admin_note, :created_at
  
  @@requests = []
  @@next_id = 1
  
  def initialize(attributes = {})
    @id = @@next_id
    @@next_id += 1
    @user_id = attributes[:user_id]
    @start_date = attributes[:start_date]
    @end_date = attributes[:end_date]
    @reason = attributes[:reason]
    @status = attributes[:status] || 'pending'
    @admin_note = attributes[:admin_note]
    @created_at = Time.now
    @@requests << self
  end
  
  def self.all
    @@requests
  end
  
  def self.find(id)
    @@requests.find { |request| request.id == id.to_i }
  end
  
  def user
    User.find(user_id)
  end
  
  def update(attributes = {})
    @status = attributes[:status] if attributes[:status]
    @admin_note = attributes[:admin_note] if attributes[:admin_note]
    true
  end
end