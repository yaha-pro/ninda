"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  FiMoreVertical,
  FiEdit,
  FiTrash,
  FiMessageCircle,
} from "react-icons/fi";
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
import { getUser } from "@/lib/axios";
import { LikeButtonWithTooltip } from "./LikeButtonWithTooltip";
import { Button } from "@/components/ui/button";

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

  const handleDeleteClick = (event: React.MouseEvent) => {
    event.preventDefault(); // 親の Link の遷移を防ぐ
    event.stopPropagation(); // イベントの伝播を防ぐ
    handleDelete(post.id, post.title, setPosts, {
      isMyPage,
      isLikesList,
      userId,
    });
  };

  // コメントボタンのクリックハンドラ
  const handleCommentClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    // 投稿詳細ページのコメント欄にスクロール
    window.location.href = `/posts/${post.id}#comments`;
  };

  // いいね状態変更のハンドラ
  const handleLikeChange = (newIsLiked: boolean, newLikesCount: number) => {
    setIsLiked(newIsLiked);
    setLikesCount(newLikesCount);

    // 投稿リストの状態も更新
    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p.id === post.id
          ? { ...p, is_liked: newIsLiked, likes_count: newLikesCount }
          : p
      )
    );
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

  // ユーザープロフィール部分をクリックした時のハンドラ
  const handleUserProfileClick = (event: React.MouseEvent) => {
    event.preventDefault(); // 親のLinkの遷移を防ぐ
    event.stopPropagation(); // イベントの伝播を防ぐ
    window.location.href = getUserProfileLink(); // 直接URLを変更
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
                src={String(postUserProfileImageUrl) || "/placeholder.svg"}
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

        {/* コメントボタンとカウント、いいねボタンとカウント */}
        <div className="flex items-center gap-2 pr-2 relative">
          {/* コメントボタン */}
          <Button
            variant="postIcon"
            size="postIcon"
            onClick={handleCommentClick}
            className="h-9 gap-1 data-[liked=true]:bg-blue-50 data-[liked=true]:border-blue-400 data-[liked=true]:text-blue-500 hover:border-blue-300 hover:text-blue-400"
          >
            <FiMessageCircle className="w-5 h-5" />
            <span className="font-medium">{post.comments_count || 0}</span>
          </Button>

          {/* いいねボタン */}
          <LikeButtonWithTooltip
            postId={post.id}
            isLiked={isLiked}
            likesCount={likesCount}
            onLikeChange={handleLikeChange}
            className="h-9 gap-1"
          />
        </div>
      </div>
    </div>
  );
};

export default PostCard;
