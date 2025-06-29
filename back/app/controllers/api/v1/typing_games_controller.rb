class Api::V1::TypingGamesController < ApplicationController
  before_action :authenticate_api_v1_user!, only: [:create]

  def index
    @typing_games = TypingGame.all
    render json: @typing_games
  end

  def create
    # user_id, post_id の組み合わせで1件だけ持つ
    @typing_game = TypingGame.find_or_initialize_by(
      user: current_api_v1_user,
      post_id: typing_game_params[:post_id]
    )

    # 新しいスコアが既存より優れていれば更新
    if better_than?(@typing_game, typing_game_params)
      @typing_game.assign_attributes(typing_game_params)

      if @typing_game.save
        render json: @typing_game, status: :created
      else
        render json: @typing_game.errors, status: :unprocessable_entity
      end
    else
      # 既存のスコアが上回っている → そのスコアの情報を返す
      render json: @typing_game, status: :ok
    end
  end

  def ranking
    post_id = params[:post_id]
    unless post_id.present?
      render json: { error: "post_id is required" }, status: :bad_request and return
    end

    ranking_sql = ActiveRecord::Base.send(:sanitize_sql_array, [<<-SQL, post_id])
      SELECT
        ranked.post_id,
        ranked.user_id,
        ranked.user_name,
        ranked.accuracy,
        ranked.play_time,
        RANK() OVER (
          ORDER BY ranked.accuracy DESC, ranked.play_time ASC
        ) AS rank
      FROM (
        SELECT DISTINCT ON (tg.user_id)
          tg.post_id,
          tg.user_id,
          u.name AS user_name,
          tg.accuracy,
          tg.play_time
        FROM typing_games tg
        INNER JOIN users u ON u.id = tg.user_id
        WHERE tg.post_id = ?
        ORDER BY tg.user_id, tg.accuracy DESC, tg.play_time ASC
      ) AS ranked
      LIMIT 100
    SQL

    records = ActiveRecord::Base.connection.exec_query(ranking_sql)
    render json: records.to_a, status: :ok
  end

  # プレイ後のランキング／プレイトータル人数を取得
  def pseudo_rank
    post_id = params[:post_id]
    accuracy = params[:accuracy].to_f
    play_time = params[:play_time].to_f

    unless post_id.present?
      render json: { error: "post_id is required" }, status: :bad_request and return
    end

    # ベストスコア一覧を取得
    base_sql = <<-SQL
      SELECT DISTINCT ON (user_id)
        user_id,
        accuracy,
        play_time
      FROM typing_games
      WHERE post_id = ?
      ORDER BY user_id, accuracy DESC, play_time ASC
    SQL

    base_scores = ActiveRecord::Base.connection.exec_query(
      ActiveRecord::Base.send(:sanitize_sql_array, [base_sql, post_id])
    ).to_a

    # 仮スコア作成
    temp_score = { 'user_id' => current_api_v1_user&.id, 'accuracy' => accuracy, 'play_time' => play_time }

    # 現在のログインユーザーのベストスコア
    current_best = nil
    if current_api_v1_user
      current_best = base_scores.find { |s| s["user_id"] == current_api_v1_user.id }
    end

    # 仮ランキング配列を作成
    scores = base_scores.dup

    if current_api_v1_user
      # 今回の成績がベストより良ければ、自分の既存スコアを削除して仮スコア追加
      if current_best.nil? ||
          accuracy > current_best['accuracy'].to_f ||
          (accuracy == current_best['accuracy'].to_f && play_time < current_best['play_time'].to_f)
        scores.reject! { |s| s["user_id"] == current_api_v1_user.id }
        scores << temp_score
      else
        # 成績がベストより劣る → 仮スコアを比較用に追加するがトータル人数には含める
        scores << temp_score
      end
    else
      # ゲスト → 仮スコアだけ追加
      scores << temp_score
    end

    # ランキングを計算
    sorted = scores.sort_by { |s| [-s['accuracy'].to_f, s['play_time'].to_f] }
    rank = sorted.index(temp_score) + 1

    # トータル人数（仮スコアがランキングに追加されたかどうかでカウント）
    total_players = base_scores.size
    if current_api_v1_user.nil? || (current_best && (
      accuracy < current_best['accuracy'].to_f ||
      (accuracy == current_best['accuracy'].to_f && play_time > current_best['play_time'].to_f)
    ))
      total_players += 1
    elsif current_best.nil?
      total_players += 1
    end

    render json: { rank: rank, total_players: total_players }, status: :ok
  end

  private

  def better_than?(existing_game, new_params)
    return true if existing_game.new_record? # まだ保存されていないならOK

    new_accuracy = new_params[:accuracy].to_f
    new_time = new_params[:play_time].to_f
    old_accuracy = existing_game.accuracy
    old_time = existing_game.play_time

    # より高い正確率、または同じ正確率でより早ければ上書き
    new_accuracy > old_accuracy ||
    (new_accuracy == old_accuracy && new_time < old_time)
  end

  def typing_game_params
    params.require(:typing_game).permit(:post_id, :play_time, :accuracy, :mistake_count, :score)
  end
end