/*
 * Plain configuration values, deliberately free of any @supabase/supabase-js
 * import. The public menu only ever *reads* content — two GET requests
 * PostgREST answers over plain fetch — pulling the full client into the
 * entry chunk for that would cost every guest scanning the table QR code
 * bytes they don't need before the menu can paint. The real client lives in
 * supabase.js and is only imported by the admin panel, which is lazy-loaded.
 */
export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '')
export const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_ANON_KEY && /^https?:\/\//.test(SUPABASE_URL)
)

export const MEDIA_BUCKET = 'menu-media'
