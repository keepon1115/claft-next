# 🎮 CLAFT Next.js プロジェクト

CLAFTは学習を冒険に変える、革新的な教育プラットフォームです。

## 🚀 クイックスタート

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev
```

アプリケーションは http://localhost:3000 で起動します。

## 📁 プロジェクト構成

詳細なディレクトリ構成については、[PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md) をご覧ください。

```
claft-next/
├── app/                   # Next.js App Router (ページ・API)
├── components/            # 再利用可能なUIコンポーネント
├── hooks/                 # カスタムReactフック
├── lib/                   # ライブラリとユーティリティ
├── stores/                # 状態管理 (Zustand)
├── types/                 # TypeScript型定義
├── docs/                  # ドキュメント・ガイド
├── public/                # 静的ファイル
└── reference/             # 参考資料
```

## 🛠️ 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **状態管理**: Zustand + Immer + Persist
- **データベース**: Supabase
- **認証**: Supabase Auth
- **PWA**: next-pwa
- **アイコン**: Lucide React

## 🎯 主要機能

- **🗺️ クエストマップ**: 学習進捗を視覚的に表示
- **👤 プロフィール管理**: ユーザーの学習データ管理
- **😆 Yononaka**: 正解が一つでない問いに対して自分の意見を共有する時間
- **🌍 ミライクラフト**: 「やってみたい」を形にする企画・発表会
- **🤝 アントレプレナー**: アントレプレナーシップを学び、実際の活動を紹介
- **🔐 認証システム**: Supabaseベースのセキュアな認証
- **📱 PWA対応**: オフライン対応とアプリライクな体験
- **⚡ パフォーマンス最適化**: 動的インポートとコード分割

## 🛠️ 開発コマンド

```bash
# 依存関係インストール
npm install

# 開発サーバー
npm run dev

# プロダクションビルド  
npm run build

# プロダクション起動
npm run start

# 型チェック
npm run type-check

# Linting
npm run lint
```

## 📚 ドキュメント

- [プロジェクト構成](./docs/PROJECT_STRUCTURE.md) - ディレクトリ構成の詳細
- [開発ワークフロー](./docs/Development-Workflow-Guide.md) - 開発の進め方
- [パフォーマンス最適化](./docs/Performance-Optimization-Guide.md) - 最適化手法
- [PWA設定](./docs/PWA-Setup.md) - PWA機能の設定
- [SEO実装](./docs/SEO-Implementation-Guide.md) - SEO対策

## 🔄 バックアップ・同期設定

### 除外すべきフォルダ（自動生成される）
```
node_modules/     # 依存関係（59,000+ファイル）
.next/           # Next.jsビルドキャッシュ
.git/            # Gitデータ
```

### バックアップ対象（重要なソースコード）
```
app/             # アプリケーションコード
components/      # UIコンポーネント
hooks/           # カスタムフック
lib/             # ライブラリコード
stores/          # 状態管理
types/           # TypeScript型定義
docs/            # ドキュメント
public/          # 静的ファイル
package.json     # 依存関係設定
```

## 🚀 デプロイ

### Vercel（推奨）
1. Vercelアカウントにログイン
2. GitHubリポジトリを接続
3. 自動デプロイが開始されます

### 環境変数
以下の環境変数を設定してください：
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチをプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 🔗 関連リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)