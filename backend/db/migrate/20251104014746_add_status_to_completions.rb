class AddStatusToCompletions < ActiveRecord::Migration[8.0]
  def change
    add_column :completions, :status, :string, default: 'pending', null: false
    add_index :completions, :status
  end
end
