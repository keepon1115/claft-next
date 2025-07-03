import type { Metadata } from "next";
import "./globals.css";
import { Header } from '@/components/common/Header';
import { Sidebar } from '@/components/common/Sidebar';
import { AppProviders } from './providers';

export const metadata: Metadata = {
  title: "CLAFT - Test",
  description: "Test page",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <AppProviders>
          <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <Header />
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>
          </div>
        </AppProviders>
      </body>
    </html>
  )
}
