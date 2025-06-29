'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AlertTriangle, Home, ArrowLeft, Shield } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'
import { pageMetadata } from '@/lib/utils/seo'

// ==========================================
// メタデータ設定（noindex）
// ==========================================

export const metadata: Metadata = pageMetadata.unauthorized()

// ==========================================
// 未承認ページコンポーネント
// ==========================================

export default function UnauthorizedPage() {
  const router = useRouter()
  const { isAuthenticated, isAdmin, user, displayName } = useAuth()
  const [countdown, setCountdown] = useState(10)

  // 10秒後に自動でホームページにリダイレクト
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const handleGoHome = () => {
    router.push('/')
  }

  const handleGoBack = () => {
    router.back()
  }

  return (
    <div className="unauthorized-page">
      <div className="container">
        <div className="content">
          <div className="icon">🚫</div>
          <h1 className="title">アクセス拒否</h1>
          <p className="description">
            申し訳ございませんが、このページにアクセスする権限がありません。
          </p>
          <p className="sub-description">
            ログインするか、適切な権限を持つアカウントでアクセスしてください。
          </p>
          
          <div className="actions">
            <Link href="/" className="button primary">
              ホームに戻る
            </Link>
            <button 
              onClick={handleGoBack}
              className="button secondary"
            >
              前のページに戻る
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .unauthorized-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .container {
          max-width: 600px;
          width: 100%;
        }

        .content {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 3rem;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
        }

        .title {
          font-size: 2.5rem;
          font-weight: 900;
          color: white;
          margin-bottom: 1rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .description {
          font-size: 1.25rem;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 1rem;
          line-height: 1.6;
        }

        .sub-description {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 2.5rem;
          line-height: 1.6;
        }

        .actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .button {
          padding: 12px 24px;
          border-radius: 25px;
          font-weight: 600;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .button.primary {
          background: white;
          color: #667eea;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .button.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        .button.secondary {
          background: transparent;
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.5);
        }

        .button.secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: white;
        }

        @media (max-width: 768px) {
          .content {
            padding: 2rem;
          }

          .title {
            font-size: 2rem;
          }

          .actions {
            flex-direction: column;
            align-items: center;
          }

          .button {
            width: 100%;
            max-width: 250px;
          }
        }
      `}</style>
    </div>
  )
} 