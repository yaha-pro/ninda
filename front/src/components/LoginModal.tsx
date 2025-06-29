"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogContentWithoutClose,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LuMail, LuLock } from "react-icons/lu";
import { login, register, updateProfile } from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true); // ログイン画面か新規登録画面かを管理
  const [isProfile, setIsProfile] = useState(false); // 新規登録（プロフィール設定）の表示を管理
  const [email, setEmail] = useState(""); // メールアドレス
  const [password, setPassword] = useState(""); // パスワード
  const [passwordConfirmation, setPasswordConfirmation] = useState(""); // パスワード確認
  const [name, setUserName] = useState(""); // 表示名
  const [bio, setBio] = useState(""); // 自己紹介文
  const [isLoading, setIsLoading] = useState(false); // API通信中の状態

  const { setUser } = useAuth();

  useEffect(() => {
    if (!isOpen) {
      setIsLogin(true); // モーダルが閉じたときにログイン画面のリセット
      setEmail(""); // フィールドのリセット
      setPassword(""); // フィールドのリセット
      setPasswordConfirmation(""); // フィールドのリセット
      setUserName("");
      setBio("");
      setIsProfile(false);
      sessionStorage.removeItem("registrationState");
    }
  }, [isOpen]);

  // ページリロード時に新規登録状態を復元
  useEffect(() => {
    const registrationState = sessionStorage.getItem("registrationState");
    if (registrationState) {
      const state = JSON.parse(registrationState);
      setIsLogin(false); // ログインモードをオフ
      setIsProfile(state.isProfile || false); // モーダル表示状態を復元
      setEmail(state.email || ""); // 保存されているメールアドレスをセット
    }
  }, []);

  // モーダルの状態変更時にセッションストレージに保存
  useEffect(() => {
    const state = { isProfile, email };
    sessionStorage.setItem("registrationState", JSON.stringify(state));
  }, [isProfile, email]);

  /**
   * ログイン処理
   * メールアドレスとパスワードのバリデーションを行い、
   * APIを呼び出してログインを実行する
   */
  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("メールアドレスとパスワードを入力してください");
      return;
    }

    try {
      setIsLoading(true);
      const response = await login(email, password);
      setUser(response.data);
      toast.success("ログインしました");
      sessionStorage.removeItem("registrationState");
      onClose();
    } catch {
      toast.error("ログインに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 新規登録処理
   * メールアドレスとパスワードのバリデーションを行い、
   * APIを呼び出してアカウントを作成する
   */
  const handleRegister = async () => {
    if (!email || !password || !passwordConfirmation) {
      toast.error("すべての項目を入力してください");
      return;
    }

    if (password !== passwordConfirmation) {
      toast.error("パスワードが一致しません");
      return;
    }
    console.log(email, password, passwordConfirmation);

    try {
      setIsLoading(true);
      const response = await register({
        name: email,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setUser(response.data);
      setIsProfile(true);
      // 登録状態を保存
      sessionStorage.setItem(
        "registrationState",
        JSON.stringify({
          isProfile: true,
          email: email,
        })
      );
    } catch {
      toast.error("登録に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 新規登録処理（プロフィール設定）
   * 表示名と自己紹介文を設定して登録を完了する
   */
  const handleCompleteRegistration = async () => {
    if (!name) {
      toast.error("表示名を入力してください");
      return;
    }

    try {
      setIsLoading(true);
      await updateProfile({ name, bio });
      setUser((prev) => (prev ? { ...prev, name, bio } : null));
      toast.success("登録が完了しました");
      sessionStorage.removeItem("registrationState");
      onClose();
      setIsProfile(false); // モーダルが閉じたときにプロファイル設定画面のリセット
    } catch {
      toast.error("登録に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // 新規登録（プロフィール設定）の表示
  if (isProfile) {
    return (
      <Dialog open={isProfile} onOpenChange={() => {}}>
        {" "}
        {/* onOpenChangeを空の関数にして閉じれないようにする */}
        <DialogContentWithoutClose className="sm:max-w-[390px] h-[64vh]">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">
              新規登録
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* 表示名入力フィールド */}
            <div className="space-y-1">
              <label className="text-sm font-medium">表示名</label>
              <Input
                type="text"
                placeholder="忍打（ニックネーム）"
                value={name}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            {/* 自己紹介文入力フィールド */}
            <div className="space-y-1">
              <label className="text-sm font-medium">紹介文</label>
              <textarea
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="半角英数字"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
              />
            </div>
            {/* 登録完了ボタン */}
            <Button
              className="w-full bg-[#FF8D76] text-white hover:bg-red-500"
              onClick={handleCompleteRegistration}
              disabled={isLoading}
            >
              {isLoading ? "処理中..." : "登録する"}
            </Button>
          </div>
        </DialogContentWithoutClose>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[390px] h-[72vh]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {isLogin ? "ログイン" : "新規登録"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {isLogin ? (
            <form
              autoComplete="on"
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
              className="space-y-6"
            >
              {/* ログイン画面 */}
              <div className="space-y-1">
                <label className="text-sm font-medium">メールアドレス</label>
                <div className="relative">
                  <LuMail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="email"
                    name="email"
                    autoComplete="email"
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
              <Button
                type="submit"
                className="w-full bg-[#FF8D76] text-white hover:bg-red-500"
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? "処理中..." : "ログイン"}
              </Button>
              {/* <div className="text-center">
                <a href="#" className="text-sm text-blue-500 hover:underline">
                  パスワードを忘れた場合
                </a>
              </div> */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">または</span>
                </div>
              </div>
              {/* <Button
                variant="outline"
                className="w-full border-2"
              >
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  className="mr-2 h-6 w-6"
                />
                Googleでログイン
              </Button> */}
              <div className="text-center">
                <a
                  href="#"
                  className="text-sm text-orange-500 hover:underline"
                  onClick={() => setIsLogin(false)} // 新規登録画面に切り替える
                >
                  新規登録はこちらから
                </a>
              </div>
            </form>
          ) : (
            <form
              autoComplete="on"
              onSubmit={(e) => {
                e.preventDefault();
                handleRegister();
              }}
              className="space-y-6"
            >
              {" "}
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
                type="submit"
                className="w-full bg-[#FF8D76] text-white hover:bg-red-500"
                onClick={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? "処理中..." : "登録する"}
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">または</span>
                </div>
              </div>
              {/* <Button
                    variant="outline"
                    className="w-full border-2"
                  >
                    <img
                      src="https://www.google.com/favicon.ico"
                      alt="Google"
                      className="mr-2 h-6 w-6"
                    />
                    Googleで登録
                  </Button> */}
              <div className="text-center">
                <a
                  href="#"
                  className="text-sm text-blue-500 hover:underline"
                  onClick={() => setIsLogin(true)} // ログイン画面に戻る
                >
                  ログイン画面に戻る
                </a>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
