# 管理者用Server Actions

`app/admin/actions.ts`に実装された管理者専用のServer Actionsドキュメント。

## 概要

管理者がクエストの承認・却下を行うためのServer Actions。セキュリティを重視し、サーバーサイドで権限チェックを実装。

## 実装された機能

### 1. 権限チェック（checkAdminPermission）

```typescript
// 内部関数 - 全てのServer Actionで権限チェックを実行
async function checkAdminPermission()
```

**機能:**
- セッション確認
- `admin_users`テーブルでの管理者権限確認
- `is_active`フラグによる有効性チェック
- 権限がない場合は自動的に`/unauthorized`にリダイレクト

### 2. クエスト承認（approveQuest）

```typescript
export async function approveQuest(userId: string, stageId: number)
```

**パラメータ:**
- `userId`: 承認対象のユーザーID
- `stageId`: 承認するステージ番号（1-6）

**処理内容:**
1. 管理者権限チェック
2. 入力値検証
3. クエスト状態確認（`pending_approval`状態のみ承認可能）
4. ステージを`completed`状態に更新
5. 次のステージを自動解放（ステージ6以外）
6. ユーザー統計情報の更新
7. キャッシュ再検証（`revalidatePath('/admin')`）

**返り値:**
```typescript
{
  success: true,
  message: "ステージ{N}を承認しました",
  nextStageUnlocked: boolean
} | {
  success: false,
  error: string
}
```

### 3. クエスト却下（rejectQuest）

```typescript
export async function rejectQuest(userId: string, stageId: number)
```

**パラメータ:**
- `userId`: 却下対象のユーザーID
- `stageId`: 却下するステージ番号（1-6）

**処理内容:**
1. 管理者権限チェック
2. 入力値検証
3. クエスト状態確認
4. ステージを`current`状態に戻す
5. 却下履歴の記録
6. 承認関連情報のクリア（再提出準備）
7. キャッシュ再検証

**返り値:**
```typescript
{
  success: true,
  message: "ステージ{N}を却下しました。ユーザーは再挑戦可能です。"
} | {
  success: false,
  error: string
}
```

### 4. 一括承認（bulkApprove）

```typescript
export async function bulkApprove(userStageIds: { userId: string; stageId: number }[])
```

**パラメータ:**
- `userStageIds`: 承認対象の配列（最大50件）

**処理内容:**
1. 管理者権限チェック
2. 入力値検証（件数制限チェック）
3. 各アイテムを順次承認処理
4. 成功・失敗の集計
5. エラー詳細の記録

**返り値:**
```typescript
{
  success: boolean,
  successCount: number,
  failureCount: number,
  totalCount: number,
  errors?: string[],
  message: string
}
```

### 5. 統計情報更新（updateUserStats）

```typescript
export async function updateUserStats(userId: string, action: 'quest_completed' | 'login')
```

**パラメータ:**
- `userId`: 対象ユーザーID
- `action`: 更新種別（`quest_completed` | `login`）

**処理内容:**
- `quest_completed`: クエストクリア数+1、経験値+100
- `login`: ログイン回数+1、最終ログイン日時更新
- `upsert`による安全な更新

### 6. 管理者情報取得（getAdminInfo）

```typescript
export async function getAdminInfo()
```

**機能:**
- 権限確認済みの管理者情報取得
- セッション情報と`admin_users`テーブルのデータを結合

## 使用例

### 1. ApprovalTableコンポーネントでの使用

```typescript
import { approveQuest, rejectQuest, bulkApprove } from '@/app/admin/actions'

// 個別承認
const handleApprove = async (userId: string, stageId: number) => {
  const result = await approveQuest(userId, stageId)
  
  if (result.success) {
    showNotification('success', '承認完了', result.message)
    await loadData()
  } else {
    showNotification('error', '承認失敗', result.error)
  }
}

// 一括承認
const handleBulkApprove = async (items: SelectedItem[]) => {
  const userStageIds = items.map(item => ({
    userId: item.userId,
    stageId: item.stageId
  }))
  
  const result = await bulkApprove(userStageIds)
  
  if (result.success) {
    showNotification('success', '一括承認完了', 
      `${result.successCount}件承認、${result.failureCount}件失敗`)
  }
}
```

### 2. 他のコンポーネントでの使用

```typescript
// ダッシュボードでの管理者情報表示
const { admin } = await getAdminInfo()
console.log('管理者:', admin.email)

// 手動での統計更新
await updateUserStats(userId, 'quest_completed')
```

## セキュリティ仕様

### 1. 多層防御
- **Middleware**: `/admin`ルートへのアクセス制御
- **Layout**: サーバーサイドでの権限確認
- **Server Actions**: 各アクション実行時の権限チェック

### 2. 権限管理
- `admin_users`テーブルでの明示的権限管理
- `is_active`フラグによる権限の有効/無効制御
- セッション情報とデータベース情報の照合

### 3. 入力検証
- パラメータの型チェック
- 範囲チェック（ステージ番号1-6）
- 一括処理の件数制限（最大50件）

### 4. エラーハンドリング
- 詳細なエラーログ
- ユーザーフレンドリーなエラーメッセージ
- 権限エラー時の自動リダイレクト

## データベース影響

### 更新されるテーブル

1. **quest_progress**
   - 承認時: `status`, `approved_at`, `approved_by`
   - 却下時: `status`, `rejected_at`, `rejected_by`, 承認情報クリア
   - 次ステージ: 新規作成または`status`更新

2. **user_stats**
   - クエスト完了時: `quest_clear_count`, `total_exp`
   - ログイン時: `login_count`, `last_login_date`

### トランザクション処理

- 複数テーブルの更新は`Promise.all`で並列実行
- エラー発生時は全体をロールバック
- 一括処理は順次実行（デッドロック回避）

## パフォーマンス最適化

### 1. 並列処理
- 複数の独立したクエリを同時実行
- 統計更新とメイン処理の並列化

### 2. キャッシュ管理
- `revalidatePath('/admin')`による選択的キャッシュ無効化
- 必要最小限のデータ再取得

### 3. クエリ最適化
- 必要なフィールドのみ選択
- インデックスを活用したクエリ設計

## エラーコード

| コード | 説明 | 対処法 |
|--------|------|--------|
| 認証が必要です | セッション不正 | 再ログイン |
| 管理者権限がありません | 権限不足 | 管理者に連絡 |
| 無効なパラメータです | 入力値エラー | パラメータ確認 |
| 承認待ちのクエストが見つかりません | データ不整合 | データ確認 |
| 一度に承認できるのは50件までです | 制限超過 | 分割処理 |

## ログ仕様

### 成功ログ
```
承認完了: ユーザー{userId} ステージ{stageId}
一括承認完了: {successCount}件成功、{failureCount}件失敗
```

### エラーログ
```
承認エラー: {errorMessage} (ユーザー: {userId}, ステージ: {stageId})
権限チェックエラー: {errorMessage}
```

## 関連ファイル

- `app/admin/layout.tsx` - 管理者レイアウト（権限チェック）
- `components/admin/ApprovalTable.tsx` - 承認テーブル（UI）
- `components/admin/FilterSection.tsx` - フィルター機能
- `middleware.ts` - アクセス制御
- `lib/supabase/client.ts` - Supabaseクライアント設定 