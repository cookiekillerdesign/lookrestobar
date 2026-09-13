-- ============================================================================
-- LOOK Restobar — digital menu — Supabase schema
-- Run once in Supabase Studio → SQL Editor → New query → Run.
-- Safe to re-run: everything is idempotent.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Admin allowlist
--    Being logged in is NOT enough to write. The user id must also be here.
-- ----------------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

-- ----------------------------------------------------------------------------
-- 2. Menu categories (Gustări, Salate, Carne, ...)
-- ----------------------------------------------------------------------------
create table if not exists public.menu_categories (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  icon         text not null default 'platter',
  emoji        text,          -- shown before the name in the category tab, independent of `icon`
  sort_order   integer not null default 0,
  published    boolean not null default true,
  translations jsonb not null default '{}'::jsonb,  -- { ru: { name }, en: { name } } — RO stays in `name` above
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Upgrading an already-provisioned database: add the column if it predates it.
alter table public.menu_categories add column if not exists translations jsonb not null default '{}'::jsonb;
alter table public.menu_categories add column if not exists emoji text;

create index if not exists menu_categories_sort_idx on public.menu_categories (sort_order);

-- ----------------------------------------------------------------------------
-- 3. Menu items (dishes / drinks)
-- ----------------------------------------------------------------------------
create table if not exists public.menu_items (
  id               uuid primary key default gen_random_uuid(),
  category_id      uuid references public.menu_categories(id) on delete set null,
  name             text not null default '',
  description      text not null default '',
  price            numeric not null default 0,
  weight           text,          -- free text, e.g. "300 g" — left blank when not shown
  photo_url        text,
  storage_path     text,          -- path inside the `menu-media` bucket, for cleanup
  signature        boolean not null default false,  -- legacy gold "Recomandat" ribbon — superseded by `badge`, kept for old rows
  translations     jsonb not null default '{}'::jsonb,       -- { ru: { name, description }, en: { name, description } }
  badge            text,          -- one of: recommended | out_of_stock | new | discount (null = none)
  badge_expires_at timestamptz,   -- null = badge never expires; otherwise hidden client-side once past
  discount_percent integer,       -- shown on the "discount" badge, e.g. 20 → "-20%"
  sort_order       integer not null default 0,
  published        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint menu_items_badge_check check (badge is null or badge in ('recommended', 'out_of_stock', 'new', 'discount'))
);

-- Upgrading an already-provisioned database: add the new columns if they predate them.
alter table public.menu_items add column if not exists translations     jsonb not null default '{}'::jsonb;
alter table public.menu_items add column if not exists badge            text;
alter table public.menu_items add column if not exists badge_expires_at timestamptz;
alter table public.menu_items add column if not exists discount_percent integer;
do $$ begin
  alter table public.menu_items add constraint menu_items_badge_check check (badge is null or badge in ('recommended', 'out_of_stock', 'new', 'discount'));
exception when duplicate_object then null;
end $$;

create index if not exists menu_items_category_idx  on public.menu_items (category_id, sort_order);
create index if not exists menu_items_published_idx on public.menu_items (published);

-- ----------------------------------------------------------------------------
-- 4. updated_at triggers
-- ----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists menu_categories_touch on public.menu_categories;
create trigger menu_categories_touch before update on public.menu_categories
  for each row execute function public.touch_updated_at();

drop trigger if exists menu_items_touch on public.menu_items;
create trigger menu_items_touch before update on public.menu_items
  for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- 5. Row Level Security
--    Read: everyone (the public menu uses the anon key).
--    Write: only users present in admin_users.
-- ----------------------------------------------------------------------------
alter table public.menu_categories enable row level security;
alter table public.menu_items      enable row level security;
alter table public.admin_users     enable row level security;

drop policy if exists "categories public read" on public.menu_categories;
create policy "categories public read" on public.menu_categories
  for select using (published = true or public.is_admin());

drop policy if exists "categories admin write" on public.menu_categories;
create policy "categories admin write" on public.menu_categories
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "items public read" on public.menu_items;
create policy "items public read" on public.menu_items
  for select using (published = true or public.is_admin());

drop policy if exists "items admin write" on public.menu_items;
create policy "items admin write" on public.menu_items
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins read self" on public.admin_users;
create policy "admins read self" on public.admin_users
  for select using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 6. Storage bucket for dish photos
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('menu-media', 'menu-media', true, 20971520)   -- 20 MB per file — photos only
on conflict (id) do update set public = true, file_size_limit = 20971520;

drop policy if exists "menu media public read"  on storage.objects;
create policy "menu media public read" on storage.objects
  for select using (bucket_id = 'menu-media');

drop policy if exists "menu media admin insert" on storage.objects;
create policy "menu media admin insert" on storage.objects
  for insert with check (bucket_id = 'menu-media' and public.is_admin());

drop policy if exists "menu media admin update" on storage.objects;
create policy "menu media admin update" on storage.objects
  for update using (bucket_id = 'menu-media' and public.is_admin());

drop policy if exists "menu media admin delete" on storage.objects;
create policy "menu media admin delete" on storage.objects
  for delete using (bucket_id = 'menu-media' and public.is_admin());

-- ----------------------------------------------------------------------------
-- 7. Convenience: promote a user to admin by email
--    Usage:  select public.grant_admin('you@example.com');
--    Only works from the SQL editor (service role); ordinary users can't call it.
-- ----------------------------------------------------------------------------
create or replace function public.grant_admin(target_email text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare uid uuid;
begin
  select id into uid from auth.users where lower(email) = lower(target_email) limit 1;
  if uid is null then
    return 'Utilizatorul ' || target_email || ' nu a fost găsit. Creați-l mai întâi în Authentication → Users.';
  end if;
  insert into public.admin_users (user_id, email) values (uid, target_email)
  on conflict (user_id) do nothing;
  return 'Gata: ' || target_email || ' este acum administrator.';
end;
$$;

revoke all on function public.grant_admin(text) from public, anon, authenticated;

-- ----------------------------------------------------------------------------
-- 8. Usage stats for the admin Overview page ("free-tier meter")
--    Reads real numbers straight from Postgres/Storage — never guessed —
--    so the panel always matches what the Supabase dashboard itself shows.
--    Admin-only: returns no rows at all for a non-admin caller.
-- ----------------------------------------------------------------------------
create or replace function public.admin_usage_stats()
returns table (
  db_bytes             bigint,
  storage_file_count   bigint,
  storage_bytes        bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    pg_database_size(current_database())::bigint as db_bytes,
    (select count(*) from storage.objects where bucket_id = 'menu-media')::bigint as storage_file_count,
    (select coalesce(sum((o.metadata->>'size')::bigint), 0) from storage.objects o where o.bucket_id = 'menu-media')::bigint as storage_bytes
  where public.is_admin();
$$;

revoke all on function public.admin_usage_stats() from public, anon;
grant execute on function public.admin_usage_stats() to authenticated;

-- ----------------------------------------------------------------------------
-- 9. Site content — contacts, footer note, legal pages
--    One row per key ('contact', 'footer', 'legal_terms', 'legal_privacy',
--    'legal_gdpr', 'legal_cookies'). Nothing personal lives here, so it's
--    world-readable like the menu; only admins can write. The app ships with
--    bundled defaults for every key, so a guest never sees blank content —
--    a row only needs to exist once an admin actually edits that section.
-- ----------------------------------------------------------------------------
create table if not exists public.site_content (
  id         text primary key,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

drop trigger if exists site_content_touch on public.site_content;
create trigger site_content_touch before update on public.site_content
  for each row execute function public.touch_updated_at();

alter table public.site_content enable row level security;

drop policy if exists "site content public read" on public.site_content;
create policy "site content public read" on public.site_content
  for select using (true);

drop policy if exists "site content admin write" on public.site_content;
create policy "site content admin write" on public.site_content
  for all using (public.is_admin()) with check (public.is_admin());
