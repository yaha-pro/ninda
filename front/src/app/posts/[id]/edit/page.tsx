"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
// import { ImagePlus } from "lucide-react";
import { getPost, updatePost } from "@/lib/axios";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  SMALL_KANA_MAP,
  BASIC_KANA_TO_ROMAN,
  COMPOUND_KANA_TO_ROMAN,
  SPLIT_PATTERNS,
} from "@/constants/KanaMappings";
import Link from "next/link";
import Image from "next/image";
import edit_post_title from "/public/edit_post_title.png";
import toast from "react-hot-toast";


export default function EditPostPage() {
  const params = useParams(); // URLから投稿IDを取得
  const id: string = params.id as string; // 明示的に `string` 型に変換
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // const [tags, setTags] = useState(""); // タグ機能実装時に追加（以降関連項目についてコメントアウト）
  const [displayText, setDisplayText] = useState("");
  const [typingText, setTypingText] = useState("");
  // const [imageUrl, setImageUrl] = useState(""); // 画像投稿機能実装時に追加（以降関連項目についてコメントアウト）
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const validCharacters = new Set([
    ...Object.keys(SMALL_KANA_MAP),
    ...Object.keys(BASIC_KANA_TO_ROMAN),
    ...Object.keys(COMPOUND_KANA_TO_ROMAN),
    ...Object.keys(SPLIT_PATTERNS),
    ..."abcdefghijklmnopqrstuvwxyz",
    ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    ..."0123456789"
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

  useEffect(() => {
    if (!id) {
      toast.error("無効な投稿IDです");
      setLoading(false);
      return;
    }
    const fetchPost = async () => {
      try {
        const data = await getPost(id);
        setTitle(data.title);
        setDescription(data.description || "");
        setDisplayText(data.display_text);
        setTypingText(data.typing_text);
        // setImageUrl(data.image_url || ""); // 画像投稿機能実装時に追加
      } catch (error) {
        console.error("Error fetching post:", error);
        toast.error("投稿の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

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
      await updatePost(id, {
        title,
        description,
        // image_url: imageUrl || null,
        display_text: displayText,
        typing_text: typingText,
        // tags: tags.split(",").map(tag => tag.trim()).filter(Boolean)
      });

      toast.success("投稿を更新しました");
      window.history.back(); // 更新成功後に前のページに戻る
    } catch (error) {
      toast.error("投稿の更新に失敗しました");
      console.error(error);
    } finally {
      setIsSubmitting(false);
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

  return (
    <>
      <main className="flex-1 bg-[#f5f2ed] text-gray-600">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="mb-6">
            <Link href="/" className="text-blue-500 hover:underline text-sm">
              TOP
            </Link>
            <span className="mx-2 text-gray-500">&gt;</span>
            <span className="text-sm text-gray-500">投稿編集</span>
          </div>
          <div className="flex justify-center items-center mb-6">
            <Image
              src={edit_post_title}
              alt="タイトル画像_投稿編集"
              className="w-64 h-auto"
              priority
            />
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* <div className="space-y-2">
              <label className="block text-lg font-bold">サムネイル</label>
              <div className="w-32 h-32 bg-gray-100 border-black border-2 rounded flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="サムネイル"
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="flex flex-col items-center text-gray-500">
                    <ImagePlus className="w-8 h-8 mb-2" />
                    <span className="text-xs">画像を選択する</span>
                  </div>
                )}
                <div className="flex flex-col items-center text-gray-500">
                  <ImagePlus className="w-8 h-8 mb-2" />
                  <span className="text-xs">画像を選択する</span>
                </div>
              </div>
            </div> */}

            <div className="space-y-2">
              <label className="block text-lg font-bold">タイトル</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={40}
                placeholder="40文字以内"
                className="bg-white"
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
              />
              {/* // 自動変換機能実装時に追加
                  <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-600 hover:bg-red-50"
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
                {isSubmitting ? "更新中..." : "更新する"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
