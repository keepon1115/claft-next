# フェーズ11: Yononakaマップ 採用機能 実装指示書(確定版)

前提: `00-OVERVIEW.md`、`09-avatar-sync.md`、`10-map-integration.md`。
**採用確定: C・A・B・E・F**(D・Gは見送り)。実装順序: **11-0(ブリッジ) → C → E → A → F → B**。
C・Eはブリッジ不要なので先行可。1機能=1セッションでSonnetに依頼する。

共通原則: コンテンツ・データはSupabase/JSONに置き、Godot再書き出しなしで増やせる形に。
PostgREST呼び出しは全て失敗許容(オフライン・未ログインでゲームが止まらない)。
Godot側変更後はオーナーの書き出しが必要(`10`の実装分担参照)。

---

## 11-0. 認証ブリッジ(A・F・Bの基盤。CLAFT⇔マップ本格連携の心臓部)

同一オリジンiframe(`10`で確立)を利用した双方向連携。

### CLAFT側(`app/yononaka-map/page.tsx` に追加)

1. iframeの `onLoad` 後、`supabase.auth.getSession()` でaccess_tokenを取得し
   `iframeRef.current.contentWindow.postMessage({ type: 'claft-auth', accessToken, userId }, window.location.origin)`
2. `supabase.auth.onAuthStateChange` でトークン更新時(約1時間ごと)に再送
3. マップからの `message` イベント(`type: 'map-event'`, 例: `letter-sent`, `npc-met`)を受けてトースト表示

### Godot側(新規autoload `scripts/ClaftBridge.gd`)

1. `JavaScriptBridge` で `window.addEventListener('message', ...)` を登録。
   **`event.origin === location.origin` を必ず検証**してからtoken/userIdを保持
2. ヘルパー `api(method, path, body)`: PostgRESTへのHTTPRequestに
   `apikey: {anon key}` + (tokenがあれば) `Authorization: Bearer {token}` を付与
3. `notify_parent(event_name, payload)`: `window.parent.postMessage(...)` で親へ通知
4. token未受領=ゲストモード。A・F(記録)・B(投函)はスキップし、探索は全て可能

### 完了条件

- [ ] ログイン状態でマップを開くとGodot内でuser_idが取れる/未ログインでも全explore可
- [ ] トークン更新後もAPI呼び出しが401にならない

---

## 11-C. 日替わりのにぎわい(小・ブリッジ不要)

- メンバー村人(9b)を日替わりで一部「おでかけ中」に。位置も日替わりで微変動
  (既存 `KodawariMap.gd` の日付seed配置ロジックを流用。表示率は7割程度)
- 自分の村人(userId一致)は**常に表示**+頭上に「じぶん」マーク
- データ追加不要、Godot側のみ

完了条件: 日を跨ぐと顔ぶれが変わる/自分は必ずいる

---

## 11-E. ラジオ塔・展望台(小・ブリッジ不要)

- マップに「ラジオ塔」を建設(V1のランドマークと同時施工可)。調べると選択肢UI:
  「コテンラジオをきく」「視点をふやすページへ」等
- リンクデータは `data/radio_tower.json`(Godot側)で管理。選ぶと
  `JavaScriptBridge.eval("window.open('...', '_blank')")` で新規タブ
- URL自体は `/perspectives` と同じ出典(TBD-2確定後に両方へ反映)

完了条件: 塔からコテンラジオ・/perspectivesが新規タブで開く

---

## 11-A. お仕事ずかん(中・目玉)

### データ(CLAFT側migration)

```sql
create table npc_encounters (
  user_id uuid references auth.users(id) on delete cascade,
  npc_id text not null,
  first_met_at timestamptz not null default now(),
  primary key (user_id, npc_id)
);
alter table npc_encounters enable row level security;
create policy "own read"  on npc_encounters for select using (auth.uid() = user_id);
create policy "own write" on npc_encounters for insert with check (auth.uid() = user_id);
```

### Godot側

- 大人NPC・偉人(11-F)との会話終了時、ブリッジ経由で `npc_encounters` にupsert(ゲスト時スキップ)
- 初遭遇時は「ずかんに記録した!」の小演出(キラッ+SE)

### CLAFT側: `/myself/zukan`(図鑑トーン=フェーズ2に従う)

- NPCマスタは `yononaka-map/data/npcs.json` をビルド時import(同一リポジトリなので直接読める)。
  偉人は `data/heroes.ts`(11-F)から
- 出会った人: カラー表示+名前+こだわりタグ+出会った日付
  未出会い: 黒シルエット+「?」(名前も伏せる)
- ページ構成: 「おとなずかん」セクション+「偉人ずかん」セクション。達成率表示(「12人中5人」)
- navConfig「自分を理解する」グループに「📖 であった人ずかん → /myself/zukan」を追加

完了条件: マップで話す→ずかんが埋まる→未出会いはシルエット/ゲスト時はエラーなくスキップ

---

## 11-F. 偉人かくれキャラ × 非認知能力連携(中・このアプリの独自性の核)

背景: CLAFTでは定期的に「非認知能力測定(Ai GROW)+キャリア面談」を実施している。
レポートには気質5項目・強みTOP3・「創造性が高いあなたは、現代のエジソン」のような**偉人の見立て**がある。
これをマップとメンバープロフィールに接続する。

### データ(CLAFT側)

