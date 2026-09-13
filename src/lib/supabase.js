import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured, MEDIA_BUCKET } from './supabaseConfig'

/*
 * A single client for the whole app. When the env vars are missing this
 * stays null instead of throwing at import time, so the admin panel can
 * render a setup screen rather than a blank page.
 */
export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storageKey: 'look_menu_admin_auth'
      }
    })
  : null

export { SUPABASE_URL, isSupabaseConfigured, MEDIA_BUCKET }
