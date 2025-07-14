"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateProfile, updateProfileImage, checkSession } from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { Pencil, Camera, ImageIcon, FolderOpen, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileEditModal({ isOpen, onClose }: ProfileEditModalProps) {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || "");
      setBio(user.bio || "");

      // プロフィール画像の設定
      if (user.profile_image) {
        const image =
          typeof user.profile_image === "string"
            ? user.profile_image
            : user.profile_image.url;
        setProfileImage(image);
      } else {
        setProfileImage(null);
      }

      // 選択された画像ファイルをリセット
      setSelectedImageFile(null);
    }
  }, [isOpen, user]);

  // ユーザーのイニシャルを取得する関数
  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  // 画像ファイルの処理（プレビューのみ）
  const handleImageSelect = (file: File) => {
    if (file) {
      // ファイルサイズチェック（5MB制限）
      if (file.size > 5 * 1024 * 1024) {
        toast.error("ファイルサイズは5MB以下にしてください。");
        return;
      }

      // ファイル形式チェック
      if (!file.type.startsWith("image/")) {
        toast.error("画像ファイルを選択してください。");
        return;
      }

      // ローカルプレビュー表示
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfileImage(result); // 画像プレビュー
        setSelectedImageFile(file); // ファイルを保存
      };
      reader.readAsDataURL(file);
    }
  };

  // ファイル選択（通常）
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
    // input要素をリセット
    event.target.value = "";
  };

  // カメラ撮影
  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
    // input要素をリセット
    event.target.value = "";
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      toast.error("表示名を入力してください");
      return;
    }

    try {
      setIsLoading(true);

      // プロフィール画像がある場合は先にアップロード
      if (selectedImageFile) {
        try {
          const uploadedUrl = await updateProfileImage(selectedImageFile);
          setProfileImage(uploadedUrl);
          console.log("画像アップロード成功:", uploadedUrl);
        } catch (error) {
          console.error("画像アップロードエラー:", error);
          toast.error("プロフィール画像のアップロードに失敗しました。");
          return;
        }
      }

      // プロフィール情報を更新
      await updateProfile({ name, bio });

      // サーバー側の状態で最新のuserを取得してContextを更新
      const updatedUser = await checkSession();
      setUser(updatedUser);

      toast.success("プロフィールを更新しました");
      onClose();
    } catch {
      toast.error("プロフィールの更新に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[390px] h-auto">
        {/* ローディングオーバーレイ */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#FF8D76]" />
              <p className="text-sm font-medium text-gray-700">
                プロフィールを更新中...
              </p>
            </div>
          </div>
        )}

        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            プロフィール編集
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* プロフィール画像編集エリア */}
          <div className="flex justify-center">
            <div
              className="relative group cursor-pointer"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Avatar
                className={`h-24 w-24 border-white border-4 shadow-md transition-all duration-300 ${
                  isHovered ? "scale-105 shadow-lg" : ""
                }`}
              >
                {profileImage ? (
                  <AvatarImage
                    src={String(profileImage) || "/placeholder.svg"}
                    alt="プロフィール画像"
                  />
                ) : (
                  <AvatarFallback className="bg-[#FF8D76] text-white font-semibold shadow-md text-2xl">
                    {user ? getInitials(user.name) : "ND"}
                  </AvatarFallback>
                )}
              </Avatar>

              {/* 編集オーバーレイ */}
              <div
                className={`absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center transition-opacity duration-300 ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
              >
                {/* デスクトップ用 */}
                <div className="hidden sm:block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="modal-desktop-file-input"
                    title=""
                  />
                  <Pencil className="w-6 h-6 text-white" />
                </div>

                {/* モバイル用 */}
                <div className="sm:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="flex items-center justify-center">
                        <Pencil className="w-6 h-6 text-white" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-48">
                      <DropdownMenuItem asChild>
                        <label className="flex items-center gap-2 cursor-pointer w-full">
                          <ImageIcon className="w-4 h-4" />
                          写真ライブラリ
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                        </label>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <label className="flex items-center gap-2 cursor-pointer w-full">
                          <Camera className="w-4 h-4" />
                          写真を撮る
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleCameraCapture}
                            className="hidden"
                          />
                        </label>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <label className="flex items-center gap-2 cursor-pointer w-full">
                          <FolderOpen className="w-4 h-4" />
                          ファイルを選択
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                        </label>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">表示名</label>
            <Input
              type="text"
              placeholder="表示名"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">紹介文</label>
            <textarea
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="自己紹介"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex justify-center">
            <Button
              className="w-52 bg-[#FF8D76] text-white hover:bg-red-500"
              onClick={handleUpdateProfile}
              disabled={isLoading}
            >
              {isLoading ? "更新中..." : "更新する"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
