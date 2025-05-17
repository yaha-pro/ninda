"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUserTypingResults } from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import type { TypingResult } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ProfileEditModal } from "@/components/ProfileEditModal";
import Link from "next/link";

import ResultsTable from "@/components/results-table";
// import UserProfile from "./user-profile" // プロフィール編集機能実装時に追加
import PostsList from "./posts-list";
import LikesList from "./likes-list";

export default function MyPage() {
  const { user, isAuthenticated } = useAuth();
  const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false);
  const [results, setResults] = useState<TypingResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
        const data = await getCurrentUserTypingResults();
        setResults(data);
      } catch (error) {
        console.error("Failed to fetch typing results:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchResults();
    }
  }, [user]);

  // ユーザーのイニシャルを取得する関数
  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="bg-[#f5f2ed]">
      <div className="container max-w-4xl mx-auto px-4 py-10">
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
              className="w-full max-w-xs text-md"
              onClick={() => setIsProfileEditModalOpen(true)}
            >
              プロフィール編集
            </Button>
          </div>
        </div>
        {/* ユーザー情報表示エリア */}
        <div className="flex flex-col items-center text-center justify-center mb-8">
          <Avatar className="h-32 w-32 border-white border-4 shadow-md">
            <AvatarFallback className="bg-[#FF8D76] text-white font-semibold shadow-md text-4xl">
              {user ? getInitials(user.name) : "ND"}
            </AvatarFallback>
          </Avatar>
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
            <PostsList />
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
