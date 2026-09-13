import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from '../lib/supabaseConfig'
import { SEED_CATEGORIES, SEED_ITEMS } from '../data/seedMenu'

/*
 * Read-only access over PostgREST. Deliberately hand-rolled fetch rather
 * than supabase-js: this runs on every guest's phone, and the only thing it
 * needs is two anonymous GETs. Row Level Security still applies — the anon
 * key can read published rows and nothing else.
 */
async function get(path, signal) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    signal,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Accept: 'application/json'
    }
  })
  if (!res.ok) throw new Error(`Supabase ${res.status}`)
  return res.json()
}

/**
 * Loads the menu. Falls back to the bundled "Meniu Sala" content whenever
 * Supabase isn't configured yet, or the database has no categories in it —
 * a guest never sees a blank menu, and the site works before the admin
 * panel has been set up at all.
 */
export async function fetchMenu(signal) {
  if (!isSupabaseConfigured) {
    return { categories: SEED_CATEGORIES, items: SEED_ITEMS, live: false }
  }
  try {
    const [categories, items] = await Promise.all([
      get('menu_categories?select=*&published=eq.true&order=sort_order.asc', signal),
      get('menu_items?select=*&published=eq.true&order=sort_order.asc', signal)
    ])
    if (!categories.length) return { categories: SEED_CATEGORIES, items: SEED_ITEMS, live: false }
    return { categories, items, live: true }
  } catch {
    return { categories: SEED_CATEGORIES, items: SEED_ITEMS, live: false }
  }
}
