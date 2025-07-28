"use client";

import { useState, useEffect } from "react";
import TypingPlay from "./TypingPlay";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { saveTypingResult, getPseudoRank } from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import ranking_1_image from "/public/ranking_1_image.png";
import ranking_2_image from "/public/ranking_2_image.png";
import ranking_3_image from "/public/ranking_3_image.png";

type GameState = "waiting" | "loading" | "countdown" | "playing" | "finished";

interface TypingGameProps {
  displayText: string;
  typingText: string;
  postId?: string; // タイピングするテキストの投稿ID
  postTitle?: string;
  onGameEnd?: () => void;
}

interface GameResult {
  score: number;
  time: number;
  mistakes: number;
  accuracy: number;
}

export default function TypingGame({
  displayText,
  typingText,
  postId,
  postTitle,
  onGameEnd,
}: TypingGameProps) {
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [gameResult, setGameResult] = useState<GameResult>({
    score: 0,
    time: 0,
    mistakes: 0,
    accuracy: 0,
  });

  const [count, setCount] = useState(3); // カウントダウンの状態を管理
  const { isAuthenticated } = useAuth();
  const [ranking, setRanking] = useState<{
    rank: number;
    total: number;
  } | null>(null);

  const handleGameEnd = async (
    finalScore: number,
    finalTime: number,
    totalMistakes: number,
    accuracy: number
  ) => {
    setGameResult({
      score: finalScore,
      time: finalTime,
      mistakes: totalMistakes,
      accuracy: accuracy,
    });
    setGameState("finished");

    // ログインしている場合のみ結果を保存
    if (postId) {
      try {
        // 保存せずに今回の成績からランキングを取得
        const pseudoRank = await getPseudoRank({
          post_id: postId,
          play_time: finalTime,
          accuracy: accuracy,
        });

        if (isAuthenticated) {
          // タイピング結果を保存
          await saveTypingResult({
            post_id: postId,
            play_time: finalTime,
            accuracy: accuracy,
            mistake_count: totalMistakes,
          });
        }

        setRanking({
          rank: pseudoRank.rank,
          total: pseudoRank.total_players,
        });

        // 終了後にランキングを再取得する
        if (onGameEnd) {
          onGameEnd();
        }
      } catch (error) {
        console.error("ランキング取得に失敗しました", error);
      }
    }
  };

  const handleCancel = () => {
    setGameState("waiting");
    setCount(3);
    setGameResult({ score: 0, time: 0, mistakes: 0, accuracy: 0 });
  };

  // スペースキーでゲーム開始
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // スペースキーが押された時のデフォルトの挙動を防ぐ
      if (e.code === "Space") {
        e.preventDefault();

        // 待機状態の時のみローディングを開始する
        if (gameState === "waiting") {
          setGameState("loading");

          // ローディングを模擬的に実装（実際のアプリケーションでは必要に応じて調整）
          setTimeout(() => {
            setGameState("countdown");
          }, 1500);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [gameState]);

  // カウントダウンの処理を追加
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (gameState === "countdown") {
      timer = setInterval(() => {
        setCount((prev) => {
          if (prev <= 1) {
            // カウントダウン終了時にゲームを開始
            setGameState("playing");
            return 3; // カウントをリセット
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(timer);
    };
  }, [gameState]);

  // 順位アイコンを取得する関数
  const getRankIcon = (rank: number) => {
    if (rank === 1) {
      return (
        <Image
          src={ranking_1_image}
          alt="1位"
          width={50}
          height={50}
          className="object-contain"
        />
      );
    }
    if (rank === 2) {
      return (
        <Image
          src={ranking_2_image}
          alt="2位"
          width={50}
          height={50}
          className="object-contain"
        />
      );
    }
    if (rank === 3) {
      return (
        <Image
          src={ranking_3_image}
          alt="3位"
          width={50}
          height={50}
          className="object-contain"
        />
      );
    }
    return <span className="text-4xl font-bold">{rank}</span>;
  };

  return (
    <div className="flex items-center justify-center h-full w-full">
      {/* 待機画面 */}
      {gameState === "waiting" && (
        <div>
          <div className="flex text-3xl font-semibold text-muted-foreground animate-pulse pb-4">
            <span>スペースキーを押して開始！</span>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">
              ※日本語入力モードをオフにしてから開始してください
              <br />
              ※ESCキーを押すとやり直しできます
            </span>
          </div>
        </div>
      )}

      {/* ローディング画面 */}
      {gameState === "loading" && (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-primary">準備中...</h2>
          <div className="flex items-center gap-2 text-xl font-semibold text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>ゲームを準備しています</span>
          </div>
        </div>
      )}

      {/* カウントダウン画面 */}
      {gameState === "countdown" && (
        <div className="text-center">
          <div
            className={cn(
              "text-6xl font-bold transition-all duration-300",
              "animate-[bounce_0.5s_ease-in-out]"
            )}
          >
            {count}
          </div>
        </div>
      )}

      {/* ゲーム画面 */}
      {gameState === "playing" && (
        <TypingPlay
          displayText={displayText}
          typingText={typingText}
          onGameEnd={handleGameEnd}
          onCancel={handleCancel}
        />
      )}

      {/* 結果画面 */}
      {gameState === "finished" && (
        <div className="bg-white rounded-3xl p-8 text-center space-y-6">
          <h2 className="text-3xl font-bold text-black">{postTitle}の結果</h2>

          {/* Time & Rank */}
          <div className="flex justify-center gap-8 flex-wrap">
            {/* Time カード */}
            <div className="w-60 border rounded-xl p-4">
              <div className="text-gray-500 text-sm mb-4">Time</div>
              <div className="text-3xl font-bold text-primary text-[#fe6344]">
                {gameResult.time.toFixed(2)}秒
              </div>
            </div>

            {/* Rank カード */}
            <div className="w-60 border rounded-xl p-4">
              <div className="text-gray-500 text-sm mb-2">Rank</div>
              <div className="text-3xl font-bold text-primary flex items-center justify-center gap-2 text-[#fe6344]">
                {ranking?.rank != null ? getRankIcon(ranking.rank) : "-"}
                <span className="text-black text-xl pt-2">
                  位 / {ranking?.total ?? "-"}
                </span>{" "}
              </div>
            </div>
          </div>

          {/* 正誤率とミス */}
          <div className="flex justify-center gap-6 text-gray-500 text-sm">
            <div>正確率 {gameResult.accuracy.toFixed(1)}%</div>
            <div>ミスタイプ数 {gameResult.mistakes}</div>
          </div>

          {/* 未ログイン時のメッセージ */}
          {!isAuthenticated && (
            <div className="text-black text-md mt-4 font-bold">
              会員登録するとランキングに参加できるよ！
            </div>
          )}

          {/* もう一度プレイ */}
          <Button
            onClick={() => {
              setGameState("waiting");
              setCount(3);
              setGameResult({ score: 0, time: 0, mistakes: 0, accuracy: 0 });
              setRanking(null);
            }}
            size="lg"
            className="bg-[#FF8D76] text-white hover:bg-red-500"
          >
            もう一度プレイ
          </Button>
        </div>
      )}
    </div>
  );
}
