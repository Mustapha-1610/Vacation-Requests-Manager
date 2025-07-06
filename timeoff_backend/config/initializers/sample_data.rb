# config/initializers/sample_data.rb

# Create sample users and data when app starts
Rails.application.config.after_initialize do
  # Create admin user
  admin = User.new(
    name: 'Admin User',
    email: 'admin@company.com',
    password: 'password123',
    role: 'admin'
  )

  # Create employee user
  employee = User.new(
    name: 'John Doe',
    email: 'john@company.com',
    password: 'password123',
    role: 'employee'
  )

  # Create sample time off request
  TimeOffRequest.new(
    user_id: employee.id,
    start_date: (Date.today + 7).to_s,
    end_date: (Date.today + 10).to_s,
    reason: 'Family vacation',
    status: 'pending'
  )

  puts "✅ Sample data created:"
  puts "   Admin: admin@company.com / password123"
  puts "   Employee: john@company.com / password123"
end