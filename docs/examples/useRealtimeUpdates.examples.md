# useRealtimeUpdates フック

管理画面専用のSupabase Realtimeフック。quest_progressテーブルの変更をリアルタイムで監視し、新規承認待ちの通知、他の管理者の操作の検出、UI更新を提供します。

## 概要

`useRealtimeUpdates`は、管理者がクエスト承認業務を効率的に行うためのリアルタイム機能を提供するカスタムフックです。

### 主な機能

1. **リアルタイム監視**: quest_progressテーブルの変更をリアルタイムで検出
2. **通知システム**: 新規承認待ち、他の管理者の操作を通知
3. **接続管理**: 自動再接続、接続状態の管理
4. **通知管理**: 未読数管理、通知の既読・削除機能

## API仕様

### Options

```typescript
interface UseRealtimeUpdatesOptions {
  onNotification?: (type: 'success' | 'error' | 'info', title: string, message?: string) => void
  onDataUpdate?: () => void
  currentAdminId?: string | null
}
```

#### パラメータ

- `onNotification`: 通知表示関数（外部通知システムとの連携）
- `onDataUpdate`: データ更新時のコールバック（テーブルの再読み込み等）
- `currentAdminId`: 現在の管理者ID（自分の操作を除外するため）

### 返り値

```typescript
{
  isConnected: boolean
  notifications: RealtimeNotification[]
  unreadCount: number
  markNotificationAsRead: (notificationId: string) => void
  clearNotifications: () => void
  reconnect: () => void
}
```

#### 返り値の説明

- `isConnected`: Realtime接続状態
- `notifications`: 受信した通知の配列
- `unreadCount`: 未読通知数
- `markNotificationAsRead`: 通知を既読にする
- `clearNotifications`: 全通知をクリア
- `reconnect`: 手動再接続

## 使用例

### 1. 基本的な使用方法

```typescript
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates'

function AdminDashboard() {
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null)
  
  const {
    isConnected,
    notifications,
    unreadCount,
    markNotificationAsRead,
    clearNotifications,
    reconnect
  } = useRealtimeUpdates({
    onNotification: (type, title, message) => {
      // 外部通知システムへの連携
      showToast(type, title, message)
    },
    onDataUpdate: () => {
      // データ更新時の処理
      refetchApprovalData()
    },
    currentAdminId
  })

  return (
    <div>
      {/* 接続状態表示 */}
      <div className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? '接続中' : '再接続中...'}
      </div>
      
      {/* 通知バッジ */}
      {unreadCount > 0 && (
        <div className="notification-badge">{unreadCount}</div>
      )}
    </div>
  )
}
```

### 2. ApprovalTableでの統合

```typescript
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates'
import { approveQuest, rejectQuest } from '@/app/admin/actions'

function ApprovalTable({ onNotification }: { onNotification: Function }) {
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null)
  const [pendingApprovals, setPendingApprovals] = useState([])

  // 通知システムの統合
  const showNotification = (type: string, title: string, message?: string) => {
    if (onNotification) {
      onNotification(type, title, message)
    }
  }

  // Realtimeフック
  const {
    isConnected: realtimeConnected,
    notifications: realtimeNotifications,
    unreadCount: realtimeUnreadCount,
    markNotificationAsRead: markRealtimeNotificationAsRead,
    clearNotifications: clearRealtimeNotifications,
    reconnect: reconnectRealtime
  } = useRealtimeUpdates({
    onNotification: showNotification,
    onDataUpdate: () => {
      // リアルタイムでデータが更新されたらテーブルを再読み込み
      loadPendingApprovals()
    },
    currentAdminId
  })

  // 楽観的更新を伴う承認処理
  const handleApprove = async (userId: string, stageId: number) => {
    // UIを即座に更新（楽観的更新）
    setPendingApprovals(prev => prev.filter(item => 
      !(item.user_id === userId && item.stage_id === stageId)
    ))

    try {
      const result = await approveQuest(userId, stageId)
      if (result.success) {
        showNotification('success', '承認完了', result.message)
      }
    } catch (error) {
      // エラー時は元に戻す
      loadPendingApprovals()
      showNotification('error', '承認失敗', error.message)
    }
  }

  return (
    <div>
      {/* 接続状態とバッジ */}
      <div className="realtime-status">
        <div className={`indicator ${realtimeConnected ? 'connected' : 'disconnected'}`}>
          {realtimeConnected ? 'リアルタイム接続中' : '接続を試行中...'}
        </div>
        {realtimeUnreadCount > 0 && (
          <div className="badge">{realtimeUnreadCount}</div>
        )}
      </div>
      
      {/* テーブル */}
      <table>
        {/* ... */}
      </table>
    </div>
  )
}
```

