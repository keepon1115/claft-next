# CLAFT Next.js プロジェクト構成

## 📁 ディレクトリ構成

```
claft-next/
├── app/                        # Next.js 14 App Router
│   ├── admin/                  # 管理者画面
│   │   ├── actions.ts          # サーバーアクション
│   │   ├── AdminDashboard.tsx  # ダッシュボード
│   │   ├── page.tsx           # 管理者ホーム
│   │   ├── quests/            # クエスト管理
│   │   ├── settings/          # 設定管理
│   │   └── users/             # ユーザー管理
│   ├── api/                   # API Routes
│   │   └── test/              # テスト用API
│   ├── entrepreneur/          # 起業家ページ
│   ├── minecraft-sdgs/        # Minecraft SDGsページ
│   ├── mirai/                 # 未来ページ
│   ├── profile/               # プロフィールページ
│   ├── quest/                 # クエストページ
│   ├── unauthorized/          # 未認証ページ
│   ├── yononaka/             # 世の中ページ
│   ├── app-layout.tsx        # アプリレイアウト
│   ├── error.tsx             # エラーページ
│   ├── global-error.tsx      # グローバルエラー
│   ├── globals.css           # グローバルスタイル
│   ├── layout.tsx            # ルートレイアウト
│   ├── not-found.tsx         # 404ページ
│   ├── opengraph-image.tsx   # OG画像生成
│   ├── page.tsx              # ホームページ
│   ├── providers.tsx         # プロバイダー設定
│   ├── robots.ts             # robots.txt生成
│   └── sitemap.ts            # サイトマップ生成
│
├── components/                # Reactコンポーネント
│   ├── admin/                 # 管理者用コンポーネント
│   │   ├── ApprovalTable.tsx
│   │   ├── FilterSection.tsx
│   │   └── DynamicAdminDashboard.tsx
│   ├── auth/                  # 認証関連コンポーネント
│   │   ├── AuthButton.tsx
│   │   ├── AuthModal.tsx
│   │   └── DynamicAuthModal.tsx
│   ├── common/                # 共通コンポーネント
│   │   ├── AnimationProvider.tsx
│   │   ├── BackgroundAnimations.tsx
│   │   ├── DynamicLoader.tsx
│   │   ├── HamburgerMenu.tsx
│   │   ├── Header.tsx
│   │   ├── LevelUpModal.tsx
│   │   ├── LockedContent.tsx
│   │   ├── NotificationSystem.tsx
│   │   ├── OptimizedImage.tsx
│   │   ├── PerformanceMonitor.tsx
│   │   ├── PWAInstallPrompt.tsx
│   │   └── Sidebar.tsx
│   ├── home/                  # ホームページ用コンポーネント
│   │   ├── CraftStory.tsx
│   │   ├── DynamicProfileCard.tsx
│   │   ├── HomePageInteractions.tsx
│   │   ├── JibunCraft.tsx
│   │   └── ProfileCard.tsx
│   ├── minecraft-sdgs/        # Minecraft SDGs用コンポーネント
│   │   ├── DynamicStageModal.tsx
│   │   ├── LoginPromptModal.tsx
│   │   ├── MinecraftAnimations.tsx
│   │   ├── MinecraftMap.tsx
│   │   ├── MinecraftStageModal.tsx
│   │   ├── MinecraftStageNode.tsx
│   │   └── WorldDataModal.tsx
│   ├── quest/                 # クエスト関連コンポーネント
│   │   ├── CategoryBlock.tsx  # カテゴリブロック
│   │   ├── CategoryModal.tsx  # カテゴリモーダル
│   │   ├── DynamicStageModal.tsx
│   │   ├── LoginPromptModal.tsx
│   │   ├── QuestMap.tsx       # クエストマップ
│   │   ├── StageModal.tsx     # ステージモーダル
│   │   └── StageNode.tsx      # ステージノード
│   └── yononaka/             # 世の中ページ用コンポーネント
│       └── UserProfileModal.tsx
│
├── hooks/                      # カスタムフック
│   ├── useAdventurerList.ts   # 冒険者リストフック
│   ├── useAuth.ts             # 認証フック
│   ├── useCategorySystem.ts   # カテゴリシステムフック
│   ├── useMediaQuery.ts       # メディアクエリフック
│   ├── usePWA.ts              # PWAフック
│   ├── useRealtimeUpdates.ts  # リアルタイム更新フック
│   └── useToast.ts            # トーストフック
│
├── lib/                        # ライブラリとユーティリティ
│   ├── api/                    # API関連
│   │   ├── minecraft-sdgs.ts   # Minecraft SDGs API
│   │   └── quests.ts          # クエストAPI
│   ├── supabase/              # Supabase設定
│   │   ├── client.ts          # Supabaseクライアント
│   │   └── hooks.ts           # Supabaseフック
│   └── utils/                 # ユーティリティ関数
│       ├── imageUtils.ts      # 画像ユーティリティ
│       ├── performance.ts     # パフォーマンス関連
│       └── seo.ts             # SEO関連
│
├── stores/                     # 状態管理 (Zustand)
│   ├── authStore.ts           # 認証ストア
│   ├── minecraftSdgsStore.ts  # Minecraft SDGsストア
│   ├── questStore.ts          # クエストストア
│   └── userStore.ts           # ユーザーストア
│
├── types/                      # TypeScript型定義
│   ├── category.ts            # カテゴリ型
│   ├── database.ts            # データベース型
│   ├── index.ts               # 共通型
│   ├── quest.ts               # クエスト型
│   └── user.ts                # ユーザー型
│
├── docs/                       # ドキュメント
│   ├── examples/              # 使用例とサンプル
│   │   ├── authStore.example.md
│   │   ├── examples.md
│   │   ├── middleware.examples.md
│   │   ├── providers.examples.md
│   │   ├── useAuth.examples.md
│   │   ├── useMediaQuery.examples.md
│   │   ├── usePWA.examples.md
│   │   ├── useRealtimeUpdates.examples.md
│   │   └── userStore.examples.md
│   ├── Admin-Operations-Manual.md       # 管理者操作マニュアル
│   ├── Avatar-Upload-Setup.md           # アバターアップロード設定
│   ├── Category-Block-Implementation.md # カテゴリブロック実装
│   ├── Development-Workflow-Guide.md    # 開発ワークフローガイド
│   ├── Dynamic-Import-Bundle-Optimization.md # 動的インポート最適化
│   ├── Emergency-Recovery-Guide.md      # 緊急復旧ガイド
│   ├── Image-Optimization-Guide.md     # 画像最適化ガイド
│   ├── Performance-Optimization-Guide.md # パフォーマンス最適化
│   ├── Production-Migration-Guide.md   # 本番移行ガイド
│   ├── PROJECT_STRUCTURE.md           # プロジェクト構成（本ファイル）
│   ├── PWA-Setup.md                   # PWA設定
│   └── SEO-Implementation-Guide.md    # SEO実装ガイド
│
├── public/                     # 静的ファイル
│   ├── images/                # 画像ファイル（サムネイル等）
│   ├── icons/                 # アイコンファイル（PWA対応）
│   ├── manifest.json          # PWAマニフェスト
│   ├── sw.js                  # サービスワーカー
│   └── workbox-*.js           # Workbox関連ファイル
│
├── reference/                  # 参考資料
│   ├── assets/                # アセット参考
│   ├── css/                   # CSS参考
│   │   ├── auth.css
│   │   ├── navigation.css
│   │   ├── profile.css
│   │   └── quest.css
│   ├── html/                  # HTML参考
│   ├── images/                # 画像参考
│   └── javascript/            # JavaScript参考
│
└── scripts/                    # ビルドスクリプト
    ├── health-check.js        # ヘルスチェック
    └── performance-audit.js   # パフォーマンス監査
```

