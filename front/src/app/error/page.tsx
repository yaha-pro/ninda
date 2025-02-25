
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ErrorPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white px-4">
      <div className="text-center">
        <h1 className="text-[12rem] md:text-[16rem] font-bold text-gray-50 select-none relative">
          <span className="absolute inset-0 text-gray-100">403</span>
          403
        </h1>
        <p className="text-gray-600 text-lg md:text-xl mt-4 mb-8">
          ログインしてください。
        </p>
        <Link href="/" passHref>
         <Button>TOPに戻る</Button>
        </Link>
      </div>
    </div>
  );
}
