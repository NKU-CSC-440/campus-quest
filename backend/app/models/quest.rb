class Quest < ApplicationRecord
  has_many :completions, dependent: :destroy
  has_many :users, through: :completions
end
