import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/*
 * Same idea as the cookiekiller.online build: open the connection to
 * Supabase (DNS + TLS) while the HTML is still parsing, instead of only
 * once the JS bundle has downloaded and run far enough to call fetch()
 * itself. Cheap to add, shaves a bit off the menu's first paint.
 */
function supabasePreconnect() {
  return {
    name: 'supabase-preconnect',
    apply: 'build',
    transformIndexHtml() {
      const raw = (process.env.VITE_SUPABASE_URL || '').trim()
      if (!raw) return []
      let origin
      try { origin = new URL(raw).origin } catch { return [] }
      return [
        { tag: 'link', attrs: { rel: 'preconnect', href: origin, crossorigin: '' }, injectTo: 'head' },
        { tag: 'link', attrs: { rel: 'dns-prefetch', href: origin }, injectTo: 'head' }
      ]
    }
  }
}

export default defineConfig({
  plugins: [react(), supabasePreconnect()]
})
