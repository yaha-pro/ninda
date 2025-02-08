import axios from 'axios';
import Cookies from 'js-cookie';
import { User } from './types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

console.log('NODE_ENV:', process.env.NODE_ENV);

// 環境判定ロジック
const isProduction = process.env.NODE_ENV === 'production';

 // DeviseTokenAuth のレスポンスヘッダーを保存（Cookies に保存）
const saveAuthHeaders = (headers: { [key: string]: string }) => {
  Cookies.set('access-token', headers['access-token'], { secure: isProduction, sameSite: 'Lax' });
  Cookies.set('client', headers['client'], { secure: isProduction, sameSite: 'Lax' });
  Cookies.set('uid', headers['uid'], { secure: isProduction, sameSite: 'Lax' });
};

// 保存されたヘッダーをリクエストに追加
api.interceptors.request.use(
  (config) => {
    const accessToken = Cookies.get('access-token');
    const client = Cookies.get('client');
    const uid = Cookies.get('uid');

    console.log("🛠 リクエストに追加するクッキー:", { accessToken, client, uid });

    if (accessToken && client && uid) {
      config.headers['access-token'] = accessToken;
      config.headers['client'] = client;
      config.headers['uid'] = uid;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// セッションの確認
export async function checkSession(): Promise<User | null> {
  try {
    console.log("セッション確認");
    const response = await api.get('/auth/validate_token');
    return response.data.data;
  } catch {
    return null;
  }
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

// ログイン
export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/sign_in', {
    email,
    password,
  });
  saveAuthHeaders(response.headers as { [key: string]: string });
  return response.data;
}

// 新規登録
export async function register(params: RegisterParams): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth', {
    name: params.name,
    email: params.email,
    password: params.password,
    password_confirmation: params.password_confirmation,
  });
  saveAuthHeaders(response.headers as { [key: string]: string });
  return response.data;
}

// プロフィール更新
export async function updateProfile(params: UpdateProfileParams): Promise<void> {
  const response = await api.put('/auth', {
    name: params.name,
    bio: params.bio
  });
  saveAuthHeaders(response.headers as { [key: string]: string });
}

// ログアウト
export async function logout(): Promise<void> {
  await api.delete('/auth/sign_out');
  Cookies.remove('auth', { path: '/' });
}