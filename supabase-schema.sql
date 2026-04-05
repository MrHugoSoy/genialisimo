-- ============================================================
-- GENIALISIMO — Supabase Schema
-- Ejecuta esto en el SQL Editor de tu proyecto Supabase
-- ============================================================

-- 1. PROFILES (extiende auth.users)
create table if not exists profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  username      text unique not null,
  avatar_emoji  text default '🗿',
  bio           text,
  points        int default 0,
  banner        text default 'linear-gradient(135deg,#ff4654,#ff8c00)',
  created_at    timestamptz default now()
);

-- 2. POSTS
create table if not exists posts (
  id            bigserial primary key,
  user_id       uuid references profiles(id) on delete cascade not null,
  title         text not null,
  image_url     text,
  category      text not null,
  votes         int default 0,
  comment_count int default 0,
  created_at    timestamptz default now()
);

-- 3. VOTES (evita votar dos veces)
create table if not exists votes (
  user_id  uuid references profiles(id) on delete cascade,
  post_id  bigint references posts(id) on delete cascade,
  value    int check (value in (1, -1)),
  primary key (user_id, post_id)
);

-- 4. COMMENTS
create table if not exists comments (
  id         bigserial primary key,
  post_id    bigint references posts(id) on delete cascade not null,
  user_id    uuid references profiles(id) on delete cascade not null,
  content    text not null,
  likes      int default 0,
  created_at timestamptz default now()
);

-- 5. STORAGE BUCKET para imágenes de posts
insert into storage.buckets (id, name, public)
values ('posts', 'posts', true)
on conflict do nothing;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table posts    enable row level security;
alter table votes    enable row level security;
alter table comments enable row level security;

-- Profiles: lectura pública, escritura solo propia
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- Posts: lectura pública, insertar/editar solo el dueño
create policy "posts_select" on posts for select using (true);
create policy "posts_insert" on posts for insert with check (auth.uid() = user_id);
create policy "posts_update" on posts for update using (auth.uid() = user_id);
create policy "posts_delete" on posts for delete using (auth.uid() = user_id);

-- Votes: solo usuarios autenticados
create policy "votes_all"    on votes    for all using (auth.uid() = user_id);

-- Comments: lectura pública, escritura autenticada
create policy "comments_select" on comments for select using (true);
create policy "comments_insert" on comments for insert with check (auth.uid() = user_id);
create policy "comments_delete" on comments for delete using (auth.uid() = user_id);

-- Storage: lectura pública, subida autenticada
create policy "storage_select" on storage.objects for select using (bucket_id = 'posts');
create policy "storage_insert" on storage.objects for insert with check (bucket_id = 'posts' and auth.role() = 'authenticated');

-- ============================================================
-- TRIGGER: crear perfil automáticamente al registrarse
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_emoji, banner)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_emoji', '🗿'),
    coalesce(new.raw_user_meta_data->>'banner', 'linear-gradient(135deg,#ff4654,#ff8c00)')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- FUNCTION: votar un post (upsert atómico)
-- ============================================================
create or replace function vote_post(p_post_id bigint, p_value int)
returns void as $$
declare
  old_value int := 0;
begin
  select value into old_value from votes where user_id = auth.uid() and post_id = p_post_id;

  if old_value is not null then
    if old_value = p_value then
      -- quitar voto
      delete from votes where user_id = auth.uid() and post_id = p_post_id;
      update posts set votes = votes - old_value where id = p_post_id;
    else
      -- cambiar voto
      update votes set value = p_value where user_id = auth.uid() and post_id = p_post_id;
      update posts set votes = votes - old_value + p_value where id = p_post_id;
    end if;
  else
    -- nuevo voto
    insert into votes (user_id, post_id, value) values (auth.uid(), p_post_id, p_value);
    update posts set votes = votes + p_value where id = p_post_id;
  end if;
end;
$$ language plpgsql security definer;
