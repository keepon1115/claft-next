import { Metadata } from 'next'
import { pageMetadata, generateStructuredData } from '@/lib/utils/seo'

// ==========================================
// メタデータ設定
// ==========================================

export const metadata: Metadata = pageMetadata.profile()

// ==========================================
// 構造化データ
// ==========================================

const structuredData = generateStructuredData({
  type: 'Article',
  name: 'CLAFTプロフィール',
  description: 'あなたのクラフト冒険者プロフィールを管理しましょう。能力、特性、成長記録を確認できます。',
  url: '/profile',
  category: 'プロフィール管理',
})

// ==========================================
// プロフィールページコンポーネント
// ==========================================

export default function ProfilePage() {
  return (
    <>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <div className="profile-page">
        <div className="profile-container">
          <h1 className="page-title">🧙‍♀️ 冒険者プロフィール</h1>
          <p className="page-description">
            あなたのクラフト冒険者としての成長を確認しましょう
          </p>
          
          {/* TODO: プロフィールコンテンツの実装 */}
          <div className="profile-content">
            <p>プロフィール機能は開発中です...</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .profile-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 80px 20px 40px;
        }

        .profile-container {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }

        .page-title {
          font-size: 3rem;
          font-weight: 900;
          color: white;
          margin-bottom: 1rem;
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .page-description {
          font-size: 1.25rem;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 3rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .profile-content {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 3rem;
          color: white;
        }

        @media (max-width: 768px) {
          .page-title {
            font-size: 2.5rem;
          }

          .profile-content {
            padding: 2rem;
          }
        }
      `}</style>
    </>
  )
} 