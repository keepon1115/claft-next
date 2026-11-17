# 🎮 CLAFT Next.js プロジェクト

CLAFTは学習を冒険に変える、革新的な教育プラットフォームです。

## 🚀 クイックスタート

前提:
- Node.js 18.18+ もしくは 20+（Next.js 15 対応）
- npm (推奨)

1) 依存関係インストール
```bash
npm install
```

2) 環境変数を設定
```bash
cp .env.local.example .env.local
```
`.env.local` を編集し、以下の値を設定してください：
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anonymous_key_here
```
サーバーサイド処理（管理者 API 等）で必要な場合は、`SUPABASE_SERVICE_ROLE_KEY` も設定してください。

3) 開発サーバー起動
```bash
npm run dev
```

アプリケーションは `http://localhost:3000` で起動します。

## 📁 プロジェクト構成

詳細の説明は `docs/PROJECT_STRUCTURE.md` も参照してください。以下は現在の実体ベースのツリーです。

```
claft-next/
├── app/
│  ├── admin/          # 管理者ダッシュボード（ユーザ管理・クエスト管理・生徒管理・ひらめきポスト管理・設定）
│  ├── api/            # APIルート（admin/, chat/, twilight/, test/）
│  ├── auth/           # 認証（callback, reset-password）
│  ├── chat/           # AIチャット機能
│  ├── entrepreneur/   # アントレプレナーシップ学習
│  ├── hirameki-post/  # ひらめきポスト投稿機能
│  ├── magazine/       # マガジン記事（kissa_zeroichi, recycling）
│  ├── messages/       # メッセージ機能
│  ├── minecraft-sdgs/ # Minecraft×SDGs学習
│  ├── mirai/          # ミライクラフト（企画・発表会）
│  ├── pbl/            # PBL（プロジェクト型学習）
│  ├── profile/        # プロフィール管理
│  ├── quest/          # クエストマップ
│  ├── twilight/       # トワイライト（放課後ルーム）
│  ├── unauthorized/   # 認可エラーページ
│  ├── yononaka/       # ヨノナカ（正解のない問いの共有）
│  ├── app-layout.tsx, layout.tsx, providers.tsx, page.tsx
│  ├── error.tsx, global-error.tsx, not-found.tsx
│  ├── globals.css, favicon.ico
│  ├── opengraph-image.tsx, robots.ts, sitemap.ts
├── components/
│  ├── admin/          # 管理者UI（ApprovalTable, FilterSection, DynamicAdminDashboard, students/）
│  ├── auth/           # 認証UI（AuthButton, AuthModal, DynamicAuthModal, PasswordResetModal）
│  ├── common/         # 共通UI（Sidebar, Header, NotificationSystem, LevelUpModal, PWAInstallPrompt,
│  │                   #         PerformanceMonitor, StepFlow, BackgroundAnimations, DynamicLoader 他）
│  ├── home/           # ホーム画面（ProfileCard, CraftStory, JibunCraft, HowToModal, TutorialGuide,
│  │                   #             ProfileNudge, HomePageInteractions 他）
│  ├── minecraft-sdgs/ # Minecraft SDGs UI（MinecraftMap, MinecraftStageModal, WorldDataModal 他）
│  ├── profile/        # プロフィールUI（AccountSettings）
│  ├── quest/          # クエストUI（QuestMap, StageModal, CategoryBlock, CategoryModal,
│  │                   #             MediaPlayerModal, JibunMediaLibrary, UnlockAnimation 他）
│  ├── twilight/       # トワイライトUI（TwilightRoom）
│  └── yononaka/       # ヨノナカUI（UserProfileModal）
├── data/
│  ├── import/         # CSVインポートデータ（生徒一括登録用）
│  ├── media/          # メディアライブラリ定義（items, library, assignments, taxonomies）
│  └── quests/         # クエスト定義（1-6/, 7-12/）
├── hooks/             # カスタムフック
│  ├── useAuth, useAdventurerList, useCategorySystem, useMediaQuery,
│  ├── usePWA, useRealtimeUpdates, useToast, useUserGoals
├── lib/
│  ├── api/            # APIクライアント（quests, minecraft-sdgs, messages）
│  ├── supabase/       # Supabaseクライアント（client, hooks）
│  └── utils/          # ユーティリティ（imageUtils, performance, seo）
├── stores/            # Zustand状態管理
│  ├── authStore, userStore, questStore, minecraftSdgsStore, tutorialStore
│  └── quest/          # クエスト関連ストア拡張（types）
├── types/             # TypeScript型定義
│  ├── category, database, index, media, message, quest, student, user
├── supabase/
│  └── migrations/     # DBマイグレーション（students_tables, admin_users_rls）
├── docs/              # ドキュメント群
├── public/            # 静的ファイル（アイコン, OGP画像, manifest.json, SW, assets/）
├── scripts/           # 運用スクリプト（health-check, init-user-stats, import-students, performance-audit）
├── next.config.ts, tsconfig.json, tailwind.config.js, postcss.config.mjs, eslint.config.mjs
├── package.json, package-lock.json, next-env.d.ts
└── README.md
```

