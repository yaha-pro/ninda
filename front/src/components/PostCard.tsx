"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FiMoreVertical, FiEdit, FiTrash } from "react-icons/fi";
// import { Heart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Post, User } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import post_image_def from "/public/post_image_def.png";
import { useDeletePost } from "@/hooks/useDeletePost";
import { getUser } from "@/lib/axios";

interface PostCardProps {
  post: Post;
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
}

const PostCard: React.FC<PostCardProps> = ({ post, setPosts }) => {
  const { user } = useAuth(); // 現在のユーザー情報を取得
  const { handleDelete } = useDeletePost();
  const [postUser, setPostUser] = useState<User | null>(null);

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

  const handleDeleteClick = (event: React.MouseEvent) => {
    event.preventDefault(); // 親の Link の遷移を防ぐ
    event.stopPropagation(); // イベントの伝播を防ぐ
    handleDelete(post.id, post.title, setPosts);
  };

  // ユーザー名の表示用関数
  const getUserInitial = () => {
    if (postUser && postUser.name) {
      return postUser.name.charAt(0).toUpperCase();
    }
    return post.user_id.toString().charAt(0).toUpperCase();
  };

  const getUserName = () => {
    return postUser?.name;
  };

  // ユーザーのリンク先を決定する関数
  const getUserProfileLink = () => {
    // 投稿者が現在のログインユーザーと同じ場合はマイページへ
    if (user && post.user_id === user.id) {
      return "/mypage";
    }
    // それ以外は通常のユーザーページへ
    return `/users/${post.user_id}`;
  };

  // ユーザープロフィール部分をクリックした時のハンドラ
  const handleUserProfileClick = (event: React.MouseEvent) => {
    event.preventDefault(); // 親のLinkの遷移を防ぐ
    event.stopPropagation(); // イベントの伝播を防ぐ
    window.location.href = getUserProfileLink(); // 直接URLを変更
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow p-6"
      onClick={(event) => {
        if (event.target instanceof HTMLButtonElement) {
          event.stopPropagation(); // ボタンをクリックしたときのみ遷移を防ぐ
        }
      }}
    >
      <div className="flex items-center justify-end">
        {user && user.id === post.user_id ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="text-gray-500 hover:text-gray-600 transition-colors">
              <FiMoreVertical className="w-6 h-6" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="absolute -left-8 mt-1 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
              <DropdownMenuItem className="text-gray-500">
                <Link
                  href={`/posts/${post.id}/edit`}
                  className="flex items-center gap-2"
                >
                  <FiEdit />
                  編集する
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDeleteClick}
                className="flex items-center gap-2 text-gray-500"
              >
                <FiTrash />
                削除する
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="w-6 h-6" /> // 空のdivで幅を確保
        )}
      </div>
      <div className="flex gap-3">
        <div className="w-40 h-40 shrink-0">
          <Image
            src={post_image_def || "/placeholder.svg"}
            alt={post.title}
            className="w-40 h-40 object-cover rounded-lg"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg mb-2 line-clamp-2">{post.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-3 mb-2">
            {post.description}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleUserProfileClick}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-red-100 text-red-600 text-xs">
              {getUserInitial()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-500">{getUserName()}</span>
        </div>
        {/* <button className="text-red-500 hover:text-red-600 transition-colors">
          <Heart className="w-5 h-5" />
        </button> */}
      </div>
    </div>
  );
};

export default PostCard;
