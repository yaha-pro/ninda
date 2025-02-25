"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { kanaToRoman } from "./KanaToRoman";
import { cn } from "@/lib/utils";

interface TypingPlayProps {
  displayText: string;
  typingText: string;
  onGameEnd: (
    score: number,
    time: number,
    mistakes: number,
    accuracy: number
  ) => void;
  onCancel: () => void; // キャンセル時のコールバック
}

export default function TypingPlay({
  displayText,
  typingText,
  onGameEnd,
  onCancel,
}: TypingPlayProps) {
  const [userInput, setUserInput] = useState("");
  const [mistakes, setMistakes] = useState(0);
  const [currentPattern, setCurrentPattern] = useState(0);
  const [showError, setShowError] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLongText, setIsLongText] = useState(false);
  const [completedChars, setCompletedChars] = useState<boolean[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const kanaRef = useRef<HTMLDivElement>(null);
  const kanaContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | undefined>(undefined);

  // 入力パターンの計算（再レンダリング時の再計算を防ぐ）
  const romanizedOptions = useMemo(() => kanaToRoman(typingText), [typingText]);

  // かな文字とローマ字の対応を計算
  const kanaMapping = useMemo(() => {
    const mapping: {
      char: string;
      roma: string;
      startIndex: number;
      endIndex: number;
    }[] = [];
    let currentIndex = 0;

    for (let i = 0; i < typingText.length; i++) {
      const char = typingText[i];
      const nextChar = typingText[i + 1];

      // 複合文字の処理（きゃ、しゃなど）
      if (nextChar && kanaToRoman(char + nextChar).length > 2) {
        const roma = romanizedOptions[currentPattern].slice(
          currentIndex,
          currentIndex + kanaToRoman(char + nextChar)[0].length
        );
        mapping.push({
          char: char + nextChar,
          roma,
          startIndex: currentIndex,
          endIndex: currentIndex + roma.length,
        });
        currentIndex += roma.length;
        i++; // 次の文字はスキップ
      } else {
        const roma = romanizedOptions[currentPattern].slice(
          currentIndex,
          currentIndex + kanaToRoman(char)[0].length
        );
        mapping.push({
          char,
          roma,
          startIndex: currentIndex,
          endIndex: currentIndex + roma.length,
        });
        currentIndex += roma.length;
      }
    }
    return mapping;
  }, [typingText, romanizedOptions, currentPattern]);

  // タイマーの設定
  useEffect(() => {
    if (startTime) {
      timerRef.current = window.setInterval(() => {
        setCurrentTime((Date.now() - startTime) / 1000);
      }, 10); // 10ミリ秒ごとに更新（より滑らかな表示のため）
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startTime]);

  // 完了状態の初期化
  useEffect(() => {
    setCompletedChars(new Array(kanaMapping.length).fill(false));
  }, [kanaMapping.length]);

  // テキストの長さをチェックして状態を更新
  useEffect(() => {
    if (containerRef.current && textRef.current) {
      const container = containerRef.current;
      const text = textRef.current;
      setIsLongText(text.scrollWidth > container.clientWidth);
    }
  }, []);

  // キーボード入力の処理
  useEffect(() => {
    if (!startTime) {
      setStartTime(Date.now());
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // ESCキーが押されたときの処理を変更
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        onCancel(); // スタート待機画面に戻る
        return;
      }

      if (event.key.length === 1) {
        if (event.key === " ") {
          event.preventDefault();
          return;
        }

        const newInput = userInput + event.key;
        let matchedPattern = -1;

        for (let i = 0; i < romanizedOptions.length; i++) {
          if (romanizedOptions[i].startsWith(newInput)) {
            matchedPattern = i;
            break;
          }
        }

        if (matchedPattern !== -1) {
          setUserInput(newInput);
          setCurrentPattern(matchedPattern);

          // かな文字の完了状態を更新
          const newCompletedChars = [...completedChars];
          for (let i = 0; i < kanaMapping.length; i++) {
            const mapping = kanaMapping[i];
            if (newInput.length === mapping.endIndex) {
              newCompletedChars[i] = true;
              break;
            }
          }
          setCompletedChars(newCompletedChars);

          if (romanizedOptions[matchedPattern] === newInput) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            const endTime = Date.now();
            const timeInSeconds = (endTime - (startTime || endTime)) / 1000;
            const correct = newInput.length;
            const speed = (correct / timeInSeconds) * 60; // 1分あたりの正しい入力数
            const accuracy = correct / (correct + mistakes);
            const score = Math.floor(speed * Math.pow(accuracy, 3));
            onGameEnd(score, timeInSeconds, mistakes, accuracy * 100);
          }
        } else {
          setMistakes((prev) => prev + 1);
          setShowError(true);
          setTimeout(() => setShowError(false), 200);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    userInput,
    romanizedOptions,
    onGameEnd,
    onCancel,
    mistakes,
    startTime,
    kanaMapping,
    completedChars,
    currentTime,
  ]);

  // スクロール処理
  useEffect(() => {
    // ローマ字のスクロール
    if (containerRef.current && textRef.current && isLongText) {
      const container = containerRef.current;
      const text = textRef.current;
      const totalWidth = text.scrollWidth;
      const containerWidth = container.clientWidth;
      const maxScroll = totalWidth - containerWidth;
      const progress =
        userInput.length / romanizedOptions[currentPattern].length;
      const scrollAmount = maxScroll * progress;

      container.scrollTo({
        left: scrollAmount,
        behavior: "smooth",
      });
    }

    // かな文字のスクロール
    if (kanaContainerRef.current && kanaRef.current) {
      const container = kanaContainerRef.current;
      const text = kanaRef.current;
      const totalWidth = text.scrollWidth;
      const containerWidth = container.clientWidth;

      if (totalWidth > containerWidth) {
        const maxScroll = totalWidth - containerWidth;
        const completedCount = completedChars.filter(Boolean).length;
        const progress = completedCount / kanaMapping.length;
        const scrollAmount = maxScroll * progress;

        container.scrollTo({
          left: scrollAmount,
          behavior: "smooth",
        });
      }
    }
  }, [
    userInput,
    currentPattern,
    romanizedOptions,
    isLongText,
    completedChars,
    kanaMapping.length,
  ]);

  return (
    <div
      className={cn(
        "w-full max-w-4xl pl-6 pr-6 rounded-lg transition-colors",
        showError && "bg-red-100 dark:bg-red-900/20"
      )}
    >
      {/* タイマー表示 */}
      <div className="flex justify-end mb-2">
        <div className="text-xl font-mono text-muted-foreground">
          {currentTime.toFixed(2)}秒
        </div>
      </div>

      {/* displayTextのコンテナ */}
      <div className="flex justify-center max-h-48 mb-8">
        <div className="text-2xl font-bold text-primary">{displayText}</div>
      </div>

      {/* かな文字のコンテナ */}
      <div
        ref={kanaContainerRef}
        className="relative w-full overflow-hidden mb-2"
      >
        <div
          ref={kanaRef}
          className={cn(
            "inline-block font-mono text-xl whitespace-nowrap",
            isLongText ? "text-left" : "w-full text-center"
          )}
        >
          {kanaMapping.map((item, index) => (
            <span
              key={index}
              className={cn(
                "transition-colors",
                completedChars[index]
                  ? "text-green-600 dark:text-green-400"
                  : "text-muted-foreground"
              )}
            >
              {item.char}
            </span>
          ))}
        </div>
      </div>

      {/* タイピングテキストのコンテナ */}
      <div ref={containerRef} className="relative w-full overflow-hidden mb-4">
        <div
          ref={textRef}
          className={cn(
            "inline-block font-mono text-xl whitespace-nowrap",
            isLongText ? "text-left" : "w-full text-center"
          )}
        >
          {romanizedOptions[currentPattern].split("").map((char, index) => (
            <span
              key={index}
              className={cn(
                "transition-colors",
                index < userInput.length
                  ? "text-green-600 dark:text-green-400"
                  : "text-muted-foreground"
              )}
            >
              {char}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
