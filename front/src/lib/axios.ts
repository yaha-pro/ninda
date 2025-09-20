import axios from "axios";
import Cookies from "js-cookie";
import {
  User,
  LoginResponse,
  RegisterParams,
  UpdateProfileParams,
  CreatePostParams,
  Post,
  SaveTypingResultParams,
  TypingResult,
  GetPseudoRankParams,
  PseudoRankResult,
  LikeResponse,
  Comment,
} from "./types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

console.log("NODE_ENV:", process.env.NODE_ENV);

// 環境判定ロジック
const isProduction = process.env.NODE_ENV === "production";

// DeviseTokenAuthのレスポンスヘッダーを保存
const saveAuthHeaders = (headers: { [key: string]: string }) => {
  const authHeaders = {
    "access-token": headers["access-token"],
    client: headers["client"],
    uid: headers["uid"],
  };
  // js-cookieを使用してCookieを保存（30日間有効）
  Cookies.set("auth", JSON.stringify(authHeaders), {
    secure: isProduction,
    sameSite: "Lax",
    expires: 14,
    path: "/",
  });
};

// 保存されたヘッダーをリクエストに追加
api.interceptors.request.use((config) => {
  const authCookie = Cookies.get("auth");
  if (authCookie) {
    const headers = JSON.parse(authCookie);
    config.headers = {
      ...config.headers,
      ...headers,
    };
  }
  return config;
});

// セッションの確認
export async function checkSession(): Promise<User | null> {
  try {
    console.log("セッション確認");
    const response = await api.get("/auth/validate_token");
    console.log(response);
    return response.data.data;
  } catch {
    return null;
  }
}

// ログイン
export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/sign_in", {
    email,
    password,
  });
  saveAuthHeaders(response.headers as { [key: string]: string });
  return response.data;
}

// Google認証用の関数（IDトークン方式）
export async function googleLogin(idToken: string): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/google", {
    id_token: idToken,
  });
  // レスポンスからトークンを取得してヘッダーに保存
  saveAuthHeaders(response.headers as { [key: string]: string });
  return response.data;
}

// 新規登録
export async function register(params: RegisterParams): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth", {
    name: params.name,
    email: params.email,
    password: params.password,
    password_confirmation: params.password_confirmation,
  });
  saveAuthHeaders(response.headers as { [key: string]: string });
  return response.data;
}

// プロフィール更新
export async function updateProfile(
  params: UpdateProfileParams
): Promise<void> {
  const response = await api.put("/auth", {
    name: params.name,
    bio: params.bio,
  });
  saveAuthHeaders(response.headers as { [key: string]: string });
}

// ログアウト
export async function logout(): Promise<void> {
  await api.delete("/auth/sign_out");
  Cookies.remove("auth", { path: "/" });
}

// 投稿の作成
export async function createPost(params: CreatePostParams): Promise<Post> {
  console.log(params);
  const response = await api.post("/posts", params);
  console.log(response.data);
  return response.data.post;
}

// 投稿一覧の取得
export async function getPosts(): Promise<Post[]> {
  const response = await api.get("/posts");
  return response.data;
}

// 投稿の取得
export async function getPost(id: string): Promise<Post> {
  const response = await api.get(`/posts/${id}`);
  return response.data;
}

// 投稿の更新
export async function updatePost(
  id: string,
  params: Partial<CreatePostParams>
): Promise<Post> {
  const response = await api.put(`/posts/${id}`, params);
  return response.data;
}

// 投稿の削除
export async function deletePost(id: string): Promise<void> {
  await api.delete(`/posts/${id}`);
}

// ユーザー情報の取得
export async function getUser(id: string): Promise<User> {
  const response = await api.get(`/users/${id}`);
  return response.data;
}

// ユーザー一覧取得
export async function getUsers(): Promise<User[]> {
  const response = await api.get("/users");
  console.log("users:", response.data); // 状態更新後の `users` を確認
  return response.data;
}

