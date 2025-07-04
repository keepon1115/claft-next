# 🛠️ CLAFT開発ワークフローガイド

> **重要**: このドキュメントは全ての変更作業で必ず参照し、記載されたチェックリストに従って作業を行ってください。

## 📋 変更作業の標準フロー

### 1️⃣ **作業開始前チェック**

#### プロセス状況確認
```powershell
# 現在のNode.jsプロセスを確認
tasklist /fi "imagename eq node.exe"
```
- **問題**: 複数プロセス、高メモリ使用量（100MB以上）
- **対処**: 全プロセス停止 → `taskkill /f /im node.exe`

#### 開発環境状態確認
```powershell
# 開発サーバーが起動中かチェック
curl -s http://localhost:3000 2>$null
```

### 2️⃣ **コード変更作業**

#### ファイル変更
- 必要な変更を実施
- linterエラーは即座に修正（3回ループまで）
- TypeScriptエラーに注意

### 3️⃣ **問題が発生した場合のクリーンアップ**

#### 🚨 CPU高負荷・プロセス異常時
```powershell
# 1. 全Node.jsプロセス強制終了
taskkill /f /im node.exe

# 2. プロセス停止確認
tasklist /fi "imagename eq node.exe"
```

#### 🧹 キャッシュクリア（以下の順で実行）
```powershell
# 1. Next.jsビルドキャッシュ削除
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# 2. npm キャッシュクリア
npm cache clean --force

# 3. （必要時）node_modules再インストール
Remove-Item -Recurse -Force node_modules
npm install
```

#### 🔄 開発サーバー再起動
```powershell
# クリーンな状態から起動
npm run dev
```

### 4️⃣ **動作確認**

#### 基本動作チェック
- [ ] `http://localhost:3000` - ホームページ表示
- [ ] `http://localhost:3000/profile` - プロフィールページ
- [ ] `http://localhost:3000/quest` - クエストページ  
- [ ] `http://localhost:3000/admin` - 管理画面（認証フロー含む）

#### パフォーマンスチェック
```powershell
# メモリ使用量確認（50MB以下が理想）
tasklist /fi "imagename eq node.exe"
```

### 5️⃣ **Git作業**

#### ステージング・コミット
```powershell
# 変更ファイル確認
git status

# 全変更をステージング
git add .

# 詳細なコミットメッセージでコミット
git commit -m "✨ [機能名]: [変更内容]

🎯 主要な変更:
- [変更点1]
- [変更点2]

🔧 技術的改善:
- [技術的変更点1]
- [技術的変更点2]

✅ 動作確認済み: [確認したページ/機能]"
```

## 🚨 **トラブルシューティング**

### CPU高負荷が続く場合
1. 全Node.jsプロセス停止
2. `.next`フォルダ削除
3. 必要に応じてnode_modules削除・再インストール
4. 開発サーバー再起動

### Internal Server Error
1. コンソールエラーログ確認
2. linterエラー修正
3. Supabase環境変数確認（`.env.local`）
4. キャッシュクリア後再起動

### OneDrive同期問題
- **削除推奨**: `webpack.hot-update.json`等の一時ファイル
- **対策**: プロジェクトをOneDrive外に移動検討

## 📊 **パフォーマンス基準**

### 正常な状態
- **Node.jsプロセス**: 1-2個
- **メモリ使用量**: 50MB以下/プロセス
- **起動時間**: 3秒以内
- **HMR反応時間**: 1秒以内

### 要注意状態
- **Node.jsプロセス**: 3個以上
- **メモリ使用量**: 100MB以上/プロセス
- **起動時間**: 10秒以上

## 🎯 **品質保証チェックリスト**

### 作業前
- [ ] プロセス状況確認
- [ ] 前回の変更が完全にコミット済み
- [ ] 開発サーバー正常動作確認

### 作業中
- [ ] linterエラー即座修正
- [ ] TypeScriptエラー解決
- [ ] コンソールエラーなし

### 作業後
- [ ] 全ページ動作確認
- [ ] プロセス数・メモリ使用量確認
- [ ] 詳細なコミットメッセージでコミット
- [ ] ドキュメント更新（必要時）

---

## 📝 **変更履歴**

| 日付 | 変更内容 | 担当者 |
|------|----------|--------|
| 2024-01-XX | 初回作成 | Assistant |
| | | |

---

> **🔧 開発効率化**: このワークフローに従うことで、CPU高負荷、キャッシュ問題、プロセス管理の問題を事前に防ぎ、安定した開発環境を維持できます。 