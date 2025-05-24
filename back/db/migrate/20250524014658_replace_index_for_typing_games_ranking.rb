class ReplaceIndexForTypingGamesRanking < ActiveRecord::Migration[7.2]
  def change
    # 古いインデックスを削除
    remove_index :typing_games, name: "index_typing_games_on_accuracy_and_play_time"

    # 新しい複合インデックスを追加
    add_index :typing_games,
              [:post_id, :accuracy, :play_time],
              order: { post_id: :asc, accuracy: :desc, play_time: :asc },
              name: "index_typing_games_on_post_and_accuracy_and_time"
  end
end
