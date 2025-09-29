class User < ApplicationRecord
  extend ActiveRecord::Enum

  enum :role, { teacher: 0, student: 1 }

  has_many :completions, dependent: :destroy
  has_many :completed_quests, through: :completions, source: :quest
end
