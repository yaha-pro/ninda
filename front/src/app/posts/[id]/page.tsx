"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import Link from "next/link";
// import { Heart } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input"
import { getPost, getUser, getRanking } from "@/lib/axios";
import type { Post, User, TypingResult } from "@/lib/types";
import post_image_def from "/public/post_image_def.png";
import ranking_1_image from "/public/ranking_1_image.png";
import ranking_2_image from "/public/ranking_2_image.png";
import ranking_3_image from "/public/ranking_3_image.png";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import TypingGame from "@/components/TypingGame";

export default function PostDetailPage() {
  const { user } = useAuth(); // 現在のユーザー情報を取得
  const params = useParams(); // URLから投稿IDを取得
  const router = useRouter(); // ルーター取得
  const post_id: string = params.id as string; // 明示的に `string` 型に変換
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [postUser, setPostUser] = useState<User | null>(null);
  const [ranking, setRanking] = useState<TypingResult[]>([]);
  const [rankingLoading, setRankingLoading] = useState(true);
  const [showMoreRanking, setShowMoreRanking] = useState(false);

  // 投稿の取得
  useEffect(() => {
    if (!post_id) {
      toast.error("無効な投稿IDです");
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        const data = await getPost(post_id);
        setPost(data);
      } catch (error) {
        console.error("Error fetching post:", error);
        toast.error("投稿の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [post_id]);

  // ランキングの取得
  useEffect(() => {
    if (!post_id) return;

    const fetchRanking = async () => {
      try {
        setRankingLoading(true);
        const rankingData = await getRanking(Number(post_id));
        setRanking(rankingData);
      } catch (error) {
        console.error("Error fetching ranking:", error);
        toast.error("ランキングの取得に失敗しました");
      } finally {
        setRankingLoading(false);
      }
    };

    fetchRanking();
  }, [post_id]);

  // 投稿者の取得
  useEffect(() => {
    if (!post?.user_id) return;

    const fetchPostUser = async () => {
      try {
        const userData = await getUser(post.user_id);
        setPostUser(userData);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchPostUser();
  }, [post?.user_id]);

  // ゲーム終了後にランキングを再取得する関数
  // const refreshRanking = async () => {
  //   if (!post_id) return;

  //   try {
  //     const rankingData = await getRanking(Number(post_id));
  //     setRanking(rankingData);
  //   } catch (error) {
  //     console.error("Error refreshing ranking:", error);
  //   }
  // };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7ef] p-4">
        <div className="animate-pulse space-y-4 max-w-6xl mx-auto">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#f5f7ef] p-4">
        <div className="text-center py-12">
          <p className="text-gray-500">投稿が見つかりませんでした</p>
        </div>
      </div>
    );
  }

  // ユーザー名の表示用関数
  const getUserInitial = () => {
    if (postUser && postUser.name) {
      return postUser.name.substring(0, 2).toUpperCase();
    }
    return post.user_id.toString().substring(0, 2).toUpperCase();
  };

  const getUserName = () => {
    return postUser?.name || "ユーザー";
  };

  // ユーザープロフィールへの遷移処理
  const handleUserProfileClick = () => {
    if (user && post.user_id === user.id) {
      // 投稿者が現在のログインユーザーと同じ場合はマイページへ
      router.push("/mypage");
    } else {
      // それ以外は通常のユーザーページへ
      router.push(`/users/${post.user_id}`);
    }
  };

  // ランキング用のユーザー名取得関数
  const getRankingUserInitial = (userName?: string) => {
    if (userName) {
      return userName.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  // 順位アイコンを取得する関数
  const getRankIcon = (rank: number) => {
    if (rank === 1) {
      return (
        <Image
          src={ranking_1_image}
          alt="1位"
          width={40}
          height={40}
          className="object-contain"
        />
      );
    }
    if (rank === 2) {
      return (
        <Image
          src={ranking_2_image}
          alt="2位"
          width={40}
          height={40}
          className="object-contain"
        />
      );
    }
    if (rank === 3) {
      return (
        <Image
          src={ranking_3_image}
          alt="3位"
          width={40}
          height={40}
          className="object-contain"
        />
      );
    }
    return <span className="text-lg font-bold">{rank}</span>;
  };

  // プレイ時間を秒に変換して表示する関数
  // const formatPlayTime = (playTime: number) => {
  //   return (playTime / 1000).toFixed(1) + "秒";
  // };

  return (
    <main className="min-h-screen bg-[#f5f7ef] sm:px-16 py-12">
      {/* Breadcrumb */}
      <div className="flex justify-between">
        <div className="flex items-center gap-2 text-sm mb-10">
          <Link href="/" className="text-blue-500 hover:underline">
            TOP
          </Link>
          <span className="text-gray-500">&gt;</span>
          <Link href="/posts" className="text-blue-500 hover:underline">
            投稿一覧
          </Link>
          <span className="text-gray-500">&gt;</span>
          <span className="text-gray-500">{post.title}</span>
        </div>
        <div className="flex">
          {user && user.id === post.user_id ? (
            <Link href={`/posts/${post.id}/edit`} className="ml-auto">
              <Button
                variant="outline"
                size="sm"
                className="w-full max-w-xs text-md"
              >
                編集する
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl p-6 shadow-md border-8 border-[#FF8D76] h-[450px]">
          {!isPlaying ? (
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <Image
                src={post_image_def || "/placeholder.svg"}
                alt="Post image"
                width={200}
                height={200}
                className="rounded-lg mx-auto"
              />
              <h1 className="text-3xl font-extrabold text-gray-700">
                {post.title}
              </h1>
              <Button
                size="lg"
                className="w-full max-w-xs text-[#FF8D76] border-2 border-[#FF8D76]"
                onClick={() => setIsPlaying(true)}
              >
                スタート
              </Button>
            </div>
          ) : (
            <TypingGame
              displayText={post.display_text}
              typingText={post.typing_text}
              postId={post.id}
              // onGameEnd={refreshRanking}
            />
          )}
        </div>
        {/* User Info */}
        <div className="flex items-center justify-between mt-2">
          <div
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleUserProfileClick}
          >
            <Avatar>
              <AvatarFallback className="bg-red-100 text-red-600">
                {getUserInitial()}
              </AvatarFallback>
            </Avatar>
            <span className="text-gray-600">{getUserName()}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              公開日：{new Date(post.created_at).toLocaleDateString()}
            </div>
            {/* <div className="text-sm text-gray-500">プレイ回数：{post.play_count || 0}</div> */}
            {/* <Button
              variant="ghost"
              size="icon"
              className="border border-[#FF8D76]"
            >
              <Heart className="w-5 h-5" />
            </Button> */}
          </div>
        </div>

        {/* Tags
          <div className="flex flex-wrap gap-2 mt-4">
            {["タグ", "タグ", "タグ", "タグ"].map((tag, index) => (
              <Button key={index} variant="outline" size="sm">
                {tag}
              </Button>
            ))}
          </div>
 */}
        {/* Description */}
        <div className="mt-6 text-gray-700">
          <p>{post.description}</p>
        </div>
      </div>
      {/* Comments and Ranking */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Comments */}
        {/* <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">
              コメント <span className="text-gray-500">(999件)</span>
            </h2>
            <div className="space-y-4">
              <div className="flex">
                <Input placeholder="コメントを入力する" className="rounded-r-none" />
                <Button className="rounded-l-none">送信</Button>
              </div>
              <div className="space-y-4 mt-4">
                {[1, 2, 3].map((_, index) => (
                  <div key={index} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-red-100 text-red-600">U</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">ユーザー</span>
                        <span className="text-sm text-gray-500">yyyy/mm/dd</span>
                      </div>
                      <p className="text-sm text-gray-700">テキストテキストテキストテキスト</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div> */}

        {/* Ranking */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-center text-xl font-bold mb-6 text-[#FF8D76]">
            タイピングのランキング
          </h2>

          {rankingLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((index) => (
                <div key={index} className="animate-pulse">
                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-6 bg-gray-200 rounded"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="w-16 h-4 bg-gray-200 rounded"></div>
                      <div className="w-12 h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : ranking.length > 0 ? (
            <div className="overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 py-3 border-b-2 border-gray-200 font-semibold text-gray-600">
                <div className="col-span-2 text-center">順位</div>
                <div className="col-span-3 text-center pl-4">ユーザー</div>
                <div className="col-span-5 text-center pl-10">タイム</div>
                <div className="col-span-2 text-left">正確率</div>
              </div>

              {/* Table Body */}
              <div
                className={`space-y-0 ${
                  showMoreRanking ? "max-h-96 overflow-y-auto" : ""
                }`}
              >
                {ranking
                  .slice(0, showMoreRanking ? 100 : 5)
                  .map((result, index) => {
                    const rank = index + 1;

                    return (
                      <div
                        key={result.id ?? index}
                        className="grid grid-cols-12 gap-2 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        {/* 順位 */}
                        <div className="col-span-2 flex items-center justify-center">
                          {getRankIcon(rank)}
                        </div>

                        {/* ユーザー */}
                        <div className="col-span-4 flex items-center gap-2 pl-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-red-100 text-red-600 text-sm">
                              {getRankingUserInitial(result.user_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium truncate">
                            {result.user_name || "ユーザー"}
                          </span>
                        </div>

                        {/* タイム */}
                        <div className="col-span-4 flex items-center justify-center">
                          <span className="font-semibold text-blue-600">
                            {result.play_time}秒
                          </span>
                        </div>

                        {/* 正確率 */}
                        <div className="col-span-1 flex items-center justify-center">
                          <span className="font-semibold text-green-600">
                            {Number(result.accuracy).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* もっと見るボタン */}
              {!showMoreRanking && ranking.length > 5 && (
                <div className="flex justify-center mt-6 mb-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowMoreRanking(true)}
                  >
                    もっと見る
                    <svg
                      className="ml-2 w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-lg mb-2">🏆</div>
              <p>まだランキングデータがありません</p>
              <p className="text-sm">
                最初にプレイしてランキングに登録しよう！
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
