import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { RxHamburgerMenu } from "react-icons/rx";

export function HamburgerMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <RxHamburgerMenu className="text-red-500 mt-1 w-10 h-10 hover:opacity-60 transition-opacity duration-300" />
      </SheetTrigger>
      <SheetContent side="right" className="w-64 bg-[#faf7ef] font-bold">
        <SheetHeader>
          <SheetTitle></SheetTitle>
        </SheetHeader>
        <nav className="mt-4 space-y-4 text-gray-600">
          {[
            "新規登録/ログイン",
            "使い方",
            "投稿一覧",
            "ユーザー一覧",
            "タグ一覧",
            "利用規約",
            "プライバシー",
            "お問い合わせ",
          ].map((item) => (
            <a key={item} href="#" className="block px-4 py-2 text-lg hover:underline">
              {item}
            </a>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
