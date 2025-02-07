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

// DeviseTokenAuthのレスポンスヘッダーを保存（Cookiesに保存）
const saveAuthHeaders = (headers: { [key: string]: string }) => {
  Cookies.set('access-token', headers['access-token'], { secure: true, sameSite: 'Strict' });
  Cookies.set('client', headers['client'], { secure: true, sameSite: 'Strict' });
  Cookies.set('uid', headers['uid'], { secure: true, sameSite: 'Strict' });
};

// 保存されたヘッダーをリクエストに追加
api.interceptors.request.use(
  (config) => {
    const accessToken = Cookies.get('access-token');
    const client = Cookies.get('client');
    const uid = Cookies.get('uid');

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

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/sign_in', {
    email,
    password,
  });
  saveAuthHeaders(response.headers as { [key: string]: string });
  return response.data;
}

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

export async function updateProfile(params: UpdateProfileParams): Promise<void> {
  const response = await api.put('/auth', { 
    name: params.name, 
    bio: params.bio 
  });
  saveAuthHeaders(response.headers as { [key: string]: string });
}
