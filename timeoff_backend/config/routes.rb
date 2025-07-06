# config/routes.rb

Rails.application.routes.draw do
  # Authentication routes
  post '/auth/login', to: 'auth#login'
  post '/auth/register', to: 'auth#register'
  get '/auth/me', to: 'auth#me'
  get '/debug/users', to: 'auth#debug_users'
  post '/debug/make_admin', to: 'auth#make_admin'
  
  # Time off requests
  resources :time_off_requests, only: [:index, :show, :create]
  get '/my_requests', to: 'time_off_requests#my_requests'
  patch '/time_off_requests/:id/status', to: 'time_off_requests#update_status'
  
  # Health check
  get '/health', to: proc { [200, {}, ['OK']] }
end