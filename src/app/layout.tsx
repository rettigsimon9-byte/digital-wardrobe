import type { Metadata, Viewport } from 'next';
import './globals.css';
import BottomNav from '@/components/BottomNav';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Mein Kleiderschrank',
  description: 'Digitaler Kleiderschrank mit KI-Outfit-Generator',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#6366f1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <Providers>
          <div className="max-w-lg mx-auto md:max-w-4xl relative min-h-screen">
            <main className="pb-24">{children}</main>
          </div>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
