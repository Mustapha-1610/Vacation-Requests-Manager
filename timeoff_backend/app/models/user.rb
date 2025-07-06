# app/models/user.rb

class User
  attr_accessor :id, :name, :email, :password, :role
  
  @@users = []
  @@next_id = 1
  
  def initialize(attributes = {})
    @id = @@next_id
    @@next_id += 1
    @name = attributes[:name]
    @email = attributes[:email]
    @password = attributes[:password]
    @role = attributes[:role] || 'employee'
    @@users << self
  end
  
  def self.all
    @@users
  end
  
  def self.find(id)
    @@users.find { |user| user.id == id.to_i }
  end
  
  def self.find_by_email(email)
    @@users.find { |user| user.email == email }
  end
  
  def admin?
    role == 'admin'
  end
  
  def time_off_requests
    TimeOffRequest.all.select { |request| request.user_id == id }
  end
  
  def authenticate(password)
    @password == password
  end
end