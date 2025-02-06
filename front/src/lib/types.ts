// ユーザー情報の型定義
export interface User {
    id: number;
    email: string;
    name: string;
    bio?: string;
  }

  // 認証コンテキストの型定義
  export interface AuthContextType {
    user: User | null;
    setUser: (user: User | null | ((prev: User | null) => User | null)) => void;
    isAuthenticated: boolean;
  }