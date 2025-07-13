"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getCurrentUserTypingResults,
  getRanking,
  updateProfileImage,
  checkSession,
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
import LikesList from "./likes-list";
import { Pencil, Camera, ImageIcon, FolderOpen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";

export default function MyPage() {
  const { user, isAuthenticated, setUser } = useAuth();
  const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false);
  const [results, setResults] = useState<TypingResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  // 未ログインならエラーページへリダイレクト
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/error");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const typingResults = await getCurrentUserTypingResults(); // 自分のタイピング結果を取得
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
        console.log("プロフィール画像", image);
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
        toast({
          title: "エラー",
          description: "ファイルサイズは5MB以下にしてください。",
          variant: "destructive",
        });
        return;
      }

      // ファイル形式チェック
      if (!file.type.startsWith("image/")) {
        toast({
          title: "エラー",
          description: "画像ファイルを選択してください。",
          variant: "destructive",
        });
        return;
      }

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

  return (
    <div className="bg-[#f5f2ed]">
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
          <div className="flex">
            <Button
              variant="outline"
              size="sm"
              className="w-full max-w-xs text-md bg-transparent"
              onClick={() => setIsProfileEditModalOpen(true)}
            >
              プロフィール編集
            </Button>
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
              }`}
            >
              {profileImage ? (
                <AvatarImage
                  src={String(profileImage)}
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
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            >
              {/* デスクトップ用 */}
              <div className="hidden sm:block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="desktop-file-input"
                />
                <Pencil className="w-8 h-8 text-white" />
              </div>

              {/* モバイル用 */}
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
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

          {/* ユーザーステータス情報 */}
          {/* <div className="flex justify-center gap-4 mt-4">
          <div className="text-center">
            <p className="text-lg font-semibold">プレイ回数</p>
            <p className="text-xl font-bold">xxxxx</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">1位獲得数</p>
            <p className="text-xl font-bold">xxxxx</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">投稿数</p>
            <p className="text-xl font-bold">xxxxx</p>
          </div>
        </div> */}
        </div>

        {/* タブナビゲーション */}
        <Tabs defaultValue="posts" className="mt-8">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="posts" className="flex-1">
              投稿一覧
            </TabsTrigger>
            <TabsTrigger value="likes" className="flex-1">
              いいね一覧
            </TabsTrigger>
            <TabsTrigger value="results" className="flex-1">
              成績
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <PostsList isMyPage />
          </TabsContent>

          <TabsContent value="likes" className="mt-6">
            <LikesList />
          </TabsContent>

          <TabsContent value="results" className="mt-6">
            <ResultsTable results={results} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </div>
      <ProfileEditModal
        isOpen={isProfileEditModalOpen}
        onClose={() => setIsProfileEditModalOpen(false)}
      />
    </div>
  );
}
