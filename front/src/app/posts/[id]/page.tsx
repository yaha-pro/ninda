"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  getPost,
  getUser,
  getRanking,
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from "@/lib/axios";
import type { Post, User, TypingResult, Comment } from "@/lib/types";
import post_image_def from "/public/post_image_def.png";
import ranking_1_image from "/public/ranking_1_image.png";
import ranking_2_image from "/public/ranking_2_image.png";
import ranking_3_image from "/public/ranking_3_image.png";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import TypingGame from "@/components/TypingGame";
import { FiMoreVertical, FiEdit, FiTrash, FiSend } from "react-icons/fi";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { LikeButtonWithTooltip } from "@/components/LikeButtonWithTooltip";

// 共通のヘルパー関数
const getProfileImageUrl = (profileImage?: string | { url: string }) => {
  if (profileImage) {
    return typeof profileImage === "string" ? profileImage : profileImage.url;
  }
  return null;
};

const getUserInitials = (name?: string, fallback?: string) => {
  if (name && name.length > 0) {
    return name.substring(0, 2).toUpperCase();
  }
  if (fallback) {
    return fallback.substring(0, 2).toUpperCase();
  }
  return "U";
};

export default function PostDetailPage() {
  const { user } = useAuth(); // 現在のユーザー情報を取得
  const params = useParams(); // URLから投稿IDを取得
  const router = useRouter(); // ルーター取得
  const post_id: string = params.id as string; // 明示的に `string` 型に変換
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [postUser, setPostUser] = useState<User | null>(null);
  const [ranking, setRanking] = useState<TypingResult[]>([]);
  const [rankingLoading, setRankingLoading] = useState(true);
  const [showMoreRanking, setShowMoreRanking] = useState(false);
  const [rankingUsers, setRankingUsers] = useState<{ [key: string]: User }>({}); // ランキングユーザー情報をキャッシュ

  // いいね関連の状態
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(0);

  // コメント関連の状態
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [showMoreComments, setShowMoreComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  // 投稿の取得
  useEffect(() => {
    if (!post_id) {
      toast.error("無効な投稿IDです");
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        const data = await getPost(post_id);
        setPost(data);
        // いいね状態の初期化
        setIsLiked(data.is_liked || false);
        setLikesCount(data.likes_count || 0);
      } catch (error) {
        console.error("Error fetching post:", error);
        toast.error("投稿の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [post_id]);

  // コメントの取得
  useEffect(() => {
    if (!post_id) return;

    const fetchComments = async () => {
      try {
        setCommentsLoading(true);
        const commentsData = await getComments(post_id);
        setComments(commentsData);
      } catch (error) {
        console.error("Error fetching comments:", error);
        toast.error("コメントの取得に失敗しました");
      } finally {
        setCommentsLoading(false);
      }
    };

    fetchComments();
  }, [post_id]);

  // ランキングの取得
  useEffect(() => {
    if (!post_id) return;

    const fetchRanking = async () => {
      try {
        setRankingLoading(true);
        const rankingData = await getRanking(Number(post_id));
        setRanking(rankingData);

        // ランキングユーザーの情報を取得
        const userPromises = rankingData.map(async (result) => {
          if (result.user_id && !rankingUsers[result.user_id]) {
            try {
              const userData = await getUser(result.user_id);
              return { [result.user_id]: userData };
            } catch (error) {
              console.error(`Failed to fetch user ${result.user_id}:`, error);
              return null;
            }
          }
          return null;
        });

        const userResults = await Promise.all(userPromises);
        const newUsers = userResults.reduce((acc, userObj) => {
          if (userObj) {
            return { ...acc, ...userObj };
          }
          return acc;
        }, {});

        setRankingUsers((prev) => ({ ...prev, ...newUsers }));
      } catch (error) {
        console.error("Error fetching ranking:", error);
        toast.error("ランキングの取得に失敗しました");
      } finally {
        setRankingLoading(false);
      }
    };

    fetchRanking();
  }, [post_id]);

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

  // ゲーム終了後にランキングを再取得する関数
  const refreshRanking = async () => {
    if (!post_id) return;
    try {
      const rankingData = await getRanking(Number(post_id));
      // ランキングユーザーの情報を再取得
      const userPromises = rankingData.map(async (result) => {
        if (result.user_id && !rankingUsers[result.user_id]) {
          try {
            const userData = await getUser(result.user_id);
            return { [result.user_id]: userData };
          } catch (error) {
            console.error(`Failed to fetch user ${result.user_id}:`, error);
            return null;
          }
        }
        return null;
      });

      const userResults = await Promise.all(userPromises);
      const newUsers = userResults.reduce((acc, userObj) => {
        if (userObj) {
          return { ...acc, ...userObj };
        }
        return acc;
      }, {});

      setRankingUsers((prev) => ({ ...prev, ...newUsers }));
      setRanking(rankingData);
    } catch (error) {
      console.error("Error refreshing ranking:", error);
    }
  };

  // いいね状態変更のハンドラ
  const handleLikeChange = (newIsLiked: boolean, newLikesCount: number) => {
    setIsLiked(newIsLiked);
    setLikesCount(newLikesCount);
  };

  // コメント送信
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) {
      toast.error("コメントを入力してください");
      return;
    }

    try {
      setIsSubmittingComment(true);
      const comment = await createComment(post_id, newComment.trim());
      setComments((prev) => [{ ...comment, user }, ...prev]);
      setNewComment("");
      toast.success("コメントを投稿しました");
    } catch (error) {
      console.error("Error creating comment:", error);
      toast.error("コメントの投稿に失敗しました");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // コメント編集開始
  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  // コメント編集保存
  const handleSaveComment = async (commentId: string) => {
    if (!editingContent.trim()) {
      toast.error("コメントを入力してください");
      return;
    }

    try {
      const updatedComment = await updateComment(
        commentId,
        editingContent.trim()
      );
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? { ...comment, content: updatedComment.content }
            : comment
        )
      );
      setEditingCommentId(null);
      setEditingContent("");
      toast.success("コメントを更新しました");
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("コメントの更新に失敗しました");
    }
  };

  // コメント編集キャンセル
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent("");
  };

  // コメント削除
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("このコメントを削除しますか？")) return;

    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      toast.success("コメントを削除しました");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("コメントの削除に失敗しました");
    }
  };

  // コメントユーザープロフィールへの遷移処理
  const handleCommentUserProfileClick = (
    commentUserId: string,
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (user && commentUserId === user.id) {
      // コメントしたユーザーが現在のログインユーザーと同じ場合はマイページへ
      router.push("/mypage");
    } else {
      // それ以外は通常のユーザーページへ
      router.push(`/users/${commentUserId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7ef] p-4">
        <div className="animate-pulse space-y-4 max-w-6xl mx-auto">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#f5f7ef] p-4">
        <div className="text-center py-12">
          <p className="text-gray-500">投稿が見つかりませんでした</p>
        </div>
      </div>
    );
  }

  // サムネイル画像のURLを取得する関数
  const getThumbnailImageUrl = () => {
    if (post.thumbnail_image) {
      return typeof post.thumbnail_image === "string"
        ? post.thumbnail_image
        : post.thumbnail_image.url;
    }
    return null;
  };

  // 投稿者のプロフィール画像URL取得
  const postUserProfileImageUrl = getProfileImageUrl(postUser?.profile_image);

  // ユーザープロフィールへの遷移処理
  const handleUserProfileClick = () => {
    if (user && post.user_id === user.id) {
      // 投稿者が現在のログインユーザーと同じ場合はマイページへ
      router.push("/mypage");
    } else {
      // それ以外は通常のユーザーページへ
      router.push(`/users/${post.user_id}`);
    }
  };

  // 順位アイコンを取得する関数
  const getRankIcon = (rank: number) => {
    if (rank === 1) {
      return (
        <Image
          src={ranking_1_image || "/placeholder.svg"}
          alt="1位"
          width={40}
          height={40}
          className="object-contain"
        />
      );
    }
    if (rank === 2) {
      return (
        <Image
          src={ranking_2_image || "/placeholder.svg"}
          alt="2位"
          width={40}
          height={40}
          className="object-contain"
        />
      );
    }
    if (rank === 3) {
      return (
        <Image
          src={ranking_3_image || "/placeholder.svg"}
          alt="3位"
          width={40}
          height={40}
          className="object-contain"
        />
      );
    }
    return <span className="text-lg font-bold">{rank}</span>;
  };

  // ランキングユーザープロフィールへの遷移処理
  const handleRankingUserProfileClick = (userId: string) => {
    if (user && userId === user.id) {
      // クリックしたユーザーが現在のログインユーザーと同じ場合はマイページへ
      router.push("/mypage");
    } else {
      // それ以外は通常のユーザーページへ
      router.push(`/users/${userId}`);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7ef] sm:px-16 py-12">
      {/* Breadcrumb */}
      <div className="flex justify-between">
        <div className="flex items-center gap-2 text-sm mb-10">
          <Link href="/" className="text-blue-500 hover:underline">
            TOP
          </Link>
          <span className="text-gray-500">&gt;</span>
          <Link href="/posts" className="text-blue-500 hover:underline">
            投稿一覧
          </Link>
          <span className="text-gray-500">&gt;</span>
          <span className="text-gray-500">{post.title}</span>
        </div>
        <div className="flex">
          {user && user.id === post.user_id ? (
            <Link href={`/posts/${post.id}/edit`} className="ml-auto">
              <Button
                variant="outline"
                size="sm"
                className="w-full max-w-xs text-md"
              >
                編集する
              </Button>
            </Link>
          ) : null}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl p-6 shadow-md border-8 border-[#FF8D76] h-[450px]">
          {!isPlaying ? (
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <Image
                src={getThumbnailImageUrl() || post_image_def}
                alt="Post image"
                width={200}
                height={200}
                className="rounded-lg mx-auto"
              />
              <h1 className="text-3xl font-extrabold text-gray-700">
                {post.title}
              </h1>
              <Button
                size="lg"
                className="w-full max-w-xs text-[#FF8D76] border-2 border-[#FF8D76]"
                onClick={() => setIsPlaying(true)}
              >
                スタート
              </Button>
            </div>
          ) : (
            <TypingGame
              displayText={post.display_text}
              typingText={post.typing_text}
              postId={post.id}
              postTitle={post.title}
              onGameEnd={refreshRanking}
            />
          )}
        </div>

        {/* User Info */}
        <div className="flex items-center justify-between mt-2">
          <div
            className="flex items-center gap-3 cursor-pointer hover:opacity-70 transition-opacity"
            onClick={handleUserProfileClick}
          >
            <Avatar className="h-12 w-12 border-white border-2 shadow-md transition-all duration-300">
              {postUserProfileImageUrl ? (
                <AvatarImage
                  src={String(postUserProfileImageUrl) || "/placeholder.svg"}
                  alt={postUser?.name || "投稿者画像"}
                />
              ) : (
                <AvatarFallback className="bg-red-100 text-red-600">
                  {getUserInitials(postUser?.name, post.user_id.toString())}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="text-gray-600">
              {postUser?.name || "ユーザー"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              {new Date(post.created_at).getTime() !==
              new Date(post.updated_at).getTime()
                ? `更新日：${new Date(post.updated_at).toLocaleDateString()}`
                : `公開日：${new Date(post.created_at).toLocaleDateString()}`}
            </div>
            {/* Like Button */}
            <LikeButtonWithTooltip
              postId={post_id}
              isLiked={isLiked}
              likesCount={likesCount}
              onLikeChange={handleLikeChange}
            />
          </div>
        </div>

        {/* Description */}
        <div className="mt-6 text-gray-700">
          <p>{post.description}</p>
        </div>
      </div>

      {/* Comments and Ranking */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Comments */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-center text-xl font-bold mb-6 text-[#FF8D76]">
            コメント{" "}
            <span className="text-gray-500">({comments.length}件)</span>
          </h2>

          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="mb-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="コメントを入力する"
                  className="resize-none min-h-[40px] h-10"
                  rows={3}
                  disabled={isSubmittingComment || !user}
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                disabled={isSubmittingComment || !newComment.trim() || !user}
                className="self-end h-10 items-center shadow-sm bg-transparent"
              >
                <FiSend className="w-4 h-4" />
              </Button>
            </div>
            {!user && (
              <p className="text-xs text-gray-500 mt-1 pl-2">
                ※コメントするにはログインが必要です
              </p>
            )}
          </form>

          {/* Comments List */}
          {commentsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((index) => (
                <div key={index} className="animate-pulse">
                  <div className="flex gap-3 py-4 border-b border-gray-100">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-20 h-4 bg-gray-200 rounded"></div>
                        <div className="w-16 h-3 bg-gray-200 rounded"></div>
                      </div>
                      <div className="w-full h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length > 0 ? (
            <div className="overflow-hidden">
              <div
                className={`space-y-0 ${
                  showMoreComments ? "max-h-96 overflow-y-auto" : ""
                }`}
              >
                {comments
                  .slice(0, showMoreComments ? comments.length : 5)
                  .map((comment) => {
                    const commentUserProfileImageUrl = getProfileImageUrl(
                      comment.user?.profile_image
                    );
                    const isEditing = editingCommentId === comment.id;
                    const isOwnComment = user && comment.user_id === user.id;

                    return (
                      <div
                        key={comment.id}
                        className="py-4 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex gap-3">
                          <div
                            className="cursor-pointer hover:opacity-70 transition-opacity"
                            onClick={(e) =>
                              handleCommentUserProfileClick(comment.user_id, e)
                            }
                          >
                            <Avatar className="h-10 w-10">
                              {commentUserProfileImageUrl ? (
                                <AvatarImage
                                  src={
                                    String(commentUserProfileImageUrl) ||
                                    "/placeholder.svg"
                                  }
                                  alt={
                                    comment.user?.name || "コメントユーザー画像"
                                  }
                                />
                              ) : (
                                <AvatarFallback className="bg-red-100 text-red-600 text-sm">
                                  {getUserInitials(comment.user?.name)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span
                                  className="font-medium text-sm cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                                  onClick={(e) =>
                                    handleCommentUserProfileClick(
                                      comment.user_id,
                                      e
                                    )
                                  }
                                >
                                  {comment.user?.name || "ユーザー"}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(
                                    comment.created_at
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              {isOwnComment && !isEditing && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger className="text-gray-400 hover:text-gray-600">
                                    <FiMoreVertical className="w-5 h-5" />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => handleEditComment(comment)}
                                    >
                                      <FiEdit className="w-4 h-4 mr-2" />
                                      編集
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDeleteComment(comment.id)
                                      }
                                      className="text-red-600"
                                    >
                                      <FiTrash className="w-4 h-4 mr-2" />
                                      削除
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                            {isEditing ? (
                              <div className="mt-2 space-y-2">
                                <Textarea
                                  value={editingContent}
                                  onChange={(e) =>
                                    setEditingContent(e.target.value)
                                  }
                                  className="resize-none"
                                  rows={3}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleSaveComment(comment.id)
                                    }
                                    className="text-[#FF8D76] border-2 border-[#FF8D76] text-sm shadow-sm"
                                  >
                                    保存
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                    className="text-sm shadow-sm bg-transparent"
                                  >
                                    キャンセル
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-700 mt-1 pr-5 break-words">
                                {comment.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* もっと見るボタン */}
              {!showMoreComments && comments.length > 5 && (
                <div className="flex justify-center mt-2 mb-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowMoreComments(true)}
                  >
                    もっと見る
                    <svg
                      className="ml-2 w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-lg mb-2">💬</div>
              <p>まだコメントがありません</p>
              <p className="text-sm">最初にコメントしてみましょう！</p>
            </div>
          )}
        </div>

        {/* Ranking */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-center text-xl font-bold mb-6 text-[#FF8D76]">
            タイピングのランキング
          </h2>
          {rankingLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((index) => (
                <div key={index} className="animate-pulse">
                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-6 bg-gray-200 rounded"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="w-16 h-4 bg-gray-200 rounded"></div>
                      <div className="w-12 h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : ranking.length > 0 ? (
            <div className="overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 py-3 border-b-2 border-gray-200 font-semibold text-gray-600">
                <div className="col-span-2 text-center">順位</div>
                <div className="col-span-3 text-center pl-4">ユーザー</div>
                <div className="col-span-5 text-center pl-10">タイム</div>
                <div className="col-span-2 text-left">正確率</div>
              </div>

              {/* Table Body */}
              <div
                className={`space-y-0 ${
                  showMoreRanking ? "max-h-96 overflow-y-auto" : ""
                }`}
              >
                {ranking
                  .slice(0, showMoreRanking ? 100 : 5)
                  .map((result, index) => {
                    const rank = index + 1;
                    const rankingUserProfileImageUrl = getProfileImageUrl(
                      rankingUsers[result.user_id]?.profile_image
                    );
                    return (
                      <div
                        key={result.id ?? index}
                        className="grid grid-cols-12 gap-2 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() =>
                          result.user_id &&
                          handleRankingUserProfileClick(result.user_id)
                        }
                      >
                        {/* 順位 */}
                        <div className="col-span-2 flex items-center justify-center">
                          {getRankIcon(rank)}
                        </div>

                        {/* ユーザー */}
                        <div className="col-span-4 flex items-center gap-2 pl-4">
                          <Avatar className="h-10 w-10">
                            {rankingUserProfileImageUrl ? (
                              <AvatarImage
                                src={
                                  String(rankingUserProfileImageUrl) ||
                                  "/placeholder.svg"
                                }
                                alt={
                                  result.user_name || "ランキングユーザー画像"
                                }
                              />
                            ) : (
                              <AvatarFallback className="bg-red-100 text-red-600 text-sm">
                                {getUserInitials(
                                  result.user_name,
                                  rankingUsers[result.user_id]?.name
                                )}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <span className="text-sm font-medium truncate">
                            {result.user_name || "ユーザー"}
                          </span>
                        </div>

                        {/* タイム */}
                        <div className="col-span-4 flex items-center justify-center">
                          <span className="font-semibold text-blue-600">
                            {result.play_time}秒
                          </span>
                        </div>

                        {/* 正確率 */}
                        <div className="col-span-1 flex items-center justify-center">
                          <span className="font-semibold text-green-600">
                            {Number(result.accuracy).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* もっと見るボタン */}
              {!showMoreRanking && ranking.length > 5 && (
                <div className="flex justify-center mt-6 mb-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowMoreRanking(true)}
                  >
                    もっと見る
                    <svg
                      className="ml-2 w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-lg mb-2">🏆</div>
              <p>まだランキングデータがありません</p>
              <p className="text-sm">
                最初にプレイしてランキングに登録しよう！
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