## 🎯 フォルダの役割

### `/app` - Next.js App Router
- **役割**: ページルーティングとレイアウト
- **特徴**: Next.js 13+のApp Routerを使用
- **含まれるもの**: ページコンポーネント、API Routes、レイアウト

### `/components` - UIコンポーネント
- **役割**: 再利用可能なReactコンポーネント
- **構成**: 機能別にフォルダ分け
- **特徴**: 単一責任の原則に従った設計

### `/hooks` - カスタムフック
- **役割**: ロジックの再利用とコンポーネントの分離
- **特徴**: React Hooksパターンに従った実装

### `/lib` - ライブラリとユーティリティ
- **役割**: 外部ライブラリの設定とユーティリティ関数
- **含まれるもの**: Supabase設定、API関数、共通ユーティリティ

### `/stores` - 状態管理
- **役割**: グローバル状態の管理
- **技術**: Zustand + Immer + Persist
- **特徴**: TypeScript完全対応

### `/types` - 型定義
- **役割**: TypeScript型定義の集約
- **特徴**: データベーススキーマと連動

### `/docs` - ドキュメント
- **役割**: プロジェクトドキュメントと使用例
- **構成**: ガイド + 例文集

## 🛠️ 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS + styled-jsx
- **状態管理**: Zustand + Immer + Persist
- **データベース**: Supabase PostgreSQL
- **認証**: Supabase Auth
- **PWA**: next-pwa + Workbox
- **アイコン**: Lucide React
- **画像最適化**: Next.js Image + OptimizedImage
- **アニメーション**: CSS Animations + Framer Motion
- **パフォーマンス**: Dynamic Imports + Code Splitting

