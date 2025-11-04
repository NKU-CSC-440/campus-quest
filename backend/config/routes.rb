Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      resources :organizations, only: [:index, :show, :create] do
        resources :organization_memberships, only: [:create, :update, :destroy], shallow: true
      end
      get '/my_organizations', to: 'organizations#my_organizations'
      get '/my_pending_applications', to: 'organizations#my_pending_applications'
      get '/my_rejected_applications', to: 'organizations#my_rejected_applications'
      get '/organizations/:id/pending_applications', to: 'organizations#pending_applications'
      get '/organizations/:id/my_membership', to: 'organizations#my_membership'
      post "/login", to: "sessions#create", as: :login
      delete "/logout", to: "sessions#destroy", as: :logout
      get "/me", to: "sessions#show", as: :me
      resources :quests, only: [ :index, :show, :create ] do
        post 'completions/batch', to: 'completions#batch_create', on: :member
        get 'completions/pending', to: 'completions#pending', on: :member
      end
      resources :completions, only: [ :create, :update ]
      resources :users, only: [ :create ]
      resources :categories, only: [ :index, :show ]
      
      # Leaderboard routes
      get '/leaderboard', to: 'leaderboard#show', as: :leaderboard
      get '/organizations/:organization_id/leaderboard', to: 'leaderboard#show', as: :organization_leaderboard
    end
  end

  # Defines the root path route ("/")
  # root "posts#index"
end
