# CLAFT アバター画像アップロード機能セットアップガイド

## 概要

CLAFTプロジェクトに、ユーザーがプロフィール画像をアップロードできる機能を実装しました。この機能により、ユーザーは個性的なアバター画像を設定し、ホーム画面で表示することができます。

## 実装済み機能

### ✅ 完了済み機能

1. **プロフィール編集画面でのアバター画像アップロード**
   - ファイル選択UI
   - 画像プレビュー機能
   - ファイル形式・サイズチェック
   - アップロード進行状況表示

2. **Supabase Storageとの連携**
   - `user-avatars`バケットへの画像アップロード
   - パブリックURL生成
   - 画像の最適化とキャッシュ設定

3. **ホーム画面でのアバター表示**
   - アップロード済み画像の表示
   - フォールバック（デフォルトアイコン）機能
   - 画像読み込みエラー時の自動切り替え

4. **キャッシュとパフォーマンス最適化**
   - PWAキャッシュ設定
   - Next.js画像最適化
   - ユーザーストアでの状態管理とリフレッシュ

## Supabase Storageの設定

### 必要なバケット作成

Supabaseダッシュボードで以下のバケットを作成してください：

```sql
-- Storage bucketの作成
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-avatars', 'user-avatars', true);
```

### バケットポリシーの設定

以下のRLSポリシーを`user-avatars`バケットに適用してください：

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

### データベーステーブルの更新

`users_profile`テーブルに`avatar_url`カラムが必要です：

```sql
-- avatar_urlカラムの追加（まだ存在しない場合）
ALTER TABLE users_profile 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- インデックスの作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_users_profile_avatar_url 
ON users_profile(avatar_url);
```

## 技術仕様

### 対応ファイル形式
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

### ファイルサイズ制限
- 最大5MB

### 画像最適化
- Next.js Image最適化による自動WebP/AVIF変換
- デバイスサイズに応じたレスポンシブ配信
- PWAキャッシュによる高速読み込み

### ファイル命名規則
```
{userId}/avatar-{timestamp}.{extension}
```

**変更理由**: RLSポリシーがパスの最初の部分をユーザーIDとして認識するため、ユーザーIDをディレクトリ名として使用します。

## 使用方法

### プロフィール画像のアップロード

1. プロフィール編集ページ（`/profile`）にアクセス
2. 「基本情報」タブを選択
3. 「アバター画像」セクションで「画像を選択」ボタンをクリック
4. 対応形式の画像ファイルを選択
5. プレビューを確認後、「プロフィールを保存する」ボタンをクリック

### ホーム画面での表示確認

1. ホーム画面（`/`）にアクセス
2. プロフィールカードにアップロードした画像が表示される
3. 画像が読み込めない場合はデフォルトアイコンが表示される

## ファイル構造

### 追加・修正されたファイル

```
app/profile/page.tsx          # アバターアップロード機能追加
components/home/ProfileCard.tsx   # アバター表示機能追加
stores/userStore.ts           # プロフィールリフレッシュ機能追加
app/globals.css              # アバター画像用CSS追加
next.config.ts               # 画像最適化・キャッシュ設定追加
docs/Avatar-Upload-Setup.md  # このセットアップガイド
```

### 主要な新機能コンポーネント

1. **アバターアップロードコンポーネント**
   - ファイル選択とプレビュー
   - バリデーション（形式・サイズ）
   - アップロード進行状況表示

2. **アバター表示コンポーネント**
   - 画像表示とフォールバック
   - エラーハンドリング
   - レスポンシブ対応

## トラブルシューティング

### よくある問題と解決方法

1. **画像がアップロードされない**
   - Supabase Storageの`user-avatars`バケットが作成されているか確認
   - RLSポリシーが正しく設定されているか確認
   - ファイル形式とサイズが要件を満たしているか確認

2. **画像が表示されない**
   - `next.config.ts`の`remotePatterns`設定を確認
   - SupabaseプロジェクトURLが正しく設定されているか確認
   - ブラウザの開発者ツールでネットワークエラーを確認

3. **パフォーマンスが遅い**
   - PWAキャッシュが有効になっているか確認
   - Next.js画像最適化が機能しているか確認
   - SupabaseのCDN設定を確認

### デバッグ方法

```javascript
// ブラウザのコンソールでデバッグ情報を確認
console.log('Profile Data:', useUserStore.getState().profileData);
console.log('Avatar URL:', useUserStore.getState().profileData.avatarUrl);

// Supabase Storageのテスト
const { data, error } = await supabase.storage
  .from('user-avatars')
  .list('avatars/', { limit: 10 });
console.log('Storage files:', data, error);
```

## パフォーマンス指標

### 期待される改善

- **初回画像読み込み**: 2-3秒
- **キャッシュ後の読み込み**: 200-500ms
- **アップロード時間（1MB画像）**: 3-5秒
- **プレビュー表示**: 100ms以内

### 最適化ポイント

1. **画像圧縮**: アップロード前のクライアント側圧縮
2. **CDN活用**: Supabase CDNによる高速配信
3. **プリロード**: 重要な画像の事前読み込み
4. **遅延読み込み**: スクロール位置に応じた読み込み

## セキュリティ考慮事項

### 実装済みセキュリティ対策

1. **ファイル形式検証**: MIME typeチェック
2. **サイズ制限**: 5MB上限
3. **RLSポリシー**: ユーザー別アクセス制御
4. **パブリックアクセス**: 読み取り専用での安全な公開

### 追加推奨対策

1. **ウイルススキャン**: ファイルアップロード時のマルウェアチェック
2. **画像検閲**: 不適切コンテンツの自動検出
3. **レート制限**: アップロード頻度の制限
4. **ログ監視**: 不正アクセスの検出

## 今後の拡張予定

### Phase 2: 画像編集機能
- クロップ・リサイズ機能
- フィルター・エフェクト
- 複数画像サポート

### Phase 3: ソーシャル機能
- 画像共有機能
- いいね・コメント機能
- ギャラリー表示

### Phase 4: AI活用
- 自動顔認識・美化
- スタイル変換
- 背景除去・合成

---

このガイドに従って設定することで、CLAFT プロジェクトでアバター画像アップロード機能を完全に利用できるようになります。
