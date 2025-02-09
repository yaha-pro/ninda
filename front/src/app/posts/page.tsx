"use client";

import { Search, Filter, Heart } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";
import Image from "next/image";
import post_image_def from "/public/post_image_def.png";
import posts_title from "/public/posts_title.png";

interface PostCardProps {
  title: string;
  description: string;
  //   tags: string[];
  user: string;
  //   imageUrl: string;
}

// function PostCard({ title, description, tags, user, imageUrl }: PostCardProps) {
function PostCard({ title, description, user }: PostCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-40">
        <Image
          src={post_image_def}
          alt="サムネイル画像"
          layout="fill"
          className="w-full h-full object-cover"
          priority
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium line-clamp-1">{title}</h3>
          <button className="text-red-500 hover:text-red-600 transition-colors">
            <Heart className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{description}</p>
        {/* <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag, index) => (
            <span key={index} className="text-xs text-gray-600">
              #{tag}
            </span>
          ))}
        </div> */}
        <p className="text-sm text-gray-500">{user}</p>
      </div>
    </div>
  );
}

// function RankingItem({ rank, user }: { rank: number; user: string }) {
//   return (
//     <div className="flex items-center gap-3 py-2">
//       <div className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full font-bold">
//         {rank}
//       </div>
//       <div className="flex items-center gap-2">
//         <div className="w-6 h-6 bg-gray-200 rounded-full" />
//         <span className="text-sm">{user}</span>
//       </div>
//     </div>
//   );
// }

export default function PostsPage() {
  const posts = Array(5).fill({
    title: "投稿タイトル",
    description:
      "テキストテキストテキストテキストテキストテキストテキストテキストテキスト",
    // tags: ["タグ1", "タグ2", "タグ3"],
    user: "ユーザー",
    // imageUrl:
    //   "https://images.unsplash.com/photo-1546776230-bb86256870ce?auto=format&fit=crop&q=80&w=500",
  });

  //   const popularTags = ["タグ1", "タグ2", "タグ3", "タグ4", "タグ5", "タグ6"];

  return (
    <>
      <main className="sm:px-6 lg:py-12 flex-1 bg-[#f5f7ef]">
        <div className="flex justify-center items-center mb-6">
          <Image
            src={posts_title}
            alt="タイトル画像_投稿一覧"
            className="w-64 h-auto"
            priority
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* メインコンテンツ */}
            <div className="flex-1">
              {/* <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h1 className="text-xl font-bold">投稿一覧</h1>
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                      <Input
                        type="search"
                        placeholder="タイトル、ユーザー名、タグで検索"
                        className="pl-10 w-full sm:w-[300px]"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    <Button variant="outline" className="shrink-0">
                      <Filter className="h-4 w-4 mr-2" />
                      絞り込み
                    </Button>
                  </div>
                </div>
              </div> */}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {posts.map((post, index) => (
                  <PostCard key={index} {...post} />
                ))}
              </div>

              {/* <div className="flex justify-center gap-2">
                {[1, 2, 3, 4].map((page) => (
                  <button
                    key={page}
                    className={`w-8 h-8 rounded-full ${
                      page === 1
                        ? "bg-red-600 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div> */}
            </div>

            {/* サイドバー */}
            <div className="lg:w-[300px] space-y-6">
              {/* ランキング */}
              {/* <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold">総合ランキング</h2>
                  <Link
                    href="#"
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    ユーザー一覧 ＞
                  </Link>
                </div>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((rank) => (
                    <RankingItem
                      key={rank}
                      rank={rank}
                      user={`ユーザー${rank}`}
                    />
                  ))}
                </div>
              </div> */}

              {/* おすすめタグ */}
              {/* <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold">おすすめタグ</h2>
                  <Link
                    href="#"
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    タグ一覧 ＞
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <Link
                      key={tag}
                      href="#"
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
