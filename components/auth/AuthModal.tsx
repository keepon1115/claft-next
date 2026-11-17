'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { createPortal } from 'react-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { PasswordResetModal } from './PasswordResetModal'

// =====================================================
// バリデーションスキーマ
// =====================================================

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(1, 'パスワードを入力してください')
    .min(6, 'パスワードは6文字以上で入力してください')
})

const signupSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(1, 'パスワードを入力してください')
    .min(6, 'パスワードは6文字以上で入力してください')
    .max(128, 'パスワードは128文字以下で入力してください'),
  nickname: z
    .string()
    .optional()
    .refine(val => !val || val.length <= 50, 'ニックネームは50文字以下で入力してください')
})

type LoginFormData = z.infer<typeof loginSchema>
type SignupFormData = z.infer<typeof signupSchema>

// =====================================================
// コンポーネントの型定義
// =====================================================

interface AuthModalProps {
  /** モーダルの表示状態 */
  isOpen: boolean
  /** モーダルを閉じる関数 */
  onClose: () => void
  /** 初期タブ（'login' | 'signup'） */
  defaultTab?: 'login' | 'signup'
  /** 認証成功後のリダイレクト先 */
  redirectTo?: string
}

// =====================================================
// AuthModalコンポーネント
// =====================================================

/**
 * 認証モーダルコンポーネント
 * ログイン・サインアップ機能をタブ切り替えで提供
 * 
 * @example
 * ```tsx
 * function App() {
 *   const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
 *   
 *   return (
 *     <div>
 *       <button onClick={() => setIsAuthModalOpen(true)}>
 *         ログイン
 *       </button>
 *       
 *       <AuthModal 
 *         isOpen={isAuthModalOpen}
 *         onClose={() => setIsAuthModalOpen(false)}
 *         defaultTab="login"
 *         redirectTo="/dashboard"
 *       />
 *     </div>
 *   )
 * }
 * ```
 */
