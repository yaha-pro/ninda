"use client";

import { useState } from "react";
import { LoginModal } from "./LoginModal";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { HamburgerMenu } from "@/components/ui/hamburger-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import Image from "next/image";
import ninda_header_Logo from "/public/ninda_logo.png";

export function Header() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // ユーザーのイニシャルを取得する関数
  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="fixed top-0 left-0 w-full shadow-sm bg-[#faf7ef] z-50">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" passHref>
            <Image
              src={ninda_header_Logo}
              alt="Ninda"
              width={128}
              height={32}
              className="w-32"
            />
          </Link>
          <div className="flex gap-6 align-items-center">
            <Link href="/posts" passHref>
              <Button>投稿一覧</Button>
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/create" passHref>
                  <Button>投稿する</Button>
                </Link>
                <Link href="/mypage" passHref>
                  <Avatar className="h-12 w-12 border-white border-4 shadow-md">
                    <AvatarFallback className="bg-[#FF8D76] text-white font-semibold shadow-md">
                      {user ? getInitials(user.name) : "ND"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
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
