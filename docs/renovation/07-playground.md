# フェーズ7: 息抜きの場所(ゲームセンター風)

前提: `00-OVERVIEW.md`、フェーズ1完了。

## 目的

メンバーがつくったゲームで遊べるアーケードページを作る。黄昏の対話室(既存 `/twilight`)もこの場所の住人としてリンクする。

## デザイントーン: ゲームセンター風

- 背景: 黒 `#0a0a12`。ネオン: ピンク `#ff2e88` / シアン `#2ee6ff`
- 見出しはネオン管風(text-shadowの多重グロー)。「GAME CENTER」看板
- ゲームは**アーケード筐体風カード**(枠+スクリーン部にサムネ+下部にINSERT COIN風ボタン)
- ホバー/タップで筐体がわずかに光る

## 対象ファイル

- 新規: `app/asobiba/page.tsx`
- 新規: `data/games.ts`
- 新規: `components/asobiba/GameCabinet.tsx`、`components/asobiba/GamePlayerModal.tsx`

## 実装内容

### 1. data/games.ts(コード管理 — TBD-4: 実ゲーム一覧は後日)

```ts
export interface MemberGame {
  id: string
  title: string
  author: string          // 作者ニックネーム
  description?: string
  thumbnail?: string
  url: string             // 遊べるURL('' なら COMING SOON)
  playMode: 'iframe' | 'external'  // iframe埋め込み可か、外部タブか
}
export const MEMBER_GAMES: MemberGame[] = [ /* 初期はCOMING SOON筐体を数台 */ ]
```

### 2. ページ構成

1. ネオン看板ヒーロー「あそびば」
2. **筐体グリッド**(PC3列/タブレット2列/モバイル1列): MEMBER_GAMES をGameCabinetで表示
   - `url`空 → 画面消灯+「COMING SOON」の暗い筐体
   - `playMode: 'iframe'` → GamePlayerModal(全画面寄りモーダル、`allow="fullscreen"`、閉じるボタン)
   - `playMode: 'external'` → 新規タブ
3. **特別筐体「黄昏の対話室」**: 紫ネオン(`#a855f7`)の一回り大きい筐体。クリックで `/twilight` へ。
   コピー例:「夜のすみっこで、キャラクターと話そう」
4. フッターに小さく「きみの作ったゲームもここに並べよう → 先生に声をかけてね」

## 注意

- iframeゲーム(Godot/Scratch等)は重い。**モーダルを開いた時だけマウント**し、閉じたらアンマウント
- 音が出るゲームがある旨をモーダル内に小さく表示
- ログイン不要

## 完了条件

- [ ] `/asobiba` がゲームセンタートーンで表示される
- [ ] COMING SOON筐体・iframe再生・外部リンクの3パターンが動く
- [ ] 黄昏の対話室の特別筐体から `/twilight` に遷移できる
- [ ] data/games.ts 編集だけでゲーム追加できる
- [ ] navConfigの該当リンクを解放
- [ ] `npm run build` 成功
