"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FiMoreVertical, FiEdit, FiTrash } from "react-icons/fi";
import { Heart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Post } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import post_image_def from "/public/post_image_def.png";
import { useDeletePost } from "@/hooks/useDeletePost";

interface PostCardProps {
  post: Post;
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
}

const PostCard: React.FC<PostCardProps> = ({ post, setPosts }) => {
  const { user } = useAuth(); // 現在のユーザー情報を取得
  const { handleDelete } = useDeletePost();

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow p-6">
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
                onSelect={() => handleDelete(post.id, post.title, setPosts)}
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
            src={post_image_def}
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
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-red-100 text-red-600 text-xs">
              {post.user_id.toString().charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-500">ユーザー</span>
        </div>
        <button className="text-red-500 hover:text-red-600 transition-colors">
          <Heart className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PostCard;
