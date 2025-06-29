# Header コンポーネント使用例とドキュメント

## 概要

`Header`コンポーネントは、既存のindex.htmlのヘッダー部分を完全にReact化したコンポーネントです。
ユーザー情報表示、経験値バー、認証ボタン、レスポンシブ対応が含まれており、
CLAFTアプリケーションの統一されたヘッダーUIを提供します。

## 主な機能

- 🎮 **ユーザー情報表示** - 認証状態に応じた挨拶とユーザー名表示
- 📊 **経験値バー** - アニメーション付きの経験値表示システム
- 🏆 **実績バッジ** - ユーザーの実績を視覚的に表示
- 🔐 **認証ボタン統合** - AuthButtonコンポーネント使用
- 📱 **レスポンシブ対応** - デスクトップ・タブレット・モバイル対応
- ✨ **アニメーション** - 回転背景とシマーエフェクト
- ⚡ **ローディング状態** - 認証確認中のスケルトンUI

## 基本的な使用方法

### 1. デフォルト使用

```tsx
import Header from '@/components/common/Header'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream-100">
      <Header />
      <main>{children}</main>
    </div>
  )
}
```

### 2. カスタム経験値での使用

```tsx
import Header from '@/components/common/Header'

export default function GamePage() {
  const [userExp, setUserExp] = useState(75)
  const [userLevel, setUserLevel] = useState(5)

  return (
    <div>
      <Header 
        experience={userExp}
        level={userLevel}
        showAchievements={true}
      />
      <div className="mt-4 p-6">
        <button onClick={() => setUserExp(prev => Math.min(100, prev + 10))}>
          経験値アップ！
        </button>
      </div>
    </div>
  )
}
```

### 3. カスタムスタイルでの使用

```tsx
import Header from '@/components/common/Header'

export default function SpecialPage() {
  return (
    <Header 
      className="bg-gradient-to-r from-pink-500 to-purple-600"
      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
      experience={90}
      level={10}
      showAchievements={false}
    />
  )
}
```

## コンポーネントバリエーション

### SimpleHeader（簡易版）

```tsx
import { SimpleHeader } from '@/components/common/Header'

export default function ErrorPage() {
  return (
    <div>
      <SimpleHeader title="エラーが発生しました" />
      <div className="p-6">
        <p>申し訳ございません。予期しないエラーが発生しました。</p>
      </div>
    </div>
  )
}
```

### HeaderWithCustomExp（カスタム経験値専用）

```tsx
import { HeaderWithCustomExp } from '@/components/common/Header'

export default function LevelingPage() {
  return (
    <HeaderWithCustomExp 
      experience={25} 
      level={3}
      className="border-b-4 border-yellow-400"
    />
  )
}
```

## プロパティ詳細

### HeaderProps

| プロパティ | 型 | デフォルト | 説明 |
|-----------|----|-----------|----- |
| `className` | `string` | `''` | 追加のCSSクラス |
| `style` | `React.CSSProperties` | - | カスタムスタイル |
| `experience` | `number` | `65` | 経験値（0-100の値） |
| `level` | `number` | `1` | レベル情報 |
| `showAchievements` | `boolean` | `true` | 実績バッジの表示制御 |

### Achievement 型

```tsx
interface Achievement {
  id: string                          // 実績ID
  type: 'gold' | 'silver' | 'bronze' // 実績ランク
  icon: string                        // 表示アイコン（絵文字）
  tooltip: string                     // ホバー時のツールチップ
  unlocked: boolean                   // 解除状態
}
```

## レスポンシブ対応

### ブレークポイント

- **デスクトップ**: `1200px以上`
- **タブレット**: `769px - 1199px`
- **モバイル**: `481px - 768px`
- **小画面**: `480px以下`

### レスポンシブ調整

```css
/* デスクトップ */
.header {
  padding: 15px 30px 15px 70px;
}

/* タブレット・モバイル */
@media (max-width: 768px) {
  .header {
    padding: 15px 15px 15px 60px;
    flex-direction: column;
    gap: 12px;
  }
}

/* 小画面 */
@media (max-width: 480px) {
  .header {
    padding: 12px 12px 12px 55px;
  }
}
```

## カスタマイゼーション例

### 1. テーマカラーのカスタマイズ

```tsx
// 赤系グラデーション
<Header 
  className="bg-gradient-to-br from-red-400 to-pink-600"
  experience={80}
/>

// 緑系グラデーション
<Header 
  className="bg-gradient-to-br from-green-400 to-teal-600"
  experience={45}
/>
```

### 2. アニメーション速度の調整

```tsx
<Header 
  style={{
    '--rotate-duration': '60s',  // 背景回転を遅く
    '--shimmer-duration': '3s'   // シマーを遅く
  } as React.CSSProperties}
/>
```

### 3. 高さの調整

```tsx
<Header 
  className="py-8"  // より高いヘッダー
  experience={70}
/>

<Header 
  className="py-2"  // よりコンパクトなヘッダー
  experience={30}
/>
```

## 実績バッジシステム

### カスタム実績データの設定

