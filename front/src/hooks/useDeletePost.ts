import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { deletePost, getPosts } from "@/lib/axios";
import { Post } from "@/lib/types";

export const useDeletePost = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleDelete = async (
    postId: string,
    postTitle: string,
    setPosts: React.Dispatch<React.SetStateAction<Post[]>>
  ) => {
    if (window.confirm("" + postTitle + "を削除しますか？")) {
      try {
        // 投稿を削除
        await deletePost(postId);
        toast.success("" + postTitle + "が削除されました");

        // 投稿情報を再取得
        const updatedPosts = await getPosts();
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
