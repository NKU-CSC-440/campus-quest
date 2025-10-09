class Category < ApplicationRecord
  has_many :quests, dependent: :destroy

  validates :name, presence: true, uniqueness: true
  validates :score, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
end
