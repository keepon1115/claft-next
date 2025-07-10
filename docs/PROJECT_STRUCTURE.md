# CLAFT Next.js プロジェクト構成

## 📁 ディレクトリ構成

```
claft-next/
├── app/                        # Next.js 13+ App Router
│   ├── admin/                  # 管理者画面
│   ├── api/                    # API Routes
│   ├── mirai/                  # 未来ページ
│   ├── profile/                # プロフィールページ
│   ├── quest/                  # クエストページ
│   ├── unauthorized/           # 未認証ページ
│   ├── yononaka/              # 世の中ページ
│   ├── globals.css            # グローバルスタイル
│   ├── layout.tsx             # ルートレイアウト
│   ├── page.tsx               # ホームページ
│   └── providers.tsx          # プロバイダー設定
│
├── components/                 # Reactコンポーネント
│   ├── admin/                  # 管理者用コンポーネント
│   │   ├── ApprovalTable.tsx
│   │   ├── FilterSection.tsx
│   │   └── DynamicAdminDashboard.tsx
│   ├── auth/                   # 認証関連コンポーネント
│   │   ├── AuthButton.tsx
│   │   ├── AuthModal.tsx
│   │   └── DynamicAuthModal.tsx
│   ├── common/                 # 共通コンポーネント
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── HamburgerMenu.tsx
│   │   └── NotificationSystem.tsx
│   ├── home/                   # ホームページ用コンポーネント
│   │   ├── ProfileCard.tsx
│   │   ├── JibunCraft.tsx
│   │   ├── CraftStory.tsx
│   │   └── DynamicProfileCard.tsx
│   └── quest/                  # クエスト関連コンポーネント
│       ├── QuestMap.tsx
│       ├── StageModal.tsx
│       ├── StageNode.tsx
│       ├── LoginPromptModal.tsx
│       └── DynamicStageModal.tsx
│
├── hooks/                      # カスタムフック
│   ├── useAuth.ts             # 認証フック
│   ├── useMediaQuery.ts       # メディアクエリフック
│   ├── usePWA.ts              # PWAフック
│   ├── useRealtimeUpdates.ts  # リアルタイム更新フック
│   └── useToast.ts            # トーストフック
│
├── lib/                        # ライブラリとユーティリティ
│   ├── api/                    # API関連
│   │   └── quests.ts
│   ├── supabase/              # Supabase設定
│   │   ├── client.ts
│   │   └── hooks.ts
│   └── utils/                 # ユーティリティ関数
│       ├── imageUtils.ts
│       ├── performance.ts
│       └── seo.ts
│
├── stores/                     # 状態管理 (Zustand)
│   ├── authStore.ts           # 認証ストア
│   ├── questStore.ts          # クエストストア
│   └── userStore.ts           # ユーザーストア
│
├── types/                      # TypeScript型定義
│   ├── database.ts            # データベース型
│   ├── index.ts               # 共通型
│   ├── quest.ts               # クエスト型
│   └── user.ts                # ユーザー型
│
├── docs/                       # ドキュメント
│   ├── examples/              # 使用例とサンプル
│   │   ├── authStore.example.md
│   │   ├── middleware.examples.md
│   │   ├── providers.examples.md
│   │   ├── useAuth.examples.md
│   │   ├── useMediaQuery.examples.md
│   │   ├── usePWA.examples.md
│   │   ├── useRealtimeUpdates.examples.md
│   │   ├── userStore.examples.md
│   │   └── examples.md
│   ├── Development-Workflow-Guide.md
│   ├── Performance-Optimization-Guide.md
│   ├── PWA-Setup.md
│   └── SEO-Implementation-Guide.md
│
├── public/                     # 静的ファイル
│   ├── images/                # 画像ファイル
│   ├── icons/                 # アイコンファイル
│   └── manifest.json          # PWAマニフェスト
│
├── reference/                  # 参考資料
│   ├── assets/
│   ├── css/
│   ├── html/
│   ├── images/
│   └── javascript/
│
└── scripts/                    # ビルドスクリプト
    └── performance-audit.js
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
- **スタイリング**: Tailwind CSS
- **状態管理**: Zustand
- **データベース**: Supabase
- **認証**: Supabase Auth
- **PWA**: next-pwa
- **アイコン**: Lucide React

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

## 🔄 今後の拡張

新機能追加時は以下の構成に従ってください：

1. **新ページ**: `/app/[feature]/page.tsx`
2. **新コンポーネント**: `/components/[feature]/`
3. **新フック**: `/hooks/use[Feature].ts`
4. **新ストア**: `/stores/[feature]Store.ts`
5. **新型定義**: `/types/[feature].ts` 