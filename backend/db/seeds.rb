# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

require 'faker'

puts "🌱 Starting seed process..."

# Clear existing data
puts "Clearing existing data..."
Completion.destroy_all
Quest.destroy_all
OrganizationMembership.destroy_all
Organization.destroy_all
Category.destroy_all
User.destroy_all

puts "✅ Existing data cleared"

# Create Categories
puts "\n📁 Creating categories..."
categories = [
  { name: "Exploration", score: 100 },
  { name: "Social", score: 150 },
  { name: "Service", score: 200 },
  { name: "Academic", score: 175 },
  { name: "Athletic", score: 125 },
  { name: "Creative", score: 150 }
]

categories.each do |cat_data|
  Category.create!(cat_data)
end
puts "✅ Created #{Category.count} categories"

# Create Users
puts "\n👥 Creating users..."

# Create specific demo users
teacher = User.create!(
  name: "Professor Alice Smith",
  email: "alice@nku.edu",
  password: "password",
  password_confirmation: "password",
  role: :teacher
)

student = User.create!(
  name: "Bob Johnson",
  email: "bob@nku.edu",
  password: "password",
  password_confirmation: "password",
  role: :student
)

# Create additional random teachers
5.times do
  User.create!(
    name: Faker::Name.name,
    email: Faker::Internet.unique.email(domain: 'nku.edu'),
    password: "password",
    password_confirmation: "password",
    role: :teacher
  )
end

# Create additional random students
20.times do
  User.create!(
    name: Faker::Name.name,
    email: Faker::Internet.unique.email(domain: 'nku.edu'),
    password: "password",
    password_confirmation: "password",
    role: :student
  )
end

puts "✅ Created #{User.count} users (#{User.teacher.count} teachers, #{User.student.count} students)"

# Create Organizations
puts "\n🏢 Creating organizations..."

organization_data = [
  { name: "Computer Science Club", description: "A community for students passionate about programming and technology" },
  { name: "Math Society", description: "Exploring the beauty of mathematics together" },
  { name: "Campus Sustainability", description: "Making our campus more environmentally friendly" },
  { name: "Student Government", description: "Voice of the student body" },
  { name: "Chess Club", description: "Strategic thinking and friendly competition" },
  { name: "Robotics Team", description: "Building autonomous robots and competing nationally" },
  { name: "Dance Ensemble", description: "Express yourself through movement" },
  { name: "Debate Society", description: "Developing critical thinking and public speaking skills" },
  { name: "Photography Club", description: "Capture moments and develop your artistic eye" },
  { name: "International Students Association", description: "Celebrating diversity and cultural exchange" },
  { name: "Gaming League", description: "Esports and board games community" },
  { name: "Volunteer Corps", description: "Making a difference in our community" }
]

organizations = organization_data.map do |org_data|
  Organization.create!(org_data)
end

puts "✅ Created #{Organization.count} organizations"

# Create Organization Memberships
puts "\n👥 Creating organization memberships..."

teachers = User.teacher.to_a
students = User.student.to_a

membership_count = 0

organizations.each do |org|
  # Assign 1-2 teachers as admins
  admins = teachers.sample(rand(1..2))
  admins.each do |teacher|
    OrganizationMembership.create!(
      user: teacher,
      organization: org,
      role: 'admin',
      status: 'active'
    )
    membership_count += 1
  end

  # Assign random students as members (30-70% of students)
  member_count = rand((students.count * 0.3).to_i..(students.count * 0.7).to_i)
  members = students.sample(member_count)
  
  members.each do |student|
    # 80% active, 15% pending, 5% rejected
    status = rand < 0.8 ? 'active' : (rand < 0.75 ? 'pending' : 'rejected')
    
    OrganizationMembership.create!(
      user: student,
      organization: org,
      role: 'member',
      status: status
    )
    membership_count += 1
  end
end

puts "✅ Created #{membership_count} organization memberships"

# Create Quests
puts "\n🎯 Creating quests..."

