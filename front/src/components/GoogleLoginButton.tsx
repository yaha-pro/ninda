"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { googleLogin } from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

interface GoogleLoginButtonProps {
  isLogin: boolean; // ログインモードか新規登録モードかを判定
  onSuccess?: () => void; // 成功時のコールバック
}

export function GoogleLoginButton({
  isLogin,
  onSuccess,
}: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);

      // Google Identity Services を使用してIDトークンを取得
      if (typeof window !== "undefined" && window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: async (response: GoogleCredentialResponse) => {
            try {
              if (response.credential) {
                // IDトークンをバックエンドに送信
                const result = await googleLogin(response.credential);
                setUser(result.data);
                toast.success(
                  isLogin ? "ログインしました" : "登録が完了しました"
                );
                onSuccess?.();
              } else {
                throw new Error("IDトークンが取得できませんでした");
              }
            } catch (error) {
              console.error("Google login error:", error);
              toast.error(
                isLogin ? "ログインに失敗しました" : "登録に失敗しました"
              );
            } finally {
              setIsLoading(false);
            }
          },
        });

        // ポップアップでGoogle認証を開始（ワンタップではなく）
        // 一時的な要素を作成してrenderButtonを呼び出し、即座にクリック
        const tempDiv = document.createElement("div");
        tempDiv.style.display = "none";
        document.body.appendChild(tempDiv);

        window.google.accounts.id.renderButton(tempDiv, {
          theme: "outline",
          size: "large",
          type: "standard",
          width: "100%",
        });

        // 作成されたボタンを自動クリック
        setTimeout(() => {
          const googleButton = tempDiv.querySelector(
            "div[role='button']"
          ) as HTMLElement;
          if (googleButton) {
            googleButton.click();
          }
          // 一時要素を削除
          document.body.removeChild(tempDiv);
        }, 100);
      } else {
        toast.error("Google認証の初期化に失敗しました");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Google login initialization error:", error);
      toast.error("Google認証の初期化に失敗しました");
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full border-2 bg-transparent hover:border-[#ff8d76] hover:bg-transparent hover:text-inherit"
      onClick={handleGoogleLogin}
      disabled={isLoading}
    >
      <FcGoogle className="mr-2 h-6 w-6 bg-white rounded-full"/>
      {isLoading ? "処理中..." : isLogin ? "Googleでログイン" : "Googleで登録"}
    </Button>
  );
}

// Google Identity Services の型定義
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            element: HTMLElement | null,
            config: {
              theme?: string;
              size?: string;
              type?: string;
              width?: string | number;
            }
          ) => void;
        };
      };
    };
  }
}
