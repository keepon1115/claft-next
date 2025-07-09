# 管理画面運用マニュアル

## 🎯 概要

このマニュアルは、Claft-Next管理画面の日常運用、トラブルシューティング、メンテナンスについての包括的なガイドです。

## 📋 目次

1. [緊急対応手順](#緊急対応手順)
2. [定期メンテナンス](#定期メンテナンス)
3. [トラブルシューティング](#トラブルシューティング)
4. [監視・アラート](#監視アラート)
5. [バックアップ・復旧](#バックアップ復旧)

---

## 🚨 緊急対応手順

### Level 1: 即座対応（5分以内）

#### 🔴 ログインができない場合

```bash
# 1. 基本チェック
netstat -an | findstr :3000  # サーバー起動確認
Get-Content .env.local        # 環境変数確認

# 2. 健全性チェック実行
node scripts/health-check.js

# 3. サーバー再起動
taskkill /f /im node.exe
npx next dev
```

#### 🔴 管理画面が表示されない場合

```bash
# 1. キャッシュクリア
Remove-Item -Path .next -Recurse -Force
npm run dev

# 2. ブラウザキャッシュクリア
# Chrome: Ctrl+Shift+R (ハードリフレッシュ)
# または シークレットモードでテスト
```

#### 🔴 データベース接続エラー

```bash
# 1. Supabase接続テスト
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
supabase.auth.getSession().then(r => console.log('OK:', !r.error)).catch(e => console.log('ERROR:', e));
"

# 2. 環境変数再確認
echo $env:NEXT_PUBLIC_SUPABASE_URL
echo $env:NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Level 2: 計画対応（30分以内）

#### 🟡 パフォーマンス問題

1. **メモリ使用量確認**
   ```bash
   Get-Process -Name node | Format-Table ProcessName,Id,CPU,WorkingSet
   ```

2. **コンソールエラーチェック**
   - ブラウザ開発者ツール → Console
   - 無限ループエラーの確認
   - ネットワークエラーの確認

3. **依存関係の再インストール**
   ```bash
   Remove-Item -Path node_modules -Recurse -Force
   npm install
   ```

---

## 🔄 定期メンテナンス

### 日次チェック（5分）

```bash
# 健全性チェック実行
node scripts/health-check.js

# ログファイル確認（開発環境）
# - コンソールエラーの有無
# - パフォーマンス警告の有無
```

### 週次メンテナンス（30分）

1. **依存関係の更新確認**
   ```bash
   npm audit
   npm outdated
   ```

2. **バックアップの確認**
   - `.env.local` の存在確認
   - 重要設定ファイルの確認

3. **パフォーマンス確認**
   ```bash
   node scripts/performance-audit.js
   ```

### 月次メンテナンス（2時間）

1. **セキュリティ更新**
   ```bash
   npm audit fix
   npm update
   ```

2. **データベースメンテナンス**
   - 不要データの削除
   - インデックスの最適化

3. **ドキュメント更新**
   - 設定変更の記録
   - 既知の問題の更新

---

## 🔍 トラブルシューティング

### 問題分類マトリックス

| 症状 | 原因候補 | 確認方法 | 解決方法 |
|------|----------|----------|----------|
| **ログイン400エラー** | 環境変数/Supabase設定 | health-check.js | 環境変数再設定 |
| **無限ループエラー** | useEffect依存配列 | Console確認 | 依存配列修正 |
| **データベースJOINエラー** | RLS/外部キー | Supabase logs | クエリ修正 |
| **500 Internal Error** | ビルドキャッシュ | .next確認 | キャッシュクリア |

### 詳細診断手順

#### 1. 認証問題の診断

```bash
# Step 1: 環境変数確認
echo "URL: $env:NEXT_PUBLIC_SUPABASE_URL"
echo "KEY: $env:NEXT_PUBLIC_SUPABASE_ANON_KEY"

# Step 2: Supabase接続テスト
node -e "console.log('Testing...'); require('@supabase/supabase-js').createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).auth.getSession().then(r => console.log('Auth OK:', !r.error))"

# Step 3: ブラウザでの詳細ログ確認
# コンソールで以下を確認:
# - 🔧 ログイン開始
# - 🔧 Supabase認証開始  
# - 🔧 Supabase認証レスポンス
```

#### 2. データベース問題の診断

```bash
# RLSポリシーの確認
# Supabaseダッシュボード → Authentication → Policies

# テーブル関係の確認
# Supabaseダッシュボード → Database → Schema
```

### エラーコード別対応

| エラーコード | 意味 | 対応方法 |
|--------------|------|----------|
| `400` | Bad Request | 送信データ確認、環境変数確認 |
| `401` | Unauthorized | 認証情報確認、セッション確認 |
| `403` | Forbidden | 権限確認、RLSポリシー確認 |
| `500` | Internal Server Error | サーバーログ確認、キャッシュクリア |

---

## 📊 監視・アラート

### 自動監視の設定

1. **健全性チェックの定期実行**
   ```bash
   # タスクスケジューラーで定期実行
   # 毎時間: node scripts/health-check.js
   ```

2. **ログ監視**
   - コンソールエラーの検出
   - パフォーマンス劣化の検出

### アラート基準

| レベル | 条件 | 通知方法 | 対応時間 |
|--------|------|----------|----------|
| **Critical** | ログイン不可、500エラー | 即座 | 5分以内 |
| **Warning** | パフォーマンス劣化 | 1時間以内 | 24時間以内 |
| **Info** | 設定変更、更新 | 日次レポート | - |

---

## 💾 バックアップ・復旧

### 重要ファイルのバックアップ

**毎日バックアップ:**
- `.env.local` - 環境変数
- `package.json` - 依存関係

**毎週バックアップ:**
- プロジェクト全体（node_modules除く）
- 設定ファイル

### 復旧手順

#### 1. 緊急復旧（新環境）

```bash
# 1. プロジェクトクローン
git clone <repository>
cd claft-next

# 2. 依存関係インストール
npm install

# 3. 環境変数設定
# .env.local を作成して設定

# 4. 起動確認
npm run dev
node scripts/health-check.js
```

#### 2. 設定復旧

```bash
# 1. 環境変数の復旧
cp backup/.env.local .env.local

# 2. キャッシュクリア
Remove-Item -Path .next -Recurse -Force

# 3. 依存関係再インストール
Remove-Item -Path node_modules -Recurse -Force
npm install

# 4. 起動
npm run dev
```

---

## 📞 サポート・エスカレーション

### 連絡先・リソース

- **Supabaseサポート**: https://supabase.com/support
- **Next.jsドキュメント**: https://nextjs.org/docs
- **プロジェクトリポジトリ**: [Git Repository URL]

### エスカレーション基準

1. **30分で解決できない問題** → 外部サポート検討
2. **データ破損の可能性** → 即座にバックアップ確認
3. **セキュリティインシデント** → Supabaseサポートに連絡

---

## 📝 変更管理

### 設定変更の記録

全ての設定変更は以下の形式で記録：

```
日時: YYYY-MM-DD HH:MM
変更者: [Name]
対象: [File/System]
変更内容: [Description]
影響: [Impact]
テスト: [Test Results]
```

### Git管理

```bash
# 変更のコミット
git add .
git commit -m "fix: [問題の説明] - [解決方法]"

# 重要な変更はタグ付け
git tag -a v1.0.1 -m "管理画面ログイン問題修正"
```

---

## 🎯 最終確認チェックリスト

### 作業完了時の確認

- [ ] 管理画面にログインできる
- [ ] 承認待ちクエストが表示される
- [ ] 承認履歴が表示される
- [ ] コンソールエラーがない
- [ ] パフォーマンスが正常
- [ ] 変更がGitにコミットされている
- [ ] ドキュメントが更新されている

### 定期確認項目

- [ ] 健全性チェックが通る
- [ ] バックアップが最新
- [ ] セキュリティ更新が適用済み
- [ ] 監視が正常動作している 