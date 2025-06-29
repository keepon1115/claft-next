# AuthButton コンポーネント使用例ガイド

`AuthButton`は、認証状態に応じてログイン/ログアウトボタンを表示するコンポーネントです。既存の`auth.js`のスタイルを維持しながら、モダンなReactコンポーネントとして実装されています。

## 📋 目次

1. [基本的な使用方法](#基本的な使用方法)
2. [プロパティ一覧](#プロパティ一覧)
3. [バリエーション別使用例](#バリエーション別使用例)
4. [サイズ別使用例](#サイズ別使用例)
5. [実際の実装例](#実際の実装例)
6. [カスタマイズ方法](#カスタマイズ方法)

## 🚀 基本的な使用方法

### インポート

```tsx
import AuthButton from '@/components/auth/AuthButton'
// または
import { AuthButton } from '@/components/auth/AuthButton'
```

### 最小限の実装

```tsx
'use client'

import AuthButton from '@/components/auth/AuthButton'

function App() {
  return (
    <div>
      <AuthButton />
    </div>
  )
}
```

## 📝 プロパティ一覧

| プロパティ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| `variant` | `'default' \| 'compact' \| 'minimal'` | `'default'` | ボタンのバリエーション |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | ボタンのサイズ |
| `redirectTo` | `string` | `'/'` | ログイン成功後のリダイレクト先 |
| `defaultTab` | `'login' \| 'signup'` | `'login'` | 初期表示タブ |
| `className` | `string` | `''` | カスタムクラス名 |
| `enableUserMenu` | `boolean` | `false` | ユーザー名をクリック可能にするか |
| `showAdminLink` | `boolean` | `true` | 管理者リンクの表示 |

## 🎨 バリエーション別使用例

### 1. Default バリエーション

フル機能版。ユーザー情報、管理者バッジ、ドロップダウンメニューを含みます。

```tsx
'use client'

import AuthButton from '@/components/auth/AuthButton'

function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl font-bold">Claft</h1>
          
          {/* デフォルトのAuthButton */}
          <AuthButton 
            enableUserMenu={true}
            redirectTo="/dashboard"
            showAdminLink={true}
          />
        </div>
      </div>
    </header>
  )
}
```

### 2. Compact バリエーション

コンパクトな表示。スペースが限られた場所に適しています。

```tsx
'use client'

import AuthButton from '@/components/auth/AuthButton'

function Sidebar() {
  return (
    <aside className="w-64 bg-gray-50 h-screen p-4">
      <nav className="space-y-4">
        <div className="mb-6">
          <AuthButton 
            variant="compact"
            size="sm"
            redirectTo="/profile"
          />
        </div>
        
        {/* その他のナビゲーション項目 */}
        <a href="/quest" className="block p-2 hover:bg-gray-100 rounded">
          クエスト
        </a>
        <a href="/profile" className="block p-2 hover:bg-gray-100 rounded">
          プロフィール
        </a>
      </nav>
    </aside>
  )
}
```

### 3. Minimal バリエーション

最小限の表示。テキストのみの軽量版です。

```tsx
'use client'

import AuthButton from '@/components/auth/AuthButton'

function Footer() {
  return (
    <footer className="bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-gray-600 mb-4">
          © 2024 Claft. All rights reserved.
        </p>
        
        {/* ミニマルなAuthButton */}
        <AuthButton 
          variant="minimal"
          className="text-sm"
        />
      </div>
    </footer>
  )
}
```

## 📏 サイズ別使用例

### Small サイズ

```tsx
<AuthButton 
  size="sm"
  variant="compact"
  className="text-xs"
/>
```

### Medium サイズ（デフォルト）

```tsx
<AuthButton 
  size="md"
  variant="default"
/>
```

### Large サイズ

```tsx
<AuthButton 
  size="lg"
  variant="default"
  className="font-bold"
/>
```

## 🏗️ 実際の実装例

### 1. ヘッダーナビゲーション

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import AuthButton from '@/components/auth/AuthButton'
import { Menu, X } from 'lucide-react'

function MainHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-600">Claft</span>
          </Link>

          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/quest" className="text-gray-700 hover:text-blue-600">
              クエスト
            </Link>
            <Link href="/leaderboard" className="text-gray-700 hover:text-blue-600">
              ランキング
            </Link>
            <Link href="/community" className="text-gray-700 hover:text-blue-600">
              コミュニティ
            </Link>
            
            {/* 認証ボタン */}
            <AuthButton 
              variant="default"
              enableUserMenu={true}
              redirectTo="/dashboard"
              showAdminLink={true}
            />
          </nav>

          {/* モバイルメニューボタン */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-4">
              <Link href="/quest" className="block px-4 py-2 text-gray-700">
                クエスト
              </Link>
              <Link href="/leaderboard" className="block px-4 py-2 text-gray-700">
                ランキング
              </Link>
              <Link href="/community" className="block px-4 py-2 text-gray-700">
                コミュニティ
              </Link>
              
              {/* モバイル用認証ボタン */}
              <div className="px-4 py-2">
                <AuthButton 
                  variant="compact"
                  size="sm"
                  redirectTo="/dashboard"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
```

### 2. サイドバーユーザープロフィール

```tsx
'use client'

import AuthButton from '@/components/auth/AuthButton'
import { useAuth } from '@/hooks/useAuth'

function ProfileSidebar() {
  const { isAuthenticated, profile, stats } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">ログインしてください</h3>
        <p className="text-gray-600 mb-4">
          アカウントにログインして冒険を始めましょう！
        </p>
        <AuthButton 
          variant="compact"
          defaultTab="signup"
          redirectTo="/onboarding"
        />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* ユーザー情報表示 */}
      <div className="mb-4">
        <AuthButton 
          variant="compact"
          enableUserMenu={false}
        />
      </div>
      
      {/* 統計情報 */}
      {profile && stats && (
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">レベル:</span>
            <span className="font-medium">{profile.level}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">経験値:</span>
            <span className="font-medium">{profile.experience_points}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">ログイン回数:</span>
            <span className="font-medium">{stats.login_count}</span>
          </div>
        </div>
      )}
    </div>
  )
}
```

### 3. カスタムヘッダーコンポーネント

```tsx
'use client'

import { useRouter } from 'next/navigation'
import AuthButton from '@/components/auth/AuthButton'
import { useAuth } from '@/hooks/useAuth'

interface CustomHeaderProps {
  showAuthButton?: boolean
  authVariant?: 'default' | 'compact' | 'minimal'
  children?: React.ReactNode
}

function CustomHeader({ 
  showAuthButton = true, 
  authVariant = 'default',
  children 
}: CustomHeaderProps) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* ロゴエリア */}
          <div className="flex items-center space-x-4">
            <h1 
              className="text-3xl font-bold cursor-pointer"
              onClick={() => router.push('/')}
            >
              ⚔️ Claft
            </h1>
            {children}
          </div>

          {/* 認証ボタンエリア */}
          {showAuthButton && (
            <div className="flex items-center">
              <AuthButton 
                variant={authVariant}
                size="md"
                redirectTo={isAuthenticated ? '/dashboard' : '/welcome'}
                enableUserMenu={true}
                className="text-white"
              />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

// 使用例
function HomePage() {
  return (
    <div>
      <CustomHeader authVariant="compact">
        <span className="text-lg">新しい冒険が待っています</span>
      </CustomHeader>
      
      {/* ページコンテンツ */}
    </div>
  )
}
```

## 🛠️ カスタマイズ方法

### 1. カスタムスタイリング

```tsx
<AuthButton 
  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
  variant="compact"
/>
```

### 2. カスタム認証フロー

```tsx
'use client'

import { useState } from 'react'
import AuthButton from '@/components/auth/AuthButton'

function CustomAuthFlow() {
  const [showWelcome, setShowWelcome] = useState(false)

  return (
    <div>
      <AuthButton 
        defaultTab="signup"
        redirectTo="/custom-onboarding"
        variant="compact"
      />
      
      {showWelcome && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <p className="text-green-800">ようこそ、新しい冒険者！</p>
        </div>
      )}
    </div>
  )
}
```

### 3. 条件付き表示

```tsx
'use client'

import AuthButton from '@/components/auth/AuthButton'
import { useAuth } from '@/hooks/useAuth'

function ConditionalAuthButton() {
  const { isAuthenticated, isAdmin } = useAuth()

  // 管理者の場合は特別なスタイル
  if (isAdmin) {
    return (
      <AuthButton 
        variant="default"
        className="border-2 border-yellow-400"
        enableUserMenu={true}
        showAdminLink={true}
      />
    )
  }

  // 一般ユーザーの場合
  if (isAuthenticated) {
    return (
      <AuthButton 
        variant="compact"
        enableUserMenu={false}
        showAdminLink={false}
      />
    )
  }

  // 未認証の場合
  return (
    <AuthButton 
      variant="default"
      defaultTab="signup"
      className="bg-green-600 hover:bg-green-700"
    />
  )
}
```

## 🔧 トラブルシューティング

### よくある問題と解決方法

1. **ボタンが表示されない**
   - useAuthフックが正しく初期化されているか確認
   - 認証状態の確認

2. **スタイルが適用されない**
   - TailwindCSSの設定確認
   - className propsの優先順位確認

3. **モーダルが開かない**
   - AuthModalコンポーネントが正しくインポートされているか確認

このガイドを参考に、プロジェクトに最適な認証ボタンを実装してください。 