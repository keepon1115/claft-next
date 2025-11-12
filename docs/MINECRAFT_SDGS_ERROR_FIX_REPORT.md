# マイクラSDGs承認エラー修正レポート

**修正日時**: 2025年11月12日  
**エラー**: `Error: Assignment to constant variable.`  
**ステータス**: ✅ 修正完了

---

## 🐛 発生したエラー

### コンソールエラー内容
```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
承認エラー: Error: Assignment to constant variable.
    at callApproveApi (C:\dev\claft-next\app\admin\minecraft-sdgs\page.tsx:144:42)
    at async handleApprove (C:\dev\claft-next\app\admin\minecraft-sdgs\page.tsx:175:7)
```

---

## 🔍 原因分析

### 問題箇所
**`app/api/admin/minecraft-sdgs/approve/route.ts`** の7行目と41行目：

```typescript
// ❌ 問題のあるコード
const supabase = createRouteHandlerSupabaseClient(request, response)  // 7行目: const で宣言

// ... 中略 ...

if (authedUserId) {
  // @ts-ignore
  supabase = tokenClient as any  // 41行目: const に再代入しようとしてエラー
}
```

### なぜこのエラーが発生したか
JavaScriptでは`const`で宣言された変数には**再代入ができません**。

認証トークンを使用する場合にSupabaseクライアントを切り替える必要がありましたが、`const`で宣言していたため、実行時エラーが発生しました。

**同様の問題が`reject/route.ts`にもありました。**

---

## ✅ 実施した修正

### 修正内容

**両方のファイルで`const`を`let`に変更**

#### `app/api/admin/minecraft-sdgs/approve/route.ts`
```typescript
// ✅ 修正後
let supabase = createRouteHandlerSupabaseClient(request, response)  // const → let

// ... 中略 ...

if (authedUserId) {
  supabase = tokenClient as any  // 再代入が可能に
}
```

#### `app/api/admin/minecraft-sdgs/reject/route.ts`
```typescript
// ✅ 修正後
let supabase = createRouteHandlerSupabaseClient(request, response)  // const → let

// ... 中略 ...

if (authedUserId) {
  supabase = tokenClient as any  // 再代入が可能に
}
```

---

## 🧪 確認手順

### 1. ブラウザをリロード
```
http://localhost:3002/admin/minecraft-sdgs
```

### 2. 承認ボタンをクリック
- 承認待ちのユーザーの「承認」ボタンをクリック

### 3. 期待される動作
- ✅ `Error: Assignment to constant variable.` エラーが出なくなる
- 次のエラーが出る可能性があります：
  - **RLSポリシーエラー**: `fetch_failed` または `update_failed`
  - これは正常です（Supabase RLSポリシーの設定が必要）

---

## 📋 今後の作業

### まだ承認が動作しない場合

**Supabase RLSポリシーを設定する必要があります。**

詳細は `docs/MINECRAFT_SDGS_APPROVAL_FIX.md` を参照してください。

#### クイック設定（Supabase SQL Editorで実行）

```sql
-- 管理者による読み取り許可
CREATE POLICY "管理者は全ユーザーの進捗を読み取れる"
ON minecraft_sdgs_progress FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);

-- 管理者による更新許可
CREATE POLICY "管理者は全ユーザーの進捗を更新できる"
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

-- 管理者による作成許可
CREATE POLICY "管理者は進捗レコードを作成できる"
ON minecraft_sdgs_progress FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);

-- 管理者による通知作成許可
CREATE POLICY "管理者は通知を作成できる"
ON notifications FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);
```

---

## 🔍 エラーメッセージの見方

修正により、より詳細なエラーメッセージが表示されるようになりました。

### エラーコードと意味

| エラーコード | 意味 | 対処方法 |
|-------------|------|----------|
| `fetch_failed` | 進捗データの取得に失敗 | RLSポリシーで読み取り権限を付与 |
| `update_failed` | 進捗データの更新に失敗 | RLSポリシーで更新権限を付与 |
| `not_pending` | 承認待ちのレコードが見つからない | データを確認 |
| `unauthorized` | 認証されていない | ログイン確認 |
| `forbidden` | 管理者権限がない | admin_usersテーブルを確認 |

---

## 📝 まとめ

### 修正内容
- ✅ `const` → `let` に変更（2ファイル）
- ✅ 定数再代入エラーを解決
- ✅ TypeScriptエラーなし
- ✅ ビルド成功

### 次のステップ
1. ✅ ブラウザをリロード
2. ⏳ Supabase RLSポリシーを設定（まだ承認が動作しない場合）
3. ⏳ 承認フローをテスト

---

## 🎯 現在の状態

| 項目 | 状態 |
|------|------|
| ビルドエラー | ✅ 解決済み |
| 定数再代入エラー | ✅ 修正完了 |
| RLSポリシー設定 | ⏳ 必要に応じて設定 |
| 承認フロー動作 | ⏳ RLS設定後に確認 |

---

**問題が解決したか、ブラウザをリロードして確認してください！**

