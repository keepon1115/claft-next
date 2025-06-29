'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import type { User as AuthUser } from '@supabase/supabase-js'
import type { UserProfile, UserStats } from '@/types'
import AnimationProvider from '@/components/common/AnimationProvider'
import { PerformanceProvider } from '@/components/common/PerformanceMonitor'

// Vercel Analytics
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

// =====================================================
// 型定義
// =====================================================

interface AuthContextType {
  // 認証状態
  user: AuthUser | null
  profile: UserProfile | null
  stats: UserStats | null
  isLoading: boolean
  isAdmin: boolean
  error: string | null
  isInitialized: boolean
  
  // 派生状態
  isAuthenticated: boolean
  displayName: string
  
  // アクション
  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (email: string, password: string, nickname?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<{ success: boolean; error?: string }>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>
  clearError: () => void
  checkAdminStatus: () => Promise<void>
}

interface AuthProviderProps {
  children: ReactNode
}

interface AppProvidersProps {
  children: ReactNode
}

// =====================================================
// 認証コンテキスト
// =====================================================

const AuthContext = createContext<AuthContextType | null>(null)

// =====================================================
// 認証プロバイダー
// =====================================================

/**
 * 認証状態を管理するプロバイダー
 * アプリケーション全体で認証状態を共有し、自動初期化を行う
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [mounted, setMounted] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)
  
  // Zustand認証ストアから状態とアクションを取得
  const {
    user,
    profile,
    stats,
    isLoading,
    isAdmin,
    error,
    isInitialized,
    initialize,
    login,
    signup,
    logout,
    updateProfile,
    clearError,
    checkAdminStatus
  } = useAuthStore()

  // クライアントサイドでのマウント確認
  useEffect(() => {
    setMounted(true)
  }, [])

  // 認証の初期化
  useEffect(() => {
    let isCancelled = false

    const initializeAuth = async () => {
      if (!mounted || isInitialized) return

      try {
        console.log('🔄 認証プロバイダー: 初期化開始')
        await initialize()
        console.log('✅ 認証プロバイダー: 初期化完了')
      } catch (err) {
        if (!isCancelled) {
          const errorMessage = err instanceof Error ? err.message : '認証初期化エラー'
          console.error('❌ 認証プロバイダー: 初期化失敗', err)
          setInitError(errorMessage)
        }
      }
    }

    initializeAuth()

    return () => {
      isCancelled = true
    }
  }, [mounted, isInitialized, initialize])

  // Supabaseセッション監視の追加設定
  useEffect(() => {
    if (!mounted || !isInitialized) return

    let supabase: any = null
    
    try {
      supabase = createBrowserSupabaseClient()
      
      // 追加のセッション監視（プロバイダーレベル）
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event: string, session: any) => {
          console.log('🔄 認証プロバイダー: セッション変更検出', { event, hasSession: !!session })
          
          // セッション変更時の追加処理をここに実装可能
          if (event === 'SIGNED_OUT') {
            console.log('📤 認証プロバイダー: ログアウト検出')
            // 必要に応じてキャッシュクリア等の処理を追加
          } else if (event === 'SIGNED_IN') {
            console.log('📥 認証プロバイダー: ログイン検出')
            // 必要に応じてアナリティクス等の処理を追加
          }
        }
      )

      return () => {
        subscription?.unsubscribe()
      }
    } catch (err) {
      console.error('❌ 認証プロバイダー: セッション監視設定エラー', err)
    }
  }, [mounted, isInitialized])

  // 派生状態の計算
  const contextValue: AuthContextType = {
    // 基本状態
    user,
    profile,
    stats,
    isLoading,
    isAdmin,
    error: error || initError,
    isInitialized,
    
    // 派生状態
    isAuthenticated: !!user,
    displayName: profile?.nickname || user?.user_metadata?.display_name || '冒険者',
    
    // アクション
    initialize,
    login,
    signup,
    logout,
    updateProfile,
    clearError: () => {
      clearError()
      setInitError(null)
    },
    checkAdminStatus
  }

  // SSRの互換性を確保
  if (!mounted) {
    return (
      <AuthContext.Provider value={{
        user: null,
        profile: null,
        stats: null,
        isLoading: true,
        isAdmin: false,
        error: null,
        isInitialized: false,
        isAuthenticated: false,
        displayName: '冒険者',
        initialize: async () => {},
        login: async () => ({ success: false }),
        signup: async () => ({ success: false }),
        logout: async () => ({ success: false }),
        updateProfile: async () => ({ success: false }),
        clearError: () => {},
        checkAdminStatus: async () => {}
      }}>
        {children}
      </AuthContext.Provider>
    )
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// =====================================================
// 認証コンテキストフック
// =====================================================

/**
 * 認証コンテキストを使用するためのフック
 * AuthProvider内でのみ使用可能
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isAuthenticated, user, login } = useAuthContext()
 *   
 *   if (!isAuthenticated) {
 *     return <button onClick={() => login('email', 'password')}>Login</button>
 *   }
 *   
 *   return <div>Hello, {user?.email}</div>
 * }
 * ```
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error(
      'useAuthContext must be used within an AuthProvider. ' +
      'Make sure your component is wrapped with <AuthProvider> or <AppProviders>.'
    )
  }
  
  return context
}

// =====================================================
// エラー境界コンポーネント
// =====================================================

interface AuthErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface AuthErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

class AuthErrorBoundary extends React.Component<AuthErrorBoundaryProps, AuthErrorBoundaryState> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('❌ 認証エラー境界: エラーをキャッチしました', error, errorInfo)
    
    // エラーレポート送信（本番環境では適切なエラーレポートサービスを使用）
    if (process.env.NODE_ENV === 'production') {
      // analytics.captureException(error, { extra: errorInfo })
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              認証エラーが発生しました
            </h2>
            <p className="text-gray-600 mb-6">
              申し訳ございません。認証システムでエラーが発生しました。
              ページをリロードしてもう一度お試しください。
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ページをリロード
            </button>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">
                  開発者向け詳細情報
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 text-xs text-red-600 rounded overflow-auto">
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// =====================================================
// 統合プロバイダー
// =====================================================

/**
 * アプリケーション全体のプロバイダーを統合するコンポーネント
 * 認証、テーマ、その他のグローバル状態を管理
 * 
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { AppProviders } from './providers'
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <AppProviders>
 *           {children}
 *         </AppProviders>
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 */
export function AppProviders({ children }: AppProvidersProps) {
  // ページ読み込み完了の通知
  useEffect(() => {
    // パフォーマンス測定のため、ページ読み込み完了を通知
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pageLoaded'))
    }
  }, [])

