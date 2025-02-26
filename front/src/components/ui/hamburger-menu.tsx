"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { RxHamburgerMenu } from "react-icons/rx";
import { LoginModal } from "../LoginModal";
import { useAuth } from "@/contexts/AuthContext";
import { logout } from "@/lib/axios";
import toast from "react-hot-toast";
import Link from "next/link";

export function HamburgerMenu() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, setUser } = useAuth();

  const handleLoginClick = () => {
    setIsLoginOpen(true);
    setIsMenuOpen(false); // メニューを閉じる
  };

  // ログアウト処理
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      toast.success("ログアウトしました");
    } catch {
      toast.error("ログアウトに失敗しました");
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <RxHamburgerMenu className="text-red-500 mt-1 w-10 h-10 hover:opacity-60 transition-opacity duration-300" />
        </SheetTrigger>
        <SheetContent side="right" className="w-64 bg-[#faf7ef] font-bold">
          <SheetHeader>
            <SheetTitle></SheetTitle>
          </SheetHeader>
          <nav className="mt-4 space-y-4 text-gray-600">
            {isAuthenticated ? (
              <>
                <Link href="/mypage" passHref className="block">
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2 text-lg hover:underline"
                  >
                    マイページ
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-lg hover:underline"
                >
                  ログアウト
                </button>
                <Link href="/create" passHref className="block">
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2 text-lg hover:underline"
                  >
                    投稿する
                  </button>
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={handleLoginClick}
                  className="block w-full text-left px-4 py-2 text-lg hover:underline"
                >
                  新規登録/ログイン
                </button>
              </>
            )}
            <a href="#" className="block px-4 py-2 text-lg hover:underline">
              使い方
            </a>
            <Link href="/posts" passHref className="block">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-2 text-lg hover:underline"
              >
                投稿一覧
              </button>
            </Link>
            <a href="#" className="block px-4 py-2 text-lg hover:underline">
              ユーザー一覧
            </a>
            <a href="#" className="block px-4 py-2 text-lg hover:underline">
              タグ一覧
            </a>
            <a href="#" className="block px-4 py-2 text-lg hover:underline">
              利用規約
            </a>
            <a href="#" className="block px-4 py-2 text-lg hover:underline">
              プライバシー
            </a>
            <a href="#" className="block px-4 py-2 text-lg hover:underline">
              お問い合わせ
            </a>
          </nav>
        </SheetContent>
      </Sheet>

      {/* ログインモーダル */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}
