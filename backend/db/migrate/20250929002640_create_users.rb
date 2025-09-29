class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.string :name
      t.string :email
      t.integer :role, null: false, default: 1  # default to student

      t.timestamps
    end
  end
end
