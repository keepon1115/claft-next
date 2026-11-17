# フォント配置ガイド

ここに日本語フォントファイルを **`Japanese.ttf`** という名前で置いてください。
（.otf でも可能ですが、FontManager.gd を `.otf` に合わせて書き換えてください）

## 推奨フォント（すべて無料・OFL/CC0）

| フォント | URL | 特徴 |
|---|---|---|
| **Noto Sans JP** ★推奨 | https://fonts.google.com/noto/specimen/Noto+Sans+JP | 読みやすい・軽量・Web標準 |
| M PLUS Rounded 1c | https://fonts.google.com/specimen/M+PLUS+Rounded+1c | 丸くてかわいい・ゲームに合う |
| Kosugi Maru | https://fonts.google.com/specimen/Kosugi+Maru | コンパクト・ドット絵に合う |
| 源ノ角ゴシック JP | https://github.com/adobe-fonts/source-han-sans | Adobe製・高品質 |

## 手順

1. 上記サイトからフォントをダウンロード
2. `.ttf` または `.otf` ファイルを取り出す
3. このフォルダに **`Japanese.ttf`** という名前でコピー
4. Godot エディタを再起動（または F5 で実行）

## ファイルサイズ注意

- Noto Sans JP Regular: 約 4MB → Web書き出しに同梱される
- 軽量化したい場合: Google Fonts の "Variable font" 版 (NotoSansJP[wght].ttf ≈ 2MB) を使う
- フォントはWeb書き出しの .pck ファイルに自動で埋め込まれます

## 確認方法

Godotエディタのコンソールに `[FontManager] 日本語フォントを適用しました` と出ればOK。
出ない場合はファイル名・パスを確認してください。
