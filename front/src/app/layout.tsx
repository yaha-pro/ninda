import './globals.css';
import { Header } from '@/components/Header';
// import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'Ninda - タイピングゲームサービス',
  description: '忍者のように素早くタイピングができるようになろう！',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
          <div className="w-full min-h-screen max-w-8xl mx-auto bg-[#faf7ef] flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            {/* <Footer /> */}
          </div>
      </body>
    </html>
  );
}