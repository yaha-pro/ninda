"use client";

import { useState } from "react";
import { LoginModal } from "./LoginModal";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { HamburgerMenu } from "@/components/ui/hamburger-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // ユーザーのイニシャルを取得する関数
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <img src="ninda_logo.png" alt="Ninda" className="w-32" />
          <div className="flex gap-6 align-items-center">
            <Button>投稿一覧</Button>
            {isAuthenticated ? (
              <>
                <Button>投稿する</Button>
                <Avatar className="h-12 w-12 border-white border-4 shadow-md">
                  <AvatarFallback className="bg-[#FF8D76] text-white font-semibold shadow-md">
                    {user ? getInitials(user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
              </>
            ) : (
              <>
                <Button onClick={() => setIsLoginModalOpen(true)}>
                  新規登録/ログイン
                </Button>
              </>
            )}
            <HamburgerMenu />
          </div>
        </div>
      </div>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </header>
  );
}
