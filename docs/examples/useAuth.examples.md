# useAuth フック使用例ガイド

このドキュメントでは、`hooks/useAuth.ts`で提供されている認証関連フックの詳細な使用例とベストプラクティスを説明します。

## 📋 目次

1. [基本的な使用方法](#基本的な使用方法)
2. [認証が必要なページの実装](#認証が必要なページの実装)
3. [管理者専用ページの実装](#管理者専用ページの実装)
4. [ログイン・ログアウト機能](#ログインログアウト機能)
5. [リアルタイム認証状態監視](#リアルタイム認証状態監視)
6. [エラーハンドリング](#エラーハンドリング)
7. [パフォーマンス最適化](#パフォーマンス最適化)

## 🚀 基本的な使用方法

### 1. メイン認証フック（useAuth）

```tsx
'use client'

import { useAuth } from '@/hooks/useAuth'

function UserDashboard() {
  const { 
    isAuthenticated, 
    user, 
    profile, 
    isLoading, 
    error,
    displayName 
  } = useAuth()

  if (isLoading) {
    return <div className="loading">認証状態を確認中...</div>
  }

  if (error) {
    return <div className="error">エラー: {error}</div>
  }

  if (!isAuthenticated) {
    return <div>ログインが必要です</div>
  }

  return (
    <div className="dashboard">
      <h1>こんにちは、{displayName}さん！</h1>
      <p>メール: {user?.email}</p>
      {profile && (
        <div>
          <p>レベル: {profile.level}</p>
          <p>経験値: {profile.experience_points}</p>
        </div>
      )}
    </div>
  )
}
```

## 🔒 認証が必要なページの実装

### 2. 基本的な保護されたページ

```tsx
'use client'

import { useRequireAuth } from '@/hooks/useAuth'
import LoadingSpinner from '@/components/common/LoadingSpinner'

function ProtectedPage() {
  const { user, profile, isLoading } = useRequireAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  // この時点で認証済みが保証される
  return (
    <div>
      <h1>プロテクテッドページ</h1>
      <p>ユーザー: {user.email}</p>
      <p>ニックネーム: {profile?.nickname}</p>
    </div>
  )
}

export default ProtectedPage
```

### 3. カスタムリダイレクト先を指定

```tsx
'use client'

import { useRequireAuth } from '@/hooks/useAuth'

function QuestPage() {
  const auth = useRequireAuth({ 
    redirectTo: '/auth/signin',  // カスタムログインページ
    showLoading: false           // ローディング表示を無効化
  })

  if (!auth.isAuthenticated) {
    return null // リダイレクト処理中
  }

  return (
    <div>
      <h1>クエストページ</h1>
      <p>レベル {auth.profile?.level} の冒険者</p>
    </div>
  )
}
```

### 4. Next.js App Routerでのページレベル実装

```tsx
// app/quest/page.tsx
'use client'

import { useRequireAuth } from '@/hooks/useAuth'
import QuestList from '@/components/quest/QuestList'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function QuestPage() {
  const { user, profile, stats, isLoading } = useRequireAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {profile?.nickname}のクエスト
        </h1>
        <p className="text-gray-600">
          レベル {profile?.level} | 経験値 {profile?.experience_points}
        </p>
      </div>
      
      <QuestList 
        userId={user.id}
        userLevel={profile?.level || 1}
      />
    </div>
  )
}
```

## 👑 管理者専用ページの実装

### 5. 基本的な管理者ページ

```tsx
'use client'

import { useAdminOnly } from '@/hooks/useAuth'
import AdminDashboard from '@/components/admin/AdminDashboard'

function AdminPage() {
  const { user, isLoading } = useAdminOnly()

  if (isLoading) {
    return <div>管理者権限を確認中...</div>
  }

  // この時点で管理者権限が保証される
  return (
    <div>
      <h1>管理者パネル</h1>
      <p>管理者: {user.email}</p>
      <AdminDashboard />
    </div>
  )
}

export default AdminPage
```

### 6. カスタム権限エラーページ

```tsx
'use client'

import { useAdminOnly } from '@/hooks/useAuth'

function AdminUsersPage() {
  const auth = useAdminOnly({ 
    redirectTo: '/unauthorized'  // 権限がない場合のリダイレクト先
  })

  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner-border animate-spin" />
          <p className="mt-2">管理者権限を確認中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-panel">
      <h1>ユーザー管理</h1>
      {/* 管理者専用コンテンツ */}
    </div>
  )
}
```

## 🔐 ログイン・ログアウト機能

### 7. ログインコンポーネント

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading, error, clearError } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    const result = await login(email, password)
    if (result.success) {
      router.push('/dashboard')  // ログイン成功後のリダイレクト
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">ログイン</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          メールアドレス
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          required
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          パスワード
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? 'ログイン中...' : 'ログイン'}
      </button>
    </form>
  )
}
```

### 8. ログアウト機能付きヘッダー

```tsx
'use client'

import { useAuth, useLogoutWithRedirect } from '@/hooks/useAuth'
import Link from 'next/link'

function Header() {
  const { isAuthenticated, user, displayName, isAdmin } = useAuth()
  const { logout, isLoggingOut } = useLogoutWithRedirect('/login')

  const handleLogout = async () => {
    const result = await logout()
    if (!result.success) {
      alert('ログアウトに失敗しました')
    }
  }

  if (!isAuthenticated) {
    return (
      <header className="bg-blue-600 text-white p-4">
        <nav className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            Claft
          </Link>
          <div>
            <Link href="/login" className="mr-4 hover:underline">
              ログイン
            </Link>
            <Link href="/signup" className="hover:underline">
              新規登録
            </Link>
          </div>
        </nav>
      </header>
    )
  }

  return (
    <header className="bg-blue-600 text-white p-4">
      <nav className="flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Claft
        </Link>
        
        <div className="flex items-center space-x-4">
          <Link href="/quest" className="hover:underline">
            クエスト
          </Link>
          <Link href="/profile" className="hover:underline">
            プロフィール
          </Link>
          
          {isAdmin && (
            <Link href="/admin" className="hover:underline bg-red-500 px-2 py-1 rounded">
              管理者
            </Link>
          )}
          
          <div className="flex items-center space-x-2">
            <span>こんにちは、{displayName}さん</span>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded disabled:opacity-50"
            >
              {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
            </button>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header
```

## 📡 リアルタイム認証状態監視

### 9. 認証状態変更の監視

```tsx
'use client'

import { useAuthStateChange } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'

function App({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<string[]>([])

  useAuthStateChange((isAuthenticated, user) => {
    if (isAuthenticated && user) {
      console.log('ユーザーがログインしました:', user.email)
      setNotifications(prev => [...prev, `${user.email} がログインしました`])
      
      // アナリティクス送信
      // analytics.track('user_login', { userId: user.id })
    } else {
      console.log('ユーザーがログアウトしました')
      setNotifications(prev => [...prev, 'ログアウトしました'])
      
      // キャッシュクリア
      // clearUserCache()
    }
  })

  // 通知を5秒後に自動削除
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.slice(1))
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [notifications])

  return (
    <div>
      {/* 通知表示 */}
      {notifications.map((notification, index) => (
        <div
          key={index}
          className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50"
        >
          {notification}
        </div>
      ))}
      
      {children}
    </div>
  )
}
```

### 10. セッション管理と自動ログアウト

```tsx
'use client'

import { useAuth } from '@/hooks/useAuth'
import { useEffect, useRef } from 'react'

function SessionManager({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuth()
  const sessionWarningShown = useRef(false)

  useEffect(() => {
    if (!isAuthenticated) return

    // セッション期限の監視（例：24時間）
    const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24時間
    const userCreatedAt = new Date(user?.created_at || '').getTime()
    const now = Date.now()
    const sessionAge = now - userCreatedAt

    if (sessionAge > SESSION_DURATION * 0.9 && !sessionWarningShown.current) {
      // セッション期限の90%で警告
      sessionWarningShown.current = true
      
      const shouldContinue = confirm(
        'セッションの期限が近づいています。継続しますか？'
      )
      
      if (!shouldContinue) {
        logout()
      }
    }

    if (sessionAge > SESSION_DURATION) {
      // セッション期限切れで自動ログアウト
      alert('セッションが期限切れです。再度ログインしてください。')
      logout()
    }
  }, [isAuthenticated, user, logout])

  return <>{children}</>
}
```

## ❌ エラーハンドリング

### 11. エラー境界コンポーネント

```tsx
'use client'

import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'

function AuthErrorBoundary({ children }: { children: React.ReactNode }) {
  const { error, clearError } = useAuth()

  useEffect(() => {
    if (error) {
      console.error('認証エラー:', error)
      
      // エラーレポート送信
      // errorReporting.captureException(new Error(error))
    }
  }, [error])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            認証エラーが発生しました
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={clearError}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              再試行
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              ページをリロード
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
```

## ⚡ パフォーマンス最適化

### 12. メモ化による最適化

```tsx
'use client'

import { useAuth } from '@/hooks/useAuth'
import { useMemo } from 'react'

function UserStats() {
  const { profile, stats } = useAuth()

  // 計算コストの高い派生状態をメモ化
  const userMetrics = useMemo(() => {
    if (!profile || !stats) return null

    return {
      level: profile.level,
      experiencePoints: profile.experience_points,
      loginStreak: stats.login_count,
      lastLoginDaysAgo: Math.floor(
        (Date.now() - new Date(stats.last_login_date).getTime()) / (1000 * 60 * 60 * 24)
      ),
      progressToNextLevel: ((profile.experience_points % 1000) / 1000) * 100
    }
  }, [profile, stats])

  if (!userMetrics) {
    return <div>統計情報を読み込み中...</div>
  }

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <h3>レベル</h3>
        <p className="text-3xl font-bold">{userMetrics.level}</p>
      </div>
      
      <div className="stat-card">
        <h3>次のレベルまで</h3>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${userMetrics.progressToNextLevel}%` }}
          />
        </div>
        <p>{userMetrics.progressToNextLevel.toFixed(1)}%</p>
      </div>
      
      <div className="stat-card">
        <h3>ログイン回数</h3>
        <p className="text-2xl">{userMetrics.loginStreak}</p>
      </div>
      
      <div className="stat-card">
        <h3>最終ログイン</h3>
        <p>{userMetrics.lastLoginDaysAgo}日前</p>
      </div>
    </div>
  )
}
```

### 13. カスタムプロバイダーでのパフォーマンス最適化

```tsx
'use client'

import { createContext, useContext, useMemo } from 'react'
import { useAuth, type UseAuthReturn } from '@/hooks/useAuth'

// 認証コンテキストを作成
const AuthContext = createContext<UseAuthReturn | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth()
  
  // 認証状態のメモ化
  const authValue = useMemo(() => auth, [
    auth.isAuthenticated,
    auth.user?.id,
    auth.profile?.id,
    auth.isAdmin,
    auth.isLoading,
    auth.error
  ])

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  )
}

// 最適化されたフック
export function useOptimizedAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useOptimizedAuth must be used within AuthProvider')
  }
  return context
}
```

## 🎯 ベストプラクティス

### ✅ 推奨パターン

1. **Early Return**: 認証チェックは早期にreturnで処理する
2. **Loading States**: 適切なローディング状態を表示する
3. **Error Boundaries**: エラーハンドリングを適切に実装する
4. **Type Safety**: TypeScriptの型安全性を活用する
5. **Memoization**: 計算コストの高い処理はメモ化する

### ❌ 避けるべきパターン

1. **認証状態の直接操作**: ストアを直接変更しない
2. **ローディング状態の無視**: isLoadingをチェックしない
3. **エラーの放置**: エラーハンドリングを怠らない
4. **過度なリレンダリング**: 不要な再レンダリングを避ける

## 🔧 トラブルシューティング

### よくある問題と解決方法

1. **リダイレクトループ**
   - `useRequireAuth`の`redirectTo`が循環していないかチェック

2. **認証状態が更新されない**
   - `initialize()`が正しく呼ばれているかチェック
   - Supabaseの認証リスナーが正常に動作しているかチェック

3. **管理者権限が反映されない**
   - `checkAdminStatus()`が適切なタイミングで呼ばれているかチェック
   - データベースの`admin_users`テーブルの設定をチェック

4. **型エラー**
   - 型定義ファイルが最新かチェック
   - nullable値の適切なハンドリング

この使用例ガイドを参考に、安全で効率的な認証機能を実装してください。 