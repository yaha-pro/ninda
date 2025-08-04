"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContentWithoutClose,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getLikedUsers } from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/types";

interface LikedUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  initialUsers?: User[];
}

export function LikedUsersModal({
  isOpen,
  onClose,
  postId,
  initialUsers = [],
}: LikedUsersModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [likedUsers, setLikedUsers] = useState<User[]>(initialUsers);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // モーダルが開かれた時にユーザー一覧を取得
  useEffect(() => {
    if (isOpen && postId) {
      fetchLikedUsers();
    }
  }, [isOpen, postId]);

  const fetchLikedUsers = async () => {
    try {
      setIsLoading(true);
      const users = await getLikedUsers(postId);
      setLikedUsers(users);
    } catch (error) {
      console.error("Failed to fetch liked users:", error);
      setLikedUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ユーザープロフィールへの遷移
  const handleUserClick = (clickedUser: User) => {
    onClose(); // モーダルを閉じる

    if (user && clickedUser.id === user.id) {
      // クリックしたユーザーが現在のログインユーザーと同じ場合はマイページへ
      router.push("/mypage");
    } else {
      // それ以外は通常のユーザーページへ
      router.push(`/users/${clickedUser.id}`);
    }
  };

  // ユーザーのイニシャルを取得する関数
  const getUserInitial = (userName: string) => {
    return userName.substring(0, 2).toUpperCase();
  };

  // プロフィール画像のURLを取得する関数
  const getProfileImageUrl = (profileImage?: string | { url: string }) => {
    if (profileImage) {
      return typeof profileImage === "string" ? profileImage : profileImage.url;
    }
    return null;
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          // モーダル外クリック時の伝播を防ぐため、遅延実行で閉じる
          setTimeout(() => onClose(), 0);
        }
      }}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <DialogContentWithoutClose className="sm:max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <DialogTitle className="text-xl font-bold text-center flex-1">
              いいねしたユーザー
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">読み込み中...</div>
              </div>
            ) : likedUsers.length > 0 ? (
              <div className="max-h-96 overflow-y-auto py-2">
                <div className="space-y-1">
                  {likedUsers.map((likedUser) => {
                    const profileImageUrl = getProfileImageUrl(
                      likedUser.profile_image
                    );
                    return (
                      <div
                        key={likedUser.id}
                        onClick={() => handleUserClick(likedUser)}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      >
                        <Avatar className="h-12 w-12">
                          {profileImageUrl ? (
                            <AvatarImage
                              src={
                                String(profileImageUrl) || "/placeholder.svg"
                              }
                              alt={likedUser.name}
                            />
                          ) : (
                            <AvatarFallback className="bg-[#FF8D76] text-white font-semibold">
                              {getUserInitial(likedUser.name)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {likedUser.name}
                          </p>
                          {likedUser.bio && (
                            <p className="text-sm text-gray-500 truncate">
                              {likedUser.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="text-gray-400 text-lg mb-2">💝</div>
                  <p className="text-gray-500">まだいいねがありません</p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <Button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200"
              variant="ghost"
            >
              閉じる
            </Button>
          </div>
        </DialogContentWithoutClose>
      </div>
    </Dialog>
  );
}
