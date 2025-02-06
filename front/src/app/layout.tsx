import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';

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
            <AuthProvider>
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
              <Toaster />
            </AuthProvider>
          </div>
      </body>
    </html>
  );
}