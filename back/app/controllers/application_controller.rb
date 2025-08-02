class ApplicationController < ActionController::API
  include DeviseTokenAuth::Concerns::SetUserByToken

  private

  # 投稿レスポンス用メソッド
  def post_response(post)
    {
      id: post.id,
      user_id: post.user_id,
      title: post.title,
      description: post.description,
      display_text: post.display_text,
      typing_text: post.typing_text,
      thumbnail_image: post.thumbnail_image,
      typing_play_count: post.typing_play_count,
      likes_count: post.likes_count,
      is_liked: current_api_v1_user ? post.likes.exists?(user_id: current_api_v1_user.id) : false,
      created_at: post.created_at,
      updated_at: post.updated_at
    }
  end
end
