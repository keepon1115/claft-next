'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AlertTriangle, Home, ArrowLeft, Shield } from 'lucide-react'
import Link from 'next/link'

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
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-5">
      <div className="max-w-2xl w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 text-center border border-white/20 shadow-2xl">
          {/* アイコン */}
          <div className="text-6xl mb-6">🚫</div>
          
          {/* タイトル */}
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-lg">
            アクセス拒否
          </h1>
          
          {/* 説明文 */}
          <p className="text-xl text-white/90 mb-4 leading-relaxed">
            申し訳ございませんが、このページにアクセスする権限がありません。
          </p>
          <p className="text-base text-white/80 mb-8 leading-relaxed">
            ログインするか、適切な権限を持つアカウントでアクセスしてください。
          </p>
          
          {/* カウントダウン表示 */}
          <div className="mb-8 p-4 bg-white/10 rounded-xl border border-white/20">
            <p className="text-white/80 text-sm mb-2">自動リダイレクト</p>
            <p className="text-2xl font-bold text-white">
              {countdown > 0 ? `${countdown}秒後にホームページへ` : 'リダイレクト中...'}
            </p>
          </div>
          
          {/* アクションボタン */}
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link 
              href="/" 
              className="group bg-white text-blue-600 px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              ホームに戻る
            </Link>
            <button 
              onClick={handleGoBack}
              className="group bg-transparent text-white px-8 py-4 rounded-full font-semibold border-2 border-white/50 hover:bg-white/10 hover:border-white transition-all duration-300 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              前のページに戻る
            </button>
          </div>
          
          {/* ユーザー情報（デバッグ用） */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-black/20 rounded-xl text-left">
              <p className="text-white/60 text-xs mb-2">Debug Info:</p>
              <p className="text-white/80 text-sm">
                認証状態: {isAuthenticated ? '✅ ログイン済み' : '❌ 未ログイン'}
              </p>
              <p className="text-white/80 text-sm">
                管理者権限: {isAdmin ? '✅ 管理者' : '❌ 一般ユーザー'}
              </p>
              <p className="text-white/80 text-sm">
                ユーザー名: {displayName || 'なし'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 