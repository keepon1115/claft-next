// 「視点をふやす」(/perspectives) のリンク集。
// URLは後日オーナーが差し込む(TBD-2)。'' の間はページ側で「準備中🔒」表示になる。
// リンクの追加・変更はこのファイルの編集だけで完結する(管理画面は作らない)。
// 詳細仕様: docs/renovation/04-perspectives.md

export interface PerspectiveLink {
  title: string
  description: string // 1行
  url: string // '' なら「準備中」表示
  icon: string // 絵文字
}

export const PAST_LINKS: PerspectiveLink[] = [
  { title: 'キャリア理論', description: '先人はどう生き方を考えたか', url: '', icon: '🧭' },
  { title: 'コテンラジオ', description: '歴史を面白く学ぶラジオ', url: 'https://coten.co.jp/services/cotenradio/', icon: '📻' },
]

export const FUTURE_LINKS: PerspectiveLink[] = [
  { title: 'Society 5.0', description: 'これからの社会のかたち', url: '', icon: '🏙️' },
  { title: '世代の価値観', description: '世代で違う「あたりまえ」', url: '', icon: '👥' },
  { title: '世界の価値観', description: '国や文化で違う考え方', url: '', icon: '🌍' },
]
