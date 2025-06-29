# AuthModal コンポーネント使用例ガイド

`AuthModal`は、既存の`auth.js`から移植された認証モーダルのReactコンポーネント版です。ログイン・サインアップ機能をタブ切り替えで提供し、React Hook FormとZodを使用した堅牢なフォームバリデーションを実装しています。

## 📋 目次

1. [基本的な使用方法](#基本的な使用方法)
2. [プロパティ一覧](#プロパティ一覧)
3. [詳細な使用例](#詳細な使用例)
4. [カスタマイズ方法](#カスタマイズ方法)
5. [アクセシビリティ](#アクセシビリティ)
6. [トラブルシューティング](#トラブルシューティング)

## 🚀 基本的な使用方法

### インポート

```tsx
import AuthModal from '@/components/auth/AuthModal'
// または
import { AuthModal } from '@/components/auth/AuthModal'
```

### 最小限の実装

```tsx
'use client'

import { useState } from 'react'
import AuthModal from '@/components/auth/AuthModal'

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  return (
    <div>
      <button 
        onClick={() => setIsAuthModalOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        ログイン
      </button>
      
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  )
}
```

## 📝 プロパティ一覧

| プロパティ | 型 | デフォルト | 必須 | 説明 |
|-----------|-----|-----------|------|------|
| `isOpen` | `boolean` | - | ✅ | モーダルの表示状態 |
| `onClose` | `() => void` | - | ✅ | モーダルを閉じる関数 |
| `defaultTab` | `'login' \| 'signup'` | `'login'` | ❌ | 初期表示タブ |
| `redirectTo` | `string` | `'/'` | ❌ | 認証成功後のリダイレクト先 |

## 🎯 詳細な使用例

### 1. ログインボタンから開く

```tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import AuthModal from '@/components/auth/AuthModal'

function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { isAuthenticated, displayName, logout } = useAuth()

  if (isAuthenticated) {
    return (
      <header className="flex justify-between items-center p-4">
        <h1>Claft</h1>
        <div className="flex items-center space-x-4">
          <span>こんにちは、{displayName}さん</span>
          <button 
            onClick={logout}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            ログアウト
          </button>
        </div>
      </header>
    )
  }

  return (
    <header className="flex justify-between items-center p-4">
      <h1>Claft</h1>
      <button 
        onClick={() => setIsAuthModalOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
      >
        ログイン
      </button>
      
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab="login"
        redirectTo="/dashboard"
      />
    </header>
  )
}
```

### 2. 新規登録メインのモーダル

```tsx
'use client'

import { useState } from 'react'
import AuthModal from '@/components/auth/AuthModal'

function LandingPage() {
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Claftで冒険を始めよう！</h1>
        
        <button 
          onClick={() => setIsSignupModalOpen(true)}
          className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-green-700 transition-colors"
        >
          今すぐ冒険者登録！
        </button>
        
        <AuthModal 
          isOpen={isSignupModalOpen}
          onClose={() => setIsSignupModalOpen(false)}
          defaultTab="signup"  // サインアップタブから開始
          redirectTo="/onboarding"  // 登録後はオンボーディングへ
        />
      </div>
    </div>
  )
}
```

### 3. ページアクセス時の自動表示

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import AuthModal from '@/components/auth/AuthModal'

function ProtectedPage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { isAuthenticated, isInitialized } = useAuth()

  useEffect(() => {
    // 初期化完了後、未認証の場合はモーダルを表示
    if (isInitialized && !isAuthenticated) {
      setShowAuthModal(true)
    }
  }, [isInitialized, isAuthenticated])

  // 認証済みの場合は通常のコンテンツを表示
  if (isAuthenticated) {
    return (
      <div>
        <h1>保護されたページ</h1>
        <p>ログイン済みユーザーのみ閲覧可能</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">
          このページをご覧いただくにはログインが必要です
        </h1>
        <p className="text-gray-600 mb-6">
          アカウントをお持ちでない方は新規登録をお願いします
        </p>
        
        <button 
          onClick={() => setShowAuthModal(true)}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          ログイン・新規登録
        </button>
      </div>
      
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        redirectTo="/dashboard"
      />
    </div>
  )
}
```

### 4. カスタムフックでの状態管理

```tsx
'use client'

import { useState, useCallback } from 'react'

// カスタムフック
function useAuthModal(defaultTab: 'login' | 'signup' = 'login') {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(defaultTab)

  const openLogin = useCallback(() => {
    setActiveTab('login')
    setIsOpen(true)
  }, [])

  const openSignup = useCallback(() => {
    setActiveTab('signup')
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  return {
    isOpen,
    activeTab,
    openLogin,
    openSignup,
    close
  }
}

// 使用例
function MyComponent() {
  const authModal = useAuthModal()

  return (
    <div>
      <button onClick={authModal.openLogin}>
        ログイン
      </button>
      <button onClick={authModal.openSignup}>
        新規登録
      </button>
      
      <AuthModal 
        isOpen={authModal.isOpen}
        onClose={authModal.close}
        defaultTab={authModal.activeTab}
      />
    </div>
  )
}
```

### 5. コンテキストを使った全体管理

```tsx
'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import AuthModal from '@/components/auth/AuthModal'

interface AuthModalContextType {
  openAuthModal: (tab?: 'login' | 'signup') => void
  closeAuthModal: () => void
}

const AuthModalContext = createContext<AuthModalContextType | null>(null)

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [defaultTab, setDefaultTab] = useState<'login' | 'signup'>('login')

  const openAuthModal = (tab: 'login' | 'signup' = 'login') => {
    setDefaultTab(tab)
    setIsOpen(true)
  }

  const closeAuthModal = () => {
    setIsOpen(false)
  }

  return (
    <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal }}>
      {children}
      <AuthModal 
        isOpen={isOpen}
        onClose={closeAuthModal}
        defaultTab={defaultTab}
      />
    </AuthModalContext.Provider>
  )
}

export function useAuthModal() {
  const context = useContext(AuthModalContext)
  if (!context) {
    throw new Error('useAuthModal must be used within AuthModalProvider')
  }
  return context
}

// アプリ全体での使用
function App() {
  return (
    <AuthModalProvider>
      <YourAppContent />
    </AuthModalProvider>
  )
}

// 任意のコンポーネントから使用
function AnyComponent() {
  const { openAuthModal } = useAuthModal()

  return (
    <button onClick={() => openAuthModal('login')}>
      ログイン
    </button>
  )
}
```

## 🎨 カスタマイズ方法

### スタイルのカスタマイズ

既存のTailwindクラスを変更してデザインをカスタマイズできます：

```tsx
// 独自のAuthModalWrapper
function CustomAuthModal(props: AuthModalProps) {
  return (
    <div className="custom-auth-overlay">
      <AuthModal {...props} />
    </div>
  )
}
```

### アニメーションの追加

```css
/* globals.css に追加 */
@keyframes slideInFromTop {
  from {
    transform: translateY(-100%) scale(0.9);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.auth-modal-enter {
  animation: slideInFromTop 0.3s ease-out;
}
```

### バリデーションルールのカスタマイズ

独自のバリデーションが必要な場合は、コンポーネントを拡張：

```tsx
import { z } from 'zod'

const customSignupSchema = z.object({
  email: z.string().email().refine(
    email => email.endsWith('@company.com'),
    '会社のメールアドレスを使用してください'
  ),
  password: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'パスワードは英数字を含む8文字以上で入力してください'
  ),
  nickname: z.string().min(2, 'ニックネームは2文字以上で入力してください')
})
```

## ♿ アクセシビリティ

`AuthModal`は以下のアクセシビリティ機能を実装しています：

### キーボードナビゲーション
- **Escキー**: モーダルを閉じる
- **Tabキー**: フォーカス順序通りの移動
- **Enterキー**: フォーム送信

### ARIA属性
- `role="dialog"`: モーダルダイアログとして識別
- `aria-modal="true"`: モーダル状態を明示
- `aria-labelledby`: タイトルとの関連付け

### スクリーンリーダー対応
- エラーメッセージに`role="alert"`
- 適切なラベル付け
- 状態変更の通知

## 🐛 トラブルシューティング

### よくある問題と解決方法

1. **モーダルが表示されない**
   ```tsx
   // z-indexの競合を確認
   // 親要素にoverflow:hiddenがないか確認
   ```

2. **フォームバリデーションが効かない**
   ```tsx
   // react-hook-formとzodの設定を確認
   // resolverが正しく設定されているか確認
   ```

3. **認証処理後のリダイレクトが効かない**
   ```tsx
   // useAuthフックが正しく初期化されているか確認
   // redirectToパラメータが正しく設定されているか確認
   ```

4. **スタイルが適用されない**
   ```tsx
   // TailwindCSSが正しく読み込まれているか確認
   // カスタムCSSの優先順位を確認
   ```

### デバッグ方法

```tsx
function DebugAuthModal() {
  const auth = useAuth()
  
  console.log('Auth state:', {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    user: auth.user
  })

  return <AuthModal {...props} />
}
```

### パフォーマンス最適化

```tsx
import { memo } from 'react'

// メモ化でリレンダリングを最適化
const OptimizedAuthModal = memo(AuthModal)
```

## 📚 関連ドキュメント

- [useAuth フック使用例](../../../hooks/useAuth.examples.md)
- [認証ストア使用例](../../../stores/authStore.example.md)
- [Supabase クライアント](../../../lib/supabase/examples.md)

このガイドを参考に、プロジェクトに最適な認証フローを実装してください。 