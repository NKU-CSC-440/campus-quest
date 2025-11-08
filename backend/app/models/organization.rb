class Organization < ApplicationRecord
  has_many :organization_memberships, dependent: :destroy
  has_many :users, through: :organization_memberships

  validates :name, presence: true, uniqueness: true
  validates :description, presence: true

  def admins
    users.where(organization_memberships: { role: "admin", status: "active" })
  end

  def members
    users.where(organization_memberships: { role: "member", status: "active" })
  end

  def pending_applications
    organization_memberships.where(status: "pending")
  end
end
