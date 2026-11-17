# フェーズ13: Yononakaマップの公開手順(準備中 → 公開)

前提: `10-map-integration.md`。

## しくみ

`/yononaka-map` のページは、`public/games/yononaka-map/index.html` が **あれば ゲームを表示**、
**なければ「じゅんびちゅう」の看板** を出す(`app/yononaka-map/page.tsx` が自動で判定)。

つまり公開とは「ゲームを書き出して `public/games/yononaka-map/` に置き、コミットして本番に反映する」こと。
ページ側のコード変更は不要。非公開に戻すときは、そのフォルダを削除してコミットする。

## 書き出し方法(どちらでもよい)

| 方法 | だれが | やり方 |
|---|---|---|
| A. スクリプト | AI(クラウドのセッション)/ Linux | `bash yononaka-map/tools/export_web.sh` |
| B. Godotエディタ | オーナー(Windows) | Project → Export → Web → Export Project |

どちらも出力先は `public/games/yononaka-map/`(`export_presets.cfg` で設定済み)。
A は Godot 4.6 本体と書き出しテンプレートを自動でダウンロードする(初回のみ、約1.3GB)。
2026-11 に A の方法で書き出し、ページに埋め込んで動くことを確認済み(書き出し物は約40MB)。

※ `10-map-integration.md` の「AIはGodotを実行できない」は、クラウドのセッションでは当てはまらない。
スクリプトで書き出しも画面の撮影もできる。

## 公開前チェック

- [ ] `yononaka-map/data/monsters.json` の動画URL・フォームURLが `PLACEHOLDER` のままになっていないか
- [ ] `yononaka-map/data/npcs.json` のリンク先が開けるか
- [ ] 書き出し後、`npm run dev` で `/yononaka-map` を開き、ゲームが縦長の枠に表示されるか
- [ ] スマホ実機で、歩く・話す・文字入力ができるか(オーナー確認)

## AIに頼むときのプロンプト

そのまま貼り付けて使える。

```
Yononakaマップを公開してください。手順は docs/renovation/13-map-publish.md にあります。

1. 作業ブランチを、本番に反映されるブランチの最新に合わせる
2. docs/renovation/13-map-publish.md の「公開前チェック」を確認し、
   PLACEHOLDER のURLなど未完成のものがあれば、公開する前に私に報告する
3. bash yononaka-map/tools/export_web.sh で書き出す
4. npm run dev でサイトを立ち上げ、/yononaka-map をパソコン幅とスマホ幅で撮影して、
   ゲームが表示されていることを画像で見せる
5. 問題なければ public/games/yononaka-map/ をコミットして push する
   (本番への反映方法がわからなければ、push の前に私に確認する)
```

非公開に戻すとき:

```
Yononakaマップを「じゅんびちゅう」に戻してください。
public/games/yononaka-map/ を削除してコミットし、push してください。
```

## 注意

- 書き出し物(wasm 約36MB)をコミットするたびにリポジトリが大きくなる。
  ゲーム側(`yononaka-map/` 配下)を変更したときだけ書き出し直すこと。
- `export_presets.cfg` の `variant/thread_support=false` は変えない(`10-map-integration.md` 参照)。
- `exclude_filter="exports/*,tools/*"` は、確認用の画像や開発用スクリプトをゲームに含めないための設定。
