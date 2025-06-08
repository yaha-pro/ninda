"use client";

import { useState, useEffect } from "react";
import TypingPlay from "./TypingPlay";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { saveTypingResult, getMyRank } from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";

type GameState = "waiting" | "loading" | "countdown" | "playing" | "finished";

interface TypingGameProps {
  displayText: string;
  typingText: string;
  postId?: string; // タイピングするテキストの投稿ID
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
    if (isAuthenticated && postId) {
      try {
        // タイピング結果を保存
        const result = await saveTypingResult({
          post_id: postId,
          play_time: finalTime,
          accuracy: accuracy,
          mistake_count: totalMistakes,
        });

        // ランキング取得（saveTypingResultの戻り値に typing_game_id が必要）
        const myRanking = await getMyRank(result.id);
        setRanking({
          rank: myRanking.rank ?? 0,
          total: myRanking.total_players ?? 0,
        });
      } catch (error) {
        console.error("タイピング結果の保存に失敗しました", error);
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
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-primary">ゲーム終了！</h2>
          <div className="space-y-3">
            <div className="text-4xl font-bold text-primary">
              {gameResult.score}点
            </div>
            <div className="space-y-2 text-xl text-muted-foreground">
              <div>タイム: {gameResult.time.toFixed(2)}秒</div>
              <div>正確率: {gameResult.accuracy.toFixed(1)}%</div>
              <div>ミスタイプ: {gameResult.mistakes}回</div>
            </div>

            {ranking && (
              <div className="mt-4 text-lg text-primary">
                あなたの順位: <strong>{ranking.rank}</strong> 位 /{" "}
                {ranking.total} 人中
              </div>
            )}
          </div>
          <Button
            onClick={() => {
              setGameState("waiting");
              setCount(3); // カウントリセット
              setGameResult({ score: 0, time: 0, mistakes: 0, accuracy: 0 });
              setRanking(null); // ランキングリセット
            }}
            size="lg"
          >
            もう一度プレイ
          </Button>
        </div>
      )}
    </div>
  );
}
