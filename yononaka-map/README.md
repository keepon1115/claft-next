# よのなかマップ

CLAFT の「お仕事マップ」プロトタイプ。  
2D ドット絵スタイルのマップを歩いて、村人と話し、その人の生き方に触れるゲーム。

---

## 動かし方

### ローカル（Godot エディタ）

1. [Godot 4.6](https://godotengine.org/) をインストール
2. このフォルダを Godot で開く（`project.godot` を選択）
3. F5 で実行

### Web 版（itch.io 公開用）

```
# 1. Web 書き出しテンプレートをインストール（初回のみ）
Editor → Export Templates → Download and Install

# 2. 書き出し
Project → Export → "Web" → Export Project
→ 出力先: exports/web/index.html

# 3. ローカル確認
cd exports/web
python -m http.server 8080
→ http://localhost:8080 をブラウザで開く
```

> ⚠️ `file://` で直接開くと動きません。必ず HTTP サーバー越しに開いてください。

---

## 操作方法

| 操作 | キーボード | スマホ（タッチ） |
|---|---|---|
| 移動 | WASD / 矢印キー | 画面左下のバーチャル D パッド |
| 話しかける / つぎへ | Enter / Space | ボタンをタップ |
| 全体マップ開閉 | M | 画面右上の MAP ボタン |

---

## フォルダ構成

```
project.godot          エンジン設定（stretch mode / autoload など）
export_presets.cfg     Web 書き出し設定

data/
  npcs.json            村人データ（ここを編集して村人を増やす）
  monsters.json        モンスター（動画クエスト）
  villagechief.json    村長

scripts/
  FontManager.gd       日本語フォント適用（autoload）
  KodawariMap.gd       ②こだわりの里：地形描画 + 日替わり NPC 配置
  DialogueUI.gd        会話 UI（CanvasLayer）
  VirtualDPad.gd       タッチ用バーチャル D パッド
  SignPost.gd          案内看板（インタラクティブ）
  Waypost.gd           道しるべ（分岐点の方向看板、V8）
  OverviewMap.gd       簡易全体マップ（M キー / MAP ボタン、V8）
  PortalTo.gd          シーン遷移ポータル
  Player.gd            プレイヤー移動
  NPC.gd               NPC（近接判定 → 会話）
  ...

scenes/
  Main.tscn            広場マップ（玄関）
  KodawariMap.tscn     ②こだわりの里

assets/
  fonts/               日本語フォント（README.md 参照）
  tiles/               地面タイル素材（README.md 参照）
  objects/             小道具スプライト
  characters/          キャラ PNG（将来差し替え用）

exports/web/           Web 書き出し出力先
```

---

## 村人を追加する方法

1. `data/npcs.json` に JSON オブジェクトを追加：

```json
{
  "id": "新しいID",
  "name": "表示名",
  "approach_text": "近づいたときの一言",
  "odai": "お題の文章",
  "aizuchi": ["相槌1", "相槌2", "相槌3"],
  "reply": "村人の返し（本音・物語）",
  "reveal": "種明かし（仕事・肩書き）",
  "links": { "記事": "https://..." },
  "tags": {
    "kodawari": ["だれかの力に", "家族・地元"]
  }
}
```

2. `scripts/KodawariMap.gd` に候補区画を追記：

```gdscript
# NPC_ZONE_CANDIDATES に追加
"新しいID": ["zone_power", "zone_family"],

# NPC_ORDER に追加
const NPC_ORDER: Array = [..., "新しいID"]
```

3. （任意）外見を `assets/characters/新しいID/` に配置：

```
assets/characters/新しいID/Walk.png   64×64（4方向×4コマ、列= down/up/left/right）
assets/characters/新しいID/Idle.png   64×16（4方向×1コマ）
```

Ninja Adventure Pack（`assets/raw/NinjaAdventure/.../Actor/Character/`）の
任意キャラの `SeparateAnim/Walk.png` と `Idle.png` をコピーするだけでよい。
**フォルダが無い場合は自動で汎用村人（`_default`）の見た目になる**ので、
JSON 追加だけでも動く。

---

## アセット（フォント・タイル）の置き場所

### 日本語フォント（文字化け防止・必須）

```
assets/fonts/Japanese.ttf
```

推奨: [Noto Sans JP](https://fonts.google.com/noto/specimen/Noto+Sans+JP)（OFL、無料）  
→ ダウンロード → `NotoSansJP-Regular.ttf` を `Japanese.ttf` にリネームして配置

### 地面タイル（任意・なければ単色フォールバック）

```
assets/tiles/bg_grass.png       背景草
assets/tiles/platform.png       高台
assets/tiles/zone_power.png     だれかの力に
assets/tiles/zone_craft.png     技を極める職人
assets/tiles/zone_challenge.png あたらしいこと挑戦
assets/tiles/zone_family.png    家族・地元
assets/tiles/zone_free.png      自由なくらし
assets/tiles/zone_stable.png    安定
```

推奨素材: [Kenney Tiny Town](https://kenney.nl/assets/tiny-town)（CC0、無料）

---

## こだわりの里 — 島の構成

```
         [入口 / 広場へ戻る]
              ↑
   [Zone1]  [Zone3]  [Zone2]
  だれかの力に  挑戦   技を極める職人
       ↑         ↑         ↑
   [Zone4]  [Zone6]  [Zone5]
   家族・地元  安定   自由なくらし
```

**日替わり NPC 配置**: 日付から seed を計算し、村人ごとに候補区画のどちらに出現するかを決定。同じ区画に重複しないよう自動調整。

---

## 技術スタック

| 項目 | 内容 |
|---|---|
| エンジン | Godot 4.6 (GL Compatibility) |
| 解像度 | 1280 × 720 (stretch: canvas_items / keep) |
| スタイル | 2D ドット絵（Nearest フィルター） |
| Web | HTML5 書き出し（itch.io Embed 想定） |
| タッチ | バーチャル D パッド（`DisplayServer.is_touchscreen_available()` で自動表示） |

---

## ライセンス

コード: MIT  
フォント・タイル素材は各フォントの配布ライセンスに従ってください（Noto Sans JP = OFL, Kenney = CC0）。
