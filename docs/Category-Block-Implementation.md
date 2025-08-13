# カテゴリブロック実装ドキュメント

## 概要

カテゴリブロックレイアウト拡張とポップアップ統一機能の実装が完了しました。この機能により、各カテゴリ（おかね・経済／プレゼン・コミュニケーション／AI・ITスキル／SDGs・環境）で以下の要求仕様を満たしています。

## 実装された機能

### 1. カテゴリブロックレイアウト

#### 上段レイアウト (2fr:1fr)
- **プライマリタイル（①）**: 2/3幅でYouTubeサムネイル表示
- **講師紹介タイル**: 1/3幅で講師紹介用サムネイル表示

#### 下段レイアウト (1fr:1fr:1fr:auto)
- **レッスンタイル（②③④）**: 横並びで配置
- **...etcタイル**: 右端に配置し続き感を演出

#### レスポンシブ対応
- **PC（768px以上）**: 上段 2fr:1fr、下段 repeat(3, 1fr) + auto
- **タブレット（768px未満）**: 上段は縦積み、下段 repeat(2, 1fr)
- **モバイル（480px未満）**: 全て縦積み 1fr

### 2. モーダルシステム統一

#### プライマリタイル（①）モーダル
- 既存ステージモーダルと同デザインの3ボタン構成
  1. **動画を見る** - YouTube埋め込み/外部新規タブ
  2. **クエストに挑む** - Googleフォーム／クエスト画面へ
  3. **メッセージ確認** - カテゴリ①用メッセージ一覧表示

#### 講師紹介モーダル
- 講師写真/動画サムネイル表示
- 講師プロフィール表示
- 講師紹介動画再生機能

#### レッスンタイル（②③④）モーダル
- プライマリタイルと同じ3ボタン構成
- ロック解除条件チェック
- 個別のレッスンコンテンツ対応

### 3. データ構造

#### 型定義（types/category.ts）
```typescript
interface Category {
  id: string
  slug: string
  title: string
  emoji: string
  unlock_required_stage: number
  // ... その他のフィールド
}

interface CategoryLesson {
  id: string
  category_id: string
  order: number
  title: string
  kind: 'primary' | 'instructor' | 'lesson'
  youtube_id?: string
  thumbnail_url?: string
  unlock_required_stage: number
  // ... その他のフィールド
}
```

#### デモデータ
- 4つのカテゴリ（おかね・経済、プレゼン・コミュニケーション、AI・ITスキル、SDGs・環境）
- 各カテゴリに4つのレッスン（①と②③④）
- 講師情報を含む完全なサンプルデータ

### 4. アクセシビリティ対応

#### WAI-ARIA準拠
- すべてのタイルに`button`ロール
- 適切な`aria-label`属性
- ロック状態の音声読み上げ対応

#### キーボード操作
- モーダルの`Esc`キー閉じ機能
- フォーカス管理
- タブナビゲーション対応

#### 視覚的表示
- ロック状態の明確な視覚的指示
- ホバー効果とフィードバック
- 高コントラスト対応

## ファイル構成

### 新規作成ファイル
```
types/category.ts                    # カテゴリ関連型定義
components/quest/CategoryBlock.tsx   # カテゴリブロックコンポーネント  
components/quest/CategoryModal.tsx   # 統一モーダルシステム
hooks/useCategorySystem.ts          # カテゴリシステム管理フック
```

### 更新ファイル
```
components/quest/QuestMap.tsx        # カテゴリブロック統合
```

### プレースホルダー画像
```
public/images/instructor/default-instructor.png
public/images/quest/default-thumbnail.png
```

## 使用方法

### 基本的な使用
```tsx
import { useCategorySystem } from '@/hooks/useCategorySystem'
import CategoryBlock from '@/components/quest/CategoryBlock'
import CategoryModal from '@/components/quest/CategoryModal'

function MyQuestPage() {
  const {
    modalOptions,
    isModalOpen,
    openModal,
    closeModal,
    generateDemoCategories
  } = useCategorySystem({
    userMainQuestProgress: 6,
    isAuthenticated: true
  })

  const categories = generateDemoCategories()

  return (
    <div>
      {categories.map(category => (
        <CategoryBlock
          key={category.id}
          category={category}
          userMainQuestProgress={6}
          userCategoryProgress={[]}
          onOpenModal={openModal}
        />
      ))}
      
      <CategoryModal
        options={modalOptions}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  )
}
```

## カスタマイズ可能な要素

### スタイリング
- CSS-in-JSによる完全なスタイルカスタマイズ
- レスポンシブブレークポイントの調整
- カラーテーマの変更

### データソース
- Supabaseとの連携準備完了
- デモデータからリアルデータへの簡単移行
- カスタムAPI連携対応

### 機能拡張
- 進行状況トラッキング
- バッジ・アチーブメントシステム
- ソーシャル機能

## 今後の改善点

### データベース連携
- Supabaseテーブル設計と実装
- リアルタイムデータ同期
- ユーザー進行状況の永続化

### パフォーマンス最適化
- 画像遅延読み込み
- コンポーネントメモ化
- バンドルサイズ最適化

### UX改善
- アニメーション効果の追加
- プログレス表示の改善
- オフライン対応

## 受け入れ基準の達成状況

✅ カテゴリ上段が**①=2/3幅**、**講師タイル=1/3幅**で表示される（モバイルでは縦積み）
✅ ①クリックで**既存と同デザインの3ボタンモーダル**（動画を見る／クエストに挑む／メッセージ確認）
✅ 講師タイルクリックで**講師紹介動画モーダル**が開く
✅ 下段に**②③④**と**...etc**が並ぶ
✅ ロック解除条件は既存ロジックで機能（解除前は鍵アイコン・クリック不可）
✅ 既存のカテゴリ枠デザイン・見出し・番号バッジのスタイルと整合

すべての受け入れ基準が満たされており、追加の要求事項も実装されています。
