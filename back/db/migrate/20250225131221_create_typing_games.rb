class CreateTypingGames < ActiveRecord::Migration[7.2]
  def change
    create_table :typing_games do |t|
      t.references :user, null: false, foreign_key: true
      t.references :post, null: false, foreign_key: true
      t.decimal :play_time, precision: 10, scale: 2, null: false
      t.decimal :accuracy, precision: 5, scale: 2, null: false
      t.integer :mistake_count, null: false, default: 0

      t.timestamps
    end
  end
end