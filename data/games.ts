// 「息抜きの場所」(/asobiba) のメンバー作ゲーム一覧。
// 実ゲームのファイル・URLは後日オーナーが差し込む(TBD-4)。url が '' の間は COMING SOON 筐体になる。
// ゲームの追加・変更はこのファイルの編集だけで完結する(管理画面は作らない)。
// 詳細仕様: docs/renovation/07-playground.md

export interface MemberGame {
  id: string
  title: string
  author: string // 作者ニックネーム
  description?: string
  thumbnail?: string
  url: string // 遊べるURL('' なら COMING SOON)
  playMode: 'iframe' | 'external' // iframe埋め込み可か、外部タブか
}

export const MEMBER_GAMES: MemberGame[] = [
  // 初期はCOMING SOON筐体のみ(TBD-4: 実ゲーム一覧確定後に差し替え)
  { id: 'coming-soon-1', title: '???', author: '', url: '', playMode: 'iframe' },
  { id: 'coming-soon-2', title: '???', author: '', url: '', playMode: 'iframe' },
  { id: 'coming-soon-3', title: '???', author: '', url: '', playMode: 'iframe' },
]