export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login',
  redirectTo = '/'
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(defaultTab)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  
  const { login, signup, error, clearError } = useAuth()
  const router = useRouter()

  // ログインフォーム
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange'
  })

  // サインアップフォーム
  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange'
  })

  // Portalを安全に使用するため、クライアントサイドでのみレンダリング
  useEffect(() => {
    setIsClient(true)
  }, [])

  // モーダルが開かれた時にタブをリセット
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab)
      setShowPassword(false)
      setIsSubmitting(false)
      setShowPasswordReset(false)
      loginForm.reset()
      signupForm.reset()
      clearError()
    }
  }, [isOpen, defaultTab, loginForm, signupForm, clearError])

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

  // ログイン処理
  const handleLogin = async (data: LoginFormData) => {
    setIsSubmitting(true)
    clearError()

    try {
      console.log('🔧 ログイン開始:', { email: data.email, timestamp: new Date().toISOString() })
      
      const result = await login(data.email, data.password)
      
      console.log('🔧 ログイン結果:', { success: result.success, error: result.error })
      
      if (result.success) {
        console.log('✅ ログイン成功')
        onClose()
        if (redirectTo && redirectTo !== '/') {
          router.push(redirectTo)
        }
      } else {
        console.error('❌ ログイン失敗:', result.error)
      }
    } catch (err) {
      console.error('❌ ログイン例外:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // サインアップ処理
  const handleSignup = async (data: SignupFormData) => {
    setIsSubmitting(true)
    clearError()

    try {
      // ニックネームが空の場合は「冒険者」をデフォルトとして設定
      const nickname = data.nickname?.trim() || '冒険者'
      const result = await signup(data.email, data.password, nickname)
      
      if (result.success) {
        // サインアップ成功時はログインタブに切り替え
        setActiveTab('login')
        loginForm.setValue('email', data.email)
        signupForm.reset()
        
        // 成功メッセージを表示
        alert('✅ 登録完了！確認メールをご確認ください')
      }
    } catch (err) {
      console.error('Signup error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // タブ切り替え
  const switchTab = (tab: 'login' | 'signup') => {
    setActiveTab(tab)
    setShowPassword(false)
    clearError()
    
    // フォームエラーをクリア
    loginForm.clearErrors()
    signupForm.clearErrors()
  }

  // パスワード表示切り替え
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
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

  return (
    <>
      {/* メインのAuthModal */}
      {createPortal(
        <div 
          className="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4 sm:p-6"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
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
              
              <h2 
                id="auth-modal-title"
                className="text-lg sm:text-2xl font-bold text-gray-800 text-center pr-10"
              >
                🔐 冒険者登録・ログイン
              </h2>
            </div>

            {/* タブナビゲーション */}
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => switchTab('login')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors touch-manipulation ${
                  activeTab === 'login'
                    ? 'text-white bg-blue-600 border-b-4 border-blue-600'
                    : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                ログイン
              </button>
              <button
                onClick={() => switchTab('signup')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors touch-manipulation ${
                  activeTab === 'signup'
                    ? 'text-white bg-blue-600 border-b-4 border-green-600'
                    : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                新規登録
              </button>
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

              {/* ログインフォーム */}
              {activeTab === 'login' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    冒険を続ける
                  </h3>
                  
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    {/* メールアドレス */}
                    <div>
                      <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
                        メールアドレス
                      </label>
                      <input
                        id="login-email"
                        type="email"
                        placeholder="your-email@example.com"
                        className={`w-full px-3 py-3 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-gray-900 text-base sm:text-sm ${
                          loginForm.formState.errors.email 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-gray-300'
                        }`}
                        {...loginForm.register('email')}
                      />
                      {loginForm.formState.errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {loginForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* パスワード */}
                    <div>
                      <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
                        パスワード
                      </label>
                      <div className="relative">
                        <input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="パスワードを入力"
                          className={`w-full px-3 py-3 sm:py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-gray-900 text-base sm:text-sm ${
                            loginForm.formState.errors.password 
                              ? 'border-red-300 focus:ring-red-500' 
                              : 'border-gray-300'
                          }`}
                          {...loginForm.register('password')}
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors touch-manipulation p-1"
                          aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {loginForm.formState.errors.password && (
                        <p className="mt-1 text-sm text-red-600">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    {/* 送信ボタン */}
                    <button
                      type="submit"
                      disabled={isSubmitting || !loginForm.formState.isValid}
                      className="w-full bg-blue-600 text-white py-3 sm:py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation text-base sm:text-sm font-medium"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          ログイン中...
                        </span>
                      ) : (
                        '🚪 ログイン'
                      )}
                    </button>

                    {/* パスワードリセットリンク */}
                    <div className="text-center mt-4">
                      <button
                        type="button"
                        onClick={() => setShowPasswordReset(true)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                      >
                        パスワードを忘れた方はこちら
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* サインアップフォーム */}
              {activeTab === 'signup' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    新しい冒険を始める
                  </h3>
                  
                  <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                    {/* メールアドレス */}
                    <div>
                      <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1">
                        メールアドレス
                      </label>
                      <input
                        id="signup-email"
                        type="email"
                        placeholder="your-email@example.com"
                        className={`w-full px-3 py-3 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-gray-900 text-base sm:text-sm ${
                          signupForm.formState.errors.email 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-gray-300'
                        }`}
                        {...signupForm.register('email')}
                      />
                      {signupForm.formState.errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {signupForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* パスワード */}
                    <div>
                      <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1">
                        パスワード
                      </label>
                      <div className="relative">
                        <input
                          id="signup-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="6文字以上のパスワード"
                          className={`w-full px-3 py-3 sm:py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-gray-900 text-base sm:text-sm ${
                            signupForm.formState.errors.password 
                              ? 'border-red-300 focus:ring-red-500' 
                              : 'border-gray-300'
                          }`}
                          {...signupForm.register('password')}
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors touch-manipulation p-1"
                          aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {signupForm.formState.errors.password && (
                        <p className="mt-1 text-sm text-red-600">
                          {signupForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    {/* ニックネーム */}
                    <div>
                      <label htmlFor="signup-nickname" className="block text-sm font-medium text-gray-700 mb-1">
                        冒険者名
                      </label>
                      <input
                        id="signup-nickname"
                        type="text"
                        placeholder="あなたの冒険者名"
                        className={`w-full px-3 py-3 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-gray-900 text-base sm:text-sm ${
                          signupForm.formState.errors.nickname 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-gray-300'
                        }`}
                        {...signupForm.register('nickname')}
                      />
                      {signupForm.formState.errors.nickname && (
                        <p className="mt-1 text-sm text-red-600">
                          {signupForm.formState.errors.nickname.message}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        空欄の場合は「冒険者」として登録されます
                      </p>
                    </div>

                    {/* 送信ボタン */}
                    <button
                      type="submit"
                      disabled={isSubmitting || !signupForm.formState.isValid}
                      className="w-full bg-green-600 text-black py-3 sm:py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation text-base sm:text-sm font-medium"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 718-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 74 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          登録中...
                        </span>
                      ) : (
                        '⚔️ 冒険者登録'
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* パスワードリセットモーダル */}
      <PasswordResetModal
        isOpen={showPasswordReset}
        onClose={() => setShowPasswordReset(false)}
        onBackToLogin={() => {
          setShowPasswordReset(false)
          setActiveTab('login')
        }}
      />
    </>
  )
}

// =====================================================
// カスタムCSS（必要に応じてglobals.cssに追加）
// =====================================================

const modalStyles = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}
`

// スタイルを動的に追加（開発時のみ）
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style')
  styleElement.textContent = modalStyles
  document.head.appendChild(styleElement)
}

export default AuthModal