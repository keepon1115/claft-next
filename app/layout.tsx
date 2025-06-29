import type { Metadata, Viewport } from "next";
import { M_PLUS_Rounded_1c, Noto_Sans_JP, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "./providers";
import { AppLayout } from "./app-layout";
import PWAInstallPrompt from "@/components/common/PWAInstallPrompt";
import { PerformanceMonitor } from "@/components/common/PerformanceMonitor";

// フォント設定（最適化）
const mPlusRounded = M_PLUS_Rounded_1c({
  weight: ['400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-m-plus-rounded',
  display: 'swap',
  preload: true,
});

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

// メタデータ設定
export const metadata: Metadata = {
  title: {
    default: "CLAFT - 自分でつくるキャリア",
    template: "%s | CLAFT"
  },
  description: "CLAFTで新しい冒険を始めよう！自分らしい学びと成長を楽しむキャリア育成プラットフォーム",
  keywords: ["CLAFT", "キャリア", "学習", "成長", "冒険", "教育", "スキルアップ"],
  authors: [{ name: "CLAFT Team" }],
  creator: "CLAFT",
  publisher: "CLAFT",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://claft.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: '/',
    title: 'CLAFT - 自分でつくるキャリア',
    description: 'CLAFTで新しい冒険を始めよう！自分らしい学びと成長を楽しむキャリア育成プラットフォーム',
    siteName: 'CLAFT',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CLAFT - 自分でつくるキャリア',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CLAFT - 自分でつくるキャリア',
    description: 'CLAFTで新しい冒険を始めよう！自分らしい学びと成長を楽しむキャリア育成プラットフォーム',
    images: ['/og-image.png'],
    creator: '@claft_official',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      { url: '/icon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-144.png', sizes: '144x144', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/icon-180.png', sizes: '180x180', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
};

// ビューポート設定
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#673AB7' },
    { media: '(prefers-color-scheme: dark)', color: '#512DA8' },
  ],
  colorScheme: 'light dark',
  viewportFit: 'cover',
};

// PWA用メタタグとその他の設定
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${mPlusRounded.variable} ${notoSansJP.variable} ${geistMono.variable}`}>
      <head>
        {/* PWA 関連メタタグ */}
        <meta name="application-name" content="CLAFT" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CLAFT" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#673AB7" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* パフォーマンス最適化 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://laqvpxecqvlufboquffe.supabase.co" />
        <link rel="preload" href="/icon-192.png" as="image" type="image/png" />
        
        {/* Apple Touch Icon */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-180.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png" />
        
        {/* Apple Splash Screen */}
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash-1242x2688.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash-1242x2688.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash-1242x2688.png" />
        
        {/* Microsoft Tiles */}
        <meta name="msapplication-square70x70logo" content="/icon-96.png" />
        <meta name="msapplication-square150x150logo" content="/icon-144.png" />
        <meta name="msapplication-wide310x150logo" content="/icon-192.png" />
        <meta name="msapplication-square310x310logo" content="/icon-512.png" />
        
        {/* Additional PWA meta tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="full-screen" content="yes" />
        <meta name="browsermode" content="application" />
        <meta name="x5-orientation" content="portrait" />
        <meta name="x5-fullscreen" content="true" />
        <meta name="x5-page-mode" content="app" />
        
        {/* Font Awesome */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
          crossOrigin="anonymous"
        />
        
        {/* Favicon ICO fallback */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased">
        <AppProviders>
          <AppLayout>
            {children}
          </AppLayout>
          <PWAInstallPrompt />
          
          {/* パフォーマンス監視（開発環境のみ） */}
          <PerformanceMonitor />
        </AppProviders>
      </body>
    </html>
  );
}
