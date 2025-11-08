class CreateOrganizationMemberships < ActiveRecord::Migration[8.0]
  def change
    create_table :organization_memberships do |t|
      t.references :user, null: false, foreign_key: true
      t.references :organization, null: false, foreign_key: true
      t.string :role, null: false, default: 'member'
      t.string :status, null: false, default: 'pending'

      t.timestamps

      t.index [ :user_id, :organization_id ], unique: true
      t.index [ :organization_id, :role, :status ]
    end
  end
end
