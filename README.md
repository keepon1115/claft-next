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

2) 環境変数を設定（`.env.local`）
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3) 開発サーバー起動
```bash
npm run dev
```

アプリケーションは `http://localhost:3000` で起動します。

## 📁 プロジェクト構成（現状）

詳細の説明は `docs/PROJECT_STRUCTURE.md` も参照してください。以下は現在の実体ベースのツリーです。

```
claft-next/
├── app/
│  ├── admin/ (actions.ts, AdminDashboard.tsx, page.tsx, quests/, settings/, users/)
│  ├── api/test/ (route.ts)
│  ├── auth/callback/page.tsx, auth/reset-password/page.tsx
│  ├── entrepreneur/page.tsx
│  ├── minecraft-sdgs/(loading.tsx, page.tsx)
│  ├── mirai/page.tsx, profile/page.tsx, quest/(loading.tsx, page.tsx), unauthorized/page.tsx, yononaka/page.tsx
│  ├── app-layout.tsx, error.tsx, global-error.tsx, globals.css, layout.tsx, not-found.tsx,
│  ├── opengraph-image.tsx, page.tsx, providers.tsx, robots.ts, sitemap.ts, favicon.ico
├── components/
│  ├── admin/(ApprovalTable.tsx, DynamicAdminDashboard.tsx, FilterSection.tsx)
│  ├── auth/(AuthButton.tsx, AuthModal.tsx, DynamicAuthModal.tsx, PasswordResetModal.tsx)
│  ├── common/(AnimationProvider.tsx, BackgroundAnimations.tsx, DynamicLoader.tsx, HamburgerMenu.tsx,
│  │           Header.tsx, InAppBrowserModal.tsx, LevelUpModal.tsx, LockedContent.tsx, NotificationSystem.tsx,
│  │           OptimizedImage.tsx, PerformanceMonitor.tsx, PWAInstallPrompt.tsx, Sidebar.tsx)
│  ├── home/(CraftStory.tsx, DynamicProfileCard.tsx, HomePageInteractions.tsx, HowToModal.tsx, JibunCraft.tsx, ProfileCard.tsx)
│  ├── minecraft-sdgs/(DynamicStageModal.tsx, LoginPromptModal.tsx, MinecraftAnimations.tsx, MinecraftMap.tsx,
│  │                   MinecraftStageModal.tsx, MinecraftStageNode.tsx, WorldDataModal.tsx)
│  ├── profile/AccountSettings.tsx
│  └── quest/(QuestMap.tsx, StageModal.tsx, UnlockAnimation.tsx, 他)
├── data/
│  ├── quests/(1-6/*.ts, 7-12/*.ts)
│  └── media/items.ts
├── hooks/(useAdventurerList.ts, useAuth.ts, useCategorySystem.ts, useMediaQuery.ts, usePWA.ts, useRealtimeUpdates.ts, useToast.ts, useUserGoals.ts)
├── lib/
│  ├── api/(minecraft-sdgs.ts, quests.ts)
│  ├── supabase/(client.ts, hooks.ts)
│  └── utils/(imageUtils.ts, performance.ts, seo.ts)
├── stores/(authStore.ts, minecraftSdgsStore.ts, questStore.ts, userStore.ts, quest/*.ts)
├── types/(category.ts, database.ts, index.ts, media.ts, quest.ts, user.ts)
├── docs/(各種ガイド, examples/*.md, PROJECT_STRUCTURE.md)
├── public/(images/*.png, manifest.json, robots.txt, sw.js, workbox-*.js, アイコン類)
├── scripts/(health-check.js, init-user-stats.js, performance-audit.js)
├── next.config.ts, tsconfig.json, tailwind.config.js, postcss.config.mjs, eslint.config.mjs
├── package.json, package-lock.json, next-env.d.ts
└── README.md
```

## 🛠️ 技術スタック（現状）

- **フレームワーク**: Next.js 15 (App Router) + next-pwa
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **状態管理**: Zustand + Immer + Persist
- **データベース**: Supabase
- **認証**: Supabase Auth
- **PWA**: next-pwa + Workbox
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
- **🎞️ メディアライブラリ**: 学習素材の検索・閲覧・再生（拡張中）

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

注: `perf:dev` と `perf:build` は bash の `sleep` を使用します。Windows の場合は Git Bash 等で実行するか、手動で `npm run dev` / `npm run build && npm run start` を起動後に `npm run lighthouse` を実行してください。

## 📚 ドキュメント

- [プロジェクト構成](./docs/PROJECT_STRUCTURE.md) - ディレクトリ構成の詳細
- [開発ワークフロー](./docs/Development-Workflow-Guide.md) - 開発の進め方
- [パフォーマンス最適化](./docs/Performance-Optimization-Guide.md) - 最適化手法
- [PWA設定](./docs/PWA-Setup.md) - PWA機能の設定
- [SEO実装](./docs/SEO-Implementation-Guide.md) - SEO対策
-
- 管理者向け: [Admin 機能運用ガイド](./docs/Admin-Operations-Manual.md), [Admin ユーザガイド](./docs/Admin-User-Manual.md)
- 画像最適化: [Image Optimization Guide](./docs/Image-Optimization-Guide.md)
- 動的 import 最適化: [Dynamic Import Bundle Optimization](./docs/Dynamic-Import-Bundle-Optimization.md)
- アバターアップロード: [セットアップ](./docs/Avatar-Upload-Setup.md), [トラブルシュート](./docs/Avatar-Upload-Troubleshooting.md)
- 本番移行: [Production Migration Guide](./docs/Production-Migration-Guide.md)
- 障害対応: [Emergency Recovery Guide](./docs/Emergency-Recovery-Guide.md)

## 🔄 バックアップ・同期設定

### 除外すべきフォルダ（自動生成される）
```
node_modules/     # 依存関係（59,000+ファイル）
.next/           # Next.jsビルドキャッシュ
.git/            # Gitデータ
workbox-*.js     # PWA ビルド成果物（public/ 配下）
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
next.config.ts   # Next.js設定（PWA含む）
```

## 🚀 デプロイ

### Vercel（推奨）
1. Vercelアカウントにログイン
2. GitHubリポジトリを接続
3. 自動デプロイが開始されます

### 環境変数
`.env.local` に以下を設定してください：
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🧹 整理メモ（2025-09 現在）

- `reference/` はアプリ本体からの参照が見つからず、削除候補です（docs/ と README 以外からの参照なし）。
- `public/` 直下の `next.svg`, `vercel.svg`, `window.svg`, `globe.svg`, `file.svg`, `fallback-*.js` はコード参照が見当たらず、未使用の可能性が高いです。必要に応じて削除してください。
- `public/sw.js` と `public/workbox-*.js` は next-pwa による生成物です。ビルドごとに再生成されます。

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