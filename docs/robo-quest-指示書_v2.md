# 発注書：ロボクエスト改造 v2（CSV運用化・メディア対応・UI修正）

CLAFTアプリ（claft-next）の既存機能「ロボクエスト」への改造。下記の実装を最後までやり切ってください。
調査報告で止まることは不合格です。コードの変更・動作確認まで済ませ、検収できる状態で引き渡してください。

---

## 0. 現状（v1実装済み。着手前にここに列挙したファイルを必ず読むこと）

v1は実装・本番DB適用済み。生徒は `/robo` のマップからテーマを選び、クイズ3問→問い（自由記述）→みんなの意見ウォール＋事例解説→感想→クリアスタンプ、の一連が動いている。

**既存ファイルマップ：**

| 役割 | ファイル |
|---|---|
| 生徒: マップ | `app/robo/page.tsx` |
| 生徒: クイズ〜クリアのフロー | `app/robo/[themeId]/page.tsx` |
| 生徒用コンポーネント | `components/robo/`（RoboMap, RoboStageNode, QuizStep, ModeTransition, OpenQuestionStep, AnswerWall, FeedbackStep, ClearStamp） |
| 管理: テーマ一覧 | `app/admin/robo/page.tsx` |
| 管理: テーマ編集＋設問CRUD | `app/admin/robo/[themeId]/page.tsx` |
| 管理: 回答閲覧・非表示化 | `app/admin/robo/[themeId]/answers/page.tsx` |
| 管理: A4印刷ビュー | `app/admin/robo/[themeId]/print/[userId]/page.tsx` |
| 管理: Server Actions | `app/admin/robo/actions.ts` |
| 生徒用データアクセス | `lib/api/robo.ts` |
| 型・Zodスキーマ | `types/robo.ts`、`types/database.ts`（robo_*テーブル定義） |
| 適用済みマイグレーション | `supabase/migrations/20260707_create_robo_tables.sql`、`20260707_seed_robo_lv1_1.sql` |

**重要：上記2つのマイグレーションは本番DBに適用済み。絶対に編集しないこと。** 変更はすべて新規マイグレーションファイルで行う。

---

## 1. 納品物

### A. DBマイグレーション（新規ファイル `supabase/migrations/20260708_robo_v2.sql`）

1. `robo_themes` に列追加：
   - `icon_url TEXT`（マップアイコン画像URL、nullable）
   - `icon_emoji TEXT NOT NULL DEFAULT '🤖'`（画像がないときのフォールバック絵文字）
   - `question_image_url TEXT`（問いパートに出す画像、nullable）
   - `case_image_url TEXT`（事例解説画像、nullable）
2. `robo_questions` に列追加：
   - `video_url TEXT`（YouTube URL、nullable）
3. ユニーク制約追加：
   - `robo_themes` に `UNIQUE (level, theme_number)`（CSVインポートのupsertキー）
   - `robo_questions` に `UNIQUE (theme_id, display_order)`（同上）
4. seed済みデータの更新（UPDATE文で）：
   - lv1-1 の `icon_emoji` を `'🚦'` に
5. `types/database.ts`・`types/robo.ts` を新列に合わせて更新すること

適用は発注者が行うため、ファイルとして納品すればよい。冪等（`ADD COLUMN IF NOT EXISTS` 等）に書くこと。

### B. CSVインポート機能（本丸）

`/admin/robo` に「CSVインポート」ボタンを追加 → インポート画面（`/admin/robo/import` を新設）。

**運用フロー**：発注者がGoogleスプレッドシート（テーマ・設問の2タブ）で編集 → 各タブをCSVダウンロード → この画面にアップロード → プレビュー確認 → 反映。

**テーマCSVのカラム（1行目はこのヘッダーそのまま）：**

```
level,theme_number,title,問い,問い画像URL,事例解説,事例解説画像URL,アイコン画像URL,アイコン絵文字,公開,表示順
```

**設問CSVのカラム：**

```
テーマ,設問番号,問題文,選択肢1,選択肢2,選択肢3,正解,解説,画像URL,動画URL,参照ページ
```

**仕様（すべて必須要件）：**

