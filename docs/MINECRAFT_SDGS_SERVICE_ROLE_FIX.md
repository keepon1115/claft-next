# マイクラSDGs承認エラー - Service Role Key対応

**問題**: RLSポリシーを設定してもエラーが続く場合の代替解決策

---

## 🔴 現在の状況

RLSポリシーを設定しても、以下のエラーが続く：
```
new row violates row-level security policy for table "minecraft_sdgs_stats"
```

### 考えられる原因

1. **トリガーや関数がSECURITY INVOKERで実行されている**
   - 管理者の権限ではなく、元のユーザーの権限で実行される
   - そのため、RLSポリシーが適用されない

2. **admin_usersテーブルへのアクセス権限がない**
   - RLSポリシー内で`admin_users`を参照できない

3. **複雑なトリガーチェーン**
   - 複数のテーブルが連鎖的に更新される

---

## ✅ 代替解決策: Service Role Keyの使用

RLSをバイパスして管理者APIを実行する方法です。

### ステップ1: 環境変数を確認

`.env.local`ファイルに以下があるか確認：

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # これが必要
```

**Service Role Keyの取得方法**:
1. Supabaseダッシュボード
2. Settings → API
3. Project API keys → `service_role` (secret)
4. コピーして`.env.local`に追加

⚠️ **セキュリティ警告**: Service Role Keyは絶対に公開しないこと！

### ステップ2: APIルートを修正

すでにコードが準備されていますが、Service Role Keyを使用するように変更します。

---

## 🔧 修正案1: Service Role Keyを使用（推奨）

承認APIで管理者確認後にService Role Clientを使用します。

