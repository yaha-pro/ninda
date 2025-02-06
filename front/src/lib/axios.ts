import axios from 'axios';
import { User } from './types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// DeviseTokenAuthのレスポンスヘッダーを保存
const saveAuthHeaders = (headers: { [key: string]: string }) => {
  const authHeaders = {
    'access-token': headers['access-token'],
    'client': headers['client'],
    'uid': headers['uid']
  };
  localStorage.setItem('authHeaders', JSON.stringify(authHeaders));
};

// 保存されたヘッダーをリクエストに追加
api.interceptors.request.use((config) => {
  const authHeaders = localStorage.getItem('authHeaders');
  if (authHeaders) {
    const headers = JSON.parse(authHeaders);
    config.headers = {
      ...config.headers,
      ...headers
    };
  }
  return config;
});

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
