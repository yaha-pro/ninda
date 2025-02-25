import {
  SMALL_KANA_MAP,
  NA_GYOU,
  BASIC_KANA_TO_ROMAN,
  COMPOUND_KANA_TO_ROMAN,
  SPLIT_PATTERNS,
} from "@/constants/KanaMappings"

export function kanaToRoman(kana: string): string[] {
  let result: string[] = [""]

  for (let i = 0; i < kana.length; i++) {
    const char = kana[i]
    const nextChar = kana[i + 1]
    const compound = char + (nextChar || "")

    // 「ん」の特別処理
    if (char === "ん") {
      const patterns = BASIC_KANA_TO_ROMAN["ん"]
      const newResult: string[] = []

      // 次の文字がな行かどうかをチェック
      const isNextNaGyou = nextChar && NA_GYOU.has(nextChar)
      const isNextCompoundNaGyou = nextChar && kana[i + 2] && NA_GYOU.has(nextChar + kana[i + 2])

      // な行の場合は "n" を使用しない
      if (isNextNaGyou || isNextCompoundNaGyou) {
        for (const current of result) {
          for (const pattern of patterns) {
            if (pattern !== "n") {
              newResult.push(current + pattern)
            }
          }
        }
      } else {
        // な行以外の場合は全パターンを使用
        for (const current of result) {
          for (const pattern of patterns) {
            newResult.push(current + pattern)
          }
          // 最後の文字でない場合は "n" も追加
          if (i < kana.length - 1) {
            newResult.push(current + "n")
          }
        }
      }

      result = newResult
      continue
    }

    // 複合文字の処理
    if (nextChar && COMPOUND_KANA_TO_ROMAN[compound]) {
      const directPatterns = COMPOUND_KANA_TO_ROMAN[compound]
      const splitPatterns = SPLIT_PATTERNS[compound] || []
      const newResult: string[] = []

      // 直接入力パターンを追加
      for (const current of result) {
        for (const pattern of directPatterns) {
          newResult.push(current + pattern)
        }
      }

      // 分割入力パターンを追加
      for (const current of result) {
        for (const [first, second] of splitPatterns) {
          newResult.push(current + first + second)
        }
      }

      result = newResult
      i++ // 次の文字はスキップ
      continue
    }

    // 通常の文字の処理
    if (BASIC_KANA_TO_ROMAN[char]) {
      const patterns = BASIC_KANA_TO_ROMAN[char]
      const newResult: string[] = []

      for (const current of result) {
        for (const pattern of patterns) {
          newResult.push(current + pattern)
        }
      }

      result = newResult
    } else if (SMALL_KANA_MAP[char]) {
      // 小文字単体の処理
      const patterns = SMALL_KANA_MAP[char]
      const newResult: string[] = []

      for (const current of result) {
        for (const pattern of patterns) {
          newResult.push(current + pattern)
        }
      }

      result = newResult
    } else {
      // マップにない文字はそのまま追加
      result = result.map((str) => str + char)
    }
  }

  return result
}

