"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getCurrentUserTypingResults,
  getRanking,
  updateProfileImage,
  checkSession,
  deleteAccount,
} from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import type { TypingResult } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ProfileEditModal } from "@/components/ProfileEditModal";
import Link from "next/link";
import ResultsTable from "@/components/Results-table";
import PostsList from "@/components/Posts-list";
import LikesList from "@/components/Likes-list";
import { Pencil, Camera, ImageIcon, FolderOpen, Loader2 } from "lucide-react";
import { FiMoreVertical, FiAlertTriangle } from "react-icons/fi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import toast from "react-hot-toast";
import { usePathname } from "next/navigation";

export default function MyPage() {
  const { user, isAuthenticated, setUser, clearAuthState, isLoggingOutRef } = useAuth();
  const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false);
  const [results, setResults] = useState<TypingResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // 未ログインならエラーページへリダイレクト
  useEffect(() => {
    if (
      !isAuthenticated &&
      pathname === "/mypage" &&
      !isLoggingOutRef.current
    ) {
      router.push("/error");
    }
  }, [isAuthenticated, pathname, router, isLoggingOutRef]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const typingResults = await getCurrentUserTypingResults(); // 自分のタイピング結果を取得
        // 各投稿のランキングを取得し、結果をマージ
        const resultsWithRank: TypingResult[] = await Promise.all(
          typingResults.map(async (result) => {
            try {
              const ranking = await getRanking(Number(result.post_id)); // 各投稿の全体ランキングを取得
              const myResult =
                ranking.findIndex((r) => r.user_id === result.user_id) + 1; // 自分の順位を取得
              console.log("自分のランキング", myResult);
              return {
                ...result,
                rank: myResult ?? undefined, // 全体ランキングの順位を反映
              };
            } catch (error) {
              console.error(
                `Failed to fetch ranking for post ${result.post_id}:`,
                error
              );
              return {
                ...result,
                rank: undefined,
              };
            }
          })
        );
        setResults(resultsWithRank);
      } catch (error) {
        console.error("Failed to fetch typing results or ranking:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchResults();
      if (user.profile_image) {
        const image =
          typeof user.profile_image === "string"
            ? user.profile_image
            : user.profile_image.url;
        console.log("プロフィール画像", image);
        setProfileImage(image);
      }
    }
  }, [user]);

  // ユーザーのイニシャルを取得する関数
  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  // 画像ファイルの処理
  const handleImageSelect = async (file: File) => {
    if (file) {
      // ファイルサイズチェック（5MB制限）
      if (file.size > 5 * 1024 * 1024) {
        toast.error("ファイルサイズは5MB以下にしてください。");
        return;
      }

      // ファイル形式チェック
      if (!file.type.startsWith("image/")) {
        toast.error("画像ファイルを選択してください。");
        return;
      }

      // アップロード開始
      setIsUploading(true);

      // ローカルプレビュー表示
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfileImage(result); // 画像プレビュー
      };
      reader.readAsDataURL(file);

      // 画像アップロード処理
      try {
        const uploadedUrl = await updateProfileImage(file);
        setProfileImage(uploadedUrl); // S3のURLで上書き
        console.log("画像アップロード成功:", uploadedUrl);

        // サーバー側の状態で最新のuserを取得してContextを更新
        const updatedUser = await checkSession();
        setUser(updatedUser);
        toast.success("プロフィール画像を更新しました！");
      } catch (error) {
        console.error("画像アップロードエラー:", error);
        toast.error("プロフィール画像のアップロードに失敗しました。");
      } finally {
        // アップロード完了
        setIsUploading(false);
      }
    }
  };

  // ファイル選択（通常）
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
    // input要素をリセット
    event.target.value = "";
  };

  // カメラ撮影
  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
    // input要素をリセット
    event.target.value = "";
  };

  // アカウント削除処理
  const handleDeleteAccount = async () => {
    router.replace("/"); // トップページにリダイレクト
    try {
      setIsDeleting(true);
      await deleteAccount();
      clearAuthState(); // クライアント認証情報クリア
      toast.success("アカウントを削除しました");
    } catch (error) {
      console.error("アカウント削除エラー:", error);
      toast.error("アカウントの削除に失敗しました");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="bg-[#f5f2ed] relative">
      {/* フルスクリーンローディングオーバーレイ */}
      {(isUploading || isDeleting) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4 shadow-xl">
            <Loader2 className="w-12 h-12 animate-spin text-[#FF8D76]" />
            <p className="text-lg font-semibold text-gray-700">
              {isUploading
                ? "プロフィール画像をアップロード中..."
                : "アカウントを削除中..."}
            </p>
            <p className="text-sm text-gray-500">しばらくお待ちください</p>
          </div>
        </div>
      )}

      <div className="container max-w-5xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="flex justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-blue-500 hover:underline">
              TOP
            </Link>
            <span className="text-gray-500">&gt;</span>
            <span className="text-gray-500">マイページ</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full max-w-xs text-md"
              onClick={() => setIsProfileEditModalOpen(true)}
              disabled={isUploading || isDeleting} // アップロード中・削除中は無効化
            >
              プロフィール編集
            </Button>
            <DropdownMenu
              open={showAccountMenu}
              onOpenChange={setShowAccountMenu}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="p-2"
                  disabled={isUploading || isDeleting}
                >
                  <FiMoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-16">
                <DropdownMenuItem
                  onClick={() => {
                    setShowAccountMenu(false);
                    setShowDeleteDialog(true);
                  }}
                  className="flex items-center text-red-600 focus:text-red-600 font-bold"
                >
                  <FiAlertTriangle />
                  退会する
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* ユーザー情報表示エリア */}
        <div className="flex flex-col items-center text-center justify-center mb-8">
          <div
            className="relative group cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Avatar
              className={`h-32 w-32 border-white border-4 shadow-md transition-all duration-300 ${
                isHovered ? "scale-105 shadow-lg" : ""
              } ${isUploading ? "opacity-50" : ""}`} // アップロード中は透明度を下げる
            >
              {profileImage ? (
                <AvatarImage
                  src={String(profileImage) || "/placeholder.svg"}
                  alt="プロフィール画像"
                />
              ) : (
                <AvatarFallback className="bg-[#FF8D76] text-white font-semibold shadow-md text-4xl">
                  {user ? getInitials(user.name) : "ND"}
                </AvatarFallback>
              )}{" "}
            </Avatar>

            {/* 編集オーバーレイ */}
            <div
              className={`absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center transition-opacity duration-300 ${
                isHovered && !isUploading ? "opacity-100" : "opacity-0"
              }`} // アップロード中は非表示
            >
              {/* デスクトップ用 */}
              <div className="hidden sm:block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="desktop-file-input"
                  disabled={isUploading} // アップロード中は無効化
                  title=""
                />
                <Pencil className="w-8 h-8 text-white" />
              </div>

              {/* モバイル用 */}
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild disabled={isUploading}>
                    <div className="flex items-center justify-center">
                      <Pencil className="w-8 h-8 text-white" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-48">
                    <DropdownMenuItem asChild>
                      <label className="flex items-center gap-2 cursor-pointer w-full">
                        <ImageIcon className="w-4 h-4" />
                        写真ライブラリ
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <label className="flex items-center gap-2 cursor-pointer w-full">
                        <Camera className="w-4 h-4" />
                        写真を撮る
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleCameraCapture}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <label className="flex items-center gap-2 cursor-pointer w-full">
                        <FolderOpen className="w-4 h-4" />
                        ファイルを選択
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold mt-4">{user?.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            {user?.bio || "自己紹介がありません"}
          </p>
        </div>

        {/* タブナビゲーション */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="w-full justify-start bg-white/80 backdrop-blur-sm shadow-md rounded-xl p-1">
            <TabsTrigger
              value="posts"
              className="flex-1 relative overflow-hidden transition-all duration-500 ease-out hover:shadow-md"
              disabled={isUploading || isDeleting}
            >
              <span className="relative z-10 font-bold">投稿一覧</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF8D76]/20 to-[#FF6B5A]/20 opacity-0 transition-opacity duration-300 hover:opacity-100" />
            </TabsTrigger>
            <TabsTrigger
              value="likes"
              className="flex-1 relative overflow-hidden transition-all duration-500 ease-out hover:shadow-md"
              disabled={isUploading || isDeleting}
            >
              <span className="relative z-10 font-bold">いいね一覧</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF8D76]/20 to-[#FF6B5A]/20 opacity-0 transition-opacity duration-300 hover:opacity-100" />
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="flex-1 relative overflow-hidden transition-all duration-500 ease-out hover:shadow-md"
              disabled={isUploading || isDeleting}
            >
              <span className="relative z-10 font-bold">成績</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF8D76]/20 to-[#FF6B5A]/20 opacity-0 transition-opacity duration-300 hover:opacity-100" />
            </TabsTrigger>
          </TabsList>

          <div className="relative mt-6 min-h-[400px]">
            <TabsContent
              value="posts"
              className={`transition-all duration-700 ease-out ${
                activeTab === "posts"
                  ? "opacity-100 translate-x-0 scale-100"
                  : "opacity-0 translate-x-8 scale-95 pointer-events-none absolute inset-0"
              }`}
            >
              <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
                <PostsList isMyPage />
              </div>
            </TabsContent>

            <TabsContent
              value="likes"
              className={`transition-all duration-700 ease-out ${
                activeTab === "likes"
                  ? "opacity-100 translate-x-0 scale-100"
                  : "opacity-0 translate-x-8 scale-95 pointer-events-none absolute inset-0"
              }`}
            >
              <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
                <LikesList isMyPage />
              </div>
            </TabsContent>

            <TabsContent
              value="results"
              className={`transition-all duration-700 ease-out ${
                activeTab === "results"
                  ? "opacity-100 translate-x-0 scale-100"
                  : "opacity-0 translate-x-8 scale-95 pointer-events-none absolute inset-0"
              }`}
            >
              <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
                <ResultsTable results={results} isLoading={isLoading} />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* プロフィール編集モーダル */}
      <ProfileEditModal
        isOpen={isProfileEditModalOpen && !isUploading && !isDeleting} // アップロード中・削除中はモーダルを閉じる
        onClose={() => setIsProfileEditModalOpen(false)}
      />

      {/* アカウント削除確認ダイアログ */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>アカウントを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消すことができません。
              <br />
              アカウントを削除すると、すべての投稿、いいね、コメント、
              <br />
              タイピング結果が完全に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "削除中..." : "削除する"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
