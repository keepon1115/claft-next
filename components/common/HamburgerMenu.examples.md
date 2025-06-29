# HamburgerMenu コンポーネント 使用ガイド

既存のnavigation.cssスタイルを完全に維持したハンバーガーメニューコンポーネントです。

## 📖 概要

このHamburgerMenuコンポーネントは、既存のnavigation.htmlの機能を完全にReact化し、以下の特徴を提供します：

- **既存スタイル完全維持**: navigation.cssのスタイルを100%再現
- **アニメーション**: 3本線→×への滑らかな変形
- **状態管理**: useStateによる柔軟な制御
- **アクセシビリティ**: ARIA属性とキーボードナビゲーション
- **レスポンシブ**: 元のCSSと同等のレスポンシブ対応
- **TypeScript**: 完全な型安全性

## 🎯 基本的な使用方法

### 1. シンプルな内部状態管理

```tsx
import React from 'react'
import HamburgerMenu from '@/components/common/HamburgerMenu'

export default function SimpleExample() {
  return (
    <div>
      <HamburgerMenu
        onToggle={(isActive) => {
          console.log('ハンバーガーメニューが', isActive ? '開かれました' : '閉じられました')
        }}
      />
    </div>
  )
}
```

### 2. 外部状態での制御

```tsx
import React, { useState } from 'react'
import HamburgerMenu from '@/components/common/HamburgerMenu'

export default function ControlledExample() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleToggle = (isActive: boolean) => {
    setIsMenuOpen(isActive)
    // サイドバーやその他のコンポーネントの状態も更新
  }

  return (
    <div>
      <HamburgerMenu
        isActive={isMenuOpen}
        onToggle={handleToggle}
      />
      
      {/* デバッグ情報 */}
      <div className="fixed top-20 left-20 bg-black text-white p-2 rounded">
        メニュー状態: {isMenuOpen ? '開' : '閉'}
      </div>
    </div>
  )
}
```

### 3. カスタムフックを使用

```tsx
import React from 'react'
import HamburgerMenu, { useHamburgerMenu } from '@/components/common/HamburgerMenu'

export default function HookExample() {
  const menu = useHamburgerMenu(false) // 初期状態: 閉じている

  return (
    <div>
      <HamburgerMenu
        isActive={menu.isActive}
        onToggle={() => menu.toggle()}
      />
      
      {/* 外部からのコントロール */}
      <div className="fixed top-20 right-20 space-x-2">
        <button onClick={menu.open} className="bg-green-500 text-white px-3 py-1 rounded">
          開く
        </button>
        <button onClick={menu.close} className="bg-red-500 text-white px-3 py-1 rounded">
          閉じる
        </button>
      </div>
    </div>
  )
}
```

## 🎨 バリエーションとカスタマイズ

### 1. サイズバリエーション

```tsx
import React from 'react'
import HamburgerMenu from '@/components/common/HamburgerMenu'

export default function SizeVariations() {
  return (
    <div>
      {/* 小サイズ（モバイル向け） */}
      <HamburgerMenu
        size="small"
        style={{ top: '10px', left: '10px' }}
        onToggle={(isActive) => console.log('小サイズ:', isActive)}
      />
      
      {/* 中サイズ（デフォルト） */}
      <HamburgerMenu
        size="medium"
        style={{ top: '10px', left: '60px' }}
        onToggle={(isActive) => console.log('中サイズ:', isActive)}
      />
      
      {/* 大サイズ（デスクトップ向け） */}
      <HamburgerMenu
        size="large"
        style={{ top: '10px', left: '120px' }}
        onToggle={(isActive) => console.log('大サイズ:', isActive)}
      />
    </div>
  )
}
```

### 2. テーマバリエーション

```tsx
import React from 'react'
import HamburgerMenu from '@/components/common/HamburgerMenu'

export default function ThemeVariations() {
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* デフォルトテーマ */}
      <HamburgerMenu
        variant="default"
        style={{ top: '20px', left: '20px' }}
      />
      
      {/* ライトテーマ */}
      <HamburgerMenu
        variant="light"
        style={{ top: '20px', left: '80px' }}
      />
      
      {/* ダークテーマ（ダークモード用） */}
      <div className="bg-gray-800 p-4 inline-block rounded">
        <HamburgerMenu
          variant="dark"
          style={{ position: 'relative', top: '0', left: '0' }}
        />
      </div>
    </div>
  )
}
```

### 3. カスタムスタイル

```tsx
import React from 'react'
import HamburgerMenu from '@/components/common/HamburgerMenu'

export default function CustomStyles() {
  return (
    <div>
      {/* カスタムCSS */}
      <HamburgerMenu
        className="custom-hamburger"
        style={{
          top: '20px',
          left: '20px',
          backgroundColor: 'rgba(59, 130, 246, 0.9)', // 青背景
          borderRadius: '50%', // 円形
          border: '2px solid white'
        }}
      />
      
      {/* インラインスタイルでの高度なカスタマイズ */}
      <HamburgerMenu
        style={{
          top: '20px',
          left: '80px',
          background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
          boxShadow: '0 8px 32px rgba(255, 107, 107, 0.3)',
          backdropFilter: 'blur(10px)'
        }}
      />
    </div>
  )
}
```

## 🔧 Sidebarコンポーネントとの統合

### 1. プリセットコンポーネント使用

