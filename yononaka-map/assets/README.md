# アセット配置ガイド

このフォルダに PNG ファイルを置くと、ゲーム内の地面・装飾が自動でテクスチャに切り替わります。
ファイルが存在しない場合は単色フォールバックで表示されるので、段階的に差し替え可能です。

## 推奨素材

| パック | URL | タイルサイズ |
|---|---|---|
| **Kenney Tiny Town** ★推奨 | https://kenney.nl/assets/tiny-town | 16×16 px |
| Kenney Micro Roguelike | https://kenney.nl/assets/micro-roguelike | 8×8 px |
| Kenney Tiny 16 | https://kenney.nl/assets/tiny-16 | 16×16 px |

すべて CC0 ライセンス（商用・改変・再配布自由）。

---

## tiles/ — 地面タイル（16×16 px・繰り返しタイリング）

**現在は `tools/generate_tiles.js` による自動生成タイルを配置済み。**
色味やパターンを変えたいときはスクリプトを編集して `node tools/generate_tiles.js` で再生成。
手描きタイルに差し替える場合は同名 PNG を上書きするだけでよい。

| ファイル名 | 用途 | フォールバック色 | タイルの雰囲気 |
|---|---|---|---|
| `bg_grass.png` | 里全体の背景草地 | `#A8C49A` | 明るい草、野原 |
| `platform.png` | 高台の床 | `#C8D89E` | 淡い草、見晴らし台 |
| `zone_power.png` | だれかの力に（夕日色） | `#E8935A` | 温かい土・砂系 |
| `zone_craft.png` | 技を極める職人（青・静か） | `#5A8FAA` | 石畳・タイル系 |
| `zone_challenge.png` | あたらしいこと挑戦（新緑） | `#7BC47B` | 森・新緑系 |
| `zone_family.png` | 家族・地元（木漏れ日ベージュ） | `#D4B896` | 土・砂利系 |
| `zone_free.png` | 自由なくらし（水辺・水色） | `#87CEEB` | 砂浜・水辺系 |
| `zone_stable.png` | 安定（深緑・どっしり） | `#4A7A5A` | 苔・深い草系 |

---

## objects/ — 装飾スプライト（配置済み・`tools/crop_objects.js` で生成）

Ninja Adventure のタイルセットから切り出したもの。座標を調整して再生成するには
`node tools/crop_objects.js preview` で確認 → `emit` で書き出し。

| ファイル名 | 用途 |
|---|---|
| `kamado.png` | ドーム窯（zone_power・湯気アニメ付き） |
| `workbench.png` | 道具つき作業台（zone_craft） |
| `flag_red.png` | はためく旗 4コマ（zone_challenge・アニメ） |
| `house.png` | 茅葺きの家（zone_family） |
| `palm.png` | ヤシの木（zone_free） |
| `statue_oneeye.png` / `statue_frog.png` | 苔むした石像（zone_stable） |
| `torii.png` | 鳥居（こだわりの里・入口ゲート） |
| `tree_trio.png` / `tree_sakura.png` / `tree_green.png` | 広場の木 |
| `bench.png` | 丸太ベンチ（広場） |
| `firepit.png` | 石の火床（予備） |

配置コードは `KodawariMap.gd` の `_deco_sprite()`（底辺中央を接地点に合わせる）と
`_deco_shadow()`（楕円影）。

---

## characters/ — キャラクタースプライト（Ninja Adventure 形式・配置済み）

`<id>/Walk.png`（64×64 = 4方向×4コマ、列 = down/up/left/right）と
`<id>/Idle.png`（64×16 = 4方向×1コマ）を置くと、`CharacterSprites.gd` が
実行時に SpriteFrames を組み立てる。フォルダが無い id は `_default`（汎用村人）になる。

| フォルダ | 対象 | 元キャラ（Ninja Adventure） |
|---|---|---|
| `player/` | 主人公 | Boy |
| `zeroichi/` | ゼロイチ（喫茶店マスター） | Master |
| `takeshi/` | たけし（折り紙） | Villager4 |
| `takuya/` | たくや（Webデザイナー） | Inspector |
| `tsukasa/` | つかさ（音響照明） | Hunter |
| `nanae/` | ななえ（青果） | Woman |
| `yusuke/` | ゆうすけ（銀行員） | Noble |
| `chief/` | 村長 | OldMan3 |
| `guardian/` | 守り神 | Spirit |
| `_default/` | 未割り当ての村人 | Villager |

`Faceset.png`（顔グラ）も同梱済み。将来、会話 UI に顔を出すときに使える。
元素材は `assets/raw/NinjaAdventure/.../Actor/Character/<名前>/SeparateAnim/` にある。

---

## カメラについて

### 現在の設定（Camera2D + position_smoothing）
`Player.tscn` の Camera2D に `position_smoothing_enabled = true` / `speed = 5.0` を設定済み。
なめらかな追従が動作します。KodawariMap では `zoom = 1.5` に自動変更（広いマップ向け）。

### Phantom Camera プラグイン（任意・より高品質な追従）
1. Godot エディタ → Project → Asset Library → "Phantom Camera" で検索
2. インストール後、`Player.tscn` の Camera2D ノードを `PhantomCamera2D` に差し替え
3. `follow_target` を Player 本体のノードパスに設定
4. `dead_zone` や `tween` でカメラの重みを調整

---

## Default Texture Filter

`project.godot` に `textures/canvas_textures/default_texture_filter=0`（Nearest）設定済み。
ピクセルアートが滲まずシャープに表示されます。この設定は変更しないでください。
