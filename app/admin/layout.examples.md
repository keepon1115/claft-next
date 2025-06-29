# Admin Layout

CLAFT管理画面の専用レイアウトコンポーネントです。サーバーサイドでの管理者権限確認、非管理者のリダイレクト、管理画面専用のヘッダーとナビゲーションを提供します。

## 主な機能

### 1. サーバーサイド権限確認
- Next.js 15のServer Componentsを活用
- Supabaseセッションとadmin_usersテーブルでの権限チェック
- 非同期処理による堅牢な認証フロー

### 2. 非管理者のリダイレクト
- 権限がないユーザーは自動的に`/unauthorized`にリダイレクト
- middlewareとの連携による二重の権限チェック
- サーバーサイドでの確実な保護

### 3. 管理画面専用ヘッダー
- 管理者情報の表示（ニックネーム/メールアドレス）
- 管理者バッジの表示
- レスポンシブデザイン対応

### 4. ナビゲーションメニュー
- ダッシュボード、ユーザー管理、クエスト管理へのリンク
- モバイル時の横スクロール対応
- ホバー効果とアクセシビリティ

## 技術的特徴

### サーバーサイド権限確認

```typescript
async function getAdminUser(): Promise<AdminUser | null> {
  // Supabaseセッション取得
  const { data: { session } } = await supabase.auth.getSession()
  
  // admin_usersテーブルでの権限確認
  const { data: adminData } = await supabase
    .from('admin_users')
    .select('is_active, email, created_at')
    .eq('user_id', session.user.id)
    .eq('is_active', true)
    .single()
    
  // ユーザープロフィール取得
  const { data: profileData } = await supabase
    .from('users_profile')
    .select('nickname')
    .eq('id', session.user.id)
    .single()
    
  return {
    id: session.user.id,
    email: adminData.email,
    nickname: profileData?.nickname || null,
    isActive: adminData.is_active ?? false,
    createdAt: adminData.created_at || new Date().toISOString()
  }
}
```

### middleware.tsとの連携

```typescript
// middleware.ts
const PROTECTED_ROUTES: ProtectedRoute[] = [
  {
    pattern: /^\/admin(\/.*)?$/,
    requireAuth: true,
    requireAdmin: true,
    redirectTo: '/unauthorized'
  }
]
```

## 使用方法

### 基本的な管理画面ページ

```typescript
// app/admin/page.tsx
export default function AdminDashboard() {
  return (
    <div>
      <h1>管理画面ダッシュボード</h1>
      <p>システム概要やアクティビティ...</p>
    </div>
  )
}
```

### ユーザー管理ページ

```typescript
// app/admin/users/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ユーザー管理'
}

export default function UsersPage() {
  return (
    <div>
      <h1>ユーザー管理</h1>
      {/* ユーザー一覧、検索、編集機能 */}
    </div>
  )
}
```

### クエスト管理ページ

```typescript
// app/admin/quests/page.tsx
export const metadata: Metadata = {
  title: 'クエスト管理'
}

export default function QuestsPage() {
  return (
    <div>
      <h1>クエスト管理</h1>
      {/* クエスト進捗、承認、管理機能 */}
    </div>
  )
}
```

## セキュリティ対策

### 1. 多層防御
- Middleware での事前チェック
- Layout でのサーバーサイドチェック
- 個別ページでの権限確認

### 2. セッション管理
- Supabaseの堅牢な認証システム
- 自動セッション更新
- セキュアなクッキー管理

### 3. データベース権限
- admin_usersテーブルでの明示的な権限管理
- is_activeフラグによる権限の有効/無効切り替え
- user_idとセッションIDの照合

## レスポンシブデザイン

### デスクトップ（768px以上）
- サイドバーナビゲーション（250px幅）
- 縦型レイアウト
- ホバー効果付きメニュー

### モバイル（768px未満）
- 横スクロールナビゲーション
- ヘッダーサイズ調整
- タッチフレンドリーなボタンサイズ

## メタデータ設定

```typescript
export const metadata: Metadata = {
  title: {
    template: '%s | CLAFT管理画面',
    default: 'CLAFT管理画面'
  },
  description: 'CLAFT管理画面 - システム管理とユーザー管理',
  robots: {
    index: false,        // 検索エンジンにインデックスさせない
    follow: false,       // リンクをたどらせない
    noarchive: true,     // キャッシュ保存を禁止
    nosnippet: true,     // スニペット表示を禁止
    noimageindex: true,  // 画像インデックスを禁止
  },
}
```

## 管理者の追加方法

### 1. データベースに直接追加

```sql
INSERT INTO admin_users (user_id, email, is_active)
VALUES ('user-uuid', 'admin@example.com', true);
```

### 2. Supabase管理画面から

1. `admin_users`テーブルを開く
2. 新しい行を追加
3. `user_id`、`email`、`is_active: true`を設定

## エラーハンドリング

### 認証エラー
- セッション取得失敗 → `/unauthorized`へリダイレクト
- 管理者権限なし → `/unauthorized`へリダイレクト
- データベースエラー → ログ出力後リダイレクト

### ユーザビリティ
- エラー状況の詳細ログ出力
- 管理者情報の部分取得失敗にも対応
- フォールバック表示（メールアドレス → ニックネーム）

## 将来の拡張

### 1. 詳細権限管理
- ロールベースアクセス制御（RBAC）
- 機能別権限設定
- 一時的権限付与

### 2. 監査ログ
- 管理者アクションの記録
- ログイン/ログアウト履歴
- データ変更の追跡

### 3. ダークモード
- 既にCSS準備済み
- ユーザー設定での切り替え
- システム設定との連携

## パフォーマンス

### サーバーサイドレンダリング
- 初期表示の高速化
- SEO対策（管理画面は非公開のためrobots.txtで制御）
- キャッシュ戦略

### データベースクエリ最適化
- 必要最小限のデータ取得
- インデックスの活用
- 接続プールの活用

## ブラウザ対応

- Chrome 88+
- Firefox 78+
- Safari 14+
- Edge 88+

管理者向けのため、モダンブラウザのみサポート。 