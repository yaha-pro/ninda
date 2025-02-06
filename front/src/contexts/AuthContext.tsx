"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { User, AuthContextType } from '@/lib/types';

// 認証コンテキストの作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 認証コンテキストプロバイダーコンポーネント
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// 認証コンテキストを使用するためのカスタムフック
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}