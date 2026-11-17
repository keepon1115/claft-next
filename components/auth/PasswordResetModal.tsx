'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { createPortal } from 'react-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, X, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/stores/authStore'

// =====================================================
// バリデーションスキーマ
// =====================================================

const resetSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('有効なメールアドレスを入力してください')
})

type ResetFormData = z.infer<typeof resetSchema>

// =====================================================
// コンポーネントの型定義
// =====================================================

interface PasswordResetModalProps {
  /** モーダルの表示状態 */
  isOpen: boolean
  /** モーダルを閉じる関数 */
  onClose: () => void
  /** 元のログインモーダルに戻る関数 */
  onBackToLogin: () => void
}

// =====================================================
// PasswordResetModalコンポーネント
// =====================================================

/**
 * パスワードリセット用モーダルコンポーネント
 * メールアドレスを入力してパスワードリセットメールを送信
 * 
 * @example
 * ```tsx
 * function App() {
 *   const [isResetModalOpen, setIsResetModalOpen] = useState(false)
 *   
 *   return (
 *     <div>
 *       <button onClick={() => setIsResetModalOpen(true)}>
 *         パスワードを忘れた方
 *       </button>
 *       
 *       <PasswordResetModal 
 *         isOpen={isResetModalOpen}
 *         onClose={() => setIsResetModalOpen(false)}
 *         onBackToLogin={() => {
 *           setIsResetModalOpen(false)
 *           setIsLoginModalOpen(true)
 *         }}
 *       />
 *     </div>
 *   )
 * }
 * ```
 */
export const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
  isOpen,
  onClose,
  onBackToLogin
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  
  const { resetPassword, error, clearError } = useAuth()

  // パスワードリセットフォーム
  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    mode: 'onChange'
  })

  // Portalを安全に使用するため、クライアントサイドでのみレンダリング
  useEffect(() => {
    setIsClient(true)
  }, [])

  // モーダルが開かれた時にフォームとステートをリセット
  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false)
      setEmailSent(false)
      resetForm.reset()
      clearError()
    }
  }, [isOpen, resetForm, clearError])

  // Escキーでモーダルを閉じる & モバイル対応
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      // モバイルブラウザでの背景スクロール防止
      document.body.style.overflow = 'hidden'
      
      document.addEventListener('keydown', handleEscape)
      
      // タッチイベントでのスクロール防止
      const preventScroll = (e: TouchEvent) => {
        e.preventDefault()
      }
      document.addEventListener('touchmove', preventScroll, { passive: false })
      
      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.removeEventListener('touchmove', preventScroll)
        document.body.style.overflow = ''
      }
    }
  }, [isOpen, onClose])

  // パスワードリセット処理
  const handlePasswordReset = async (data: ResetFormData) => {
    setIsSubmitting(true)
    clearError()

    try {
      console.log('🔧 パスワードリセット開始:', { email: data.email, timestamp: new Date().toISOString() })
      
      const result = await resetPassword(data.email)
      
      console.log('🔧 パスワードリセット結果:', { success: result.success, error: result.error })
      
      if (result.success) {
        console.log('✅ パスワードリセットメール送信成功')
        setEmailSent(true)
      } else {
        console.error('❌ パスワードリセットメール送信失敗:', result.error)
      }
    } catch (err) {
      console.error('❌ パスワードリセット例外:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // モーダルの背景クリックで閉じる
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  // isClientがtrueになるまで（＝クライアントでマウントされるまで）は何もレンダリングしない
  if (!isClient) return null

  return createPortal(
    <div 
      className="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4 sm:p-6"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="password-reset-modal-title"
      style={{ 
        zIndex: 99999,
      }}
    >
      <div 
        className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-auto my-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative'
        }}
      >
        {/* ヘッダー */}
        <div className="relative p-4 sm:p-6 border-b border-gray-100">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 sm:right-4 sm:top-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
            aria-label="モーダルを閉じる"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          
          <button
            onClick={onBackToLogin}
            className="absolute left-3 top-3 sm:left-4 sm:top-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
            aria-label="ログイン画面に戻る"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          
          <h2 
            id="password-reset-modal-title"
            className="text-lg sm:text-2xl font-bold text-gray-800 text-center px-10"
          >
            🔐 パスワードリセット
          </h2>
        </div>

        <div className="p-4 sm:p-6">
          {/* 共通エラーメッセージ */}
          {error && (
            <div 
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm animate-pulse"
              role="alert"
            >
              ❌ {error}
            </div>
          )}

          {/* 成功時の表示 */}
          {emailSent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800">
                メールを送信しました！
              </h3>
              
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  ご登録のメールアドレス宛にパスワードリセット用のリンクを送信しました。
                </p>
                <p>
                  メール内のリンクをクリックして、新しいパスワードを設定してください。
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-800 text-xs">
                    💡 メールが届かない場合は、迷惑メールフォルダもご確認ください。
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={onBackToLogin}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors touch-manipulation text-sm font-medium"
                >
                  ログイン画面に戻る
                </button>
                
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors touch-manipulation text-sm font-medium"
                >
                  閉じる
                </button>
              </div>
            </div>
          ) : (
            /* パスワードリセットフォーム */
            <div className="space-y-4">
              <div className="text-center space-y-2 mb-6">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  パスワードをリセット
                </h3>
                <p className="text-sm text-gray-600">
                  ご登録のメールアドレスを入力してください。<br />
                  パスワードリセット用のリンクをお送りします。
                </p>
              </div>
              
              <form onSubmit={resetForm.handleSubmit(handlePasswordReset)} className="space-y-4">
                {/* メールアドレス */}
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
                    メールアドレス
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    placeholder="your-email@example.com"
                    className={`w-full px-3 py-3 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-gray-900 text-base sm:text-sm ${
                      resetForm.formState.errors.email 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300'
                    }`}
                    {...resetForm.register('email')}
                  />
                  {resetForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {resetForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* 送信ボタン */}
                <button
                  type="submit"
                  disabled={isSubmitting || !resetForm.formState.isValid}
                  className="w-full bg-blue-600 text-white py-3 sm:py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation text-base sm:text-sm font-medium"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      送信中...
                    </span>
                  ) : (
                    '📧 リセットメールを送信'
                  )}
                </button>
              </form>

              <div className="text-center pt-4">
                <button
                  onClick={onBackToLogin}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                >
                  ← ログイン画面に戻る
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default PasswordResetModal
