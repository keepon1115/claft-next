-- メンバーアバター(フェーズ9a)。Web広場(/members)とGodotマップの村人が共有する唯一のデータソース。
-- Godot側はanonキーで公開readする前提のため、RLSは「readは全員・writeは本人のみ」。
-- message(ひとこと)は全員に公開される。50字制限はDB制約+UI両方で守る。
-- 問題が起きたら approved boolean default false を足して管理者承認制に切り替えられる設計。
-- 詳細仕様: docs/renovation/09-avatar-sync.md

create table member_avatars (
  user_id uuid primary key references auth.users(id) on delete cascade,
  sprite_id text not null default 'villager_01',
  nickname text not null,
  message text not null default '' check (char_length(message) <= 50),
  updated_at timestamptz not null default now()
);

alter table member_avatars enable row level security;

create policy "read for all" on member_avatars
  for select using (true);

create policy "write own" on member_avatars
  for insert with check (auth.uid() = user_id);

create policy "update own" on member_avatars
  for update using (auth.uid() = user_id);
