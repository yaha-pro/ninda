"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input"
import { getPost, getUser } from "@/lib/axios";
import type { Post, User } from "@/lib/types";
import post_image_def from "/public/post_image_def.png";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import TypingGame from "@/components/TypingGame";

export default function PostDetailPage() {
  const { user } = useAuth(); // 現在のユーザー情報を取得
  const params = useParams(); // URLから投稿IDを取得
  const id: string = params.id as string; // 明示的に `string` 型に変換
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [postUser, setPostUser] = useState<User | null>(null);

  // 投稿の取得
  useEffect(() => {
    if (!id) {
      toast.error("無効な投稿IDです");
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        const data = await getPost(id);
        setPost(data);
      } catch (error) {
        console.error("Error fetching post:", error);
        toast.error("投稿の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

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
      return postUser.name.charAt(0).toUpperCase();
    }
    return post.user_id.toString().charAt(0).toUpperCase();
  };

  const getUserName = () => {
    return postUser?.name || "ユーザー";
  };

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
                src={post_image_def}
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
            />
          )}
        </div>
        {/* User Info */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3">
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
            <Button
              variant="ghost"
              size="icon"
              className="border border-[#FF8D76]"
            >
              <Heart className="w-5 h-5" />
            </Button>
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
        {/* <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">タイピングのランキング</h2>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((rank) => (
                <div key={rank} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    <span className="font-bold w-6">{rank}</span>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-red-100 text-red-600">U</AvatarFallback>
                    </Avatar>
                    <span>ユーザー</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span>99.0{rank}秒</span>
                    <span>{100 - rank}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div> */}
      </div>
    </main>
  );
}
