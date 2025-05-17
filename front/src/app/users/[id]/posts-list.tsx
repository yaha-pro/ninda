interface PostsListProps {
  userId: string;
}

export default function PostsList({ userId }: PostsListProps) {
  return (
    <div className="text-center py-8 text-muted-foreground">
      自分の投稿一覧（実装予定）
    </div>
  );
}
