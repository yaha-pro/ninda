"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, ChevronsUpDown, Loader2 } from "lucide-react"
import type { TypingResult } from "@/lib/types"
import { getPost } from "@/lib/axios"

interface ResultsTableProps {
  results: TypingResult[]
  isLoading: boolean
}

type SortField = "play_time" | "accuracy" | "created_at"
type SortOrder = "asc" | "desc"

export default function ResultsTable({ results, isLoading }: ResultsTableProps) {
  const [sortField, setSortField] = useState<SortField>("created_at")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [postTitles, setPostTitles] = useState<Record<string, string>>({})
  const itemsPerPage = 10

  // 投稿タイトルを取得
  useEffect(() => {
    const fetchPostTitles = async () => {
      const titles: Record<string, string> = {}

      // 重複を排除して投稿IDのリストを作成
      const postIds = [...new Set(results.map((result) => result.post_id))]

      // 各投稿IDに対してタイトルを取得
      for (const postId of postIds) {
        try {
          const post = await getPost(postId)
          titles[postId] = post.title
        } catch (error) {
          console.error(`Failed to fetch post ${postId}:`, error)
          titles[postId] = "削除された投稿"
        }
      }

      setPostTitles(titles)
    }

    if (results.length > 0) {
      fetchPostTitles()
    }
  }, [results])

  const sortResults = (a: TypingResult, b: TypingResult) => {
    if (sortField === "created_at") {
      return sortOrder === "asc"
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    return sortOrder === "asc" ? a[sortField] - b[sortField] : b[sortField] - a[sortField]
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ChevronsUpDown className="w-4 h-4" />
    return sortOrder === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }

//   const getMedalIcon = (rank: number) => {
//     if (rank === 1) {
//       return (
//         <div className="w-6 h-6 rounded-full bg-[#FFD700] flex items-center justify-center text-white font-bold">1</div>
//       )
//     }
//     if (rank === 2) {
//       return (
//         <div className="w-6 h-6 rounded-full bg-[#C0C0C0] flex items-center justify-center text-white font-bold">2</div>
//       )
//     }
//     if (rank === 3) {
//       return (
//         <div className="w-6 h-6 rounded-full bg-[#CD7F32] flex items-center justify-center text-white font-bold">3</div>
//       )
//     }
//     return rank
//   }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date
      .toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "/")
  }

  const sortedResults = [...results].sort(sortResults)
  const totalPages = Math.ceil(sortedResults.length / itemsPerPage)
  const paginatedResults = sortedResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
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
              {/* <TableHead>順位</TableHead> */}
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
            {paginatedResults.length > 0 ? (
              paginatedResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="font-medium">{postTitles[result.post_id] || "読み込み中..."}</TableCell>
                  <TableCell>{Number(result.play_time).toFixed(2)}秒</TableCell>
                  {/* <TableCell>{getMedalIcon(index + 1)}</TableCell> */}
                  <TableCell>{Number(result.accuracy).toFixed(1)}%</TableCell>
                  <TableCell>{formatDate(result.created_at)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
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
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            次へ
          </Button>
        </div>
      )}
    </div>
  )
}

