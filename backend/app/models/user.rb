class User < ApplicationRecord
  extend ActiveRecord::Enum

  enum :role, { teacher: 0, student: 1 }
end