1. 2ファイル同時でも片方だけでもインポート可
2. upsertキー：テーマ＝`(level, theme_number)`、設問＝「テーマ」列（`1-1` 形式をパースして該当テーマを特定）＋「設問番号」
3. **CSVインポートでは削除しない**。CSVにない既存行はそのまま残す（削除は既存の管理画面からのみ）。プレビューにもその旨を明記する
4. 「正解」列は人間向けの `1`〜`3` で受け、DB保存時に `0`〜`2` に変換
5. 「公開」列は `1`/`0`
6. **プレビュー必須**：アップロード直後は書き込まず、行ごとに「新規」「更新」のバッジ付き一覧を表示 → 「この内容で反映する」ボタンで確定
7. バリデーションエラーは**行番号つき日本語**で表示（例：「設問CSV 3行目: 正解は1〜3で入力してください」）。1件でもエラーがあれば反映ボタンを無効化
8. CSVパーサは**自前実装**（RFC4180準拠：ダブルクォート囲み、クォート内の改行・カンマ・`""`エスケープに対応）。Googleスプレッドシートが書き出すCSVが正しく読めること。文字コードはUTF-8（BOM付きも受け付ける）
9. 反映はServer Action（`app/admin/robo/actions.ts` に追加。既存の `getAdminSupabase` パターンに従う）
10. インポート成功後、`/robo`・`/admin/robo` をrevalidateし、件数（新規n件・更新m件）を表示

### C. テンプレートと手順書（納品物に含む）

- `docs/robo-csv/テーマ-テンプレート.csv`、`docs/robo-csv/設問-テンプレート.csv`：ヘッダー＋lv1-1相当の記入例1行入り
- `docs/robo-csv/運用手順書.md`：非エンジニア向けに「スプレッドシートで編集→CSVダウンロード→インポート画面→プレビュー→反映」を、microCMSでの画像URL取得手順・YouTube URLの貼り方も含めて1ページで

### D. メディア表示対応

1. **画像（microCMS）**：`next.config.ts` の `images.remotePatterns` に `images.microcms-assets.io` を追加。設問画像・問い画像・事例解説画像・アイコン画像はすべて「URLがあれば表示、なければ非表示」で統一。読み込み失敗時は静かに非表示（壊れた画像アイコンを子どもに見せない）
2. **動画（YouTube）**：`robo_questions.video_url` にURLがあれば、設問画像の位置に埋め込みプレーヤーを表示（画像と動画が両方ある場合は動画優先）。
   - URLからvideo IDを抽出：`youtube.com/watch?v=`、`youtu.be/`、`youtube.com/shorts/` の3形式に対応
   - 埋め込みは `https://www.youtube-nocookie.com/embed/{id}`（プライバシー強化モード必須。子ども向けのため）
   - 16:9のレスポンシブ枠。抽出失敗時は何も表示しない

### E. 生徒画面のUI修正

1. **クイズの文字階層**（`components/robo/QuizStep.tsx`）：問題文を一段大きく・太く・濃色にし、上部に「Q1」等の番号チップ（ブランドティール `var(--brand)` 系）を付ける。選択肢は現状サイズ維持。色を増やすのではなくサイズ・太さ・余白で階層を作る
2. **クリアバッジの見切れ修正**（`components/robo/RoboStageNode.tsx`）：「クリア！」バッジが親スクロールコンテナ（`overflow-x-auto`）にクリップされて隠れている。バッジをノード枠の**内側**右上に移動して解決する
3. **マップをグリッド表示に**（`components/robo/RoboMap.tsx`）：現在の階段状ずらし（`marginLeft` によるインデント）をやめ、レベルごとの行に素直に並べるグリッドへ。順序ロックは元々存在しない（公開済みはどれでも選べる）ので、仕様変更ではなく「自由に選べることが伝わる見た目」への変更
4. **アイコン画像**（`components/robo/RoboStageNode.tsx`）：表示優先順位＝ `icon_url` の画像 → `icon_emoji` → `🤖`。ロック中は従来どおり🔒
5. **問いパートの画像**（`components/robo/OpenQuestionStep.tsx`）：`question_image_url` があれば問い文の下に表示

### F. ウォール画面の事例解説（`components/robo/AnswerWall.tsx`）

