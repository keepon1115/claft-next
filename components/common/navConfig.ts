// ナビゲーション構成の唯一の正(single source of truth)。
// Sidebarはこの配列をmapして描画する。リンクのハードコードはしない。
// 詳細仕様: docs/renovation/00-OVERVIEW.md, docs/renovation/01-navigation.md

export interface NavItem {
  label: string
  href: string
  icon: string // 絵文字
  accent?: string // focusボーダー色 (Tailwindクラス, 例: 'focus:border-blue-400')
}

export interface NavGroup {
  id: string
  label: string
  icon: string
  items?: NavItem[] // itemsありならアコーディオングループ
  href?: string // hrefありなら単独リンク
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'home',
    label: 'ホーム',
    icon: '🏠',
    href: '/',
  },
  {
    id: 'myself',
    label: '自分を理解する',
    icon: '📖',
    items: [
      { label: '自分のデータ', href: '/profile', icon: '😊', accent: 'focus:border-blue-400' },
      { label: '非認知能力レポート', href: '/myself/report', icon: '📊', accent: 'focus:border-blue-400' },
      // 未実装(フェーズ11-A完了まで): であった人ずかん
      // { label: 'であった人ずかん', href: '/myself/zukan', icon: '📖', accent: 'focus:border-blue-400' },
      { label: 'ストーリー', href: '/myself/story', icon: '📜', accent: 'focus:border-blue-400' },
      { label: 'PBL', href: '/pbl', icon: '🕵️', accent: 'focus:border-blue-400' },
    ],
  },
  {
    id: 'work-society',
    label: '仕事・社会を知る',
    icon: '🗺',
    items: [
      // マップ本体(Godot書き出し)未配置の間はページ側が準備中表示になる(フェーズ10で配置)
      { label: 'Yononakaマップ', href: '/yononaka-map', icon: '🧭', accent: 'focus:border-blue-400' },
      { label: 'クエストに出かける', href: '/quest', icon: '🏋️', accent: 'focus:border-blue-400' },
    ],
  },
  {
    id: 'yononaka',
    label: 'よのなかを知る',
    icon: '🌏',
    items: [
      { label: 'Yononaka', href: '/yononaka', icon: '😆', accent: 'focus:border-blue-400' },
      { label: '視点をふやす', href: '/perspectives', icon: '🔭', accent: 'focus:border-blue-400' },
    ],
  },
  {
    id: 'members',
    label: 'メンバーを知る',
    icon: '🏘',
    href: '/members',
  },
  {
    id: 'videos',
    label: 'カリキュラム動画',
    icon: '🎬',
    // /minecraft-sdgs・/robo へは/videos内の特別カードから遷移する
    href: '/videos',
  },
  {
    id: 'asobiba',
    label: '息抜きの場所',
    icon: '🕹',
    // 黄昏の対話室(/twilight)へは/asobiba内の特別筐体から遷移する
    href: '/asobiba',
  },
  {
    id: 'mirai',
    label: 'ミライクラフト',
    icon: '🚀',
    // ひらめきポスト(/hirameki-post)へは/mirai内の入口カードから遷移する
    href: '/mirai',
  },
]

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'マイクラSDGs管理', href: '/admin/minecraft-sdgs', icon: '🧱' },
  { label: 'ダッシュボード', href: '/admin', icon: '📊' },
  { label: 'ユーザー管理', href: '/admin/users', icon: '👥' },
  { label: 'クエスト管理', href: '/admin/quests', icon: '🗺️' },
  { label: 'ロボクエスト管理', href: '/admin/robo', icon: '🤖' },
  { label: 'システム設定', href: '/admin/settings', icon: '⚙️' },
  { label: 'スクール生管理', href: '/admin/students', icon: '🎓' },
  { label: 'ひらめき管理', href: '/admin/hirameki-posts', icon: '💡' },
]
