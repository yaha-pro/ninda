"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import { likePost, unlikePost, getLikedUsers } from "@/lib/axios";
import type { User } from "@/lib/types";
import toast from "react-hot-toast";
import { LikedUsersModal } from "./LikedUsersModal";

interface LikeButtonWithTooltipProps {
  postId: string;
  isLiked: boolean;
  likesCount: number;
  onLikeChange: (isLiked: boolean, likesCount: number) => void;
  disabled?: boolean;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon" | "postIcon" | "linkSmall";
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "linkSmall"
    | "postIcon";
}

export function LikeButtonWithTooltip({
  postId,
  isLiked,
  likesCount,
  onLikeChange,
  disabled = false,
  className = "",
  size = "postIcon",
  variant = "postIcon",
}: LikeButtonWithTooltipProps) {
  const { user } = useAuth();
  const [isLikeLoading, setIsLikeLoading] = useState<boolean>(false);

  // ツールチップ関連の状態
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [likedUsers, setLikedUsers] = useState<User[]>([]);
  const [isLoadingLikedUsers, setIsLoadingLikedUsers] =
    useState<boolean>(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // モーダル関連の状態
  const [showLikedUsersModal, setShowLikedUsersModal] =
    useState<boolean>(false);

  // いいねしたユーザーを取得する関数
  const fetchLikedUsers = async () => {
    if (isLoadingLikedUsers) return;

    try {
      setIsLoadingLikedUsers(true);
      const users = await getLikedUsers(postId);
      setLikedUsers(users);
    } catch (error) {
      console.error("Failed to fetch liked users:", error);
      setLikedUsers([]);
    } finally {
      setIsLoadingLikedUsers(false);
    }
  };

  // ツールチップ表示のハンドラ
  const handleMouseEnter = () => {
    // 既存のタイムアウトをクリア
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }

    // 400ms後にツールチップを表示
    hoverTimeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
      fetchLikedUsers();
    }, 400);
  };

  // ツールチップ非表示のハンドラ
  const handleMouseLeave = () => {
    // ホバータイムアウトをクリア
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // 少し遅延してツールチップを非表示
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 200);
  };

  // ツールチップ上でのマウスイベント
  const handleTooltipMouseEnter = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
  };

  const handleTooltipMouseLeave = () => {
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 200);
  };

  // ツールチップ内でのクリックイベント処理
  const handleTooltipClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  // いいね/いいね解除の処理
  const handleLikeClick = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      toast.error("ログインが必要です");
      return;
    }

    if (isLikeLoading) return;

    try {
      setIsLikeLoading(true);

      if (isLiked) {
        // いいね解除
        const response = await unlikePost(postId);
        if (response.success) {
          onLikeChange(false, response.likes_count);
          toast.success("いいねを解除しました");

          // ツールチップが表示されている場合、リストから自分を削除
          if (showTooltip) {
            setLikedUsers((prev) => prev.filter((u) => u.id !== user.id));
          }
        }
      } else {
        // いいね追加
        const response = await likePost(postId);
        if (response.success) {
          onLikeChange(true, response.likes_count);
          toast.success("いいねをしました");

          // ツールチップが表示されている場合、リストに自分を追加
          if (showTooltip && user) {
            setLikedUsers((prev) => [user, ...prev]);
          }
        }
      }
    } catch (error) {
      console.error("Like operation failed:", error);
      toast.error("いいね操作に失敗しました");
    } finally {
      setIsLikeLoading(false);
    }
  };

  // いいねしたユーザー名を文字列として結合
  const getLikedUsersText = () => {
    if (likedUsers.length === 0) {
      return "";
    }
    return likedUsers.map((user) => user.name).join("、");
  };

  // モーダルを開く関数
  const handleShowMoreClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setShowTooltip(false); // ツールチップを閉じる
    setShowLikedUsersModal(true); // モーダルを開く
  };

  return (
    <>
      <div
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Button
          variant={variant}
          size={size}
          onClick={handleLikeClick}
          disabled={isLikeLoading || disabled || !user}
          data-liked={isLiked}
          className={className}
        >
          {isLiked ? (
            <AiFillHeart className="w-5 h-5" />
          ) : (
            <AiOutlineHeart className="w-5 h-5" />
          )}
          <span className="font-medium">{likesCount}</span>
        </Button>

        {/* ツールチップ */}
        {showTooltip && (
          <div
            className="absolute bottom-full right-0 mb-2 w-64 bg-white border border-red-300 rounded-lg shadow-lg p-3 z-50 animate-in fade-in-0 zoom-in-95 duration-200"
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
            onClick={handleTooltipClick}
          >
            <div className="text-sm font-medium text-gray-800 mb-2">
              いいねしたユーザー
            </div>
            <div className="text-sm text-gray-600 max-h-20 overflow-hidden">
              {isLoadingLikedUsers ? (
                <div className="text-gray-400">読み込み中...</div>
              ) : likedUsers.length > 0 ? (
                <div className="break-words">
                  <span className="inline-block max-w-full truncate">
                    {getLikedUsersText()}
                    {getLikedUsersText().length > 100 && "..."}
                  </span>
                </div>
              ) : (
                <div className="text-gray-400">まだいいねがありません</div>
              )}
            </div>
            {/* もっと見るボタン */}
            {likedUsers.length > 0 && (
              <div className="pt-2 border-t border-gray-200 mt-2">
                <Button
                  variant="linkSmall"
                  size="linkSmall"
                  onClick={handleShowMoreClick}
                >
                  もっと見る
                </Button>
              </div>
            )}
            {/* 矢印 */}
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-red-300"></div>
          </div>
        )}
      </div>

      {/* いいねユーザー一覧モーダル */}
      <LikedUsersModal
        isOpen={showLikedUsersModal}
        onClose={() => setShowLikedUsersModal(false)}
        postId={postId}
        initialUsers={likedUsers}
      />
    </>
  );
}