quest_templates = [
  # Exploration
  { title: "Find the Library Secret Garden", description: "Discover the hidden garden behind Steely Library", category: "Exploration" },
  { title: "Campus Scavenger Hunt", description: "Find all 10 hidden landmarks across campus", category: "Exploration" },
  { title: "Explore Every Building", description: "Visit and check in at all academic buildings", category: "Exploration" },
  
  # Social
  { title: "Join a Student Organization", description: "Become a member of any student organization", category: "Social" },
  { title: "Attend a Campus Event", description: "Participate in any campus-wide event", category: "Social" },
  { title: "Make 5 New Friends", description: "Connect with 5 students you've never met before", category: "Social" },
  { title: "Study Group Challenge", description: "Form or join a study group and meet 3 times", category: "Social" },
  
  # Service
  { title: "Volunteer at Food Pantry", description: "Help out at the campus food pantry for 4 hours", category: "Service" },
  { title: "Campus Cleanup Day", description: "Participate in campus beautification", category: "Service" },
  { title: "Tutor a Peer", description: "Help another student in a subject you excel at", category: "Service" },
  { title: "Blood Drive Hero", description: "Donate blood at the campus blood drive", category: "Service" },
  
  # Academic
  { title: "Attend Office Hours", description: "Visit office hours for 3 different professors", category: "Academic" },
  { title: "Research Paper Publication", description: "Submit a paper to an academic journal", category: "Academic" },
  { title: "Perfect Attendance", description: "Don't miss a single class for an entire semester", category: "Academic" },
  { title: "Library Research Workshop", description: "Complete a research skills workshop", category: "Academic" },
  
  # Athletic
  { title: "Join Intramural Sports", description: "Play in any intramural league", category: "Athletic" },
  { title: "5K Fun Run", description: "Complete the annual campus 5K", category: "Athletic" },
  { title: "Gym Regular", description: "Visit the campus gym 20 times in a month", category: "Athletic" },
  
  # Creative
  { title: "Art Gallery Submission", description: "Submit artwork to the student gallery", category: "Creative" },
  { title: "Open Mic Performance", description: "Perform at an open mic night", category: "Creative" },
  { title: "Creative Writing Contest", description: "Enter the annual writing contest", category: "Creative" },
  { title: "Photography Exhibition", description: "Display your photos in a campus exhibition", category: "Creative" }
]

quest_templates.each do |quest_data|
  category = Category.find_by(name: quest_data[:category])
  # Assign a random teacher as the quest creator
  creator = teachers.sample
  Quest.create!(
    title: quest_data[:title],
    description: quest_data[:description],
    category: category,
    creator: creator
  )
end

puts "✅ Created #{Quest.count} quests"

# Create Completions
puts "\n✅ Creating quest completions..."

quests = Quest.all.to_a
completion_count = 0

# Give each student random completions (0-15 quests)
students.each do |student|
  num_completions = rand(0..15)
  completed_quests = quests.sample(num_completions)
  
  completed_quests.each do |quest|
    # Skip if student is the creator of this quest
    next if quest.creator_id == student.id
    
    Completion.create!(
      user: student,
      quest: quest,
      completed_at: Faker::Time.between(from: 90.days.ago, to: Time.now)
    )
    completion_count += 1
  end
end

# Give teachers some completions too (0-5 quests)
teachers.each do |teacher|
  num_completions = rand(0..5)
  completed_quests = quests.sample(num_completions)
  
  completed_quests.each do |quest|
    # Skip if teacher is the creator of this quest
    next if quest.creator_id == teacher.id
    
    Completion.create!(
      user: teacher,
      quest: quest,
      completed_at: Faker::Time.between(from: 90.days.ago, to: Time.now)
    )
    completion_count += 1
  end
end

puts "✅ Created #{completion_count} quest completions"

# Summary
puts "\n" + "=" * 50
puts "🎉 SEED COMPLETE!"
puts "=" * 50
puts "📊 Summary:"
puts "  • #{User.count} users (#{User.teacher.count} teachers, #{User.student.count} students)"
puts "  • #{Category.count} categories"
puts "  • #{Organization.count} organizations"
puts "  • #{OrganizationMembership.count} memberships"
puts "  • #{Quest.count} quests"
puts "  • #{Completion.count} completions"
puts ""
puts "🔑 Login credentials:"
puts "  Teacher: alice@nku.edu / password"
puts "  Student: bob@nku.edu / password"
puts "  (All users have password: 'password')"
puts "=" * 50

