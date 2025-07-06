'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import type { UserProfile, UserStats } from '@/types'
import type { User as AuthUser } from '@supabase/supabase-js'

// =====================================================
// 型定義
// =====================================================

/**
 * useAuth フックの戻り値の型
 */
export interface UseAuthReturn {
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

/**
 * useRequireAuth フックのオプション型
 */
export interface UseRequireAuthOptions {
  /** リダイレクト先のパス（デフォルト: '/login'） */
  redirectTo?: string
  /** ローディング中の表示を制御 */
  showLoading?: boolean
}

/**
 * useAdminOnly フックのオプション型
 */
export interface UseAdminOnlyOptions {
  /** 非管理者の場合のリダイレクト先（デフォルト: '/'） */
  redirectTo?: string
  /** ローディング中の表示を制御 */
  showLoading?: boolean
}

// =====================================================
// メイン認証フック
// =====================================================

/**
 * 認証状態とアクションを提供するメインフック
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isAuthenticated, user, login, logout } = useAuth()
 *   
 *   if (!isAuthenticated) {
 *     return <LoginForm onLogin={login} />
 *   }
 *   
 *   return <div>Welcome, {user?.email}!</div>
 * }
 * ```
 */
export const useAuth = (): UseAuthReturn => {
  const store = useAuthStore()
  
  // 初期化確認
  useEffect(() => {
    if (!store.isInitialized) {
      store.initialize()
    }
  }, [store.isInitialized])
  
  return {
    // 状態
    user: store.user,
    profile: store.profile,
    stats: store.stats,
    isLoading: store.isLoading,
    isAdmin: store.isAdmin,
    error: store.error,
    isInitialized: store.isInitialized,
    
    // 派生状態
    isAuthenticated: !!store.user,
    displayName: store.profile?.nickname || store.user?.user_metadata?.display_name || '冒険者',
    
    // アクション
    initialize: store.initialize,
    login: store.login,
    signup: store.signup,
    logout: store.logout,
    updateProfile: store.updateProfile,
    clearError: store.clearError,
    checkAdminStatus: store.checkAdminStatus
  }
}

// =====================================================
// 認証が必要なページ用フック
// =====================================================

/**
 * 認証が必要なページで使用するフック
 * 未認証の場合は指定されたページにリダイレクトします
 * 
 * @param options リダイレクト設定
 * @returns 認証状態と認証されたユーザー情報
 * 
 * @example
 * ```tsx
 * function ProtectedPage() {
 *   const { isAuthenticated, user, isLoading } = useRequireAuth()
 *   
 *   if (isLoading) {
 *     return <LoadingSpinner />
 *   }
 *   
 *   // この時点で認証済みが保証される
 *   return <div>Protected content for {user.email}</div>
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // カスタムリダイレクト先を指定
 * function ProtectedPage() {
 *   const auth = useRequireAuth({ 
 *     redirectTo: '/auth/signin',
 *     showLoading: false 
 *   })
 *   
 *   return <div>Protected content</div>
 * }
 * ```
 */
export const useRequireAuth = (options: UseRequireAuthOptions = {}) => {
  const {
    redirectTo = '/login',
    showLoading = true
  } = options
  
  const router = useRouter()
  const auth = useAuth()
  const [isChecking, setIsChecking] = useState(true)
  
  useEffect(() => {
    // 初期化が完了するまで待機
    if (!auth.isInitialized) {
      return
    }
    
    setIsChecking(false)
    
    // 未認証の場合はリダイレクト
    if (!auth.isAuthenticated) {
      console.log(`未認証のため ${redirectTo} にリダイレクトします`)
      router.push(redirectTo)
      return
    }
    
  }, [auth.isInitialized, auth.isAuthenticated, router, redirectTo])
  
  // ローディング状態の計算
  const isLoading = isChecking || !auth.isInitialized || (showLoading && auth.isLoading)
  
  return {
    ...auth,
    isLoading,
    // 型安全性のため、認証済みの場合のみユーザー情報を返す
    user: auth.isAuthenticated ? auth.user! : null,
    profile: auth.isAuthenticated ? auth.profile : null,
    stats: auth.isAuthenticated ? auth.stats : null
  }
}

// =====================================================
// 管理者専用ページ用フック
// =====================================================

/**
 * 管理者のみアクセス可能なページで使用するフック
 * 未認証または非管理者の場合は指定されたページにリダイレクトします
 * 
 * @param options リダイレクト設定
 * @returns 認証状態と管理者情報
 * 
 * @example
 * ```tsx
 * function AdminPage() {
 *   const { user, isLoading } = useAdminOnly()
 *   
 *   if (isLoading) {
 *     return <LoadingSpinner />
 *   }
 *   
 *   // この時点で管理者権限が保証される
 *   return <div>Admin panel for {user.email}</div>
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // カスタムリダイレクト先を指定
 * function AdminPage() {
 *   const auth = useAdminOnly({ 
 *     redirectTo: '/unauthorized' 
 *   })
 *   
 *   return <div>Admin content</div>
 * }
 * ```
 */
export const useAdminOnly = (options: UseAdminOnlyOptions = {}) => {
  const {
    redirectTo = '/',
    showLoading = true
  } = options
  
  const router = useRouter()
  const auth = useAuth()
  const [isChecking, setIsChecking] = useState(true)
  
  useEffect(() => {
    // 初期化が完了するまで待機
    if (!auth.isInitialized) {
      return
    }
    
    setIsChecking(false)
    
    // 未認証の場合はログインページにリダイレクト
    if (!auth.isAuthenticated) {
      console.log('未認証のため /login にリダイレクトします')
      router.push('/login')
      return
    }
    
    // 管理者権限チェック
    if (auth.isAuthenticated && !auth.isAdmin) {
      console.log(`管理者権限がないため ${redirectTo} にリダイレクトします`)
      router.push(redirectTo)
      return
    }
    
  }, [auth.isInitialized, auth.isAuthenticated, auth.isAdmin, router, redirectTo])
  
  // ローディング状態の計算
  const isLoading = isChecking || !auth.isInitialized || (showLoading && auth.isLoading)
  
  return {
    ...auth,
    isLoading,
    // 型安全性のため、管理者の場合のみユーザー情報を返す
    user: (auth.isAuthenticated && auth.isAdmin) ? auth.user! : null,
    profile: (auth.isAuthenticated && auth.isAdmin) ? auth.profile : null,
    stats: (auth.isAuthenticated && auth.isAdmin) ? auth.stats : null
  }
}

// =====================================================
// ユーティリティフック
// =====================================================

/**
 * ログアウト時の自動リダイレクト機能付きフック
 * 
 * @param redirectTo ログアウト後のリダイレクト先
 * @returns logout関数とローディング状態
 * 
 * @example
 * ```tsx
 * function Header() {
 *   const { logout, isLoggingOut } = useLogoutWithRedirect('/login')
 *   
 *   const handleLogout = async () => {
 *     const result = await logout()
 *     if (result.success) {
 *       // 自動的に /login にリダイレクトされる
 *     }
 *   }
 *   
 *   return (
 *     <button onClick={handleLogout} disabled={isLoggingOut}>
 *       {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
 *     </button>
 *   )
 * }
 * ```
 */
export const useLogoutWithRedirect = (redirectTo: string = '/') => {
  const router = useRouter()
  const { logout, isLoading } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  
  const logoutWithRedirect = async () => {
    setIsLoggingOut(true)
    try {
      const result = await logout()
      if (result.success) {
        console.log(`ログアウト後 ${redirectTo} にリダイレクトします`)
        router.push(redirectTo)
      }
      return result
    } finally {
      setIsLoggingOut(false)
    }
  }
  
  return {
    logout: logoutWithRedirect,
    isLoggingOut: isLoggingOut || isLoading
  }
}

/**
 * 認証状態の変更を監視するフック
 * 
 * @param callback 認証状態変更時のコールバック
 * 
 * @example
 * ```tsx
 * function App() {
 *   useAuthStateChange((isAuthenticated, user) => {
 *     if (isAuthenticated) {
 *       console.log('ユーザーがログインしました:', user?.email)
 *       // アナリティクス送信など
 *     } else {
 *       console.log('ユーザーがログアウトしました')
 *       // キャッシュクリアなど
 *     }
 *   })
 *   
 *   return <div>...</div>
 * }
 * ```
 */
export const useAuthStateChange = (
  callback: (isAuthenticated: boolean, user: AuthUser | null) => void
) => {
  const { isAuthenticated, user, isInitialized } = useAuth()
  const callbackRef = useRef(callback)
  
  // refを更新
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])
  
  useEffect(() => {
    if (isInitialized) {
      callbackRef.current(isAuthenticated, user)
    }
  }, [isAuthenticated, user, isInitialized])
} 