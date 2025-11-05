class User < ApplicationRecord
  extend ActiveRecord::Enum

  has_secure_password

  validates :email, presence: true, uniqueness: true
  validates :name, presence: true
  validates :role, presence: true

  enum :role, { teacher: 0, student: 1 }

  has_many :completions, dependent: :destroy
  has_many :completed_quests, through: :completions, source: :quest

  has_many :created_quests, class_name: 'Quest', foreign_key: 'creator_id', dependent: :nullify

  has_many :organization_memberships, dependent: :destroy
  has_many :organizations, through: :organization_memberships

  def admin_of?(organization)
    organization_memberships.exists?(organization: organization, role: 'admin', status: 'active')
  end

  def member_of?(organization)
    organization_memberships.exists?(organization: organization, status: 'active')
  end

  def pending_application?(organization)
    organization_memberships.exists?(organization: organization, status: 'pending')
  end

  # Leaderboard class methods to avoid N+1 queries
  def self.global_leaderboard
    User.select('users.id, users.name, users.email, COALESCE(SUM(categories.score), 0) as score')
        .left_joins(completions: { quest: :category })
        .where('completions.id IS NULL OR completions.status = ?', 'approved')
        .group('users.id')
        .order('score DESC, users.name ASC')
        .map do |user|
          {
            id: user.id,
            name: user.name,
            email: user.email,
            score: user.score
          }
        end
  end

  def self.leaderboard_for_organization(organization_id)
    User.select('users.id, users.name, users.email, COALESCE(SUM(categories.score), 0) as score')
        .joins(:organization_memberships)
        .left_joins(completions: { quest: :category })
        .where(organization_memberships: { organization_id: organization_id, status: 'active' })
        .where('completions.id IS NULL OR completions.status = ?', 'approved')
        .group('users.id')
        .order('score DESC, users.name ASC')
        .map do |user|
          {
            id: user.id,
            name: user.name,
            email: user.email,
            score: user.score
          }
        end
  end
end
