# フェーズ2: 自分を理解する(図鑑・フィールドノート風)

前提: `00-OVERVIEW.md`、フェーズ1完了。

## 目的

「自分のデータ・非認知能力・ストーリー・PBL」への入口となるハブページと、
非認知能力レポート(PDF)閲覧、ストーリー専用ページを作る。
閲覧者は子ども本人+同一アカウントの保護者。

## デザイントーン: 図鑑・フィールドノート風

- 背景: 生成り紙 `#faf6ee`(うっすら紙テクスチャ。CSSグラデ+noiseで表現、画像不要)
- アクセント: 深緑 `#2d5a3d` / 金 `#c9a227`
- 見出し: セリフ体(`font-serif`、游明朝系フォールバック)。「観察記録」「標本No.」のようなラベル遊び
- カードは角丸小さめ+破線ボーダーや丸シール風スタンプで"ノート感"

## 対象ファイル

- 新規: `app/myself/page.tsx`(ハブ)
- 新規: `app/myself/report/page.tsx`(非認知能力PDF)
- 新規: `app/myself/story/page.tsx`(ストーリー)
- 新規: Supabase Storageバケット `non-cognitive-reports`(SQL下記)

## 実装内容

### 1. ハブ `/myself`

図鑑の目次風に4枚の大カード:

1. **自分のデータ** → `/profile`(「きみの観察記録」)
2. **非認知能力レポート** → `/myself/report`(「きみの能力図鑑」)
3. **ストーリー** → `/myself/story`(「きみの冒険の書」)
4. **PBL** → `/pbl`(「探究の記録」)

各カードに一言説明。未ログイン時は1と2に鍵アイコン+ログイン誘導(既存 `AuthButton` / `LoginPromptModal` パターン流用)。

### 2. 非認知能力レポート `/myself/report`

- 計測は外部で実施済み。**成果物PDFを表示するだけ**の仕組みでよい
- Supabase Storage バケット `non-cognitive-reports`、パス `{user_id}/report.pdf`
- 運用: 管理者がSupabaseダッシュボードから直接アップロード(専用管理UIは作らない)
- 表示: 認証必須。signed URL(有効1時間)を取得し `<iframe>` で表示。モバイルでは「PDFを開く」ボタン(新規タブ)も併設
- PDFが存在しない場合:「レポート準備中です。楽しみに待っていてね」の図鑑風空ページ
- 保護者向け注記を1行:「このレポートはおうちの人と一緒に見てね」

バケットSQL(migrationとして `supabase/migrations/` に追加):

```sql
insert into storage.buckets (id, name, public) values ('non-cognitive-reports', 'non-cognitive-reports', false);
create policy "Users can read own report" on storage.objects
  for select using (bucket_id = 'non-cognitive-reports' and (storage.foldername(name))[1] = auth.uid()::text);
```

### 3. ストーリー `/myself/story`

- ホームの `CraftStory` / `JibunCraft`(`components/home/`)をこのページで再利用(dynamic import、ホームと同じ)
- **ホーム側は当面変更しない**(クエスト12クリアでのアンロック演出はホームの魅力なので温存)。同じコンポーネントを2箇所から参照するだけ
- アンロック条件(`statistics.completedStages >= 12`、`LockedContent`)もホームと同一ロジックを適用

## 完了条件

- [ ] `/myself` が図鑑トーンで表示され、4カードから各機能へ遷移できる
- [ ] ログイン済みユーザーが自分のPDFを閲覧できる/未アップロード時に空状態が出る
- [ ] 他人のPDFはURL直叩きでも見えない(RLS確認)
- [ ] `/myself/story` でCraftStory/JibunCraftが動く(ホームも従来通り動く)
- [ ] navConfigの該当リンクを解放
- [ ] `npm run build` 成功
