"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react"; // 検索機能実装時に追加
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PostCard from "@/components/PostCard";
import { getPosts } from "@/lib/axios";
import { Post } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import Image from "next/image";
import posts_title from "/public/posts_title.png";
import toast from "react-hot-toast";

/** ランキング機能実装時に追加 **/
function RankingSection() {
  return (
    <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
      <div className="flex justify-between items-center mb-6 gap-12">
        <h2 className="font-bold text-lg">総合ランキング</h2>
        <Link
          href="#"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
        >
          ユーザー一覧 <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((rank) => (
          <div key={rank} className="flex items-center gap-3">
            <span className="font-bold text-lg w-6">{rank}</span>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-red-100 text-red-600">
                U
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">ユーザー</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** タグ機能実装時に追加 **/
function TagsSection() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-lg">おすすめタグ</h2>
        <Link
          href="#"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
        >
          タグ一覧 <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="space-y-4">
        {["タグ", "タグ", "タグ", "タグ", "タグ", "タグ"].map((tag, index) => (
          <Link
            key={index}
            href={`/posts?tag=${tag}`}
            className="block text-sm hover:text-red-600 transition-colors"
          >
            #{tag}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [currentPage] = useState(1);
  const postsPerPage = 8;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPosts();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast.error("投稿の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description?.toLowerCase().includes(searchQuery.toLowerCase())
    // post.tags?.some((tag) =>
    //   tag.toLowerCase().includes(searchQuery.toLowerCase())
    // )
  );

  /** ソート機能実装時に追加 **/
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === "recent") {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    // 他のソートオプションを追加可能
    return 0;
  });

  /** ページネーション実装時に追加 **/
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = sortedPosts.slice(indexOfFirstPost, indexOfLastPost);
  // const totalPages = Math.ceil(sortedPosts.length / postsPerPage);

  return (
    <>
      <main className="sm:px-16 py-12 flex-1 bg-[#f5f7ef]">
        <div className="mb-6">
          <Link href="/" className="text-blue-500 hover:underline text-sm">
            TOP
          </Link>
          <span className="mx-2 text-gray-500">&gt;</span>
          <span className="text-sm text-gray-500">投稿一覧</span>
        </div>
        <div className="flex justify-center items-center mb-6">
          <Image
            src={posts_title}
            alt="タイトル画像_投稿一覧"
            className="w-64 h-auto"
            priority
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              {/* <div className="relative">
                <Input
                  type="search"
                  placeholder="タイトル、ユーザー名、タグで検索"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="bg-white absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div> */}
            </div>
          </div>
          <div className="w-48 mb-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="よくプレイされている順" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">新着順</SelectItem>
                <SelectItem value="popular">人気順</SelectItem>
                <SelectItem value="plays">プレイ回数順</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(4)].map((_, index) => (
                      <div
                        key={index}
                        className="bg-gray-100 h-32 rounded-2xl animate-pulse"
                      />
                    ))}
                  </div>
                ) : currentPosts.length > 0 ? (
                  <>
                    <div className="grid grid-col sm:grid-cols-1 lg:grid-cols-2 gap-4">
                      {currentPosts.map((post) => (
                        <Link
                          href={`/posts/${post.id}`}
                          key={post.id}
                          className="block"
                        >
                          <PostCard
                            post={post}
                            setPosts={setPosts}
                          />
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 bg-white rounded-2xl">
                    <p className="text-gray-500">投稿が見つかりませんでした</p>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-6">
              <RankingSection />
              <TagsSection />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