1. セクション見出しを「事例解説」から**「正解じゃないけど、こんな見方もあるよ」**に変更
2. 表示ロジック：`case_image_url` があれば**画像を主役**に表示（幅いっぱい・角丸）。`case_study_md` のテキストは画像の下に補足として表示。どちらか片方だけでも成立し、両方空ならセクションごと非表示
3. 表示条件は現状どおり「自分の意見を送信した後」のみ（変更しない）

### G. A4印刷ビュー（`app/admin/robo/[themeId]/print/[userId]/page.tsx`）

「④事例解説」に `case_image_url` の画像を追加：**幅いっぱい・高さ上限つき（`max-height` 80mm 程度・`object-fit: contain`）**で、全体が引き続きA4縦1枚に収まること。画像＋テキスト両方あれば画像が上。`getRoboPrintReport`（actions.ts）に `caseImageUrl` を追加する。

---

## 2. 立入禁止

- **適用済みマイグレーション2ファイルの編集禁止**（新規ファイルのみ）
- 新規npmパッケージの追加禁止（CSVパーサは自前、動画はiframe、画像はnext/image or img）
- ロボクエスト以外の既存機能（quest、yononaka、minecraft-sdgs、twilight、students等）のコード・スキーマ変更禁止。ただし `next.config.ts` の remotePatterns 追加と `types/database.ts` の robo_* 部分の更新は可
- 既存の生徒回答データ（robo_quiz_answers / robo_open_answers / robo_feedbacks / robo_theme_clears）を壊す変更禁止。CSVインポートが既存設問を更新しても回答ログのFK参照が生きること
- 認証は既存のSupabase Auth・`admin_users`・`getAdminSupabase` パターンに乗る。新設禁止

## 3. UI・トーン指針（v1から継続）

- クイズパート＝明るくにぎやか（昼の声）、問い以降＝落ち着いた暖色（夕方の声）。既存の切替演出を壊さない
- 全画面、小3が読める表記・大きめフォント。PC前提だがタブレットで崩れないこと
- 問いパートに点数・競争要素を入れない

## 4. 合格ライン（機械的に判定できる条件）

1. `npm run build` が通り、ロボ関連ファイルに対する `npx eslint` がエラー0件
2. テンプレートCSV（2ファイル）を `/admin/robo/import` に投入 → プレビューに新規/更新が正しく表示 → 反映 → `/robo` と `/admin/robo` に即反映される
3. 同じCSVをもう一度インポートすると全行「更新」となり、**重複行が作られない**（ユニークキーでのupsert確認）
4. CSVに含まれないテーマ・設問が**削除されていない**こと
5. 「正解」列に `4` や空を入れた行が、行番号つき日本語エラーになり反映がブロックされること
6. 動画URL入り設問で youtube-nocookie 埋め込みが表示される。microCMSのURL（`images.microcms-assets.io`）の画像が設問・問い・事例解説・アイコンで表示される
7. クリアバッジが見切れず表示される。マップがグリッド表示になり、公開済みテーマがどれでも選べる
8. 意見送信後のウォール画面に「正解じゃないけど、こんな見方もあるよ」カードが出て、画像主役＋テキスト補足で表示される（送信前には見えない）
9. 印刷プレビューで、解説画像込みでA4縦1枚に収まる
10. 既存ページ（/quest、/yononaka、/admin既存機能）が回帰なく表示される

## 5. 検収方法

- ローカル `npm run dev` で、管理者アカウントでCSVインポート一式（合格ライン2〜5）、生徒アカウントで表示系（6〜8）を手動確認
- マイグレーションは発注者が本番適用するため、ローカル確認はSQLファイルのレビュー＋（可能なら）ローカルDBで実施
- `npm run build` とロボ関連ファイルのeslint結果を報告に添付

## 6. 報告様式

- 変更・追加したファイルの一覧
- 施工内容の要約（コード全文は不要）
- 検収の実施結果（合格ライン1〜10それぞれ）
- 懸念（なければ「なし」と書く）

## 7. v2でやらないこと（積み残しとして明記）

- CSVでの行削除（削除は管理画面からのみ）
- 事例解説画像の複数枚対応（必要になったら「画像URL2」カラム追加で対応）
- microCMSのAPIスキーマ連携（メディアライブラリのURL利用のみ）
- インポート履歴・ロールバック機能
