// import Link from "next/link";

export default function Home() {
  return (
    <div className="sm:px-6 lg:py-12 bg-cover bg-center bg-[url('/hero_image.jpeg')]">
      <div className="text-center mb-16">
        <div className="inline-block rounded-full mb-8">
          <img src="ninda-hero-logo.png" alt="忍打" className="w-80" />
        </div>
        <p className="max-w-2xl mx-auto">
          「忍打」は、「忍者のように縦横かつ素早くタイピングができるようになろう！」というコンセプトのタイピングゲームサービスです。
          自身でオリジナルのタイピング問題を作成することができるため、苦手な文章の問題を作成して練習したり、他のユーザーが作ったタイピング問題を選んでタイピングの速さを競うことができます。
        </p>
      </div>
    </div>
  );
}