```tsx
import React, { useState } from 'react'
import { SidebarHamburgerMenu } from '@/components/common/HamburgerMenu'
import Sidebar from '@/components/common/Sidebar'

export default function SidebarIntegration() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div>
      <SidebarHamburgerMenu
        isActive={sidebarOpen}
        onToggle={setSidebarOpen}
      />
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="p-6">
        <h1>メインコンテンツ</h1>
        <p>ハンバーガーメニューでサイドバーを開閉できます</p>
      </main>
    </div>
  )
}
```

### 2. カスタム統合

```tsx
import React, { useState, useEffect } from 'react'
import HamburgerMenu from '@/components/common/HamburgerMenu'
import Sidebar from '@/components/common/Sidebar'

export default function CustomIntegration() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // サイドバー状態が変更された時のログ
  useEffect(() => {
    console.log('サイドバー状態変更:', sidebarOpen ? 'OPEN' : 'CLOSED')
  }, [sidebarOpen])

  // ESCキーでサイドバーを閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [sidebarOpen])

  return (
    <>
      <HamburgerMenu
        isActive={sidebarOpen}
        onToggle={setSidebarOpen}
        ariaLabel={sidebarOpen ? 'サイドバーを閉じる' : 'サイドバーを開く'}
      />
      
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* サイドバーが開いている時のオーバーレイ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[9998]"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <main className={`transition-all duration-300 ${sidebarOpen ? 'blur-sm' : ''}`}>
        <div className="p-6">
          <h1>メインコンテンツ</h1>
          <p>サイドバーが開いている時はブラー効果が適用されます</p>
        </div>
      </main>
    </>
  )
}
```

## 🧪 テストとデバッグ

### 1. テスト例

```tsx
// __tests__/HamburgerMenu.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import HamburgerMenu from '@/components/common/HamburgerMenu'

describe('HamburgerMenu', () => {
  it('クリックで状態が切り替わる', () => {
    const mockToggle = jest.fn()
    
    render(
      <HamburgerMenu onToggle={mockToggle} />
    )
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(mockToggle).toHaveBeenCalledWith(true)
  })
  
  it('Enterキーで動作する', () => {
    const mockToggle = jest.fn()
    
    render(
      <HamburgerMenu onToggle={mockToggle} />
    )
    
    const button = screen.getByRole('button')
    fireEvent.keyDown(button, { key: 'Enter' })
    
    expect(mockToggle).toHaveBeenCalledWith(true)
  })
  
  it('無効化されている時はクリックできない', () => {
    const mockToggle = jest.fn()
    
    render(
      <HamburgerMenu onToggle={mockToggle} disabled />
    )
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(mockToggle).not.toHaveBeenCalled()
    expect(button).toBeDisabled()
  })
})
```

## 📱 レスポンシブ対応

### ブレークポイント

| 画面サイズ | 位置 | サイズ |
|-----------|------|--------|
| デスクトップ (≥1200px) | top: 25px, left: 25px | 50px × 50px |
| 標準 (771-1199px) | top: 20px, left: 20px | 45px × 45px |
| モバイル (≤770px) | top: 15px, left: 15px | 40px × 40px |
| 小画面 (≤480px) | top: 10px, left: 10px | 35px × 35px |

### カスタムレスポンシブ

```tsx
import HamburgerMenu from '@/components/common/HamburgerMenu'

export default function ResponsiveCustom() {
  return (
    <HamburgerMenu
      className="
        max-sm:!top-[10px] max-sm:!left-[10px]
        md:!top-[20px] md:!left-[20px]
        lg:!top-[25px] lg:!left-[25px]
        xl:!top-[30px] xl:!left-[30px]
      "
      size="medium"
    />
  )
}
```

## 🔧 トラブルシューティング

### よくある問題と解決方法

#### 1. アニメーションが動作しない

```css
/* globals.cssに追加 */
.hamburger-menu .bar {
  transition: all 0.3s ease !important;
}

.hamburger-menu.active .bar:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px) !important;
}

.hamburger-menu.active .bar:nth-child(2) {
  opacity: 0 !important;
}

.hamburger-menu.active .bar:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px) !important;
}
```

#### 2. z-indexの競合

```tsx
// より高いz-indexを設定
<HamburgerMenu
  style={{ zIndex: 10001 }}
  className="!z-[10001]"
/>
```

#### 3. モバイルでタッチが効かない

```tsx
// タッチイベントの追加
const handleTouch = (e: React.TouchEvent) => {
  e.preventDefault()
  handleClick()
}

<HamburgerMenu
  style={{ touchAction: 'manipulation' }}
  onTouchEnd={handleTouch}
/>
```

#### 4. レスポンシブが正しく動作しない

```tsx
// メディアクエリの確認
<HamburgerMenu
  className="
    max-[770px]:!top-[15px] max-[770px]:!left-[15px]
    max-[480px]:!top-[10px] max-[480px]:!left-[10px]
    min-[1200px]:!top-[25px] min-[1200px]:!left-[25px]
  "
/>
```

## 📚 関連ドキュメント

- [Sidebar コンポーネント](./Sidebar.examples.md)
- [Next.js 15 App Router](https://nextjs.org/docs/app)
- [React useState Hook](https://react.dev/reference/react/useState)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [アクセシビリティガイド](https://web.dev/accessibility)

---

このHamburgerMenuコンポーネントにより、既存のnavigation.cssの機能を完全にReact化し、モダンな開発環境で柔軟に活用できます。 