import React, { Suspense } from 'react';
import { Metadata } from 'next';

// 共通コンポーネント
import BackgroundAnimations from '@/components/common/BackgroundAnimations';
import HamburgerMenu from '@/components/common/HamburgerMenu';
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import AnimationProvider, { StaggerContainer, StaggerChild } from '@/components/common/AnimationProvider';
import { NotificationProvider } from '@/components/common/NotificationSystem';

// ホームページコンポーネント
import ProfileCard from '@/components/home/ProfileCard';
import CraftStory from '@/components/home/CraftStory';
import JibunCraft from '@/components/home/JibunCraft';

// アニメーション＆インタラクション
import HomePageInteractions from '@/components/home/HomePageInteractions';

// =====================================================
// メタデータ
// =====================================================

export const metadata: Metadata = {
  title: 'CLAFT - あなたの創造性を解き放つクラフトプラットフォーム',
  description: 'CLAFTは、あなたの創造性を刺激し、新しいスキルを学び、仲間と一緒に成長できるクラフトプラットフォームです。',
  keywords: ['クラフト', '創造性', 'DIY', 'ハンドメイド', 'スキル学習', 'コミュニティ'],
  authors: [{ name: 'CLAFT Team' }],
  creator: 'CLAFT',
  publisher: 'CLAFT',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://claft.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'CLAFT - あなたの創造性を解き放つクラフトプラットフォーム',
    description: 'CLAFTは、あなたの創造性を刺激し、新しいスキルを学び、仲間と一緒に成長できるクラフトプラットフォームです。',
    url: 'https://claft.vercel.app',
    siteName: 'CLAFT',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CLAFT - クラフトプラットフォーム',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CLAFT - あなたの創造性を解き放つクラフトプラットフォーム',
    description: 'CLAFTで新しいクラフトスキルを学び、創造性を解き放ちましょう。',
    images: ['/og-image.png'],
    creator: '@claft_official',
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// =====================================================
// ユーザーデータ取得（サーバーサイド）
// =====================================================

async function getUserData() {
  // TODO: Supabaseやその他のAPIからユーザーデータを取得
  // 現在は認証がクライアントサイドなので、クライアントコンポーネントで処理
  // 将来的にはServer Actionsやミドルウェアでの認証チェックを実装予定
  
  try {
    // サーバーサイドでの初期データ取得
    // 例: const userData = await fetchUserProfile(userId);
    return {
      isAuthenticated: false, // 初期状態
      userData: null,
      error: null
    };
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    return {
      isAuthenticated: false,
      userData: null,
      error: 'Failed to load user data'
    };
  }
}

// =====================================================
// メインコンポーネント（サーバーコンポーネント）
// =====================================================

export default async function HomePage() {
  // サーバーサイドでの初期データ取得
  const { isAuthenticated, userData, error } = await getUserData();

  return (
    <NotificationProvider>
      <AnimationProvider>
        <div className="home-page-container">
          {/* 背景アニメーション */}
          <BackgroundAnimations />

          {/* ナビゲーションコンポーネント */}
          <HamburgerMenu />
          <Sidebar />

          {/* ヘッダー */}
          <Header 
            experience={75}
            level={3}
            showAchievements={true}
          />

          {/* メインコンテンツ（アニメーション付き） */}
          <StaggerContainer>
            <main className="main-content">
              {/* プロフィールカード（画面の50%） */}
              <StaggerChild className="profile-section">
                <Suspense fallback={<ProfileCardFallback />}>
                  <DynamicProfileCard className="profile-card-dynamic" />
                </Suspense>
              </StaggerChild>

              {/* コンテンツエリア（画面の50%） */}
              <div className="content-area">
                {/* クラフトストーリーカード */}
                <StaggerChild className="story-section">
                  <CraftStory />
                </StaggerChild>

                {/* ジブンクラフトカード */}
                <StaggerChild className="craft-section">
                  <JibunCraft />
                </StaggerChild>
              </div>
            </main>
          </StaggerContainer>

          {/* エラー表示 */}
          {error && (
            <div className="error-notification">
              <p>⚠️ {error}</p>
            </div>
          )}

          {/* インタラクション機能 */
          <HomePageInteractions />

          {/* ページ固有のスタイル */}
          <style jsx>{`
            .home-page-container {
              min-height: 100vh;
              position: relative;
            }

            .main-content {
              padding: 20px;
              padding-top: 20px;
              display: flex;
              gap: 40px;
              align-items: stretch;
              position: relative;
              z-index: 10;
              margin-left: 0;
              transition: margin-left 0.3s ease;
              flex: 1;
              min-height: calc(100vh - 120px); /* ヘッダー分を引く */
            }

            .profile-section {
              flex: 0 0 calc(50% - 20px);
            }

            .content-area {
              flex: 0 0 calc(50% - 20px);
              display: flex;
              flex-direction: column;
              gap: 30px;
            }

            .story-section {
              /* CraftStoryコンポーネント用 */
            }

            .craft-section {
              /* JibunCraftコンポーネント用 */
              flex: 1;
            }

            .error-notification {
              position: fixed;
              top: 20px;
              right: 20px;
              background: rgba(220, 53, 69, 0.9);
              color: white;
              padding: 12px 20px;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
              z-index: 1000;
              font-size: 14px;
              max-width: 300px;
              animation: slideInError 0.3s ease-out;
            }

            @keyframes slideInError {
              from {
                transform: translateX(100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }

            /* レスポンシブ対応 */
            @media (max-width: 1200px) {
              .main-content {
                flex-direction: column;
                align-items: stretch;
              }
              
              .profile-section,
              .content-area {
                flex: 1 1 auto;
                width: 100%;
              }
              
              .profile-section {
                margin-bottom: 30px;
              }
            }

            @media (max-width: 768px) {
              .main-content {
                padding: 15px;
                padding-top: 15px;
                flex-direction: column;
                gap: 20px;
              }
              
              .content-area {
                gap: 20px;
              }
            }

            @media (max-width: 480px) {
              .main-content {
                padding: 10px;
                gap: 15px;
              }
              
              .content-area {
                gap: 15px;
              }
              
              .error-notification {
                top: 10px;
                right: 10px;
                left: 10px;
                max-width: none;
              }
            }

            /* サイドバー開閉時のマージン調整 */
            @media (min-width: 769px) {
              .main-content {
                transition: margin-left 0.3s ease;
              }
              
              :global(.sidebar-open) .main-content {
                margin-left: 280px;
              }
            }

            /* ダークモード対応 */
            @media (prefers-color-scheme: dark) {
              .main-content {
                background: rgba(0, 0, 0, 0.02);
              }
            }

            /* 高コントラストモード対応 */
            @media (prefers-contrast: high) {
              .main-content {
                background: white;
              }
              
              .error-notification {
                border: 2px solid #dc3545;
              }
            }

            /* パフォーマンス最適化 */
            .main-content {
              contain: layout style;
              will-change: margin-left;
            }

            .content-area {
              contain: layout;
            }
          `}</style>
        </div>
      </AnimationProvider>
    </NotificationProvider>
  );
}

// =====================================================
// 静的生成の設定
// =====================================================

// ISRの設定（必要に応じて）
export const revalidate = 300; // 5分間キャッシュ

// 動的セグメントの設定
export const dynamic = 'force-dynamic'; // リアルタイムユーザーデータのため

// =====================================================
// エクスポート用のヘルパー関数
// =====================================================

/**
 * ホームページ用のプリロードデータ取得
 * 他のコンポーネントから使用可能
 */
export async function getHomePageData() {
  return await getUserData();
}

/**
 * SEO用のstructured data
 */
export function generateStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'CLAFT',
    description: 'Create Learning Adventure For Tomorrow - 学習アドベンチャープラットフォーム',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://claft.app',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'JPY'
    },
    featureList: [
      'プロフィール管理',
      '目標設定・追跡',
      'スキル開発',
      'レベルアップシステム',
      '学習履歴'
    ]
  };
}

// プロフィールカード専用のローディングフォールバック
const ProfileCardFallback = () => (
  <div className="profile-card-fallback animate-pulse">
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
      </div>
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
    
    <style jsx>{`
      .profile-card-fallback {
        flex: 0 0 calc(50% - 20px);
        max-width: 500px;
      }
      
      @media (max-width: 768px) {
        .profile-card-fallback {
          flex: 1 1 100%;
        }
      }
    `}</style>
  </div>
)
