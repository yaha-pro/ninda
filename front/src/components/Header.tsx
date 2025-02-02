"use client";

import { Button } from './ui/button';
import { HamburgerMenu } from "@/components/ui/HamburgerMenu";

export function Header() {
  return (
    <header className="shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <img src="ninda_logo.png" alt="Ninda" className="w-32" />
          <div className="flex gap-5 align-items-center">
            <Button>投稿一覧</Button>
            <Button>新規登録/ログイン</Button>
            <HamburgerMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
