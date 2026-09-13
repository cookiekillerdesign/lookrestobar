-- Fills in a distinct emoji for the standard categories on a database that
-- already has real rows in it. On a live DB from before this feature shipped,
-- the `emoji` column can be missing entirely (schema.sql adds it, but that
-- one line never got run against your production database) — that's why
-- running this file used to fail with "column emoji does not exist". Either
-- way (missing column, or column present but empty on every old row) the
-- admin panel and the site fall back to the same 🍽️ placeholder for every
-- category until this runs.
--
-- Safe to run anytime, in either state: the ADD COLUMN below is a no-op if
-- the column is already there, and the updates match by `slug`, so each one
-- only ever touches the category with that exact slug and does nothing if
-- it's missing/renamed. Re-running it is harmless. If you've renamed a
-- category's slug, or added your own categories, just type their emoji
-- straight into the Categorii page in the admin — no SQL needed for that.
--
-- Run in Supabase → SQL Editor.

alter table public.menu_categories add column if not exists emoji text;

update public.menu_categories set emoji = '🥗' where slug = 'gustari';
update public.menu_categories set emoji = '🥬' where slug = 'salate';
update public.menu_categories set emoji = '🍲' where slug = 'supe';
update public.menu_categories set emoji = '🍝' where slug = 'paste';
update public.menu_categories set emoji = '🐟' where slug = 'peste';
update public.menu_categories set emoji = '🥩' where slug = 'carne';
update public.menu_categories set emoji = '🍔' where slug = 'burgeri';
update public.menu_categories set emoji = '🍽️' where slug = 'platouri';
update public.menu_categories set emoji = '🍟' where slug = 'garnituri';
update public.menu_categories set emoji = '🍰' where slug = 'deserturi';
