-- profiles (usersテーブルの拡張)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- channels (are.naのチャンネルに相当)
create table public.channels (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  is_public boolean default true,
  slug text unique not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- blocks (チャンネル内のコンテンツ)
create table public.blocks (
  id uuid default gen_random_uuid() primary key,
  channel_id uuid references public.channels(id) on delete cascade not null,
  created_by uuid references public.profiles(id) on delete set null,
  type text not null check (type in ('link', 'image', 'text')),
  title text,
  content text,       -- テキストの内容 or URL
  image_url text,     -- 画像URL (Supabase Storage)
  metadata jsonb,     -- OGP情報など
  position integer default 0,
  created_at timestamptz default now()
);

-- channel_collaborators (共有・コラボ)
create table public.channel_collaborators (
  channel_id uuid references public.channels(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text default 'viewer' check (role in ('editor', 'viewer')),
  created_at timestamptz default now(),
  primary key (channel_id, user_id)
);

-- RLS有効化
alter table public.profiles enable row level security;
alter table public.channels enable row level security;
alter table public.blocks enable row level security;
alter table public.channel_collaborators enable row level security;

-- profiles ポリシー
create policy "profiles: 自分は読み書き" on public.profiles
  for all using (auth.uid() = id);
create policy "profiles: 全員読める" on public.profiles
  for select using (true);

-- channels ポリシー
create policy "channels: 公開チャンネルは誰でも見れる" on public.channels
  for select using (is_public = true or owner_id = auth.uid());
create policy "channels: オーナーは全操作" on public.channels
  for all using (owner_id = auth.uid());

-- blocks ポリシー
create policy "blocks: チャンネルが見えれば見れる" on public.blocks
  for select using (
    exists (
      select 1 from public.channels c
      where c.id = channel_id and (c.is_public = true or c.owner_id = auth.uid())
    )
  );
create policy "blocks: オーナーまたはエディターが書ける" on public.blocks
  for insert with check (
    exists (
      select 1 from public.channels c
      where c.id = channel_id and c.owner_id = auth.uid()
    ) or
    exists (
      select 1 from public.channel_collaborators cc
      where cc.channel_id = channel_id and cc.user_id = auth.uid() and cc.role = 'editor'
    )
  );
create policy "blocks: 作成者かオーナーが削除可" on public.blocks
  for delete using (
    created_by = auth.uid() or
    exists (select 1 from public.channels c where c.id = channel_id and c.owner_id = auth.uid())
  );

-- channel_collaborators ポリシー
create policy "collaborators: オーナーが管理" on public.channel_collaborators
  for all using (
    exists (select 1 from public.channels c where c.id = channel_id and c.owner_id = auth.uid())
  );
create policy "collaborators: 自分のコラボを見れる" on public.channel_collaborators
  for select using (user_id = auth.uid());

-- トリガー: 新規ユーザー登録時にprofileを自動作成
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Storage: 画像アップロード用バケット
insert into storage.buckets (id, name, public) values ('blocks', 'blocks', true);

create policy "blocks storage: 認証ユーザーはアップロード可" on storage.objects
  for insert with check (bucket_id = 'blocks' and auth.role() = 'authenticated');
create policy "blocks storage: 誰でも閲覧可" on storage.objects
  for select using (bucket_id = 'blocks');
