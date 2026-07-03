# フェーズ1: ナビゲーション再編(全フェーズの土台)

前提: `00-OVERVIEW.md` を先に読むこと。

## 目的

ハードコードされた9項目フラットのサイドバーを、データ駆動のグループ型ナビに置き換える。
このフェーズ完了後、他フェーズのページ追加は navConfig への1エントリ追加だけで済む状態にする。

## 対象ファイル

- 新規: `components/common/navConfig.ts`
- 改修: `components/common/Sidebar.tsx`(現状: 各リンクがJSXベタ書き、約360行)
- 改修: `next.config.ts`(リダイレクト追加)

## 実装内容

### 1. navConfig.ts

```ts
export interface NavItem {
  label: string
  href: string
  icon: string            // 絵文字
  accent?: string         // focusボーダー色 (Tailwindクラス)
  external?: boolean
}
export interface NavGroup {
  id: string
  label: string
  icon: string
  items?: NavItem[]       // itemsありならアコーディオングループ
  href?: string           // hrefありなら単独リンク
}
export const NAV_GROUPS: NavGroup[] = [...]
export const ADMIN_NAV_ITEMS: NavItem[] = [...]
```

構成(00の情報設計の通り):

```
🏠 ホーム → /
📖 自分を理解する
   ├ 😊 自分のデータ → /profile
   ├ 📊 非認知能力レポート → /myself/report
   ├ 📜 ストーリー → /myself/story
   └ 🕵️ PBL → /pbl
🗺 仕事・社会を知る
   ├ 🧭 Yononakaマップ → /yononaka-map
   └ 🏋️ クエストに出かける → /quest
🔭 視点をふやす → /perspectives
🏘 メンバーを知る → /members
🎬 カリキュラム動画 → /videos
🕹 息抜きの場所 → /asobiba
🚀 ミライクラフト → /mirai
```

管理セクション(ADMIN_NAV_ITEMS)は現Sidebarの6項目をそのまま移植。

### 2. Sidebar.tsx 改修

- `NAV_GROUPS` をmapして描画。現在のスタイル(slate系グラデ、hover時パディング増加)は踏襲
- グループはアコーディオン(クリックで開閉、▸/▾)。**現在のパス(`usePathname`)を含むグループは初期展開**
- 単独リンク(href持ちグループ)は従来通りの見た目
- サブ項目は左インデント(`pl-[45px]`)+少し小さめ(`text-sm`)
- ESCで閉じる/背景スクロール防止/オーバーレイの既存挙動は変更しない
- 未実装ルート(フェーズ未着手)へのリンクはnavConfig上でコメントアウトしておき、各フェーズ完了時に解放する

### 3. リダイレクト(next.config.ts)

```
/entrepreneur → /members   (フェーズ5完了後に有効化)
/yononaka     → /members   (フェーズ5完了後に有効化)
```

フェーズ1時点ではコメントとしてTODO記載のみ。既存ルートは壊さない。

## 完了条件

- [ ] 全既存ページでサイドバーが新グループ構成で表示される
- [ ] 現在ページの属するグループが自動展開される
- [ ] 管理者ログイン時のみ管理セクションが出る(既存挙動維持)
- [ ] モバイル(375px)で開閉・スクロールが正常
- [ ] `npm run build` 成功
