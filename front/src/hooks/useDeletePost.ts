import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import {
  deletePost,
  getPosts,
  getCurrentUserPosts,
  getCurrentUserLikedPosts,
  getUserLikedPosts,
} from "@/lib/axios";
import { Post } from "@/lib/types";

export const useDeletePost = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleDelete = async (
    postId: string,
    postTitle: string,
    setPosts: React.Dispatch<React.SetStateAction<Post[]>>,
    options: { isMyPage?: boolean; isLikesList?: boolean; userId?: string } = {}
  ) => {
    const { isMyPage = false, isLikesList = false, userId } = options;

    if (window.confirm(`${postTitle}を削除しますか？`)) {
      try {
        // 投稿を削除
        await deletePost(postId);
        toast.success(`${postTitle}が削除されました`);

        // 投稿情報を再取得
        let updatedPosts: Post[] = [];
        if (isLikesList) {
          updatedPosts = isMyPage
            ? await getCurrentUserLikedPosts() // マイページのいいね一覧
            : userId
            ? await getUserLikedPosts(userId) // 他ユーザーページのいいね一覧
            : [];
        } else {
          updatedPosts = isMyPage
            ? await getCurrentUserPosts() // マイページの投稿一覧
            : await getPosts(); // 通常の投稿一覧
        }

        setPosts(updatedPosts);

        // カレントページにリダイレクト
        router.push(pathname);
      } catch (error) {
        console.error("Error deleting or fetching posts:", error);
        toast.error("投稿の削除に失敗しました");
      }
    }
  };

  return { handleDelete };
};
