class AddIndexToTypingGamesForRanking < ActiveRecord::Migration[7.2]
  def change
    add_index :typing_games, [:accuracy, :play_time],
              order: { accuracy: :desc, play_time: :asc },
              name: 'index_typing_games_on_accuracy_and_play_time'
  end
end
