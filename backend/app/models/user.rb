class User < ApplicationRecord
  extend ActiveRecord::Enum

  has_secure_password

  validates :email, presence: true, uniqueness: true
  validates :name, presence: true
  validates :role, presence: true

  enum :role, { teacher: 0, student: 1 }

  has_many :completions, dependent: :destroy
  has_many :completed_quests, through: :completions, source: :quest

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
end
