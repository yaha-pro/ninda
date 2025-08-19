// ユーザー情報の型定義
export interface User {
  id: string;
  email: string;
  name: string;
  bio?: string;
  profile_image?: string | { url: string };
  total_play_count: number;
  posts_count: number;
}

export interface LoginResponse {
  data: User;
}

export interface RegisterParams {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface UpdateProfileParams {
  name: string;
  bio?: string;
}

// 認証コンテキストの型定義
export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null | ((prev: User | null) => User | null)) => void;
  isAuthenticated: boolean;
  isLoggingOutRef: React.MutableRefObject<boolean>;
}

// 投稿の型定義
export interface Post {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  thumbnail_image?: string | { url: string };
  display_text: string;
  typing_text: string;
  created_at: string;
  updated_at: string;
  // tags: string[]; // タグ機能実装時に追加
  user?: User;
  likes_count?: number;
  is_liked?: boolean;
  comments_count?: number;
}

// 投稿作成時のパラメータ
export interface CreatePostParams {
  title: string;
  description: string;
  display_text: string;
  typing_text: string;
  // tags: string[]; // タグ機能実装時に追加
}

// タイピング結果の型定義
export interface TypingResult {
  id: string;
  user_id: string;
  post_id: string;
  play_time: number;
  accuracy: number;
  mistake_count: number;
  created_at: string;
  post?: Post;
  rank?: number;
  user_name?: string;
  total_players?: number;
}

// タイピング結果を保存するためのパラメータ
export interface SaveTypingResultParams {
  post_id: string;
  play_time: number;
  accuracy: number;
  mistake_count: number;
}

// 擬似ランキングを取得するためのパラメータ
export interface GetPseudoRankParams {
  post_id: string;
  play_time: number;
  accuracy: number;
}

// 擬似ランキングの型定義
export interface PseudoRankResult {
  rank: number;
  total_players: number;
}

// いいねの型定義
export interface LikeResponse {
  success: boolean;
  likes_count: number;
  message?: string;
}

// コメントの型定義
// Comment型を追加
export interface Comment {
  id: string;
  content: string;
  user_id: string;
  post_id: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    profile_image?: string | { url: string };
  };
}