// タイピング結果の保存
export async function saveTypingResult(
  params: SaveTypingResultParams
): Promise<TypingResult> {
  const response = await api.post("/typing_games", {
    typing_game: {
      post_id: params.post_id,
      play_time: params.play_time,
      accuracy: params.accuracy,
      mistake_count: params.mistake_count,
    },
  });
  return response.data;
}

// カレントユーザーのタイピング結果履歴の取得
export async function getCurrentUserTypingResults(): Promise<TypingResult[]> {
  const response = await api.get("/mypage/typing_results");
  return response.data;
}

// カレントユーザーの投稿を取得
export async function getCurrentUserPosts(): Promise<Post[]> {
  const response = await api.get("/mypage/posts");
  return response.data;
}

// ユーザーのタイピング結果履歴の取得
export async function getUserTypingResults(
  id: string
): Promise<TypingResult[]> {
  const response = await api.get(`/users/${id}/user_typing_results`);
  return response.data;
}

// ユーザーの投稿を取得
export async function getUserPosts(id: string): Promise<Post[]> {
  const response = await api.get(`/users/${id}/posts`);
  return response.data;
}

// ランキングの取得
export async function getRanking(postId: number): Promise<TypingResult[]> {
  const response = await api.get("/typing_games/ranking", {
    params: { post_id: postId },
  });
  return response.data;
}

// プレイ後のランキングの取得
export async function getPseudoRank(
  params: GetPseudoRankParams
): Promise<PseudoRankResult> {
  const response = await api.get("/typing_games/pseudo_rank", {
    params: {
      post_id: params.post_id,
      play_time: params.play_time,
      accuracy: params.accuracy,
    },
  });
  return response.data;
}

// プロフィール画像の更新
export async function updateProfileImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("user[profile_image]", file);

  const response = await api.put("/mypage/profile_image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.profile_image_url; // サーバーが返すURLを使う
}

// サムネイル画像のアップロード
export async function uploadThumbnailImage(
  id: string,
  file: File
): Promise<string> {
  const formData = new FormData();
  formData.append("thumbnail_image", file);

  const response = await api.post(`/posts/${id}/upload_thumbnail`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

// いいね追加
export async function likePost(postId: string): Promise<LikeResponse> {
  const response = await api.post(`/posts/${postId}/like`);
  return response.data;
}

// いいね削除
export async function unlikePost(postId: string): Promise<LikeResponse> {
  const response = await api.delete(`/posts/${postId}/like`);
  return response.data;
}

// いいねしたユーザー一覧を取得
export async function getLikedUsers(postId: string): Promise<User[]> {
  const response = await api.get(`/posts/${postId}/like/users`);
  return response.data;
}

// カレントユーザーがいいねした投稿を取得
export async function getCurrentUserLikedPosts(): Promise<Post[]> {
  const response = await api.get("/mypage/liked_posts");
  return response.data;
}

// ユーザーがいいねした投稿を取得
export async function getUserLikedPosts(id: string): Promise<Post[]> {
  const response = await api.get(`/users/${id}/liked_posts`);
  return response.data;
}

// コメント一覧を取得
export async function getComments(postId: string): Promise<Comment[]> {
  const response = await api.get(`/posts/${postId}/comments`);
  return response.data;
}

// コメントを作成
export async function createComment(
  postId: string,
  content: string
): Promise<Comment> {
  const response = await api.post(`/posts/${postId}/comments`, {
    comment: { content },
  });
  return response.data;
}

// コメントを更新
export async function updateComment(
  commentId: string,
  content: string
): Promise<Comment> {
  const response = await api.put(`/comments/${commentId}`, {
    comment: { content },
  });
  return response.data;
}

// コメントを削除
export async function deleteComment(commentId: string): Promise<void> {
  await api.delete(`/comments/${commentId}`);
}

// アカウント削除
export async function deleteAccount(): Promise<void> {
  await api.delete("/mypage/account");
  Cookies.remove("auth", { path: "/" });
}
