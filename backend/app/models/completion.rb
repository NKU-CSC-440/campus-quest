class Completion < ApplicationRecord
  belongs_to :user
  belongs_to :quest

  validates :status, presence: true, inclusion: { in: %w[pending approved rejected] }

  scope :pending, -> { where(status: 'pending') }
  scope :approved, -> { where(status: 'approved') }
  scope :rejected, -> { where(status: 'rejected') }

  def approve!
    update!(status: 'approved', completed_at: Time.current)
  end

  def reject!
    update!(status: 'rejected')
  end
end
