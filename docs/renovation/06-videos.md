# フェーズ6: カリキュラム動画(映画館・シアター風)

前提: `00-OVERVIEW.md`、フェーズ1完了。

## 目的

カリキュラム動画(マイクラ・発表・AI・ロボット)を一覧・視聴できるシアターページを作る。
マイクラSDGs(既存 `/minecraft-sdgs`)はこのグループの一員としてリンクする(実装は動かさない)。

## デザイントーン: 映画館・シアター風

- 背景: 黒 `#111318`。上部に「NOW SHOWING」風のマーキー/ネオンサイン
- アクセント: スクリーン光 `#f5d76e`
- 動画カードは「映画ポスター」風(縦長サムネ+タイトルプレート)。棚(カテゴリ)ごとに横スクロールの列 — ストリーミングサービス的レイアウト

## 対象ファイル

- 新規: `app/videos/page.tsx`
- 新規: `data/curriculum-videos.ts`
- 参考(流用元): `components/quest/CategoryBlock.tsx` / `CategoryModal.tsx` の動画タイル・モーダルパターン

## 実装内容

### 1. data/curriculum-videos.ts(コード管理)

```ts
export type VideoCategory = 'minecraft' | 'presentation' | 'ai' | 'robot'
export interface CurriculumVideo {
  id: string
  category: VideoCategory
  title: string
  description?: string
  youtubeId?: string     // YouTube想定。他形式はurlで
  url?: string
  thumbnail?: string     // 省略時はYouTubeサムネ自動 (img.youtube.com/vi/{id}/hqdefault.jpg)
}
export const CURRICULUM_VIDEOS: CurriculumVideo[] = [ /* 初期は空 or サンプル数件 */ ]
export const CATEGORY_META = {
  minecraft:    { label: 'マイクラ',   icon: '⛏️' },
  presentation: { label: '発表',       icon: '🎤' },
  ai:           { label: 'AI',         icon: '🤖' },
  robot:        { label: 'ロボット',   icon: '🦾' },
}
```

### 2. ページ構成

1. ヒーロー: ネオンサイン「CLAFT THEATER」
2. カテゴリごとの棚(4列)。各棚はポスターカードの横スクロール
3. カードクリック → モーダルでYouTube埋め込み再生(`youtube-nocookie.com` を使用)
4. **マイクラ棚の先頭に特別カード「マイクラSDGsワールドへ」** → `/minecraft-sdgs` へ遷移(既存ページは無変更)
5. 動画0件の棚は「上映準備中」のスクリーン表示

## 注意

- 動画データの追加は `data/curriculum-videos.ts` 編集のみで完結すること
- YouTube iframe は遅延ロード(クリック後にマウント)でページを軽く保つ
- ログイン不要

## 完了条件

- [ ] `/videos` がシアタートーンで表示され、カテゴリ棚と再生モーダルが動く
- [ ] マイクラSDGsへの特別カードから既存ページに遷移できる
- [ ] データファイル編集だけで動画追加できる
- [ ] navConfigの該当リンクを解放
- [ ] `npm run build` 成功
