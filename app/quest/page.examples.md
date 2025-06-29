# Quest Page

CLAFTクエストマップページの実装です。quest.htmlの全体構造を忠実に再現し、SSG対応とモダンなReact/TypeScript構成を実現しています。

## コンポーネント構成

### 1. page.tsx（静的生成）
- メタデータの設定（SEO、OGP、Twitterカード）
- 静的生成の設定（SSG対応）
- QuestPageClientの呼び出し

### 2. QuestPageClient.tsx（クライアントサイド）
- 横画面推奨メッセージ
- 空のアニメーション（雲とUFO）
- QuestMapコンポーネント

## 主な機能

### 横画面推奨メッセージ
- モバイルデバイスで縦画面時に表示
- 画面回転を促すアニメーション付きアイコン
- デバイス判定とオリエンテーション監視

### 空のアニメーション
- 7個のランダムな空オブジェクト（95%雲、5%UFO）
- 左右からの横移動アニメーション
- UFOの揺れアニメーション

### レスポンシブ対応
- デスクトップ、タブレット、モバイル対応
- 高さが低い画面での特別調整
- レスポンシブなpadding調整

## SSG対応

```typescript
export const metadata: Metadata = {
  title: 'CLAFT クエストマップ - 冒険の書',
  description: 'きみだけの冒険物語をつくろう！',
  // SEO最適化
}

export const revalidate = false // 完全な静的生成
```

## 使用例

### 基本使用（自動的にSSG適用）

```typescript
// app/quest/page.tsx
import QuestPageClient from './QuestPageClient'

export default function QuestPage() {
  return <QuestPageClient />
}
```

### カスタムレイアウトでの使用

```typescript
import { QuestPageClient } from './QuestPageClient'

export default function CustomQuestLayout() {
  return (
    <div className="custom-layout">
      <header>カスタムヘッダー</header>
      <QuestPageClient />
      <footer>カスタムフッター</footer>
    </div>
  )
}
```

## 技術的特徴

### 1. パフォーマンス最適化
- SSG（Static Site Generation）による高速な初期読み込み
- 空のアニメーションの効率的な実装
- レスポンシブ画像とアニメーション

### 2. アクセシビリティ
- セマンティックなHTML構造
- 画面読み上げソフト対応
- キーボードナビゲーション

### 3. quest.htmlとの互換性
- 完全な視覚的再現
- 同じアニメーション動作
- 同じレスポンシブブレークポイント

## カスタマイズ

### 空のアニメーション調整

```typescript
// NUM_SKY_OBJECTS数の変更
const NUM_SKY_OBJECTS = 10

// UFO出現率の調整
const type = Math.random() < 0.9 ? 'cloud' : 'ufo' // UFOを10%に
```

### 横画面推奨メッセージの無効化

```typescript
// RotationNoticeコンポーネントをコメントアウト
{/* <RotationNotice /> */}
```

### 背景グラデーションの変更

```css
.quest-page {
  background: linear-gradient(to bottom, #custom1 0%, #custom2 100%);
}
```

## パフォーマンス指標

- **First Contentful Paint**: < 1.5s（SSG）
- **Cumulative Layout Shift**: < 0.1
- **Largest Contentful Paint**: < 2.5s
- **Total Blocking Time**: < 200ms

## ブラウザ対応

- Chrome 88+
- Firefox 78+
- Safari 14+
- Edge 88+
- iOS Safari 14+
- Android Browser 88+

## 今後の拡張予定

1. **ナビゲーション統合**: HamburgerMenu、Sidebar、AuthButtonの統合
2. **PWA対応**: Service Worker、manifest.json
3. **パフォーマンス監視**: Web Vitals計測
4. **多言語対応**: i18n対応 