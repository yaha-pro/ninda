"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserTypingResults, getUser, getRanking } from "@/lib/axios";
import type { TypingResult, User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useParams } from "next/navigation";
import ResultsTable from "@/components/Results-table";
import PostsList from "@/components/Posts-list";
import LikesList from "@/components/Likes-list"

export default function UserPage() {
  const params = useParams();
  const userId: string = params.id as string;
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [results, setResults] = useState<TypingResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("posts");

  // ユーザー情報の取得
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const userData = await getUser(userId);
        setProfileUser(userData);

        // プロフィール画像の設定
        if (userData.profile_image) {
          const image =
            typeof userData.profile_image === "string"
              ? userData.profile_image
              : userData.profile_image.url;
          console.log("ユーザープロフィール画像", image);
          setProfileImage(image);
        }

        // ユーザーのタイピング結果を取得
        const typingResults = await getUserTypingResults(userId);
        const resultsWithRank: TypingResult[] = await Promise.all(
          typingResults.map(async (result) => {
            try {
              const ranking = await getRanking(Number(result.post_id)); // 各投稿の全体ランキングを取得
              const userResult =
                ranking.findIndex((r) => r.user_id === result.user_id) + 1; // ユーザーのランキング
              return {
                ...result,
                rank: userResult ?? undefined, // 全体ランキングの順位を反映
              };
            } catch (error) {
              console.error(
                `Failed to fetch ranking for post ${result.post_id}:`,
                error
              );
              return { ...result, rank: undefined };
            }
          })
        );
        setResults(resultsWithRank);
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
      <div className="container max-w-5xl mx-auto px-4 py-10">
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
            {profileImage ? (
              <AvatarImage src={String(profileImage)} alt={profileUser.name} />
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="w-full justify-start bg-white/80 backdrop-blur-sm shadow-md rounded-xl p-1">
            <TabsTrigger
              value="posts"
              className="flex-1 relative overflow-hidden transition-all duration-500 ease-out hover:shadow-md"
            >
              <span className="relative z-10 font-bold">投稿一覧</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF8D76]/20 to-[#FF6B5A]/20 opacity-0 transition-opacity duration-300 hover:opacity-100" />
            </TabsTrigger>
            <TabsTrigger
              value="likes"
              className="flex-1 relative overflow-hidden transition-all duration-500 ease-out hover:shadow-md"
            >
              <span className="relative z-10 font-bold">いいね一覧</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF8D76]/20 to-[#FF6B5A]/20 opacity-0 transition-opacity duration-300 hover:opacity-100" />
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="flex-1 relative overflow-hidden transition-all duration-500 ease-out hover:shadow-md"
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
                <PostsList userId={userId} />
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
                <LikesList userId={userId} />
                <div className="text-center py-12 text-gray-500">
                  いいね一覧は準備中です
                </div>
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
    </div>
  );
}
