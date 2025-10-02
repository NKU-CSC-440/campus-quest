# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end
# db/seeds.rb

# Clear out existing users so reseeding is idempotent
User.destroy_all

# Create a teacher
User.create!(
  name: "Alice Teacher",
  email: "alice@nku.edu",
  password: "password",
  password_confirmation: "password",
  role: :teacher
)

# Create a student
User.create!(
  name: "Bob Student",
  email: "bob@nku.edu",
  password: "password",
  password_confirmation: "password",
  role: :student
)

puts "Seeded #{User.count} users."
