class CreatePosts < ActiveRecord::Migration[7.2]
  def change
    create_table :posts do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title, null: false
      t.text :description
      t.text :display_text, null: false
      t.text :typing_text, null: false
      t.string :thumbnail_image
      t.integer :typing_play_count, default: 0

      t.timestamps
    end
  end
end
