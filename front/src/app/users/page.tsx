"use client";

import { useEffect, useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react"; // 検索機能実装時に追加
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UserCard from "@/components/UserCard";
import { getUsers } from "@/lib/axios";
import { User } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import users_title from "/public/users_title.png";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext"; // AuthContextをインポート

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
// function TagsSection() {
//   return (
//     <div className="bg-white rounded-2xl p-6 shadow-sm">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="font-bold text-lg">おすすめタグ</h2>
//         <Link
//           href="#"
//           className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
//         >
//           タグ一覧 <ChevronRight className="w-4 h-4" />
//         </Link>
//       </div>
//       <div className="space-y-4">
//         {["タグ", "タグ", "タグ", "タグ", "タグ", "タグ"].map((tag, index) => (
//           <Link
//             key={index}
//             href={`/users?tag=${tag}`}
//             className="block text-sm hover:text-red-600 transition-colors"
//           >
//             #{tag}
//           </Link>
//         ))}
//       </div>
//     </div>
//   );
// }

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;
  const { user: currentUser } = useAuth(); // 現在ログインしているユーザー情報を取得

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("ユーザー情報の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  console.log("Current users state:", users); // 状態更新後の `users` を確認

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.bio?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /** ソート機能実装時に追加 **/
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === "recent") {
      // ここでは仮にIDの降順でソート（新しいユーザーほどIDが大きいと仮定）
      return String(b.id).localeCompare(String(a.id));
    } else if (sortBy === "popular") {
      // 総プレイ回数の多い順
      return b.total_play_count - a.total_play_count;
    } else if (sortBy === "posts") {
      // 投稿数の多い順
      return b.posts_count - a.posts_count;
    }
    return 0;
  });

  /** ページネーション実装時に追加 **/
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

  // ユーザーのリンク先を決定する関数
  const getUserLink = (user: User) => {
    // 現在のユーザーとリスト内のユーザーが同じ場合はマイページへ
    if (currentUser && user.id === currentUser.id) {
      return "/mypage";
    }
    // それ以外は通常のユーザーページへ
    return `/users/${user.id}`;
  };

  return (
    <>
      <main className="sm:px-16 py-12 flex-1 bg-[#f5f7ef]">
        <div className="mb-6">
          <Link href="/" className="text-blue-500 hover:underline text-sm">
            TOP
          </Link>
          <span className="mx-2 text-gray-500">&gt;</span>
          <span className="text-sm text-gray-500">ユーザー一覧</span>
        </div>
        <div className="flex justify-center items-center mb-6">
          <Image
            src={users_title}
            alt="タイトル画像_ユーザー一覧"
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
                <SelectValue placeholder="新着順" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">新着順</SelectItem>
                <SelectItem value="popular">プレイ回数が多い順</SelectItem>
                <SelectItem value="plays">投稿が多い順</SelectItem>
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
                ) : currentUsers.length > 0 ? (
                  <>
                    <div className="grid grid-col sm:grid-cols-1 lg:grid-cols-2 gap-4">
                      {currentUsers.map((user) => (
                        <Link
                          href={getUserLink(user)}
                          key={user.id}
                          className="block"
                        >
                          <UserCard user={user} />
                        </Link>
                      ))}
                    </div>
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 pt-8">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        {[...Array(totalPages)].map((_, index) => (
                          <Button
                            key={index + 1}
                            variant={
                              currentPage === index + 1 ? "default" : "outline"
                            }
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
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 bg-white rounded-2xl">
                    <p className="text-gray-500">
                      ユーザーが見つかりませんでした
                    </p>
                  </div>
                )}{" "}
              </div>
            </div>
            <div className="space-y-6">
              <RankingSection />
              {/* <TagsSection /> */}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
