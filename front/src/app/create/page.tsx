"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImagePlus, Camera, FolderOpen, Loader2 } from "lucide-react";
import { createPost, uploadThumbnailImage } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";
import create_post_title from "/public/create_post_title.png";
import toast from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SMALL_KANA_MAP,
  BASIC_KANA_TO_ROMAN,
  COMPOUND_KANA_TO_ROMAN,
  SPLIT_PATTERNS,
} from "@/constants/KanaMappings";

export default function CreatePostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // const [tags, setTags] = useState("") // タグ機能実装時に追加
  const [displayText, setDisplayText] = useState("");
  const [typingText, setTypingText] = useState("");
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();

  const validCharacters = new Set([
    ...Object.keys(SMALL_KANA_MAP),
    ...Object.keys(BASIC_KANA_TO_ROMAN),
    ...Object.keys(COMPOUND_KANA_TO_ROMAN),
    ...Object.keys(SPLIT_PATTERNS),
    ..."abcdefghijklmnopqrstuvwxyz",
    ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    ..."0123456789",
  ]);

  // 未ログインならエラーページへリダイレクト
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/error");
    }
  }, [isAuthenticated, router]);

  const validateInput = (input: string) => {
    for (const char of input) {
      if (!validCharacters.has(char)) {
        return false;
      }
    }
    return true;
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
        setThumbnailImage(result); // 画像プレビュー
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      toast.error("タイトルを入力してください");
      return;
    } else if (!displayText) {
      toast.error("問題の表示文を入力してください");
      return;
    } else if (!typingText) {
      toast.error("問題のタイピングテキストを入力してください");
      return;
    }

    if (!validateInput(typingText)) {
      toast.error("タイピングテキストはひらがな、英数字を入力してください");
      return;
    }

    try {
      setIsSubmitting(true);

      const data = await createPost({
        title,
        description,
        display_text: displayText,
        typing_text: typingText,
        // tags: tags
        //   .split(",")
        //   .map((tag) => tag.trim())
        //   .filter(Boolean),
      });

      // サムネイル画像のアップロード処理
      if (selectedImageFile) {
        try {
          console.log(data.id, selectedImageFile);
          await uploadThumbnailImage(data.id, selectedImageFile);
        } catch (error) {
          console.error("サムネイル画像アップロードエラー:", error);
          toast.error("サムネイル画像のアップロードに失敗しました。");
          return;
        }
      }

      toast.success("投稿を作成しました");
      router.push("/posts");
    } catch (error) {
      toast.error("投稿の作成に失敗しました");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <main className="flex-1 bg-[#f5f2ed] text-gray-600 relative">
        {/* ローディングオーバーレイ */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4 shadow-xl">
              <Loader2 className="w-12 h-12 animate-spin text-[#FF8D76]" />
              <p className="text-lg font-semibold text-gray-700">
                投稿を作成中...
              </p>
              <p className="text-sm text-gray-500">しばらくお待ちください</p>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="mb-6">
            <Link href="/" className="text-blue-500 hover:underline text-sm">
              TOP
            </Link>
            <span className="mx-2 text-gray-500">&gt;</span>
            <span className="text-sm text-gray-500">投稿作成</span>
          </div>

          <div className="flex justify-center items-center mb-6">
            <Image
              src={create_post_title}
              alt="タイトル画像_投稿作成"
              className="w-64 h-auto"
              priority
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="block text-lg font-bold">サムネイル</label>
              <div className="w-32 h-32 bg-gray-100 border-black border-2 rounded flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors relative overflow-hidden">
                {thumbnailImage ? (
                  <div className="relative w-full h-full group">
                    <img
                      src={thumbnailImage}
                      alt="サムネイル"
                      className="w-full h-full object-cover rounded"
                    />
                    {/* 画像変更オーバーレイ */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      {/* デスクトップ用 */}
                      <div className="hidden sm:flex items-center justify-center w-full h-full">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          disabled={isSubmitting}
                          title=""
                        />
                        <ImagePlus className="w-6 h-6 text-white pointer-events-none" />
                      </div>

                      {/* モバイル用 */}
                      <div className="sm:hidden flex items-center justify-center w-full h-full">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild disabled={isSubmitting}>
                            <button
                              type="button"
                              className="flex items-center justify-center w-full h-full"
                            >
                              <ImagePlus className="w-6 h-6 text-white" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="center" className="w-48">
                            <DropdownMenuItem asChild>
                              <label className="flex items-center gap-2 cursor-pointer w-full">
                                <ImagePlus className="w-4 h-4" />
                                写真ライブラリ
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileSelect}
                                  className="hidden"
                                  disabled={isSubmitting}
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
                                  disabled={isSubmitting}
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
                                  disabled={isSubmitting}
                                />
                              </label>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {/* デスクトップ用 */}
                    <div className="hidden sm:flex items-center justify-center w-full h-full relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        disabled={isSubmitting}
                        title=""
                      />
                      <div className="flex flex-col items-center text-gray-500 pointer-events-none">
                        <ImagePlus className="w-8 h-8 mb-2" />
                        <span className="text-xs">画像を選択する</span>
                      </div>
                    </div>

                    {/* モバイル用 */}
                    <div className="sm:hidden w-full h-full flex items-center justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild disabled={isSubmitting}>
                          <button
                            type="button"
                            className="flex flex-col items-center text-gray-500 w-full h-full justify-center cursor-pointer"
                          >
                            <ImagePlus className="w-8 h-8 mb-2" />
                            <span className="text-xs">画像を選択する</span>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-48">
                          <DropdownMenuItem asChild>
                            <label className="flex items-center gap-2 cursor-pointer w-full">
                              <ImagePlus className="w-4 h-4" />
                              写真ライブラリ
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                                disabled={isSubmitting}
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
                                disabled={isSubmitting}
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
                                disabled={isSubmitting}
                              />
                            </label>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )}
              </div>

              {/* 画像選択の説明テキスト */}
              {selectedImageFile && (
                <div className="text-sm text-[#FF8D76] font-medium">
                  サムネイル画像が選択されました: {selectedImageFile.name}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-bold">タイトル</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={40}
                placeholder="40文字以内"
                className="bg-white"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-lg font-bold">説明文</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                placeholder="500文字以内"
                className="h-32"
                disabled={isSubmitting}
              />
            </div>

            {/* <div className="space-y-2">
              <label className="block text-lg font-bold">タグ</label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="タグを入力"
                className="bg-white"
              />
            </div> */}

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="block text-lg font-bold">問題文</label>
                <span className="text-xs text-gray-500">(50文字以内)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 pt-2">
                <label className="block text-sm font-medium">・表示文</label>
              </div>
              <Textarea
                value={displayText}
                onChange={(e) => setDisplayText(e.target.value)}
                maxLength={50}
                placeholder="表示文を入力"
                className="h-32"
                disabled={isSubmitting}
              />
              {/* // 自動変換機能実装時に追加
                  <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                >
                  ＋自動変換
                </Button> */}
              <div className="flex items-center gap-2 text-gray-500 pt-4">
                <label className="block text-sm font-medium">
                  ・タイピングテキスト
                </label>
              </div>
              <Textarea
                value={typingText}
                onChange={(e) => setTypingText(e.target.value)}
                placeholder="ひらがな、英数字を入力してください"
                className="h-32 mt-4"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <Button
                type="button"
                onClick={() => window.history.back()}
                className="text-gray-400"
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                className="text-[#ff8d76]"
                disabled={isSubmitting}
              >
                {isSubmitting ? "作成中..." : "作成する"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
