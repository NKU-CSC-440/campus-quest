class OrganizationMembership < ApplicationRecord
  belongs_to :user
  belongs_to :organization

  # Only enforce uniqueness for active/pending memberships
  validates :user_id, uniqueness: { 
    scope: :organization_id,
    conditions: -> { where(status: ['active', 'pending']) },
    message: 'already has an active or pending membership in this organization'
  }
  validates :role, inclusion: { in: %w[admin member] }
  validates :status, inclusion: { in: %w[pending rejected active inactive] }

  # Default values
  after_initialize :set_defaults, if: :new_record?

  private

  def set_defaults
    self.role ||= 'member'
    self.status ||= 'pending'
  end
end
