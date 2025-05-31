"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ChevronsUpDown, Loader2 } from "lucide-react";
import type { TypingResult } from "@/lib/types";
import { getPost } from "@/lib/axios";
import Image from "next/image";
import ranking_1_image from "/public/ranking_1_image.png";
import ranking_2_image from "/public/ranking_2_image.png";
import ranking_3_image from "/public/ranking_3_image.png";

interface ResultsTableProps {
  results: TypingResult[];
  isLoading: boolean;
}

type SortField = "play_time" | "accuracy" | "created_at" | "rank";
type SortOrder = "asc" | "desc";

export default function ResultsTable({
  results,
  isLoading,
}: ResultsTableProps) {
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [postTitles, setPostTitles] = useState<Record<string, string>>({});
  const itemsPerPage = 10;

  // 投稿タイトルを取得
  useEffect(() => {
    const fetchPostTitles = async () => {
      const titles: Record<string, string> = {};

      // 重複を排除して投稿IDのリストを作成
      const postIds = [...new Set(results.map((result) => result.post_id))];

      // 各投稿IDに対してタイトルを取得
      for (const postId of postIds) {
        try {
          const post = await getPost(postId);
          titles[postId] = post.title;
        } catch (error) {
          console.error(`Failed to fetch post ${postId}:`, error);
          titles[postId] = "削除された投稿";
        }
      }

      setPostTitles(titles);
    };

    if (results.length > 0) {
      fetchPostTitles();
    }
  }, [results]);

  const sortResults = (a: TypingResult, b: TypingResult) => {
    if (sortField === "created_at") {
      return sortOrder === "asc"
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sortField === "rank") {
      // 順位でソート（undefinedは最後に）
      const rankA = a.rank || 999999;
      const rankB = b.rank || 999999;
      return sortOrder === "asc" ? rankA - rankB : rankB - rankA;
    }
    return sortOrder === "asc"
      ? a[sortField] - b[sortField]
      : b[sortField] - a[sortField];
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder(field === "rank" ? "asc" : "desc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ChevronsUpDown className="w-4 h-4" />;
    return sortOrder === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  // ランキング用のアイコンを取得
  const getRankIcon = (rank?: number) => {
    if (!rank) {
      return <span className="text-gray-400">-</span>;
    }

    if (rank === 1) {
      return (
        <Image
          src={ranking_1_image}
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
          src={ranking_2_image}
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
          src={ranking_3_image}
          alt="3位"
          width={40}
          height={40}
          className="object-contain"
        />
      );
    }
    return <span className="font-bold text-lg">{rank}</span>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date
      .toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "/");
  };

  const sortedResults = [...results].sort(sortResults);
  const totalPages = Math.ceil(sortedResults.length / itemsPerPage);
  const displayResults = sortedResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-lg font-bold">タイトル</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("play_time")}
                  className="flex items-center gap-1 hover:bg-transparent border-none shadow-none"
                >
                  タイム
                  {getSortIcon("play_time")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("rank")}
                  className="flex items-center gap-1 hover:bg-transparent border-none shadow-none font-bold text-gray-600"
                >
                  順位
                  {getSortIcon("rank")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("accuracy")}
                  className="flex items-center gap-1 hover:bg-transparent border-none shadow-none"
                >
                  正確率
                  {getSortIcon("accuracy")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("created_at")}
                  className="flex items-center gap-1 hover:bg-transparent border-none shadow-none"
                >
                  日付
                  {getSortIcon("created_at")}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayResults.length > 0 ? (
              displayResults.map((result) => {
                return (
                  <TableRow key={result.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-left">
                      {postTitles[result.post_id] || "読み込み中..."}
                    </TableCell>
                    <TableCell className="text-left pl-10">
                      <span className="font-semibold">
                        {result.play_time}秒
                      </span>
                    </TableCell>
                    <TableCell className="text-left pl-7">
                      {getRankIcon(result.rank)}
                    </TableCell>
                    <TableCell className="text-left pl-10">
                      <span className="font-semibold">
                        {Number(result.accuracy).toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-left text-gray-600">
                      {formatDate(result.created_at)}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-6 text-muted-foreground"
                >
                  タイピング結果がありません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            前へ
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            次へ
          </Button>
        </div>
      )}
    </div>
  );
}
