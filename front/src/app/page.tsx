import Image from "next/image";
import ninda_hero_logo from "/public/ninda-hero-logo.png";
import hero_bg_image from "/public/hero_bg_image.png";

export default function Home() {
  return (
    <div className="sm:px-16 py-12 relative overflow-hidden">
      <Image
        src={hero_bg_image}
        alt="背景画像"
        layout="fill"
        className="-z-10"
        priority
      />
      <div className="text-center mb-16">
        <div className="inline-block rounded-full mb-8">
          <Image
            src={ninda_hero_logo}
            alt="忍打"
            width={320}
            height={320}
            className="w-80"
          />
        </div>
        <p className="max-w-2xl mx-auto">
          「忍打」は、「忍者のように縦横かつ素早くタイピングができるようになろう！」というコンセプトのタイピングゲームサービスです。
          自身でオリジナルのタイピング問題を作成することができるため、苦手な文章の問題を作成して練習したり、他のユーザーが作ったタイピング問題を選んでタイピングの速さを競うことができます。
        </p>
      </div>
    </div>
  );
}