## 🛠️ 技術スタック

| カテゴリ | 技術 |
|---------|------|
| **フレームワーク** | Next.js 15 (App Router) |
| **言語** | TypeScript |
| **スタイリング** | Tailwind CSS 3 |
| **状態管理** | Zustand 5 + Immer |
| **データベース** | Supabase (PostgreSQL + RLS) |
| **認証** | Supabase Auth (`@supabase/ssr`) |
| **AI連携** | Google Generative AI (`@google/generative-ai`), Anthropic Claude (`@anthropic-ai/sdk`) |
| **フォーム** | React Hook Form + Zod バリデーション |
| **アニメーション** | Framer Motion |
| **テーマ** | next-themes（ダークモード対応） |
| **PWA** | next-pwa + Workbox |
| **アナリティクス** | Vercel Analytics + Speed Insights |
| **パフォーマンス計測** | web-vitals, Lighthouse |
| **アイコン** | Lucide React |
| **演出** | canvas-confetti |

## 🎯 主要機能

- **🗺️ クエストマップ**: カテゴリ別学習進捗を視覚的に表示。ステージクリアでレベルアップ
- **👤 プロフィール管理**: ユーザーの学習データ・アバター・目標管理
- **😆 ヨノナカ**: 正解が一つでない問いに対して自分の意見を共有する時間
- **🌍 ミライクラフト**: 「やってみたい」を形にする企画・発表会
- **🤝 アントレプレナー**: アントレプレナーシップを学び、実際の活動を紹介
- **⛏️ Minecraft×SDGs**: Minecraftの世界を通じてSDGsを学ぶ学習コンテンツ
- **🤖 AIチャット**: Google Gemini / Anthropic Claude を活用した学習支援チャット
- **💡 ひらめきポスト**: アイデアや気づきを投稿・共有する掲示板
- **📰 マガジン**: 生徒による記事コンテンツの作成・公開
- **💬 メッセージ**: ユーザー間のメッセージング機能
- **📋 PBL**: プロジェクト型学習ページ
- **🌙 トワイライト**: 放課後のリアルタイム交流ルーム
- **🔐 認証システム**: Supabaseベースのセキュアな認証（パスワードリセット対応）
- **📱 PWA対応**: オフライン対応とアプリライクな体験
- **⚡ パフォーマンス最適化**: 動的インポート、コード分割、画像最適化
- **🎞️ メディアライブラリ**: 学習素材の検索・閲覧・再生
- **👨‍💼 管理者ダッシュボード**: ユーザー管理、クエスト承認、生徒一括登録、ひらめきポスト管理、各種設定

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

# Lint
npm run lint

# 初期ユーザ統計の作成（必要時）
npm run init:user-stats

# 生徒一括インポート（CSVから）
npm run import:students

