import type { Metadata } from "next";
import { DotGothic16, M_PLUS_Rounded_1c } from 'next/font/google';
import "./globals.css";
import { AppProviders } from './providers';

// DotGothic16フォント（ピクセルアート風）
const dotGothic16 = DotGothic16({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-dot-gothic',
  display: 'swap',
});

// M PLUS Rounded 1c フォント（メインフォント）
const mPlusRounded = M_PLUS_Rounded_1c({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-m-plus-rounded',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "CLAFT - Creative Learning And Future Technology",
  description: "自分らしく、クリエイティブに成長するプラットフォーム",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        {/* Font Awesome */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        {/* Google Fonts preconnect for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={`${dotGothic16.variable} ${mPlusRounded.variable}`}>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  )
}
