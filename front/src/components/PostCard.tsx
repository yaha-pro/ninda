"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FiMoreVertical, FiEdit, FiTrash } from "react-icons/fi";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Post, User } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import post_image_def from "/public/post_image_def.png";
import { useDeletePost } from "@/hooks/useDeletePost";
import { getUser, likePost, unlikePost, getLikedUsers } from "@/lib/axios";
import toast from "react-hot-toast";
import { LikedUsersModal } from "./LikedUsersModal";

interface PostCardProps {
  post: Post;
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  isMyPage?: boolean;
  isLikesList?: boolean;
  userId?: string;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  setPosts,
  isMyPage,
  isLikesList,
  userId,
}) => {
  const { user } = useAuth(); // 現在のユーザー情報を取得
  const { handleDelete } = useDeletePost();
  const [postUser, setPostUser] = useState<User | null>(null);
  const [isLiked, setIsLiked] = useState<boolean>(post.is_liked || false);
  const [likesCount, setLikesCount] = useState<number>(post.likes_count || 0);
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

  // いいね状態の初期化
  useEffect(() => {
    setIsLiked(post.is_liked || false);
    setLikesCount(post.likes_count || 0);
  }, [post.is_liked, post.likes_count]);

  // いいねしたユーザーを取得する関数
  const fetchLikedUsers = async () => {
    if (isLoadingLikedUsers) return;

    try {
      setIsLoadingLikedUsers(true);
      const users = await getLikedUsers(post.id);
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

  const handleDeleteClick = (event: React.MouseEvent) => {
    event.preventDefault(); // 親の Link の遷移を防ぐ
    event.stopPropagation(); // イベントの伝播を防ぐ
    handleDelete(post.id, post.title, setPosts, {
      isMyPage,
      isLikesList,
      userId,
    });
  };

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
        const response = await unlikePost(post.id);
        if (response.success) {
          setIsLiked(false);
          setLikesCount(response.likes_count);

          // ツールチップが表示されている場合、リストから自分を削除
          if (showTooltip) {
            setLikedUsers((prev) => prev.filter((u) => u.id !== user.id));
          }

          // 投稿リストの状態も更新
          setPosts((prevPosts) =>
            prevPosts.map((p) =>
              p.id === post.id
                ? { ...p, is_liked: false, likes_count: response.likes_count }
                : p
            )
          );
        }
      } else {
        // いいね追加
        const response = await likePost(post.id);
        if (response.success) {
          setIsLiked(true);
          setLikesCount(response.likes_count);

          // ツールチップが表示されている場合、リストに自分を追加
          if (showTooltip && user) {
            setLikedUsers((prev) => [user, ...prev]);
          }

          // 投稿リストの状態も更新
          setPosts((prevPosts) =>
            prevPosts.map((p) =>
              p.id === post.id
                ? { ...p, is_liked: true, likes_count: response.likes_count }
                : p
            )
          );
        }
      }
    } catch (error) {
      console.error("Like operation failed:", error);
      toast.error("いいね操作に失敗しました");
    } finally {
      setIsLikeLoading(false);
    }
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

  // サムネイル画像のURLを取得する関数
  const getThumbnailImageUrl = () => {
    console.log("サムネイル画像", post.thumbnail_image);
    if (post.thumbnail_image) {
      return typeof post.thumbnail_image === "string"
        ? post.thumbnail_image
        : post.thumbnail_image.url;
    }
    console.log(post.thumbnail_image);
    return null;
  };

  // プロフィール画像のURLを取得する関数
  const getPostUserProfileImageUrl = () => {
    if (postUser?.profile_image) {
      return typeof postUser.profile_image === "string"
        ? postUser.profile_image
        : postUser.profile_image.url;
    }
    return null;
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

  // いいね数をクリックした時のハンドラ
  const handleLikesCountClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setShowLikedUsersModal(true);
  };

  const postUserProfileImageUrl = getPostUserProfileImageUrl();

  return (
    <div
      className="bg-white rounded-2xl shadow-sm overflow-hidden transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-md p-6"
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
            src={getThumbnailImageUrl() || post_image_def}
            alt={post.title}
            width={160}
            height={160}
            className="object-cover rounded-lg"
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
            {postUserProfileImageUrl ? (
              <AvatarImage
                src={String(postUserProfileImageUrl)}
                alt={getUserName() || "ユーザー画像"}
              />
            ) : (
              <AvatarFallback className="bg-red-100 text-red-600 text-xs">
                {getUserInitial()}
              </AvatarFallback>
            )}
          </Avatar>
          <span className="text-sm text-gray-500">{getUserName()}</span>
        </div>

        {/* いいねボタンとカウント */}
        <div className="flex items-center gap-2 pr-2 relative">
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={handleLikeClick}
              disabled={isLikeLoading}
              className={`transition-all duration-200 ease-in-out hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
                isLiked ? "text-red-500" : "text-gray-400 hover:text-red-400"
              }`}
            >
              {isLiked ? (
                <AiFillHeart className="w-7 h-7" />
              ) : (
                <AiOutlineHeart className="w-7 h-7" />
              )}
            </button>

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
                    <button
                      onClick={handleShowMoreClick}
                      className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                    >
                      もっと見る
                    </button>
                  </div>
                )}
                {/* 矢印 */}
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-red-300"></div>
              </div>
            )}
          </div>

          <span
            className={`text-lg font-medium cursor-pointer hover:underline ${
              isLiked ? "text-red-500" : "text-gray-500"
            }`}
            onClick={handleLikesCountClick}
          >
            {likesCount}
          </span>
        </div>
      </div>
      {/* いいねユーザー一覧モーダル */}
      <LikedUsersModal
        isOpen={showLikedUsersModal}
        onClose={() => setShowLikedUsersModal(false)}
        postId={post.id}
        initialUsers={likedUsers}
      />
    </div>
  );
};

export default PostCard;
