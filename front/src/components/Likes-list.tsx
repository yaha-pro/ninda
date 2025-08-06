"use client";

import { useEffect, useState } from "react";
import { getCurrentUserLikedPosts, getUserLikedPosts } from "@/lib/axios";
import type { Post } from "@/lib/types";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";

interface LikesListProps {
  userId?: string;
  isMyPage?: boolean;
}

export default function LikesList({
  userId,
  isMyPage = false,
}: LikesListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  useEffect(() => {
    const fetchLikedPosts = async () => {
      try {
        setIsLoading(true);
        const data = isMyPage
          ? await getCurrentUserLikedPosts() // マイページでは自分がいいねした投稿取得
          : await getUserLikedPosts(userId!); // ユーザーページでは指定ユーザーがいいねした投稿取得
        setPosts(data);
      } catch (error) {
        console.error("Failed to fetch liked posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikedPosts();
  }, [userId, isMyPage]);

  // ページネーション用の計算
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-gray-100 h-64 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <p className="text-gray-500 text-lg font-medium">
              {isMyPage
                ? "まだいいねした投稿がありません"
                : "いいねした投稿がありません"}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {isMyPage ? "気に入った投稿にいいねしてみましょう！" : ""}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {currentPosts.map((post) => (
          <Link href={`/posts/${post.id}`} key={post.id} className="block">
            <PostCard post={post} setPosts={setPosts} isMyPage={false} />
          </Link>
        ))}
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {[...Array(totalPages)].map((_, index) => (
            <Button
              key={index + 1}
              variant={currentPage === index + 1 ? "default" : "outline"}
              size="sm"
              className={
                currentPage === index + 1
                  ? "bg-[#FF8D76] hover:bg-orange-300"
                  : ""
              }
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </Button>
          ))}

          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