# バンドル分析（ビルドサイズ可視化）
npm run analyze            # 環境変数 ANALYZE=true で build 実行
npm run bundle-analyzer    # @next/bundle-analyzer の起動

# パフォーマンス計測（Lighthouse）
npm run lighthouse         # 既存サーバに対して実行
npm run perf:dev           # dev 起動後に自動計測
npm run perf:build         # build/start 後に自動計測

# ヘルスチェック（簡易）
node scripts/health-check.js
```

> **Note**: `perf:dev` と `perf:build` は bash の `sleep` を使用します。Windows の場合は Git Bash 等で実行するか、手動で `npm run dev` / `npm run build && npm run start` を起動後に `npm run lighthouse` を実行してください。

## 📚 ドキュメント

### 基本ガイド
- [プロジェクト構成](./docs/PROJECT_STRUCTURE.md) - ディレクトリ構成の詳細
- [開発ワークフロー](./docs/Development-Workflow-Guide.md) - 開発の進め方
- [パフォーマンス最適化](./docs/Performance-Optimization-Guide.md) - 最適化手法
- [PWA設定](./docs/PWA-Setup.md) - PWA機能の設定
- [SEO実装](./docs/SEO-Implementation-Guide.md) - SEO対策

### 管理者向け
- [Admin 機能運用ガイド](./docs/Admin-Operations-Manual.md) - 管理機能の運用手順
- [Admin ユーザガイド](./docs/Admin-User-Manual.md) - 管理画面の使い方

### 機能別ガイド
- [カテゴリブロック実装](./docs/Category-Block-Implementation.md) - クエストカテゴリ機能の設計
- [画像最適化](./docs/Image-Optimization-Guide.md) - 画像の最適化手法
- [動的 import 最適化](./docs/Dynamic-Import-Bundle-Optimization.md) - バンドル最適化
- [アバターアップロード セットアップ](./docs/Avatar-Upload-Setup.md) / [トラブルシュート](./docs/Avatar-Upload-Troubleshooting.md)

### 運用・デプロイ
- [本番移行ガイド](./docs/Production-Migration-Guide.md) - 本番環境への移行手順
- [障害対応ガイド](./docs/Emergency-Recovery-Guide.md) - 緊急時の復旧手順

### Minecraft SDGs 関連
- [承認フロー修正](./docs/MINECRAFT_SDGS_APPROVAL_FIX.md)
- [RLS 設定](./docs/MINECRAFT_SDGS_RLS_COMPLETE_SETUP.md)
- [デバッグクエリ](./docs/MINECRAFT_SDGS_DEBUG_QUERIES.sql)

## 🔄 バックアップ・同期設定

### 除外すべきフォルダ（自動生成される）
```
node_modules/          # 依存関係
.next/                 # Next.jsビルドキャッシュ
.git/                  # Gitデータ
public/sw.js           # PWA 生成物（next-pwaにより再生成）
public/workbox-*.js    # PWA 生成物（next-pwaにより再生成）
```

### バックアップ対象（重要なソースコード）
```
app/             # アプリケーションコード
components/      # UIコンポーネント
hooks/           # カスタムフック
lib/             # ライブラリコード
stores/          # 状態管理
types/           # TypeScript型定義
data/            # クエスト定義・メディア定義
supabase/        # マイグレーション
docs/            # ドキュメント
scripts/         # 運用スクリプト
public/          # 静的ファイル（SW除く）
package.json     # 依存関係設定
next.config.ts   # Next.js設定（PWA含む）
```

## 🚀 デプロイ

### Vercel（推奨）
1. Vercelアカウントにログイン
2. GitHubリポジトリを接続
3. 環境変数を設定（下記参照）
4. 自動デプロイが開始されます

### 環境変数
`.env.local.example` をコピーして `.env.local` を作成し、以下を設定してください：
```
# 必須
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anonymous_key_here

# サーバーサイド処理で必要な場合
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# AI連携（チャット機能で使用）
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
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
- [Framer Motion](https://www.framer.com/motion/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

---

*最終更新: 2026年5月*