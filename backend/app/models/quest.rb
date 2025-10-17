class Quest < ApplicationRecord
  belongs_to :category

  validates :title, presence: true

  has_many :completions, dependent: :destroy
  has_many :users, through: :completions
end
