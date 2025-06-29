# Sidebar コンポーネント 使用ガイド

Next.js 15 App Router対応のレスポンシブサイドバーナビゲーションコンポーネントです。

## 📖 概要

このSidebarコンポーネントは、既存のnavigation.htmlを完全にReactコンポーネント化し、以下の機能を提供します：

- **認証状態対応**: ログイン状況に応じたナビゲーション表示
- **権限管理**: 管理者専用項目の条件付き表示
- **現在ページハイライト**: `usePathname`を使用したアクティブ状態表示
- **レスポンシブ対応**: モバイル・タブレット・デスクトップ対応
- **アクセシビリティ**: ARIA属性、キーボードナビゲーション対応
- **スムーズアニメーション**: CSS Transitionによる滑らかな動作

## 🎯 基本的な使用方法

### 1. レイアウトでの基本使用

```tsx
// app/layout.tsx
import Sidebar from '@/components/common/Sidebar'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <Sidebar />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
```

### 2. 個別ページでの使用

```tsx
// app/profile/page.tsx
import Sidebar from '@/components/common/Sidebar'

export default function ProfilePage() {
  return (
    <div>
      <Sidebar />
      <div className="ml-0 md:ml-0"> {/* サイドバーは固定なので余白不要 */}
        <h1>プロフィールページ</h1>
        {/* ページコンテンツ */}
      </div>
    </div>
  )
}
```

### 3. カスタムクラスでの使用

```tsx
import Sidebar from '@/components/common/Sidebar'

export default function CustomLayout() {
  return (
    <div>
      <Sidebar className="custom-sidebar shadow-2xl" />
      {/* その他のコンテンツ */}
    </div>
  )
}
```

## 🔧 ナビゲーション項目のカスタマイズ

### 現在の設定項目

```typescript
const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    href: '/',
    label: 'ホーム',
    icon: Home,
    description: 'トップページ'
  },
  {
    href: '/profile',
    label: 'プロフィール',
    icon: User,
    requireAuth: true,
    description: 'あなたの冒険者プロフィール'
  },
  {
    href: '/quest',
    label: 'クエスト',
    icon: Scroll,
    requireAuth: true,
    description: '冒険クエストに挑戦'
  },
  {
    href: '/yononaka',
    label: 'Yononaka',
    icon: Globe,
    description: '世の中を探索'
  },
  {
    href: '/mirai',
    label: 'ミライクラフト',
    icon: Rocket,
    description: '未来をクラフト'
  },
  {
    href: '/admin',
    label: '管理画面',
    icon: Shield,
    requireAuth: true,
    requireAdmin: true,
    description: 'システム管理（管理者専用）'
  }
]
```

### 新しい項目の追加

```typescript
// components/common/Sidebar.tsx を編集
import { Settings, Calendar, MessageCircle } from 'lucide-react'

// NAVIGATION_ITEMS配列に追加
{
  href: '/settings',
  label: '設定',
  icon: Settings,
  requireAuth: true,
  description: 'アカウント設定'
},
{
  href: '/calendar',
  label: 'カレンダー',
  icon: Calendar,
  requireAuth: true,
  description: 'イベントカレンダー'
},
{
  href: '/messages',
  label: 'メッセージ',
  icon: MessageCircle,
  requireAuth: true,
  description: 'メッセージ機能'
}
```

## 🎨 スタイルのカスタマイズ

### 1. カスタムテーマの適用

```tsx
// カスタムテーマでのサイドバー
const CustomSidebar = () => {
  return (
    <Sidebar 
      className="
        [&_nav]:bg-gradient-to-b [&_nav]:from-purple-700 [&_nav]:to-purple-900
        [&_.sidebar-header]:bg-purple-800/20
        [&_button:hover]:bg-purple-400/20
      "
    />
  )
}
```

### 2. カスタムCSS

```css
/* globals.css */
.custom-sidebar nav {
  /* サイドバー全体 */
  background: linear-gradient(180deg, #1a202c 0%, #2d3748 100%);
  border-right: 2px solid #4299e1;
}

.custom-sidebar .sidebar-header {
  /* ヘッダー部分 */
  background: rgba(66, 153, 225, 0.1);
  border-bottom: 1px solid rgba(66, 153, 225, 0.2);
}

.custom-sidebar button {
  /* ナビゲーション項目 */
  border-radius: 8px;
  margin: 4px 8px;
}

.custom-sidebar button:hover {
  background: rgba(66, 153, 225, 0.2);
  transform: translateX(4px);
}
```

## 📱 レスポンシブ動作

### ブレークポイント設定

| スクリーン | サイドバー幅 | 動作 |
|-----------|-------------|------|
| デスクトップ (>1024px) | 280px | オーバーレイ表示 |
| タブレット (771-1024px) | 250px | オーバーレイ表示 |
| モバイル (481-770px) | 240px | オーバーレイ表示 |
| 小画面 (≤480px) | 220px | オーバーレイ表示 |

### カスタムブレークポイント

```tsx
// Tailwind config拡張例
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      }
    }
  }
}

// カスタムレスポンシブSidebar
const ResponsiveSidebar = () => {
  return (
    <Sidebar 
      className="
        xs:w-[260px] 
        3xl:w-[320px]
      "
    />
  )
}
```

## 🔐 認証・権限制御

### 1. 認証状態による表示制御

```tsx
// 認証状態の確認
import { useAuth } from '@/hooks/useAuth'

const AuthAwarePage = () => {
  const { isAuthenticated, isAdmin } = useAuth()
  
  return (
    <div>
      <Sidebar />
      {isAuthenticated ? (
        <div>ログイン済みコンテンツ</div>
      ) : (
        <div>ゲスト用コンテンツ</div>
      )}
    </div>
  )
}
```