## 📋 ファイル命名規則

- **コンポーネント**: PascalCase (例: `AuthButton.tsx`)
- **フック**: camelCase with `use` prefix (例: `useAuth.ts`)
- **ストア**: camelCase with `Store` suffix (例: `authStore.ts`)
- **型定義**: camelCase (例: `database.ts`)
- **ユーティリティ**: camelCase (例: `imageUtils.ts`)

## 🧹 整理のポイント

1. **機能別分離**: 関連するファイルを同じフォルダに配置
2. **例文の集約**: 全ての`.examples.md`を`docs/examples/`に移動
3. **不要ファイル削除**: `.gitkeep`やバックアップファイルを削除
4. **Dynamic Import最適化**: 適切なフォルダに分散配置
5. **型安全性**: TypeScriptの恩恵を最大化

## 🚀 主要機能

### カテゴリブロックシステム
- **4カテゴリ対応**: おかね・経済 / プレゼン・コミュニケーション / AI・ITスキル / SDGs・環境
- **動的レイアウト**: 上段2枚（プライマリ + 講師紹介）/ 下段3枚（レッスン②③ + etc）
- **ロック機能**: メインクエスト進行状況に応じた段階的アンロック
- **レスポンシブ**: PC/タブレット/モバイル対応

### Minecraft SDGs連携
- **専用ページ**: `/minecraft-sdgs`
- **ワールドデータ**: 環境問題学習コンテンツ
- **独立したUI**: メインクエストとは別のデザインシステム

### 管理者機能
- **ダッシュボード**: ユーザー管理 + クエスト管理 + 設定管理
- **承認システム**: コンテンツの投稿承認ワークフロー
- **統計表示**: 進捗データの可視化

### PWA対応
- **オフライン機能**: サービスワーカー + キャッシュ戦略
- **インストール促進**: PWAインストールプロンプト
- **パフォーマンス**: 画像最適化 + 動的インポート

## 🔄 今後の拡張

新機能追加時は以下の構成に従ってください：

1. **新ページ**: `/app/[feature]/page.tsx`
2. **新コンポーネント**: `/components/[feature]/`
3. **新フック**: `/hooks/use[Feature].ts`
4. **新ストア**: `/stores/[feature]Store.ts`
5. **新型定義**: `/types/[feature].ts`

## 📝 最近の更新

### 2024年12月 - カテゴリUI修正
- ✅ styled-jsx スコープ問題解決
- ✅ LessonTile ロック分岐修正
- ✅ カテゴリ枠色設定（おかね=黄、プレゼン=赤、AI=青、SDGs=緑）
- ✅ レイアウト統一（上2/下3配置）
- ✅ レスポンシブ対応強化 