```tsx
import Header, { Achievement } from '@/components/common/Header'

const customAchievements: Achievement[] = [
  {
    id: 'speed_runner',
    type: 'gold',
    icon: '⚡',
    tooltip: 'スピードランナー',
    unlocked: true
  },
  {
    id: 'explorer',
    type: 'silver', 
    icon: '🗺️',
    tooltip: '探検家',
    unlocked: true
  },
  {
    id: 'master_crafter',
    type: 'bronze',
    icon: '🔨',
    tooltip: 'マスタークラフター',
    unlocked: false
  }
]

// 実際のプロジェクトでは、API から実績データを取得
export default function CustomAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  
  useEffect(() => {
    // API から実際の実績データを取得
    fetchUserAchievements().then(setAchievements)
  }, [])

  return <Header achievements={achievements} />
}
```

## 認証状態の表示

### 未認証時

```
ようこそ、CLAFT へ！
あなたの冒険を始めましょう
```

### 認証済み時

```
こんにちは、[ユーザー名]さん！
今日も素晴らしい冒険を！
[実績バッジ] [実績バッジ] [実績バッジ]
```

## 統合使用例

### フルレイアウトでの使用

```tsx
'use client'

import React, { useState, useEffect } from 'react'
import Header from '@/components/common/Header'
import Sidebar from '@/components/common/Sidebar'
import HamburgerMenu from '@/components/common/HamburgerMenu'

export default function AppLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userExp, setUserExp] = useState(65)
  const [userLevel, setUserLevel] = useState(3)

  // 経験値の動的更新
  const addExperience = (amount: number) => {
    setUserExp(prev => {
      const newExp = Math.min(100, prev + amount)
      // レベルアップ判定
      if (newExp === 100 && prev < 100) {
        setUserLevel(prevLevel => prevLevel + 1)
        return 0 // 次のレベルへリセット
      }
      return newExp
    })
  }

  return (
    <div className="min-h-screen bg-cream-100">
      {/* ヘッダー */}
      <Header 
        experience={userExp}
        level={userLevel}
        showAchievements={true}
      />
      
      {/* ハンバーガーメニュー */}
      <HamburgerMenu 
        isOpen={sidebarOpen}
        onToggle={setSidebarOpen}
        size="medium"
        theme="default"
      />
      
      {/* サイドバー */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* メインコンテンツ */}
      <main className={`
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'ml-280' : 'ml-0'}
        pt-4 px-6
      `}>
        {children}
        
        {/* 経験値テスト用ボタン */}
        <div className="fixed bottom-4 right-4 space-y-2">
          <button 
            onClick={() => addExperience(10)}
            className="block bg-blue-500 text-white px-4 py-2 rounded"
          >
            +10 EXP
          </button>
          <button 
            onClick={() => addExperience(25)}
            className="block bg-green-500 text-white px-4 py-2 rounded"
          >
            +25 EXP
          </button>
        </div>
      </main>
    </div>
  )
}
```

## パフォーマンス最適化

### メモ化の使用

```tsx
import { memo } from 'react'

const OptimizedHeader = memo(Header)

// 経験値が変わった時のみ再レンダリング
<OptimizedHeader 
  experience={userExp}
  level={userLevel}
/>
```

### 実績データの遅延読み込み

```tsx
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense fallback={<SimpleHeader title="読み込み中..." />}>
      <Header />
    </Suspense>
  )
}
```

## アクセシビリティ

### キーボードナビゲーション

- 認証ボタンはTab キーでフォーカス可能
- 実績バッジはホバーとフォーカスでツールチップ表示
- 経験値バーはaria-label で現在値を読み上げ

### スクリーンリーダー対応

```tsx
<Header 
  experience={75}
  level={5}
  aria-label={`レベル5、経験値75パーセント`}
/>
```

## トラブルシューティング

### よくある問題

1. **認証状態が反映されない**
   ```tsx
   // useAuth フック が正しく設定されているか確認
   const { isAuthenticated, user } = useAuth()
   ```

2. **スタイルが適用されない**
   ```tsx
   // Tailwind CSS が正しく設定されているか確認
   // styled-jsx が有効になっているか確認
   ```

3. **経験値バーのアニメーションが動かない**
   ```tsx
   // アニメーション定義が含まれているか確認
   // transition-all クラスが適用されているか確認
   ```

### デバッグ用コンポーネント

```tsx
import Header from '@/components/common/Header'

export default function HeaderDebug() {
  return (
    <div className="space-y-4">
      <h2>Header デバッグ</h2>
      
      <div>
        <h3>デフォルト</h3>
        <Header />
      </div>
      
      <div>
        <h3>カスタム経験値</h3>
        <Header experience={25} level={2} />
      </div>
      
      <div>
        <h3>実績非表示</h3>
        <Header showAchievements={false} />
      </div>
      
      <div>
        <h3>簡易版</h3>
        <SimpleHeader title="デバッグモード" />
      </div>
    </div>
  )
}
```

## 今後の拡張計画

- [ ] 実績データの API 統合
- [ ] 経験値アニメーション の改善
- [ ] テーマシステムの実装
- [ ] 通知システムの追加
- [ ] レベルアップエフェクトの実装
- [ ] カスタムアバター機能
- [ ] 多言語対応

## 関連コンポーネント

- [`AuthButton`](../auth/AuthButton.tsx) - 認証ボタンコンポーネント
- [`Sidebar`](./Sidebar.tsx) - サイドバーナビゲーション
- [`HamburgerMenu`](./HamburgerMenu.tsx) - ハンバーガーメニュー
- [`AuthModal`](../auth/AuthModal.tsx) - 認証モーダル

---

このドキュメントは随時更新されます。質問や提案があれば、開発チームまでお知らせください。 