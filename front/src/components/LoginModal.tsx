"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LuMail, LuLock } from "react-icons/lu";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true); // ログイン画面か新規登録画面かを管理
  const [isProfile, setIsProfile] = useState(false); // 新規登録（プロフィール設定）のフラグ
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState(""); // 新規登録用
  const [displayName, setDisplayName] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setIsLogin(true); // モーダルが閉じたときにログイン画面にリセット
      setIsProfile(false); // モーダルが閉じたときにプロファイル設定画面のリセット
      setEmail(""); // フィールドのリセット
      setPassword(""); // フィールドのリセット
      setPasswordConfirmation(""); // フィールドのリセット
      setDisplayName(""); // フィールドのリセット
      setUserId(""); // フィールドのリセット
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[390px] h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {isLogin ? "ログイン" : "新規登録"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {isLogin ? (
            <>
              {/* ログイン画面 */}
              <div className="space-y-1">
                <label className="text-sm font-medium">メールアドレス</label>
                <div className="relative">
                  <LuMail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="ninda@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">パスワード</label>
                <div className="relative">
                  <LuLock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="半角英数字"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <Button className="w-full bg-[#FF8D76] text-white hover:bg-red-500">
                ログイン
              </Button>
              <div className="text-center">
                <a href="#" className="text-sm text-blue-500 hover:underline">
                  パスワードを忘れた場合
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">または</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full border-2"
              >
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  className="mr-2 h-6 w-6"
                />
                Googleでログイン
              </Button>
              <div className="text-center">
                <a
                  href="#"
                  className="text-sm text-orange-500 hover:underline"
                  onClick={() => setIsLogin(false)} // 新規登録画面に切り替える
                >
                  新規登録はこちらから
                </a>
              </div>
            </>
          ) : (
            <>
              {!isProfile ? (
                <>
                  {/* 新規登録画面 */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium">メールアドレス</label>
                    <div className="relative">
                      <LuMail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="ninda@example.com"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">パスワード</label>
                    <div className="relative">
                      <LuLock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="半角英数字"
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">パスワード確認</label>
                    <div className="relative">
                      <LuLock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="半角英数字"
                        className="pl-10"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-[#FF8D76] text-white hover:bg-red-500"
                    onClick={() => setIsProfile(true)} // 新規登録（プロフィール設定）画面に切り替える
                  >
                    登録する
                  </Button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">または</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-2"
                  >
                    <img
                      src="https://www.google.com/favicon.ico"
                      alt="Google"
                      className="mr-2 h-6 w-6"
                    />
                    Googleで登録
                  </Button>
                  <div className="text-center">
                    <a
                      href="#"
                      className="text-sm text-blue-500 hover:underline"
                      onClick={() => setIsLogin(true)} // ログイン画面に戻る
                    >
                      ログイン画面に戻る
                    </a>
                  </div>
                </>
              ) : (
                <>
                  {/* 新規登録画面（プロフィール設定） */}
                  <div className="h-[60vh]">
                    <div className="space-y-1 mb-7">
                      <label className="text-sm font-medium">表示名</label>
                      <Input
                      type="text"
                      placeholder="忍打（ニックネーム）"
                      className="pl-5"
                      value={displayName || ""}
                      onChange={(e) => setDisplayName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1 mb-10">
                      <label className="text-sm font-medium">ユーザーID</label>
                      <Input
                      type="text"
                      placeholder="半角英数字"
                      className="pl-5"
                      value={userId || ""}
                      onChange={(e) => setUserId(e.target.value)}
                      />
                    </div>
                    <Button className="w-full bg-[#FF8D76] text-white hover:bg-red-500">
                      登録する
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
