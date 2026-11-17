# マイクラSDGs承認フロー - 完全RLS設定ガイド

**最終更新**: 2025年11月12日  
**ステータス**: 統計テーブルRLSエラーの修正

---

## 🔴 現在発生しているエラー

```
Error: update_failed: new row violates row-level security policy for table "minecraft_sdgs_stats"
```

### エラーの原因

承認処理で`minecraft_sdgs_progress`を更新すると、自動的に`minecraft_sdgs_stats`（統計テーブル）も更新されます。しかし、**管理者がこのテーブルを更新する権限がない**ためエラーが発生しています。

---

## ✅ 完全な解決方法

### ステップ1: Supabaseダッシュボードにアクセス

1. https://app.supabase.com/ にログイン
2. 対象プロジェクトを選択
3. 左サイドバーから「SQL Editor」をクリック

### ステップ2: 以下のSQLを実行

```sql
-- ==========================================
-- minecraft_sdgs_stats テーブル用RLSポリシー
-- ==========================================

-- 管理者による統計データの読み取り許可
CREATE POLICY IF NOT EXISTS "管理者は全ユーザーの統計を読み取れる"
ON minecraft_sdgs_stats FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);

-- 管理者による統計データの更新許可（これが最重要！）
CREATE POLICY IF NOT EXISTS "管理者は全ユーザーの統計を更新できる"
ON minecraft_sdgs_stats FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);

-- 管理者による統計データの作成許可
CREATE POLICY IF NOT EXISTS "管理者は統計レコードを作成できる"
ON minecraft_sdgs_stats FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);

-- ==========================================
-- minecraft_sdgs_progress テーブル用RLSポリシー（念のため再実行）
-- ==========================================

-- 管理者による進捗データの読み取り許可
CREATE POLICY IF NOT EXISTS "管理者は全ユーザーの進捗を読み取れる"
ON minecraft_sdgs_progress FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);

-- 管理者による進捗データの更新許可
CREATE POLICY IF NOT EXISTS "管理者は全ユーザーの進捗を更新できる"
ON minecraft_sdgs_progress FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);

-- 管理者による進捗データの作成許可
CREATE POLICY IF NOT EXISTS "管理者は進捗レコードを作成できる"
ON minecraft_sdgs_progress FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);

-- ==========================================
-- notifications テーブル用RLSポリシー
-- ==========================================

-- 管理者による通知の作成許可
CREATE POLICY IF NOT EXISTS "管理者は通知を作成できる"
ON notifications FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);

-- ユーザーは自分の通知を読み取れる
CREATE POLICY IF NOT EXISTS "ユーザーは自分の通知を読み取れる"
ON notifications FOR SELECT TO authenticated
USING (auth.uid() = user_id);
```

### ステップ3: SQLを実行

1. 上記のSQLをコピー
2. SQL Editorに貼り付け
3. 右下の「Run」ボタンをクリック
4. 「Success. No rows returned」と表示されればOK

### ステップ4: ブラウザをリロードしてテスト

1. ブラウザをリロード（F5）
2. 古いユーザーの承認ボタンをクリック
3. ✅ 成功すれば承認完了！

---

## 🧪 設定確認方法

### 設定されたポリシーを確認

```sql
-- minecraft_sdgs_stats のポリシーを確認
SELECT 
  policyname, 
  cmd,
  CASE 
    WHEN cmd = 'SELECT' THEN 'READ'
    WHEN cmd = 'INSERT' THEN 'CREATE'
    WHEN cmd = 'UPDATE' THEN 'UPDATE'
    WHEN cmd = 'DELETE' THEN 'DELETE'
  END as operation
FROM pg_policies 
WHERE tablename = 'minecraft_sdgs_stats'
ORDER BY cmd, policyname;

-- minecraft_sdgs_progress のポリシーを確認
SELECT 
  policyname, 
  cmd,
  CASE 
    WHEN cmd = 'SELECT' THEN 'READ'
    WHEN cmd = 'INSERT' THEN 'CREATE'
    WHEN cmd = 'UPDATE' THEN 'UPDATE'
    WHEN cmd = 'DELETE' THEN 'DELETE'
  END as operation
FROM pg_policies 
WHERE tablename = 'minecraft_sdgs_progress'
ORDER BY cmd, policyname;
```

**期待される結果**:

| policyname | cmd | operation |
|-----------|-----|-----------|
| 管理者は全ユーザーの統計を読み取れる | SELECT | READ |
| 管理者は統計レコードを作成できる | INSERT | CREATE |
| 管理者は全ユーザーの統計を更新できる | UPDATE | UPDATE |

---

## 📊 テーブル構造の確認

### minecraft_sdgs_stats テーブル

このテーブルは**統計情報を管理**します：

```sql
-- テーブル構造を確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'minecraft_sdgs_stats'
ORDER BY ordinal_position;
```

**主なカラム**:
- `user_id`: ユーザーID
- `total_stages`: 全ステージ数
- `completed_stages`: 完了ステージ数
- `current_stage`: 現在のステージ
- `progress_percentage`: 進捗率
- `baseline_stage`: 承認不要の基準ステージ
- など

### トリガーの確認

```sql
-- minecraft_sdgs_progress に関連するトリガーを確認
SELECT 
  trigger_name, 
  event_manipulation, 
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'minecraft_sdgs_progress';
```

---

## 🆘 それでもエラーが出る場合

### エラーパターン別の対処

#### 1. `RLS policy violated for table "minecraft_sdgs_stats"`
→ 上記のSQLを再度実行してください

#### 2. `permission denied for table admin_users`
→ `admin_users`テーブルにもRLSポリシーが必要です：

```sql
-- admin_users テーブルの読み取り許可
CREATE POLICY IF NOT EXISTS "認証済みユーザーは管理者テーブルを読み取れる"
ON admin_users FOR SELECT TO authenticated
USING (true);
```

#### 3. `unauthorized` または `forbidden`
→ 管理者ユーザーが正しく登録されているか確認：

```sql
-- 自分が管理者として登録されているか確認
SELECT user_id, is_active, created_at
FROM admin_users
WHERE is_active = true;
```

---

## 📝 関連ドキュメント

- `docs/MINECRAFT_SDGS_APPROVAL_FIX.md` - 承認フロー修正の完全ガイド
- `docs/MINECRAFT_SDGS_ERROR_FIX_REPORT.md` - 定数再代入エラーの修正レポート
- `docs/MINECRAFT_SDGS_STATS_RLS_FIX.sql` - 統計テーブルRLS設定SQL（このファイル）

---

## 🎯 チェックリスト

承認フローを完全に動作させるには：

- [ ] `minecraft_sdgs_progress` テーブルのRLSポリシー設定
- [ ] `minecraft_sdgs_stats` テーブルのRLSポリシー設定 ⬅️ **今回追加**
- [ ] `notifications` テーブルのRLSポリシー設定
- [ ] 管理者ユーザーが`admin_users`テーブルに登録されている
- [ ] 管理者ユーザーの`is_active`が`true`
- [ ] ビルドエラーなし
- [ ] 定数再代入エラーなし

---

## 🎉 まとめ

### 今回の問題

```
minecraft_sdgs_stats テーブルのRLSポリシー不足
```

### 解決方法

**統計テーブルに管理者用のRLSポリシーを追加**

### 実行するSQL

上記の完全なSQLをSupabase SQL Editorで実行してください。

**これで承認フローが完全に動作するはずです！**

