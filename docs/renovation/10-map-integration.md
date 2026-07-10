# フェーズ10: Yononakaマップの同居構成(モノレポ化)と配信パイプライン

前提: `00-OVERVIEW.md`。**TBD-3はこのファイルで解決** — 外部ホスティングではなく、同一リポジトリ・同一デプロイで配信する。

## 実装分担(重要)

- **Sonnet(AI)がやること**: このリポジトリ内のテキストファイル編集すべて(`.gd` `.tscn` `.cfg` `.json` はテキストなので編集可能)、Next.js側の設定・ページ
- **オーナー(人間)がやること**: Godotエディタでの動作確認(F5)と Web書き出し(Project → Export)。**SonnetはGodotを実行できない**ので、書き出しが必要な変更をしたら「Godotで書き出してください」とオーナーに依頼して作業を止めること

## 1. フォルダ移動・リネーム — ✅完了済み

`claft-next/yononaka-map/` にリネーム済み(2026-07確認)。作業不要。

## 2. .gitignore 追記(Sonnet)

リポジトリ肥大防止。346MBのうち約340MBはコミット不要:

```gitignore
# Yononaka map (Godot)
yononaka-map/.godot/          # Godotのインポートキャッシュ(自動再生成される)
yononaka-map/assets/raw/      # 素材パック原本200MB(再DL可能。使う分はassets/配下にコピー済み)
yononaka-map/exports/         # 旧書き出し先(新書き出し先はpublic/games/へ変更)
```

→ コミット対象は実質ソース数MBのみになる。
注意: `assets/raw` を除外しても、ゲームが実際に参照するのは `assets/characters` 等のコピー済みファイルなので動作に影響なし(README.mdの規約通り)。

## 3. Web書き出し先の変更(Sonnet: export_presets.cfg をテキスト編集)

`yononaka-map/export_presets.cfg` の Webプリセット:

```
export_path="../public/games/yononaka-map/index.html"
```

→ オーナーがGodotで「Export Project」すると、CLAFTの `public/games/yononaka-map/` に直接出力され、
Vercelデプロイで `https://{ドメイン}/games/yononaka-map/index.html` として同一オリジン配信される。

- ルート衝突回避: Next.jsページは `/yononaka-map`(フェーズ3)、ゲーム実体は `/games/yononaka-map/` と分離済み
- `variant/thread_support=false` を確認済み → COOP/COEPヘッダー不要。**この設定は変えないこと**(trueにするとVercelでヘッダー設定が必要になる)

## 4. PWAプリキャッシュ除外(Sonnet: next.config.ts)

Godotのwasm(数十MB)がService Workerに先読みされるのを防ぐ。`withPWA({...})` に追加:

```ts
publicExcludes: ['!games/**/*'],
```

## 5. 埋め込みURL確定(Sonnet: フェーズ3の成果物を更新)

`data/yononakaMap.ts`:

```ts
export const YONONAKA_MAP_URL = '/games/yononaka-map/index.html'
```

書き出し前でもページは「準備中」表示で成立する(フェーズ3の仕様通り)。
同一オリジンになったため、フェーズ9bの認証連携(親ページ→iframeへのpostMessage)も簡単になる。

## 完了条件

- [ ] `yononaka-map/` にリネーム済み、gitignore適用後の `git status` で巨大ファイルが出ない
- [ ] オーナーの書き出しで `public/games/yononaka-map/index.html` が生成される
- [ ] 本番URLでマップが動く(PC+スマホタップ操作)
- [ ] Service Workerのプリキャッシュにgames配下が含まれない(DevTools → Application → Cache Storageで確認)
- [ ] `npm run build` 成功
