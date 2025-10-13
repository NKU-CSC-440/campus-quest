class User < ApplicationRecord
  extend ActiveRecord::Enum

  has_secure_password

  validates :email, presence: true, uniqueness: true
  validates :name, presence: true
  validates :role, presence: true

  enum :role, { teacher: 0, student: 1 }

  has_many :completions, dependent: :destroy
  has_many :completed_quests, through: :completions, source: :quest
end
