'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, AlertCircle, ArrowLeft, Mail } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

// =====================================================
// AuthCallbackPageコンポーネント
// =====================================================

/**
 * 認証コールバックページの内部コンポーネント
 * useSearchParamsを使用するためSuspenseで囲む
 */
function AuthCallbackContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState<string>('')
  const [actionType, setActionType] = useState<string>('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // URLパラメータから情報を取得
        const type = searchParams.get('type')
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        console.log('🔧 認証コールバック処理開始:', {
          type,
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          error,
          errorDescription
        })

        // エラーがある場合
        if (error) {
          console.error('❌ 認証コールバックエラー:', { error, errorDescription })
          setStatus('error')
          setMessage(errorDescription || error || '認証処理中にエラーが発生しました')
          return
        }

        // アクションタイプに応じた処理
        switch (type) {
          case 'signup':
            setActionType('アカウント確認')
            setStatus('success')
            setMessage('メールアドレスの確認が完了しました。アカウントが有効になりました。')
            break

          case 'email_change':
            setActionType('メールアドレス変更')
            setStatus('success')
            setMessage('メールアドレスの変更が完了しました。')
            break

          case 'recovery':
            setActionType('パスワードリセット')
            // パスワードリセットの場合は専用ページにリダイレクト
            const resetUrl = `/auth/reset-password?${searchParams.toString()}`
            console.log('🔄 パスワードリセットページにリダイレクト:', resetUrl)
            router.replace(resetUrl)
            return

          case 'invite':
            setActionType('招待')
            setStatus('success')
            setMessage('招待の確認が完了しました。')
            break

          default:
            // 不明なタイプまたはタイプなしの場合
            if (accessToken) {
              setActionType('認証')
              setStatus('success')
              setMessage('認証が完了しました。')
            } else {
              console.warn('⚠️ 不明な認証コールバック:', { type, searchParams: Object.fromEntries(searchParams.entries()) })
              setStatus('error')
              setMessage('不明な認証リクエストです。')
            }
            break
        }

        console.log('✅ 認証コールバック処理完了:', { type, status: 'success' })

      } catch (err) {
        console.error('❌ 認証コールバック処理例外:', err)
        setStatus('error')
        setMessage('認証処理中に予期しないエラーが発生しました。')
      }
    }

    handleCallback()
  }, [searchParams, router])

  // ホームページに戻る
  const handleGoHome = () => {
    router.push('/')
  }

  // ログインページに移動
  const handleGoToLogin = () => {
    router.push('/')
  }

  // プロフィールページに移動
  const handleGoToProfile = () => {
    router.push('/profile')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8">
        {/* ローディング画面 */}
        {status === 'loading' && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              🔄 処理中...
            </h1>
            
            <p className="text-gray-600 text-sm">
              認証情報を確認しています
            </p>
          </div>
        )}

        {/* 成功画面 */}
        {status === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              ✅ {actionType}完了
            </h1>
            
            <p className="text-gray-600 text-sm mb-6">
              {message}
            </p>

            <div className="space-y-3">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={handleGoToProfile}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                  >
                    プロフィールページへ
                  </button>
                  
                  <button
                    onClick={handleGoHome}
                    className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
                  >
                    ホームへ戻る
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleGoToLogin}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                  >
                    ログインページへ
                  </button>
                  
                  <button
                    onClick={handleGoHome}
                    className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
                  >
                    ホームへ戻る
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* エラー画面 */}
        {status === 'error' && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              ❌ エラーが発生しました
            </h1>
            
            <p className="text-gray-600 text-sm mb-6">
              {message}
            </p>

            <div className="space-y-3">
              <button
                onClick={handleGoHome}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
              >
                ホームに戻る
              </button>

              <div className="text-center">
                <Link
                  href="/"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors inline-flex items-center gap-1"
                >
                  <Mail className="w-4 h-4" />
                  サポートにお問い合わせ
                </Link>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                ホームページ
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * 認証コールバックページ
 * メール確認、パスワードリセットなどのリンクからアクセスされる
 */
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">読み込み中...</h1>
          <p className="text-gray-600 text-sm">認証情報を確認しています</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