  return (
    <AuthErrorBoundary>
      <AuthProvider>
        <PerformanceProvider>
          <AnimationProvider>
            {children}
            
            {/* Vercel Analytics（本番環境のみ） */}
            {process.env.NODE_ENV === 'production' && (
              <>
                <Analytics />
                <SpeedInsights />
              </>
            )}
          </AnimationProvider>
        </PerformanceProvider>
      </AuthProvider>
    </AuthErrorBoundary>
  )
}

// =====================================================
// 認証ガードコンポーネント
// =====================================================

interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
}

/**
 * 認証状態に基づいてコンテンツの表示を制御するガードコンポーネント
 * 
 * @example
 * ```tsx
 * // 認証が必要なコンテンツ
 * <AuthGuard requireAuth>
 *   <ProtectedContent />
 * </AuthGuard>
 * 
 * // 管理者のみアクセス可能なコンテンツ
 * <AuthGuard requireAdmin fallback={<div>Access Denied</div>}>
 *   <AdminContent />
 * </AuthGuard>
 * ```
 */
export function AuthGuard({ 
  children, 
  fallback = null, 
  requireAuth = false, 
  requireAdmin = false 
}: AuthGuardProps) {
  const { isAuthenticated, isAdmin, isLoading, isInitialized } = useAuthContext()

  // 初期化中はローディング表示
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">認証状態を確認中...</p>
        </div>
      </div>
    )
  }

  // 認証が必要だが未認証の場合
  if (requireAuth && !isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            ログインが必要です
          </h2>
          <p className="text-gray-600">
            このページをご覧いただくにはログインが必要です。
          </p>
        </div>
      </div>
    )
  }

  // 管理者権限が必要だが管理者でない場合
  if (requireAdmin && (!isAuthenticated || !isAdmin)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            アクセス権限がありません
          </h2>
          <p className="text-gray-600">
            このページは管理者のみアクセス可能です。
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// ==========================================
// 開発環境用パフォーマンス警告
// ==========================================

if (process.env.NODE_ENV === 'development') {
  // 開発環境でのパフォーマンス警告
  if (typeof window !== 'undefined') {
    console.log('🔧 開発モード: パフォーマンス監視が有効です')
    
    // 大きなバンドルサイズの警告
    const checkBundleSize = () => {
      if ('performance' in window && 'getEntriesByType' in performance) {
        const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
        const entry = navigationEntries[0]
        
        if (entry && entry.transferSize > 1024 * 1024) { // 1MB超過
          console.warn('⚠️ バンドルサイズが大きいです:', {
            transferSize: `${(entry.transferSize / 1024 / 1024).toFixed(2)} MB`,
            recommendation: 'コード分割や動的インポートを検討してください'
          })
        }
      }
    }
    
    // ページ読み込み後にチェック
    window.addEventListener('load', checkBundleSize)
  }
}

// デフォルトエクスポート
export default AppProviders 