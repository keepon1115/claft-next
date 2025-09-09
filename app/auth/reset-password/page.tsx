'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'

// =====================================================
// バリデーションスキーマ
// =====================================================

const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(1, '新しいパスワードを入力してください')
    .min(6, 'パスワードは6文字以上で入力してください')
    .max(128, 'パスワードは128文字以下で入力してください'),
  confirmPassword: z
    .string()
    .min(1, 'パスワードの確認を入力してください')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword']
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

// =====================================================
// PasswordResetPageコンポーネント
// =====================================================

/**
 * パスワードリセットページの内部コンポーネント
 * useSearchParamsを使用するためSuspenseで囲む
 */
function PasswordResetContent() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resetComplete, setResetComplete] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSessionReady, setIsSessionReady] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { updatePassword, user, isAuthenticated, error, clearError } = useAuth()

  // パスワードリセットフォーム
  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange'
  })

  // URLパラメータからアクセストークンを取得
  const accessToken = searchParams.get('access_token')
  const refreshToken = searchParams.get('refresh_token')
  const type = searchParams.get('type')
  const code = searchParams.get('code')

  // コンポーネントマウント時の処理
  useEffect(() => {
    const supabase = createBrowserSupabaseClient()
    const handleSessionFromUrl = async () => {
      try {
        // 1) 新フロー: /auth/v1/verify?code=...&type=recovery
        if (type === 'recovery' && code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
          console.log('✅ exchangeCodeForSession 成功', !!data.session)
          setIsSessionReady(true)
          return
        }

        // 2) 旧フロー: #access_token=...&refresh_token=...&type=recovery
        let at = accessToken
        let rt = refreshToken
        if (!at) {
          const hash = typeof window !== 'undefined' ? window.location.hash : ''
          if (hash && hash.includes('access_token')) {
            const params = new URLSearchParams(hash.replace(/^#/, ''))
            at = params.get('access_token') || undefined
            rt = params.get('refresh_token') || undefined
          }
        }
        if (type === 'recovery' && at && rt) {
          const { data, error } = await supabase.auth.setSession({ access_token: at, refresh_token: rt })
          if (error) throw error
          console.log('✅ setSession 成功', !!data.session)
          setIsSessionReady(true)
          return
        }

        // どちらの形式でもない場合
        if (!isAuthenticated) {
          setErrorMessage('無効なアクセスです。パスワードリセットメールから正しいリンクをクリックしてください。')
        }
      } catch (e: any) {
        console.error('❌ セッショントークン処理エラー:', e)
        setErrorMessage('リンクの有効期限が切れている可能性があります。もう一度お試しください。')
      }
    }
    handleSessionFromUrl()
  }, [accessToken, refreshToken, type, code, isAuthenticated])

  // パスワード更新処理
  const handlePasswordReset = async (data: ResetPasswordFormData) => {
    setIsSubmitting(true)
    clearError()
    setErrorMessage(null)

    try {
      console.log('🔧 パスワードリセット開始:', { timestamp: new Date().toISOString() })
      
      const result = await updatePassword(data.newPassword)
      
      console.log('🔧 パスワードリセット結果:', { success: result.success, error: result.error })
      
      if (result.success) {
        console.log('✅ パスワードリセット成功')
        setResetComplete(true)
        resetForm.reset()
        setShowPassword(false)
        setShowConfirmPassword(false)
      } else {
        console.error('❌ パスワードリセット失敗:', result.error)
        setErrorMessage(result.error || 'パスワードの更新に失敗しました')
      }
    } catch (err) {
      console.error('❌ パスワードリセット例外:', err)
      setErrorMessage('パスワードの更新中にエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ホームページに戻る
  const handleGoHome = () => {
    router.push('/')
  }

  // ログインページに移動
  const handleGoToLogin = () => { router.push('/login') }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8">
        {/* ヘッダー */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
            {resetComplete ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : errorMessage ? (
              <AlertCircle className="w-8 h-8 text-red-600" />
            ) : (
              <Eye className="w-8 h-8 text-blue-600" />
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {resetComplete ? '🎉 パスワード更新完了' : '🔒 新しいパスワードを設定'}
          </h1>
          
          <p className="text-gray-600 text-sm">
            {resetComplete 
              ? 'パスワードが正常に更新されました'
              : 'アカウントのセキュリティを保つため、新しいパスワードを設定してください'
            }
          </p>
        </div>

        {/* エラーメッセージ */}
        {(errorMessage || error) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {errorMessage || error}
          </div>
        )}

        {/* 完了画面 */}
        {resetComplete ? (
          <div className="text-center space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                ✅ パスワードが正常に更新されました。<br />
                新しいパスワードでログインできます。
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleGoToLogin}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
              >
                ログインページへ
              </button>
              
              <button
                onClick={handleGoHome}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
              >
                ホームへ戻る
              </button>
            </div>
          </div>
        ) : (
          /* パスワード設定フォーム */
          <div>
            {/* 無効なアクセスの場合 */}
            {!isSessionReady && !accessToken && !isAuthenticated ? (
              <div className="text-center space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">
                    ❌ 無効なアクセスです。<br />
                    パスワードリセットメールから正しいリンクをクリックしてください。
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleGoHome}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                  >
                    ホームに戻る
                  </button>
                </div>

                <div className="text-center">
                  <Link
                    href="/"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    パスワードを忘れた方はこちら
                  </Link>
                </div>
              </div>
            ) : (
              /* パスワード設定フォーム */
              <form onSubmit={resetForm.handleSubmit(handlePasswordReset)} className="space-y-4">
                {/* 新しいパスワード */}
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                    新しいパスワード
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="6文字以上の新しいパスワード"
                      className={`w-full px-3 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-gray-900 ${
                        resetForm.formState.errors.newPassword 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300'
                      }`}
                      {...resetForm.register('newPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {resetForm.formState.errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {resetForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                {/* パスワード確認 */}
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                    パスワードの確認
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="新しいパスワードをもう一度入力"
                      className={`w-full px-3 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-gray-900 ${
                        resetForm.formState.errors.confirmPassword 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300'
                      }`}
                      {...resetForm.register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={showConfirmPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {resetForm.formState.errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {resetForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* パスワード要件 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-800 text-sm">
                    💡 パスワードは6文字以上で設定してください。<br />
                    大文字・小文字・数字・記号を組み合わせると、より安全です。
                  </p>
                </div>

                {/* 送信ボタン */}
                <button
                  type="submit"
                  disabled={isSubmitting || !resetForm.formState.isValid}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 718-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 74 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      更新中...
                    </span>
                  ) : (
                    '🔒 パスワードを更新'
                  )}
                </button>

                {/* ホームに戻るリンク */}
                <div className="text-center pt-4">
                  <Link
                    href="/"
                    className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    ホームに戻る
                  </Link>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * パスワードリセットページ
 * メールリンクからアクセスして新しいパスワードを設定
 */
export default function PasswordResetPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">読み込み中...</h1>
          <p className="text-gray-600 text-sm">パスワードリセット画面を準備しています</p>
        </div>
      </div>
    }>
      <PasswordResetContent />
    </Suspense>
  )
}
