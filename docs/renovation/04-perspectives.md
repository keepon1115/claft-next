# フェーズ4: 視点をふやす(天文台・プラネタリウム風)

前提: `00-OVERVIEW.md`、フェーズ1完了。

## 目的

「過去(キャリア理論・コテンラジオなど)」と「未来(Society5.0・世代の価値観・世界の価値観)」の
外部コンテンツへの**リンクボタン集**ページを作る。URLは後日オーナーが差し込む(TBD-2)。

## デザイントーン: 天文台・プラネタリウム風

- 背景: 濃紺 `#0f1b3d` → 深宇宙へのグラデ。CSSで小さな星(box-shadow多重 or 疑似要素)を散らす
- 文字: 星白 `#e8ecf8`
- コンセプト: 「望遠鏡でいろんな時代・場所を覗く」。過去セクション=セピア寄りの暖色枠、未来セクション=シアン〜紫の星雲枠
- ヒーローに🔭+「視点をふやすと、世界の見え方が変わる」

## 対象ファイル

- 新規: `app/perspectives/page.tsx`
- 新規: `data/perspectives.ts`

## 実装内容

### 1. data/perspectives.ts(コード管理 — 管理画面は作らない)

```ts
export interface PerspectiveLink {
  title: string
  description: string   // 1行
  url: string           // '' なら「準備中」表示
  icon: string          // 絵文字
}
export const PAST_LINKS: PerspectiveLink[] = [
  { title: 'キャリア理論', description: '先人はどう生き方を考えたか', url: '', icon: '🧭' },
  { title: 'コテンラジオ', description: '歴史を面白く学ぶラジオ', url: '', icon: '📻' },
]
export const FUTURE_LINKS: PerspectiveLink[] = [
  { title: 'Society 5.0', description: 'これからの社会のかたち', url: '', icon: '🏙️' },
  { title: '世代の価値観', description: '世代で違う「あたりまえ」', url: '', icon: '👥' },
  { title: '世界の価値観', description: '国や文化で違う考え方', url: '', icon: '🌍' },
]
```

### 2. ページ構成

1. ヒーロー(天文台)
2. **「過去をのぞく」セクション**: PAST_LINKS をカードグリッド(2列/モバイル1列)
3. **「未来をのぞく」セクション**: FUTURE_LINKS 同様
4. カード: icon+title+description。`url`ありなら `target="_blank" rel="noopener noreferrer"`、
   空なら押せない「準備中🔒」スタイル(グレーアウト+微光)
5. ~~「Yononakaワークショップ」紹介セクションを末尾に追加~~ **取りやめ(2026-07-19)**:
   `/yononaka` は全面温存し、ナビの「よのなかを知る」グループに
   Yononaka(`/yononaka`)と視点をふやす(`/perspectives`)を並べる構成に変更。
   コテンラジオのURLは `https://coten.co.jp/services/cotenradio/` で確定済み

## 完了条件

- [ ] `/perspectives` がプラネタリウムトーンで表示される
- [ ] URL空のカードが準備中表示、URL入りは新規タブで開く
- [ ] data/perspectives.ts の編集だけでリンク追加できる
- [ ] navConfigの該当リンクを解放
- [ ] `npm run build` 成功
