"use client";

import { useState, useEffect } from "react";

type GameState = "waiting" | "playing";

interface TypingGameProps {
  displayText: string;
  typingText: string;
}

export default function TypingGame({
  displayText,
  typingText,
}: TypingGameProps) {
  const [gameState, setGameState] = useState<GameState>("waiting");

  // スペースキーでゲーム開始
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === "waiting" && e.code === "Space") {
        setGameState("playing");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [gameState]);

  return (
    <div className="flex justify-center items-center h-full w-full">
      {gameState === "waiting" ? (
        <div className="text-xl font-bold text-gray-600 animate-pulse">
          スペースキーを押して開始！
        </div>
      ) : (
        <div>
          <div className="text-xl font-bold text-blue-600">
            タイピングゲーム開始！
          </div>
        </div>
      )}
    </div>
  );
}
