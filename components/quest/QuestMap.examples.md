# QuestMap コンポーネント

CLAFTクエストマップの全体を管理するメインコンポーネントです。quest.htmlの完全な再現を目指して、6つのステージの配置、パスライン、冒険ログ、レスポンシブ対応を実装しています。

## 主な機能

- 6つのステージノードの配置（3列/2列レスポンシブ）
- パスラインによるステージ間の接続表示
- 冒険ログボタン（進捗サマリー表示）
- メインクエストボタン（フローティングアクションボタン）
- ステージモーダルとの連携
- ゲストユーザー対応（ステージ1のみ体験可能）
- 認証状態に応じた動的表示切り替え

## Props

| プロパティ | 型 | デフォルト | 説明 |
|-----------|---|----------|------|
| `className` | `string` | `''` | 追加のCSSクラス |
| `showHeader` | `boolean` | `true` | ヘッダー（タイトル・説明）の表示 |
| `showAdventureLog` | `boolean` | `true` | 冒険ログボタンの表示 |
| `showMainQuestButton` | `boolean` | `true` | メインクエストボタンの表示 |

## 使用例

### 基本的な使用方法

```tsx
import QuestMap from '@/components/quest/QuestMap'

function QuestPage() {
  return (
    <div className="quest-page">
      <QuestMap />
    </div>
  )
}
```

### カスタマイズした使用方法

```tsx
import QuestMap from '@/components/quest/QuestMap'

function CustomQuestMap() {
  return (
    <QuestMap
      className="custom-quest-map"
      showHeader={false}
      showAdventureLog={true}
      showMainQuestButton={false}
    />
  )
}
```

### 埋め込み用（ヘッダーなし）

```tsx
import QuestMap from '@/components/quest/QuestMap'

function EmbeddedQuestMap() {
  return (
    <div className="dashboard-section">
      <h2>クエスト進捗</h2>
      <QuestMap
        showHeader={false}
        showAdventureLog={false}
        showMainQuestButton={false}
        className="compact-map"
      />
    </div>
  )
}
```

### ページレイアウトでの使用

```tsx
import QuestMap from '@/components/quest/QuestMap'
import Header from '@/components/common/Header'
import Sidebar from '@/components/common/Sidebar'

function QuestPageLayout() {
  return (
    <div className="page-layout">
      <Header />
      <div className="content-wrapper">
        <Sidebar />
        <main className="main-content">
          <QuestMap 
            showHeader={true}
            showAdventureLog={true}
            showMainQuestButton={true}
          />
        </main>
      </div>
    </div>
  )
}
```

## レスポンシブ対応

### デスクトップ（768px以上）
- 3列グリッドレイアウト
- 32pxのギャップ
- パスライン：3列目（3の倍数）と最後のステージは非表示

### タブレット・モバイル（767px以下）
- 2列グリッドレイアウト
- 24pxのギャップ
- パスライン：2列目（2の倍数）と最後のステージは非表示

### 小画面（480px以下）
- メインクエストボタンを固定位置から相対位置に変更
- フルワイドボタンとして表示

## 冒険ログ機能

冒険ログボタンをクリックすると、現在の進捗状況をアラートで表示します：

```typescript
// 表示例
📖 これまでの冒険の記録

ステージ1: 君はどんな冒険者？ - ✅ クリア済み
ステージ2: 新時代の冒険者に必要なものって？ - 🎯 挑戦中
ステージ3: 君はどんなキャラ？ - ⏳ 承認待ち

⏳ 1個のクエストが承認待ちです
```

## メインクエストボタン

認証状態と進捗状況に応じて動的にテキストが変化：

| 状態 | ボタンテキスト |
|------|-------------|
| 未ログイン | 🌟 ステージ1を体験してみる |
| 進行中ステージあり | 🔥 次の冒険へ進む！ |
| 全クリア済み | 🎉 全ての冒険を達成！ |
| 次ステージ待ち | ❓ 次のステージへ |

## 内部コンポーネント連携

### StageNode との連携
- ステージ詳細情報の表示
- クリックイベントの処理
- パスライン表示制御

### StageModal との連携
- ステージクリック時のモーダル表示
- 動画視聴・クエスト提出機能

### questStore との連携
- ユーザー進捗状態の取得
- ステージ詳細情報の取得
- 統計情報の活用

### authStore との連携
- 認証状態の確認
- ゲストユーザー対応

## スタイリング

quest.htmlと完全に一致するCSS-in-JSスタイリング：

### カラーパレット
- 背景：`#F5F5DC`（ベージュ）
- ボーダー：`#8B4513`（ダークブラウン）
- アクセント：`#FFD700`（ゴールド）
- プライマリ：`#FF6B6B`（コーラル）

### アニメーション
- パルスボタン：2秒間隔の拡大縮小
- ホバーエフェクト：-2px, -2px の移動
- ローディング：回転スピナー

## イベントハンドリング

### カスタムイベント
- `openAuthModal`: 認証モーダルを開く

### アクセシビリティ
- キーボードナビゲーション対応
- スクリーンリーダー対応
- 適切なフォーカス管理

## パフォーマンス最適化

### React最適化
- `useCallback` によるイベントハンドラーの最適化
- 条件付きレンダリングによる無駄な描画の削減
- メモ化による再計算の防止

### CSS最適化
- CSS-in-JS による効率的なスタイル適用
- メディアクエリによるレスポンシブ対応
- ハードウェアアクセラレーション対応

## エラーハンドリング

### ローディング状態
- 初期化中のスピナー表示
- questStore未初期化時の対応

### データ不整合への対応
- ステージデータ未取得時のnull返却
- 進捗状態の適切なフォールバック

## トラブルシューティング

### ステージが表示されない
```typescript
// questStoreの初期化状態を確認
const { isInitialized, stageDetails } = useQuestStore()
console.log('initialized:', isInitialized)
console.log('stageDetails:', stageDetails)
```

### モーダルが開かない
```typescript
// 認証状態とステージ状態を確認
const { isAuthenticated } = useAuth()
const { userProgress } = useQuestStore()
console.log('auth:', isAuthenticated)
console.log('progress:', userProgress)
```

### レスポンシブが効かない
```css
/* CSS-in-JSのメディアクエリを確認 */
@media (max-width: 767px) {
  .stage-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

## 開発者向けデバッグ

### デバッグモード
```tsx
// StageNodeのデバッグモードを有効化
<QuestMap className="debug-mode" />
```

### 状態監視
```typescript
// React DevToolsでの状態確認
// questStore の状態
// authStore の状態
// ローカル state の状態
```

## カスタマイズ例

### 独自スタイルの適用
```tsx
<QuestMap 
  className="my-custom-quest-map"
/>

<style jsx global>{`
  .my-custom-quest-map {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  .my-custom-quest-map .stage-grid {
    gap: 40px;
  }
`}</style>
```

### 機能の部分的無効化
```tsx
// ヘッダーなし、ログなしの最小構成
<QuestMap 
  showHeader={false}
  showAdventureLog={false}
  showMainQuestButton={false}
/>
``` 