### 3. 通知管理システム

```typescript
function NotificationPanel() {
  const {
    notifications,
    unreadCount,
    markNotificationAsRead,
    clearNotifications
  } = useRealtimeUpdates()

  return (
    <div className="notification-panel">
      <div className="header">
        <h3>通知 ({unreadCount})</h3>
        <button onClick={clearNotifications}>全て削除</button>
      </div>
      
      <div className="notification-list">
        {notifications.map(notification => (
          <div 
            key={notification.id}
            className={`notification ${notification.read ? 'read' : 'unread'}`}
            onClick={() => markNotificationAsRead(notification.id)}
          >
            <div className="title">{notification.title}</div>
            <div className="message">{notification.message}</div>
            <div className="timestamp">
              {new Date(notification.timestamp).toLocaleString('ja-JP')}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## 監視対象イベント

### 1. 新規承認待ち（INSERT）

```
eventType: 'INSERT'
status: 'pending_approval'
→ 通知タイプ: 'new_pending'
```

**通知例:**
- タイトル: "新しい承認待ち"
- メッセージ: "田中太郎さんがステージ3を提出しました"

### 2. 他の管理者による承認（UPDATE）

```
eventType: 'UPDATE'
status: 'completed' 
approved_by: 他の管理者のID
→ 通知タイプ: 'approved_by_other'
```

**通知例:**
- タイトル: "他の管理者が承認"
- メッセージ: "田中太郎さんのステージ3が承認されました"

### 3. 他の管理者による却下（UPDATE）

```
eventType: 'UPDATE'
status: 'current'
rejected_by: 他の管理者のID
→ 通知タイプ: 'rejected_by_other'
```

**通知例:**
- タイトル: "他の管理者が却下"
- メッセージ: "田中太郎さんのステージ3が却下されました"

## 技術仕様

### Realtimeチャンネル設定

```typescript
const channel = supabase.channel('admin-quest-updates')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'quest_progress'
    },
    handleRealtimeUpdate
  )
```

### 自動再接続

- 接続エラー時: 5秒後に自動再接続
- タイムアウト時: 5秒後に自動再接続
- 手動再接続: `reconnect()`関数で即座に再接続

### 通知の保持

- 最大50件まで保持
- 古い通知は自動的に削除
- ブラウザリロード時は通知がクリア

## パフォーマンス考慮事項

### 1. メモリ使用量

- 通知は最大50件に制限
- 不要な通知は定期的にクリア推奨

### 2. ネットワーク負荷

- イベントフィルタリングで不要な通信を削減
- 再接続時の指数バックオフ実装

### 3. UI更新頻度

- 楽観的更新でUIの応答性を向上
- デバウンス処理で過度な更新を防止

## 制限事項

1. **ブラウザサポート**: WebSocket対応ブラウザが必要
2. **同時接続数**: Supabaseの接続数制限に依存
3. **通知履歴**: ページリロード時に通知履歴は失われる
4. **オフライン対応**: オフライン時の通知は受信不可

## トラブルシューティング

### 接続できない場合

1. Supabase設定の確認
2. ネットワーク接続の確認
3. ブラウザのWebSocket対応確認
4. 手動再接続の実行

### 通知が表示されない場合

1. `onNotification`関数の実装確認
2. 管理者権限の確認
3. テーブル権限（RLS）の確認
4. コンソールエラーの確認

### パフォーマンス問題

1. 通知件数の確認（50件制限）
2. 不要な通知のクリア
3. イベントハンドラーの最適化
4. メモリリークの確認

## 関連ファイル

- `hooks/useRealtimeUpdates.ts` - メインフック
- `components/admin/ApprovalTable.tsx` - 使用例
- `app/admin/actions.ts` - Server Actions（承認処理）
- `lib/supabase/client.ts` - Supabaseクライアント設定 