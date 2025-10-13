class OrganizationMembership < ApplicationRecord
  belongs_to :user
  belongs_to :organization

  validates :user_id, uniqueness: { scope: :organization_id }
  validates :role, inclusion: { in: %w[admin member] }
  validates :status, inclusion: { in: %w[pending active inactive] }

  # Default values
  after_initialize :set_defaults, if: :new_record?

  private

  def set_defaults
    self.role ||= 'member'
    self.status ||= 'pending'
  end
end
