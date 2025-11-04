class Quest < ApplicationRecord
  belongs_to :category
  belongs_to :creator, class_name: 'User', foreign_key: 'creator_id', optional: true

  validates :title, presence: true

  has_many :completions, dependent: :destroy
  has_many :users, through: :completions
end
