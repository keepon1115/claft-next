# 認証ストア使用例

このドキュメントでは、Zustandベースの認証ストア（`stores/authStore.ts`）の使用方法を説明します。

## 📁 ファイル構成

```
stores/
├── authStore.ts        # メインの認証ストア
└── authStore.example.md # 使用例（このファイル）
```

## 🎯 主な機能

### ✅ **状態管理**
- `user`: 認証済みユーザー情報
- `profile`: ユーザープロフィール
- `stats`: ユーザー統計
- `isLoading`: ローディング状態
- `isAdmin`: 管理者権限
- `error`: エラーメッセージ
- `isInitialized`: 初期化完了フラグ

### 🚀 **アクション**
- `initialize()`: 認証状態の初期化
- `login()`: ログイン処理
- `signup()`: サインアップ処理
- `logout()`: ログアウト処理
- `checkAdminStatus()`: 管理者権限チェック
- `updateProfile()`: プロフィール更新

## 📖 基本的な使用方法

### 1. アプリケーション初期化

```tsx
// app/layout.tsx
'use client'

import { useEffect } from 'react'
import { useAuth } from '@/stores/authStore'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { initialize, isInitialized } = useAuth()

  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [initialize, isInitialized])

  return (
    <html lang="ja">
      <body>
        {children}
      </body>
    </html>
  )
}
```

### 2. ログインフォーム

```tsx
// components/auth/LoginForm.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/stores/authStore'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const { login, isLoading, error, clearError } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    
    const result = await login(email, password)
    
    if (result.success) {
      console.log('ログイン成功！')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="email">メールアドレス</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label htmlFor="password">パスワード</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'ログイン中...' : 'ログイン'}
      </button>
    </form>
  )
}
```

### 3. サインアップフォーム

```tsx
// components/auth/SignupForm.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/stores/authStore'

export default function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  
  const { signup, isLoading, error, clearError } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    
    const result = await signup(email, password, nickname)
    
    if (result.success) {
      console.log('登録成功！')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="email">メールアドレス</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label htmlFor="password">パスワード</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label htmlFor="nickname">冒険者名</label>
        <input
          id="nickname"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="ニックネーム（任意）"
        />
      </div>
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? '登録中...' : '冒険者登録'}
      </button>
    </form>
  )
}
```

### 4. ユーザー情報表示

```tsx
// components/auth/UserProfile.tsx
'use client'

import { useAuth } from '@/stores/authStore'

export default function UserProfile() {
  const { 
    isAuthenticated, 
    profile, 
    stats, 
    displayName, 
    isAdmin, 
    logout 
  } = useAuth()

  if (!isAuthenticated) {
    return <div>ログインしてください</div>
  }

  const handleLogout = async () => {
    const result = await logout()
    if (result.success) {
      console.log('ログアウトしました')
    }
  }

  return (
    <div className="user-profile">
      <h2>ようこそ、{displayName}さん！</h2>
      
      {isAdmin && (
        <div className="admin-badge">
          🔧 管理者
        </div>
      )}
      
      <div className="profile-info">
        <p>メール: {profile?.email}</p>
        <p>登録日: {profile?.created_at}</p>
      </div>
      
      {stats && (
        <div className="stats">
          <h3>統計情報</h3>
          <p>ログイン回数: {stats.login_count}</p>
          <p>最終ログイン: {stats.last_login_date}</p>
          <p>総経験値: {stats.total_exp}</p>
          <p>クエスト完了数: {stats.quest_clear_count}</p>
        </div>
      )}
      
      <button onClick={handleLogout}>
        ログアウト
      </button>
    </div>
  )
}
```

### 5. プロフィール編集

```tsx
// components/auth/ProfileEditor.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/stores/authStore'

export default function ProfileEditor() {
  const { profile, updateProfile, isLoading, error } = useAuth()
  const [nickname, setNickname] = useState('')

  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname || '')
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const result = await updateProfile({ nickname })
    
    if (result.success) {
      console.log('プロフィール更新成功！')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>プロフィール編集</h3>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="nickname">冒険者名</label>
        <input
          id="nickname"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="冒険者名を入力"
        />
      </div>
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? '更新中...' : '更新'}
      </button>
    </form>
  )
}
```

### 6. 管理者専用コンポーネント

```tsx
// components/admin/AdminPanel.tsx
'use client'

import { useAuth } from '@/stores/authStore'

export default function AdminPanel() {
  const { isAdmin, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <div>ログインが必要です</div>
  }

  if (!isAdmin) {
    return <div>管理者権限が必要です</div>
  }

  return (
    <div className="admin-panel">
      <h2>🔧 管理者パネル</h2>
      <p>管理者専用の機能です</p>
      
      {/* 管理者専用の機能 */}
    </div>
  )
}
```

### 7. ルート保護（ページレベル）

```tsx
// app/protected/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/stores/authStore'

export default function ProtectedPage() {
  const { isAuthenticated, isInitialized } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isInitialized, router])

  if (!isInitialized) {
    return <div>初期化中...</div>
  }

  if (!isAuthenticated) {
    return <div>リダイレクト中...</div>
  }

  return (
    <div>
      <h1>保護されたページ</h1>
      <p>ログイン済みユーザーのみアクセスできます</p>
    </div>
  )
}
```

## 🔍 セレクター使用例

### 状態のみ取得

```tsx
import { useAuthState } from '@/stores/authStore'

function StatusDisplay() {
  const { isAuthenticated, displayName, isAdmin } = useAuthState()
  
  return (
    <div>
      <p>認証状態: {isAuthenticated ? 'ログイン中' : '未ログイン'}</p>
      <p>表示名: {displayName}</p>
      <p>管理者: {isAdmin ? 'はい' : 'いいえ'}</p>
    </div>
  )
}
```

### アクションのみ取得

```tsx
import { useAuthActions } from '@/stores/authStore'

function AuthButtons() {
  const { login, logout } = useAuthActions()
  
  return (
    <div>
      <button onClick={() => login('test@example.com', 'password')}>
        ログイン
      </button>
      <button onClick={logout}>
        ログアウト
      </button>
    </div>
  )
}
```

## 🐛 デバッグ

開発環境では、ブラウザの開発者ツールでZustand DevToolsを使用してストアの状態を確認できます。

```tsx
// Redux DevTools Extensionで確認可能
// - アクションの履歴
// - 状態の変更
- ストアの現在の状態
```

## 🚨 注意点

### セキュリティ
- パスワードは永続化されません
- 最小限の情報のみがローカルストレージに保存されます
- 機密情報はサーバーサイドで管理してください

### パフォーマンス
- 必要な状態のみを取得するセレクターを使用
- 不要な再レンダリングを避けるため、適切にコンポーネントを分割

### エラーハンドリング
- 各アクションの結果を確認してください
- `clearError()`を適切に使用してエラー状態をクリア 