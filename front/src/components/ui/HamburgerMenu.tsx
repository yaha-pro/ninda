import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { RxHamburgerMenu } from "react-icons/rx";

export function HamburgerMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <RxHamburgerMenu className="text-red-500 mt-1 w-10 h-10 hover:opacity-60 transition-opacity duration-300" />
      </SheetTrigger>
      <SheetContent side="right" className="w-64 bg-[#faf7ef] font-bold">
        <nav className="mt-4 space-y-4 text-gray-600">
          <a href="#" className="block px-4 py-2 text-lg hover:underline">
            新規登録/ログイン
          </a>
          <a href="#" className="block px-4 py-2 text-lg hover:underline">
            使い方
          </a>
          <a href="#" className="block px-4 py-2 text-lg hover:underline">
            投稿一覧
          </a>
          <a href="#" className="block px-4 py-2 text-lg hover:underline">
            ユーザー一覧
          </a>
          <a href="#" className="block px-4 py-2 text-lg hover:underline">
            タグ一覧
          </a>
          <a href="#" className="block px-4 py-2 text-lg hover:underline">
            利用規約
          </a>
          <a href="#" className="block px-4 py-2 text-lg hover:underline">
            プライバシー
          </a>
          <a href="#" className="block px-4 py-2 text-lg hover:underline">
            お問い合わせ
          </a>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
