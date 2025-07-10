# App Providers 使用例ガイド

`app/providers.tsx`で実装されている認証プロバイダーシステムの詳細な使用例とベストプラクティスを説明します。

## 📋 目次

1. [基本的な使用方法](#基本的な使用方法)
2. [プロバイダー構成](#プロバイダー構成)
3. [認証コンテキストの使用](#認証コンテキストの使用)
4. [認証ガードの実装](#認証ガードの実装)
5. [エラーハンドリング](#エラーハンドリング)
6. [SSR対応](#ssr対応)
7. [パフォーマンス最適化](#パフォーマンス最適化)

## 🚀 基本的な使用方法

### app/layout.tsx での設定

```tsx
import type { Metadata } from "next";
import { AppProviders } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Claft - 冒険者育成プラットフォーム",
  description: "Claftで新しい冒険を始めよう！",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
```

### コンポーネントでの認証状態使用

```tsx
'use client'

import { useAuthContext } from '@/app/providers'

function MyComponent() {
  const { isAuthenticated, user, login, logout } = useAuthContext()

  if (!isAuthenticated) {
    return (
      <button onClick={() => login('user@example.com', 'password')}>
        ログイン
      </button>
    )
  }

  return (
    <div>
      <p>こんにちは、{user?.email}さん！</p>
      <button onClick={logout}>ログアウト</button>
    </div>
  )
}
```

## 🏗️ プロバイダー構成

### 個別プロバイダーの使用

```tsx
// 認証プロバイダーのみ使用する場合
import { AuthProvider } from '@/app/providers'

function SpecificLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}
```

### 複数プロバイダーの統合

```tsx
// 将来的な拡張例
import { AppProviders } from '@/app/providers'
// import { ThemeProvider } from './theme-provider'
// import { NotificationProvider } from './notification-provider'

function ExtendedProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      {/* ThemeProvider */}
      {/* NotificationProvider */}
      {children}
      {/* /NotificationProvider */}
      {/* /ThemeProvider */}
    </AppProviders>
  )
}
```

## 🔐 認証コンテキストの使用

### 基本的な認証確認

```tsx
'use client'

import { useAuthContext } from '@/app/providers'

function UserDashboard() {
  const { 
    isAuthenticated, 
    user, 
    profile, 
    stats, 
    isLoading, 
    displayName 
  } = useAuthContext()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <div>ログインしてください</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        ようこそ、{displayName}さん！
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">プロフィール</h2>
          <p>レベル: {profile?.level || 1}</p>
          <p>経験値: {profile?.experience_points || 0}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">統計</h2>
          <p>ログイン回数: {stats?.login_count || 0}</p>
          <p>最終ログイン: {stats?.last_login_date || 'なし'}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">アカウント</h2>
          <p>メール: {user?.email}</p>
          <p>ID: {user?.id}</p>
        </div>
      </div>
    </div>
  )
}
```

### 管理者機能の実装

```tsx
'use client'

import { useAuthContext } from '@/app/providers'

function AdminPanel() {
  const { isAdmin, isAuthenticated } = useAuthContext()

  if (!isAuthenticated) {
    return <div>ログインが必要です</div>
  }

  if (!isAdmin) {
    return <div>管理者権限が必要です</div>
  }

  return (
    <div className="admin-panel">
      <h1 className="text-2xl font-bold mb-4">管理者パネル</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold">ユーザー管理</h2>
          <p>登録ユーザーの管理</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold">コンテンツ管理</h2>
          <p>クエストやコンテンツの管理</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold">システム設定</h2>
          <p>アプリケーションの設定</p>
        </div>
      </div>
    </div>
  )
}
```

## 🛡️ 認証ガードの実装

### ページレベルでの保護

```tsx
// app/dashboard/page.tsx
'use client'

import { AuthGuard } from '@/app/providers'
import DashboardContent from '@/components/DashboardContent'

export default function DashboardPage() {
  return (
    <AuthGuard 
      requireAuth 
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">ログインが必要です</h2>
            <p>ダッシュボードにアクセスするにはログインしてください。</p>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </AuthGuard>
  )
}
```

### 管理者専用ページ

```tsx
// app/admin/page.tsx
'use client'

import { AuthGuard } from '@/app/providers'
import AdminDashboard from '@/components/admin/AdminDashboard'

export default function AdminPage() {
  return (
    <AuthGuard 
      requireAdmin 
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              アクセス拒否
            </h2>
            <p>このページは管理者のみアクセス可能です。</p>
          </div>
        </div>
      }
    >
      <AdminDashboard />
    </AuthGuard>
  )
}
```

### コンポーネントレベルでの条件表示

```tsx
'use client'

import { AuthGuard, useAuthContext } from '@/app/providers'

function ConditionalContent() {
  const { isAuthenticated, isAdmin } = useAuthContext()

  return (
    <div>
      {/* 全ユーザー向けコンテンツ */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">公開コンテンツ</h2>
        <p>すべての訪問者が閲覧できるコンテンツです。</p>
      </section>

      {/* 認証ユーザー向けコンテンツ */}
      <AuthGuard requireAuth>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">メンバー限定コンテンツ</h2>
          <p>ログインユーザーのみが閲覧できるコンテンツです。</p>
        </section>
      </AuthGuard>

      {/* 管理者向けコンテンツ */}
      <AuthGuard requireAdmin>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">管理者限定コンテンツ</h2>
          <p>管理者のみが閲覧できるコンテンツです。</p>
        </section>
      </AuthGuard>
    </div>
  )
}
```

## ❌ エラーハンドリング

### カスタムエラー境界

```tsx
'use client'

import { AuthErrorBoundary } from '@/app/providers'

function CustomErrorFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          アプリケーションエラー
        </h2>
        <p className="mb-6">
          予期しないエラーが発生しました。サポートにお問い合わせください。
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          リロード
        </button>
      </div>
    </div>
  )
}

function AppWithCustomErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <AuthErrorBoundary fallback={<CustomErrorFallback />}>
      {children}
    </AuthErrorBoundary>
  )
}
```

### エラー状態の監視

```tsx
'use client'

import { useAuthContext } from '@/app/providers'
import { useEffect } from 'react'

function ErrorMonitor() {
  const { error, clearError } = useAuthContext()

  useEffect(() => {
    if (error) {
      console.error('認証エラー:', error)
      
      // エラー通知表示（Toast等）
      // showErrorNotification(error)
      
      // 必要に応じてエラー解除
      setTimeout(() => {
        clearError()
      }, 5000)
    }
  }, [error, clearError])

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <div className="text-red-500 mr-3">⚠️</div>
          <div>
            <h3 className="text-red-800 font-medium">認証エラー</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button 
            onClick={clearError}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      </div>
    )
  }

  return null
}
```

## 🖥️ SSR対応

### サーバーサイドでの認証確認

```tsx
// app/profile/page.tsx
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase/client'
import ClientProfilePage from './ClientProfilePage'

export default async function ProfilePage() {
  const supabase = createServerSupabaseClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  // サーバーサイドで認証チェック
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">ログインが必要です</h2>
          <p>プロフィールページにアクセスするにはログインしてください。</p>
        </div>
      </div>
    )
  }

  return <ClientProfilePage initialSession={session} />
}
```

### ハイドレーション対応

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/app/providers'

function HydrationSafeComponent() {
  const [mounted, setMounted] = useState(false)
  const { isAuthenticated } = useAuthContext()

  useEffect(() => {
    setMounted(true)
  }, [])

  // ハイドレーション完了前は何も表示しない
  if (!mounted) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
    )
  }

  return (
    <div>
      {isAuthenticated ? (
        <p>認証済みユーザー向けコンテンツ</p>
      ) : (
        <p>未認証ユーザー向けコンテンツ</p>
      )}
    </div>
  )
}
```

## ⚡ パフォーマンス最適化

### メモ化による最適化

```tsx
'use client'

import { memo, useMemo } from 'react'
import { useAuthContext } from '@/app/providers'

const OptimizedUserInfo = memo(function UserInfo() {
  const { user, profile, stats } = useAuthContext()

  const userMetrics = useMemo(() => {
    if (!profile || !stats) return null

    return {
      level: profile.level,
      experiencePoints: profile.experience_points,
      loginStreak: stats.login_count,
      progressToNextLevel: ((profile.experience_points % 1000) / 1000) * 100
    }
  }, [profile, stats])

  if (!userMetrics) return null

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">ユーザー統計</h3>
      <div className="space-y-2">
        <div>レベル: {userMetrics.level}</div>
        <div>経験値: {userMetrics.experiencePoints}</div>
        <div>ログイン回数: {userMetrics.loginStreak}</div>
        <div>次のレベルまで: {userMetrics.progressToNextLevel.toFixed(1)}%</div>
      </div>
    </div>
  )
})

export default OptimizedUserInfo
```

### 条件付きレンダリングの最適化

```tsx
'use client'

import { useAuthContext } from '@/app/providers'

function ConditionalRender() {
  const { isAuthenticated, isLoading, isInitialized } = useAuthContext()

  // Early return for loading states
  if (!isInitialized || isLoading) {
    return <LoadingSkeleton />
  }

  // Conditional rendering based on auth state
  return isAuthenticated ? <AuthenticatedView /> : <UnauthenticatedView />
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      <div className="h-4 bg-gray-300 rounded w-5/6"></div>
    </div>
  )
}
```

## 🔧 トラブルシューティング

### よくある問題と解決方法

1. **プロバイダーが見つからないエラー**
   ```tsx
   // ❌ 間違い: プロバイダー外でuseAuthContextを使用
   function Component() {
     const auth = useAuthContext() // Error!
   }

   // ✅ 正しい: AppProviders内で使用
   function App() {
     return (
       <AppProviders>
         <Component />
       </AppProviders>
     )
   }
   ```

2. **ハイドレーションミスマッチ**
   ```tsx
   // ✅ マウント状態を確認して対処
   const [mounted, setMounted] = useState(false)
   useEffect(() => setMounted(true), [])
   if (!mounted) return <LoadingSkeleton />
   ```

3. **認証状態が更新されない**
   ```tsx
   // ✅ 適切な依存関係を設定
   useEffect(() => {
     // 認証状態が変更された時の処理
   }, [isAuthenticated, user])
   ```

このガイドを参考に、安全で効率的な認証プロバイダーシステムを構築してください。 