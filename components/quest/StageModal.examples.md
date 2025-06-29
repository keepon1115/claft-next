# StageModal コンポーネント

ステージ詳細情報の表示と、動画視聴・クエスト挑戦機能を提供するモーダルコンポーネントです。quest.htmlのモーダルを完全に再現しています。

## 主な機能

- ステージ詳細情報の表示
- 動画視聴ボタン（新しいタブで動画を開く）
- クエスト挑戦ボタン（Googleフォームを開く）
- ゲストユーザー対応（ステージ1のみアクセス可能）
- 動画視聴状態の管理（ローカルストレージ）
- ステージ進捗状態に応じたボタン表示制御
- アクセシビリティ対応（ESCキー、フォーカス管理）

## Props

| プロパティ | 型 | 必須 | 説明 |
|-----------|---|------|------|
| `stageId` | `number \| null` | ✓ | 表示するステージID（nullの場合は非表示） |
| `onClose` | `() => void` | ✓ | モーダルを閉じる時のコールバック |
| `isOpen` | `boolean` | ✓ | モーダルの開閉状態 |

## 使用例

### 基本的な使用方法

```tsx
import { useState } from 'react'
import { StageModal } from '@/components/quest/StageModal'

function QuestMap() {
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleStageClick = (stageId: number) => {
    setSelectedStageId(stageId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedStageId(null)
  }

  return (
    <div>
      {/* ステージノードの例 */}
      <button onClick={() => handleStageClick(1)}>
        ステージ1
      </button>
      <button onClick={() => handleStageClick(2)}>
        ステージ2
      </button>

      {/* モーダル */}
      <StageModal
        stageId={selectedStageId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}
```

### StageNodeコンポーネントとの連携

```tsx
import { StageNode } from '@/components/quest/StageNode'
import { StageModal } from '@/components/quest/StageModal'

function QuestMapWithNodes() {
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleStageClick = (stageId: number) => {
    setSelectedStageId(stageId)
    setIsModalOpen(true)
  }

  return (
    <div className="stage-grid">
      {Array.from({ length: 6 }, (_, index) => (
        <StageNode
          key={index + 1}
          stageId={index + 1}
          onClick={() => handleStageClick(index + 1)}
        />
      ))}
      
      <StageModal
        stageId={selectedStageId}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedStageId(null)
        }}
      />
    </div>
  )
}
```

### カスタムイベントリスナーとの連携

```tsx
import { useEffect } from 'react'
import { StageModal } from '@/components/quest/StageModal'

function App() {
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    // AuthModalからのイベントを受信
    const handleOpenAuthModal = () => {
      // 認証モーダルを開く処理
      console.log('Opening auth modal...')
    }

    window.addEventListener('openAuthModal', handleOpenAuthModal)
    return () => {
      window.removeEventListener('openAuthModal', handleOpenAuthModal)
    }
  }, [])

  return (
    <div>
      <StageModal
        stageId={selectedStageId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
```

## ステージ状態による表示制御

### current（進行中）
- 動画視聴ボタンを表示
- クエスト挑戦ボタンを表示
- 動画視聴後にクエスト挑戦が可能

### pending_approval（承認待ち）
- 動画視聴ボタンを非表示
- クエスト挑戦ボタンを「承認待ち」として無効化

### completed（完了済み）
- 両方のボタンを非表示

### locked（ロック中）
- 特別なロック画面を表示（ステージ1以外）
- アクセス不可メッセージを表示

## ゲストユーザー対応

### ステージ1の場合
- 動画視聴ボタン：ログイン促進
- クエスト挑戦ボタン：ログイン促進
- 未ログインでもモーダル表示可能

### ステージ2以降の場合
- ロック画面を表示
- ログイン促進メッセージ

## 動画視聴状態の管理

動画視聴状態はローカルストレージで管理されます：

```typescript
// 視聴状態の保存
localStorage.setItem(`stage_${stageId}_video_watched`, 'true')

// 視聴状態の取得
const isWatched = localStorage.getItem(`stage_${stageId}_video_watched`) === 'true'
```

## アクセシビリティ

- ESCキーでモーダル閉じる
- フォーカストラップ
- ARIA属性の適切な設定
- キーボードナビゲーション対応

## スタイリング

quest.htmlと完全に一致するCSS-in-JSスタイリングを使用：

- モーダルオーバーレイ：`rgba(0, 0, 0, 0.8)`
- コンテンツ背景：`#F5F5DC`（ベージュ）
- ボーダー：4px solid `#8B4513`（ブラウン）
- ボタン：3Dエフェクト付きのカラフルなボタン

## 連携要件

### 必要なストア
- `useQuestStore`：ステージ情報と進捗状態
- `useAuth`：認証状態の確認

### 必要なイベント
- `openAuthModal`：認証モーダルを開くカスタムイベント

### 外部依存
- `lucide-react`：アイコン（Xアイコン）
- `react-dom`：ポータル機能

## トラブルシューティング

### モーダルが表示されない
- `isOpen` プロパティが `true` になっているか確認
- `stageId` が有効な値（1-6）か確認
- コンポーネントがマウントされているか確認

### ボタンが表示されない
- ステージの進捗状態を確認
- 認証状態を確認
- questStoreが正しく初期化されているか確認

### スタイリングの問題
- CSS-in-JSが正しく適用されているか確認
- z-indexの競合がないか確認
- viewport設定が適切か確認

## パフォーマンス最適化

- React.memo使用による不要な再レンダリング防止
- useCallback使用によるイベントハンドラーの最適化
- Portal使用による効率的なDOMレンダリング
- 条件付きレンダリングによる不要な要素の削減 