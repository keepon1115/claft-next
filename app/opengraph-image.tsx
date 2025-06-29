import { ImageResponse } from 'next/og'
import { siteConfig } from '@/lib/utils/seo'

// ==========================================
// OGP画像設定
// ==========================================

export const runtime = 'edge'
export const alt = 'CLAFT - クラフトプラットフォーム'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

// ==========================================
// デフォルトOGP画像生成
// ==========================================

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#673AB7',
          backgroundImage: 'linear-gradient(135deg, #673AB7 0%, #9C27B0 50%, #E91E63 100%)',
          fontFamily: '"Noto Sans JP", system-ui, sans-serif',
        }}
      >
        {/* 背景装飾 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3,
          }}
        />

        {/* メインコンテンツ */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '80px 60px',
            zIndex: 1,
          }}
        >
          {/* ロゴ/アイコン */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '120px',
              height: '120px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '30px',
              marginBottom: '40px',
              border: '3px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <span style={{ fontSize: '60px' }}>🎨</span>
          </div>

          {/* タイトル */}
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 900,
              color: 'white',
              margin: '0 0 24px 0',
              letterSpacing: '-2px',
              textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
            }}
          >
            CLAFT
          </h1>

          {/* サブタイトル */}
          <p
            style={{
              fontSize: '32px',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.95)',
              margin: '0 0 16px 0',
              maxWidth: '800px',
              lineHeight: 1.4,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            }}
          >
            あなたの創造性を解き放つ
          </p>

          {/* 説明文 */}
          <p
            style={{
              fontSize: '24px',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.85)',
              margin: '0',
              maxWidth: '900px',
              lineHeight: 1.5,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            }}
          >
            クラフトプラットフォーム
          </p>

          {/* キーワード */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              marginTop: '40px',
              justifyContent: 'center',
            }}
          >
            {['DIY', 'ハンドメイド', 'スキル学習', 'コミュニティ'].map((keyword, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '25px',
                  fontSize: '18px',
                  fontWeight: 600,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(5px)',
                }}
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        {/* 下部装飾 */}
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            left: '60px',
            right: '60px',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '2px',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}

// ==========================================
// 動的OGP画像生成関数（他のページで使用）
// ==========================================

export function generateOGImage({
  title,
  subtitle,
  icon = '🎨',
  keywords = [],
  theme = 'default'
}: {
  title: string
  subtitle?: string
  icon?: string
  keywords?: string[]
  theme?: 'default' | 'admin' | 'quest' | 'profile'
}) {
  const themes = {
    default: {
      background: 'linear-gradient(135deg, #673AB7 0%, #9C27B0 50%, #E91E63 100%)',
      primary: '#673AB7',
    },
    admin: {
      background: 'linear-gradient(135deg, #2196F3 0%, #3F51B5 50%, #673AB7 100%)',
      primary: '#2196F3',
    },
    quest: {
      background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 50%, #CDDC39 100%)',
      primary: '#4CAF50',
    },
    profile: {
      background: 'linear-gradient(135deg, #FF9800 0%, #FF5722 50%, #F44336 100%)',
      primary: '#FF9800',
    },
  }

  const currentTheme = themes[theme]

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: currentTheme.primary,
          backgroundImage: currentTheme.background,
          fontFamily: '"Noto Sans JP", system-ui, sans-serif',
        }}
      >
        {/* 背景装飾 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3,
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '80px 60px',
            zIndex: 1,
          }}
        >
          {/* アイコン */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100px',
              height: '100px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '25px',
              marginBottom: '30px',
              border: '3px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <span style={{ fontSize: '50px' }}>{icon}</span>
          </div>

          {/* タイトル */}
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 900,
              color: 'white',
              margin: '0 0 20px 0',
              letterSpacing: '-1px',
              textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
              maxWidth: '1000px',
            }}
          >
            {title}
          </h1>

          {/* サブタイトル */}
          {subtitle && (
            <p
              style={{
                fontSize: '28px',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.9)',
                margin: '0 0 20px 0',
                maxWidth: '800px',
                lineHeight: 1.4,
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              }}
            >
              {subtitle}
            </p>
          )}

          {/* キーワード */}
          {keywords.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                marginTop: '30px',
                justifyContent: 'center',
              }}
            >
              {keywords.slice(0, 4).map((keyword, index) => (
                <span
                  key={index}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '16px',
                    fontWeight: 600,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}

          {/* ブランド */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              left: '60px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '24px' }}>🎨</span>
            <span
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              CLAFT
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
} 