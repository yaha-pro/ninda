"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, AuthContextType } from '@/lib/types';
import { checkSession } from '@/lib/axios';
import Cookies from 'js-cookie';

// 認証コンテキストの作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 認証コンテキストプロバイダーコンポーネント
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  console.log("認証コンテキストプロバイダーコンポーネントチェック");

  // 初回マウント時にセッションを確認（自動ログイン）
  useEffect(() => {
    console.log("useEffectチェック");
    const validateSession = async () => {
      try {
        // authCookieが存在する場合のみセッションを確認
        const authCookie = Cookies.get('auth');
        console.log(authCookie);
        if (authCookie) {
          console.log("セッション確認開始");
          const userData = await checkSession();
          setUser(userData);
        }
      } catch (error) {
        console.error('Session validation failed:', error);
        console.log("セッション確認失敗");
      } finally {
        setLoading(false);
        console.log("セッション確認完了");
      }
    };

    validateSession();
  }, []);

  // ローディング中はローディング表示を返す
  if (loading) {
    return <div>Loading...</div>;
  }

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