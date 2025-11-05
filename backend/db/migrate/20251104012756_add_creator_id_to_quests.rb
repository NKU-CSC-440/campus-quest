class AddCreatorIdToQuests < ActiveRecord::Migration[8.0]
  def change
    add_reference :quests, :creator, foreign_key: { to_table: :users }
  end
end
