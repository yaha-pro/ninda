"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUserTypingResults, getUser } from "@/lib/axios";
import type { TypingResult, User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useParams } from "next/navigation";
import ResultsTable from "@/components/results-table"
// import PostsList from "./posts-list"
// import LikesList from "./likes-list"

export default function UserPage() {
  const params = useParams();
  const userId: string = params.id as string;
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [results, setResults] = useState<TypingResult[]>([])
  const [isLoading, setIsLoading] = useState(true);

  // ユーザー情報の取得
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const userData = await getUser(userId);
        setProfileUser(userData);

        // ユーザーのタイピング結果を取得
        const resultsData = await getUserTypingResults(userId);
        setResults(resultsData)
        console.log("リザルト結果", resultsData);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  // ユーザーのイニシャルを取得する関数
  const getInitials = (name: string) => {
    return name?.substring(0, 2).toUpperCase() || "U";
  };

  if (isLoading) {
    return (
      <div className="bg-[#f5f2ed] min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl">ユーザー情報を読み込み中...</div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="bg-[#f5f2ed] min-h-screen flex items-center justify-center">
        <div className="text-xl">ユーザーが見つかりませんでした</div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f2ed]">
      <div className="container max-w-4xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8">
          <Link href="/" className="text-blue-500 hover:underline">
            TOP
          </Link>
          <span className="text-gray-500">&gt;</span>
          <Link href="/users" className="text-blue-500 hover:underline">
            ユーザー一覧
          </Link>
          <span className="text-gray-500">&gt;</span>
          <span className="text-gray-500">{profileUser.name}</span>
        </div>

        {/* ユーザー情報表示エリア */}
        <div className="flex flex-col items-center text-center justify-center mb-8">
          <Avatar className="h-32 w-32 border-white border-4 shadow-md">
            {profileUser.profile_image ? (
              <AvatarImage
                src={profileUser.profile_image || "/placeholder.svg"}
                alt={profileUser.name}
              />
            ) : (
              <AvatarFallback className="bg-[#FF8D76] text-white font-semibold shadow-md text-4xl">
                {getInitials(profileUser.name)}
              </AvatarFallback>
            )}
          </Avatar>
          <h2 className="text-3xl font-bold mt-4">{profileUser.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            {profileUser.bio || "自己紹介がありません"}
          </p>

          {/* ユーザーステータス情報 */}
          {/* <div className="flex justify-center gap-8 mt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">プレイ回数</p>
              <p className="text-xl font-bold">{profileUser.total_play_count}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">1位獲得数</p>
              <p className="text-xl font-bold">0</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">投稿数</p>
              <p className="text-xl font-bold">{profileUser.posts_count}</p>
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

          {/* <TabsContent value="posts" className="mt-6">
            <PostsList userId={userId} />
          </TabsContent> */}

          {/* <TabsContent value="likes" className="mt-6">
            <LikesList userId={userId} />
          </TabsContent> */}

          <TabsContent value="results" className="mt-6">
            <ResultsTable results={results} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
