class User < ApplicationRecord
  extend ActiveRecord::Enum

  has_secure_password

  VALID_EMAIL_REGEX=/\A[\w+\-.]+@[a-z\d\-.]+\.[a-z]+\z/i
      validates:email, presence: true,
      uniqueness: {case_sensitive: false},
      length:{maximum: 105},
      format:{with: VALID_EMAIL_REGEX}

  enum :role, { teacher: 0, student: 1 }

  has_many :completions, dependent: :destroy
  has_many :completed_quests, through: :completions, source: :quest
end
