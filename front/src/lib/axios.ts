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
  const response = await api.post("/posts", params);
  return response.data;
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
  const response = await api.get("/typing_games/user_results");
  return response.data;
}

// ユーザーのタイピング結果履歴の取得
export async function getUserTypingResults(id: string): Promise<TypingResult[]> {
  const response = await api.get(`/typing_games/typing_results${id}`);
  return response.data;
}
