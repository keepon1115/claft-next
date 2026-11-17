#!/usr/bin/env bash
# Yononakaマップを Web 用に書き出す（Linux / クラウドのAIセッション向け）。
#
#   bash yononaka-map/tools/export_web.sh            → public/games/yononaka-map/ に書き出す（公開用）
#   bash yononaka-map/tools/export_web.sh /tmp/out   → 指定フォルダに書き出す（動作確認用）
#
# Godot 本体と書き出しテンプレートが無ければ自動でダウンロードする（初回のみ、約1.3GB）。
# 手元のPC(Windows)では、従来どおり Godot エディタの Project → Export → Web でよい。
# 公開の手順全体は docs/renovation/13-map-publish.md を参照。
set -euo pipefail

VERSION="4.6"
TAG="${VERSION}-stable"
TEMPLATE_DIR="$HOME/.local/share/godot/export_templates/${VERSION}.stable"
CACHE="${GODOT_CACHE:-$HOME/.cache/godot-yononaka}"
BASE_URL="https://github.com/godotengine/godot/releases/download/${TAG}"

PROJECT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:-$PROJECT/../public/games/yononaka-map}"
mkdir -p "$OUT" "$CACHE"
OUT="$(cd "$OUT" && pwd)"

# 1. Godot 本体
GODOT="${GODOT:-$CACHE/Godot_v${TAG}_linux.x86_64}"
if [ ! -x "$GODOT" ]; then
  echo "[export] Godot ${VERSION} をダウンロードします…"
  curl -fsSL -o "$CACHE/godot.zip" "$BASE_URL/Godot_v${TAG}_linux.x86_64.zip"
  unzip -q -o "$CACHE/godot.zip" -d "$CACHE" && rm "$CACHE/godot.zip"
fi

# 2. 書き出しテンプレート（Web・スレッドなし版だけ取り出す）
if [ ! -f "$TEMPLATE_DIR/web_nothreads_release.zip" ]; then
  echo "[export] 書き出しテンプレートをダウンロードします（約1.2GB）…"
  curl -fsSL -o "$CACHE/templates.tpz" "$BASE_URL/Godot_v${TAG}_export_templates.tpz"
  mkdir -p "$TEMPLATE_DIR"
  unzip -q -o -j "$CACHE/templates.tpz" \
    "templates/web_nothreads_release.zip" "templates/web_nothreads_debug.zip" "templates/version.txt" \
    -d "$TEMPLATE_DIR"
  rm "$CACHE/templates.tpz"
fi

# 3. 素材の取り込み → 書き出し
echo "[export] 素材を取り込みます…"
"$GODOT" --headless --path "$PROJECT" --import >/dev/null 2>&1 || true
echo "[export] 書き出します → $OUT"
"$GODOT" --headless --path "$PROJECT" --export-release "Web" "$OUT/index.html"

for f in index.html index.js index.wasm index.pck; do
  [ -s "$OUT/$f" ] || { echo "[export] 失敗: $f がありません" >&2; exit 1; }
done
echo "[export] 完了"
ls -lh "$OUT"
