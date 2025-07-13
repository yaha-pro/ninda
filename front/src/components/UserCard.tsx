"use client";

import type React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/lib/types";

interface UserCardProps {
  user: User;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  // ユーザー名の表示用関数
  const getUserInitial = () => {
    if (user && user.name) {
      return user.name.substring(0, 2).toUpperCase();
    }
    return "ND";
  };

  // プロフィール画像のURLを取得する関数
  const getProfileImageUrl = () => {
    if (user.profile_image) {
      return typeof user.profile_image === "string"
        ? user.profile_image
        : user.profile_image.url;
    }
    return null;
  };

  const profileImageUrl = getProfileImageUrl();

  return (
    <div className="bg-white rounded-3xl shadow-sm transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-md p-6 flex items-center gap-6">
      {/* プロフィール画像 */}
      <div className="shrink-0">
        <Avatar className="h-24 w-24 border-2 border-white shadow-md">
          {profileImageUrl ? (
            <AvatarImage
              src={String(profileImageUrl)}
              alt={user.name}
            />
          ) : (
            <AvatarFallback className="bg-[#FF8D76] text-white text-2xl">
              {getUserInitial()}
            </AvatarFallback>
          )}
        </Avatar>
      </div>

      {/* ユーザー情報 */}
      <div className="flex-1">
        <h3 className="font-bold text-xl mb-4">{user.name}</h3>
        <div className="space-y-2">
          {/* プレイ回数 */}
          <div className="flex items-center">
            <span className="w-24 text-sm">プレイ回数</span>
            <div className="flex-1 bg-gray-100 rounded-full px-4 py-1">
              <span className="text-sm">{user.total_play_count}</span>
            </div>
          </div>

          {/* 1位取得数 - 型定義にはないので仮で追加 */}
          <div className="flex items-center">
            <span className="w-24 text-sm">1位取得数</span>
            <div className="flex-1 bg-gray-100 rounded-full px-4 py-1">
              <span className="text-sm">0</span>
            </div>
          </div>

          {/* 投稿数 */}
          <div className="flex items-center">
            <span className="w-24 text-sm">投稿数</span>
            <div className="flex-1 bg-gray-100 rounded-full px-4 py-1">
              <span className="text-sm">{user.posts_count}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
