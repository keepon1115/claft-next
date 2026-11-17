# フェーズ9: アバター連携 — Web広場とGodotマップに同じ自分が現れる仕掛け

前提: `00-OVERVIEW.md`、フェーズ1・5完了後に着手。Godot側作業は別リポジトリ(`c:\dev\Yononaka マップ`)。

## コンセプト(確定済み設計判断)

- `/members`(Web広場)とYononakaマップ(Godot)は**同じデータの2つの見せ方**
  - Web = メンバーをじっくり知る(詳細・即時反映)
  - マップ = メンバーに偶然出会う(村人として登場、話しかけると一言)
- **アバターデータはゲームに埋め込まない**。Godotは起動時にSupabaseから読む
  → メンバーが増えても・アバターを変えても**Godotの再エクスポート不要**
- アバターは写真ではなく**パーツ選択式ドット絵**(sprite_idカタログ方式)
  理由: ドット絵世界との調和、モデレーション不要、両世界で同一見た目

## 全体像

```
[CLAFT Web] アバター作成UI ──保存──▶ [Supabase: member_avatars]
                                          │                │
                              (即時反映) ▼      (起動時にREST取得) ▼
                          [/members 広場]        [Godotマップの村人]
```

## Step 1: データ基盤(CLAFT側 migration)

```sql
create table member_avatars (
  user_id uuid primary key references auth.users(id) on delete cascade,
  sprite_id text not null default 'villager_01',
  nickname text not null,
  message text not null default '' check (char_length(message) <= 50),
  updated_at timestamptz not null default now()
);
alter table member_avatars enable row level security;
create policy "read for all" on member_avatars for select using (true);
create policy "write own" on member_avatars for insert with check (auth.uid() = user_id);
create policy "update own" on member_avatars for update using (auth.uid() = user_id);
```

- `message`(ひとこと)は**全員に公開される**。50字制限はDB制約+UI両方で
- nicknameは既存profilesのnicknameを初期値にコピー(本名は絶対に入れない)

## Step 2: アバターカタログ(両リポジトリ共通の契約)

- Godotリポジトリの Ninja Adventure Pack(`assets/raw/NinjaAdventure/.../Actor/Character/`)から
  **12〜16体を選定**し、`sprite_id` を割り当てる(例: `villager_01`〜`villager_16`)
- 各キャラの `Walk.png` / `Idle.png` を:
  - Godot側: `assets/characters/{sprite_id}/` に配置(既存NPC見た目差し替えと同じ規約)
  - CLAFT側: `public/avatars/{sprite_id}.png`(Idleの正面1コマを切り出したプレビュー用)+
    広場アニメ用に `public/avatars/{sprite_id}_walk.png`(必要なら)
- カタログの正は CLAFT側 `data/avatarCatalog.ts`(sprite_idと表示名のリスト)。
  Godot側は「未知のsprite_idは `_default` にフォールバック」する(既存NPCの仕組みと同じ)ので、
  カタログのズレで壊れない

## Step 3: アバター作成UI(CLAFT側)

- 場所: `/members` 内に「じぶんアバターをつくる」ボタン(未作成ユーザーには目立つ誘導)
- モーダルまたは `/members/avatar` ページ:
  1. キャラ選択グリッド(ドット絵プレビュー、`image-rendering: pixelated`)
  2. 名前(profiles.nicknameが初期値)
  3. ひとこと(50字、「マップのみんなに見えるよ!」の注意書き必須)
- 保存で `member_avatars` にupsert
- `/members` 広場(フェーズ5)の `MemberAvatar` を改修:
  member_avatarsにレコードがあればドット絵スプライト、なければ既存のプロフィール画像で表示

## Step 4: Godot側 — 村人スポーン(別リポジトリでの作業指示)

1. `scripts/VillagerSpawner.gd`(autoload不要、村シーンに配置):
   - `HTTPRequest` で `https://{project}.supabase.co/rest/v1/member_avatars?select=sprite_id,nickname,message`
     を取得(ヘッダ: `apikey: {anon key}`。anon keyは公開前提の鍵なので埋め込み可)
   - 取得失敗時は村人なしで正常動作(オフラインでも壊れない)
2. 村人NPC生成: 既存 `NPC.gd` を流用し、会話データを
   `approach_text = "{nickname}: {message}"` の最小構成で注入
3. 配置: `user_id`(またはnickname)のハッシュ→固定位置。**Web広場と同じアルゴリズム**にして
   「両世界で同じ定位置」を実現(KodawariMap.gdの日替わりseed配置の応用)
4. 登場ゾーン: 出発ひろば(Main.tscn)の一角に「CLAFT村」エリア、または専用シーン

## 段階リリース

| 段階 | 内容 | 依存 |
|---|---|---|
| 9a | テーブル+アバター作成UI+広場のドット絵化 | フェーズ5 |
| 9b | Godot側村人スポーン | 9a+フェーズ10(同居配信) |

補足: 9bの村人一覧取得は**anonキーの公開read**(ログイン不要領域)。本人認証が要る機能(ずかん・手紙・偉人の特別セリフ)は`11-0`の認証ブリッジを使う — 2系統あるのは意図的な設計。

## 注意

- messageは自由入力の公開情報。UIで文字数制限+注意書き。問題が起きたら管理者承認制に切り替え
  (その場合 `approved boolean default false` を足すだけで済む設計にしておく)
- Supabase anon keyのGodot埋め込みはRLS前提で安全(書き込みポリシーが本人限定であることを必ず確認)
- スプライトのライセンス: Ninja Adventure Pack(CC0)を確認済みの範囲で使用

## 完了条件

- [ ] 子どもがWebでアバターを作ると、/members広場に即反映される
- [ ] 同じアバターがGodotマップに村人として現れ、話しかけると一言を返す
- [ ] アバター未作成メンバーはマップに現れない(orデフォルト姿)がエラーにならない
- [ ] Godotの再エクスポートなしでメンバー追加が反映される