```sql
create table member_traits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  strengths text[] default '{}',      -- 強みTOP3 例 {'創造性','個人的実行力','柔軟性'}
  hero_id text,                        -- 見立て偉人ID 例 'edison'
  temperament jsonb,                   -- 気質5項目 {"外向性":60,"開放性":66,...}(本人のみ閲覧)
  updated_at timestamptz not null default now()
);
alter table member_traits enable row level security;
create policy "own full read" on member_traits for select using (auth.uid() = user_id);
-- 公開用は列を絞ったビューで(強みと偉人だけ公開、気質の数値は本人のみ)
create view member_traits_public as select user_id, strengths, hero_id from member_traits;
```

- **入力は管理者がSupabaseダッシュボードから面談後に直接行う**(専用管理UIなし)
- 偉人カタログ: CLAFT側 `data/heroes.ts` とGodot側 `yononaka-map/data/heroes.json` の2箇所
  (id, 名前, 対応コンピテンシー, 名言, 出現条件)。**両者のidを一致させること**。初期メンバー案:
  エジソン(創造性)、レオナルド・ダ・ヴィンチ(興味)、ナイチンゲール(共感・傾聴力)、
  千利休(技を極める/こだわり)、渋沢栄一(組織への働きかけ)、緒方貞子(地球市民)、
  チャップリン(表現力)、伊能忠敬(個人的実行力) ※肖像はドット絵オリジナルで描く(著作権的に安全な故人のみ)

### Godot側: かくれ出現

- 日替わりseed+曜日・時間帯条件で、**1日1体だけ**どこかのゾーンに偉人が出現(出現率は全体の5割程度の日に留め「いない日」も作る — 会えた日の特別感のため)
- 会話: 名言(Words of Wisdom)+その偉人のコンピテンシーの話を子ども向けに一言
- **マジックモーメント**: ログイン済みで、`member_traits.hero_id` が一致する偉人に出会ったとき限定セリフ:
  「…きみ、『創造性』がひかってるね。わたしと同じだ。」+ ずかんに⭐マーク付きで記録
  (トークンでmember_traits(本人行)を取得できるのでブリッジ経由で判定可能)

### CLAFT側: メンバープロフィール反映

- `/members` のプロフィールモーダル(フェーズ5)に追加:
  **強みTOP3チップ**+**偉人バッジ**(「現代のエジソン」)を表示(member_traits_publicから)
- 気質5項目の数値は**本人のマイページ(/myself)のみ**に表示(公開バランスは後で調整可能な実装に)

完了条件: 偉人が日替わりで隠れ出現/自分の偉人に会うと特別セリフ/membersプロフィールに強みと偉人が出る

---

## 11-B. 手紙ポスト(大・リレー設計の本丸)

子どもが大人NPCのお題に答えを投函 → **管理者に届き、気づける** → 大人の返事を管理者が代理入力 → 子どもに通知。

### データ(CLAFT側migration)

```sql
create table npc_letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  npc_id text not null,
  question text not null,        -- お題(投函時のスナップショット)
  answer text not null check (char_length(answer) <= 500),
  reply text,
  status text not null default 'sent' check (status in ('sent','replied','read')),
  created_at timestamptz not null default now(),
  replied_at timestamptz
);
alter table npc_letters enable row level security;
create policy "own read"   on npc_letters for select using (auth.uid() = user_id);
create policy "own insert" on npc_letters for insert with check (auth.uid() = user_id);
create policy "own mark-read" on npc_letters for update using (auth.uid() = user_id)
  with check (status = 'read');   -- 本人はstatusをreadにするだけ
create policy "admin all" on npc_letters for all
  using (exists (select 1 from admin_users au where au.user_id = auth.uid() and au.is_active));
-- ※admin_usersのカラム(user_id, is_active)は既存migration 20260318_fix_admin_users_rls.sql と一致確認済み
```

### Godot側: 投函

- NPC会話後「ポストにへんじを入れる?」→ テキスト入力UI(`LineEdit`複数行、500字)→ ブリッジ経由でinsert
- 成功時 `notify_parent('letter-sent')` → CLAFT側でトースト「ポストに入れたよ! へんじを待とう📮」
- ゲスト時: 「へんじを受けとるにはCLAFTにログインしてね」

### 管理者側: 気づける仕組み(CLAFT側)

- **新規ページ `/admin/letters`**: 既存admin画面のパターン(ApprovalTable等)に従う。
  未返信(status='sent')を上に、投函一覧(子どもの名前・NPC・お題・答え・経過日数)。
  行を開いて返事を書き込み→保存で `reply`,`replied_at`,`status='replied'` を更新
- **管理ダッシュボード(`/admin`)に未返信バッジ**(「📮 未返信の手紙 3通」)+Sidebar管理セクションに「手紙管理」追加
- 運用メモ: 返事の実文は大人本人からメール等でもらい管理者が転記、でOK(その旨をページ内に薄く注記)

### 子ども側: 返事の受け取り

- **B-1(必須)**: `/yononaka-map` ページ(React側)に「📮じぶんのポスト」ボタン。
  status='replied' が1通でもあれば赤バッジ。開くと手紙モーダル(封筒が開く演出)→ 閲覧で status='read'
  ホーム(`/`)にも replied>0 のとき小さな📮通知を表示
- **B-2(あとで)**: マップ内のポストからも同じ手紙を読める(世界観重視の強化。B-1完了後に別途依頼)

完了条件: 投函→adminに未返信表示→返事保存→子どもに📮バッジ→開封でread化。全段でRLS越えの閲覧不可を確認

---

## 見送り(将来メニューとして保持)

- **D. 成長する村**: V3(CLAFT村)実装後に再検討すると効果的
- **G. なりきり一日体験**: ずかん・手紙が回ってから