### 2. 管理者専用コンテンツ

```tsx
import { useAdminOnly } from '@/hooks/useAuth'

const AdminPage = () => {
  const { isAdmin, isLoading } = useAdminOnly()
  
  if (isLoading) return <div>読み込み中...</div>
  
  return (
    <div>
      <Sidebar />
      <div className="p-6">
        <h1>管理者ダッシュボード</h1>
        {/* 管理者専用コンテンツ */}
      </div>
    </div>
  )
}
```

## 🎭 アニメーション・インタラクション

### 1. カスタムアニメーション

```css
/* カスタムアニメーション */
.custom-sidebar {
  .hamburger-menu {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .hamburger-menu:hover {
    transform: scale(1.1) rotate(5deg);
  }
  
  .sidebar {
    transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  
  .nav-item {
    transition: all 0.2s ease;
  }
  
  .nav-item:hover {
    transform: translateX(8px) scale(1.02);
  }
}
```

### 2. インタラクション強化

```tsx
// アニメーション強化版Sidebar
const AnimatedSidebar = () => {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Sidebar 
        className={`
          transition-all duration-300
          ${isHovered ? 'shadow-2xl' : 'shadow-lg'}
        `}
      />
    </div>
  )
}
```

## 🧪 テスト

### 1. 基本的なレンダリングテスト

```tsx
// __tests__/Sidebar.test.tsx
import { render, screen } from '@testing-library/react'
import { useAuth } from '@/hooks/useAuth'
import Sidebar from '@/components/common/Sidebar'

// useAuthをモック
jest.mock('@/hooks/useAuth')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('Sidebar', () => {
  it('未認証ユーザーには基本項目のみ表示される', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isAdmin: false,
      displayName: null
    })
    
    render(<Sidebar />)
    
    expect(screen.getByText('ホーム')).toBeInTheDocument()
    expect(screen.getByText('Yononaka')).toBeInTheDocument()
    expect(screen.queryByText('プロフィール')).not.toBeInTheDocument()
    expect(screen.queryByText('管理画面')).not.toBeInTheDocument()
  })
  
  it('一般ユーザーには認証必須項目が表示される', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isAdmin: false,
      displayName: 'テストユーザー'
    })
    
    render(<Sidebar />)
    
    expect(screen.getByText('プロフィール')).toBeInTheDocument()
    expect(screen.getByText('クエスト')).toBeInTheDocument()
    expect(screen.queryByText('管理画面')).not.toBeInTheDocument()
  })
  
  it('管理者には全項目が表示される', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isAdmin: true,
      displayName: '管理者'
    })
    
    render(<Sidebar />)
    
    expect(screen.getByText('管理画面')).toBeInTheDocument()
  })
})
```

### 2. インタラクションテスト

```tsx
import { fireEvent } from '@testing-library/react'

describe('Sidebarインタラクション', () => {
  it('ハンバーガーメニューをクリックするとサイドバーが開く', () => {
    render(<Sidebar />)
    
    const hamburger = screen.getByLabelText('メニューを開く')
    fireEvent.click(hamburger)
    
    expect(screen.getByRole('navigation')).toHaveClass('left-0')
  })
  
  it('ESCキーでサイドバーが閉じる', () => {
    render(<Sidebar />)
    
    // サイドバーを開く
    const hamburger = screen.getByLabelText('メニューを開く')
    fireEvent.click(hamburger)
    
    // ESCキーを押す
    fireEvent.keyDown(document, { key: 'Escape' })
    
    expect(screen.getByRole('navigation')).not.toHaveClass('left-0')
  })
})
```

## 🚀 パフォーマンス最適化

### 1. メモ化の実装

```tsx
import { memo, useMemo } from 'react'

const OptimizedSidebar = memo(() => {
  const { isAuthenticated, isAdmin } = useAuth()
  
  const filteredItems = useMemo(() => {
    return NAVIGATION_ITEMS.filter(item => {
      if (item.requireAuth && !isAuthenticated) return false
      if (item.requireAdmin && !isAdmin) return false
      return true
    })
  }, [isAuthenticated, isAdmin])
  
  return <Sidebar /* props */ />
})
```

### 2. レイジーローディング

```tsx
import { lazy, Suspense } from 'react'

const LazySidebar = lazy(() => import('@/components/common/Sidebar'))

export default function Layout() {
  return (
    <div>
      <Suspense fallback={<div>メニュー読み込み中...</div>}>
        <LazySidebar />
      </Suspense>
    </div>
  )
}
```

## 🔧 トラブルシューティング

### よくある問題と解決方法

#### 1. サイドバーが表示されない

```css
/* z-indexの競合をチェック */
.sidebar {
  z-index: 9999 !important;
}
```

#### 2. アニメーションが動作しない

```css
/* CSS Transitionが正しく設定されているか確認 */
.sidebar {
  transition-property: transform, left;
  transition-duration: 0.3s;
  transition-timing-function: ease-in-out;
}
```

#### 3. モバイルでタッチが効かない

```tsx
// pointer-eventsの設定確認
className="pointer-events-auto"

// タッチイベントの追加
onTouchStart={handleTouchStart}
onTouchEnd={handleTouchEnd}
```

## 📚 関連ドキュメント

- [Next.js 15 App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide React Icons](https://lucide.dev/guide/packages/lucide-react)
- [認証システム全体のドキュメント](../../hooks/useAuth.examples.md)
- [ミドルウェア認証](../../middleware.examples.md)

---

このSidebarコンポーネントにより、既存のnavigation.htmlの機能を完全にReactコンポーネント化し、現代的なフロントエンド開発のベストプラクティスに沿った実装が実現できます。 