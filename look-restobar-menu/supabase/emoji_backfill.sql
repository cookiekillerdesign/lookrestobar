-- Fills in a distinct emoji for the standard categories on a database that
-- already has real rows in it (the `emoji` column exists — schema.sql added
-- it — but on a live DB it's just empty on every row that existed before
-- this feature shipped, so the admin panel and the site both fall back to
-- the same 🍽️ placeholder for all of them until you run this or type one
-- in by hand).
--
-- Safe to run anytime: matches by `slug`, so it only ever touches the
-- category with that exact slug and does nothing if it's missing/renamed.
-- Re-running it is harmless. If you've renamed a category's slug, or added
-- your own categories, just type their emoji straight into the Categorii
-- page in the admin — no SQL needed for that.
--
-- Run in Supabase → SQL Editor.

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
