# アバター画像アップロード トラブルシューティング

## 問題の症状

プロフィール編集ページでアバター画像をアップロードしても、"アップロード中..." の状態で固まり、画像が反映されない。

## 原因

1. **Supabase環境変数が未設定**: `.env.local`ファイルが存在しないか、正しい値が設定されていない
2. **Supabaseストレージバケットが未作成**: `user-avatars`バケットが作成されていない
3. **RLSポリシーが未設定**: 適切な権限設定がされていない

## 解決方法

### 1. 環境変数の設定

プロジェクトルートに`.env.local`ファイルを作成し、以下の内容を追加：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Supabaseストレージバケットの作成

Supabaseダッシュボードで以下のSQLを実行：

```sql
-- Storage bucketの作成
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-avatars', 'user-avatars', true);
```

### 3. RLSポリシーの設定

```sql
-- ユーザーが自分のアバターをアップロードできるポリシー
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ユーザーが自分のアバターを更新できるポリシー
CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'user-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 誰でもアバター画像を閲覧できるポリシー
CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'user-avatars');
```

### 4. データベーステーブルの更新

```sql
-- avatar_urlカラムの追加（まだ存在しない場合）
ALTER TABLE users_profile 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;
```

## 開発モードでの動作

環境変数が設定されていない場合、アプリケーションは開発モックモードで動作します：

- ✅ アバター画像の選択とプレビューは動作
- ✅ モックURLでの保存処理は成功
- ❌ 実際の画像アップロードは実行されない
- ❌ ホーム画面での画像表示は動作しない

## 確認方法

### ブラウザのコンソールログ

正常に動作している場合：
```
✅ アバター画像アップロード完了: https://your-project.supabase.co/storage/v1/object/public/user-avatars/avatars/avatar-user-id-timestamp.jpg
✅ プロフィール保存完了
✅ アバター画像読み込み成功: https://...
```

モックモードの場合：
```
🔧 開発モック: ストレージアップロードをシミュレーション
🔧 開発モック: モックURLを生成: https://mock.supabase.co/storage/v1/object/public/user-avatars/avatars/avatar-user-id-timestamp.jpg
```

### ネットワークタブ

- Supabaseストレージへのリクエストが送信されているか確認
- エラーレスポンスの内容を確認

## よくある問題

1. **CORS エラー**: Supabaseプロジェクトの設定でドメインを許可しているか確認
2. **認証エラー**: ユーザーが正しくログインしているか確認
3. **権限エラー**: RLSポリシーが正しく設定されているか確認
4. **バケット名の違い**: コード内のバケット名(`user-avatars`)が一致しているか確認

## サポート

問題が解決しない場合は、以下の情報と共にお問い合わせください：

1. ブラウザのコンソールログ
2. ネットワークタブのエラー詳細
3. Supabaseプロジェクトの設定状況
4. 使用している画像ファイルの詳細（サイズ、形式など）
