/** Folds diacritics and case so "branzeturi" finds "brânzeturi" — guests
 *  searching on a phone keyboard rarely bother typing ă/â/î/ș/ț. */
export function fold(s) {
  return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

/** Resolves a dish's active badge, respecting the admin-set expiry — an
 *  expired badge quietly stops showing without needing a cleanup job. Falls
 *  back to the legacy `signature` flag so older rows keep their gold ribbon. */
export function activeBadge(it) {
  if (it.badge) {
    const expired = it.badge_expires_at && new Date(it.badge_expires_at).getTime() <= Date.now()
    if (!expired) return it.badge
  }
  if (it.signature) return 'recommended'
  return null
}

/** One small inline icon per badge type — kept as hand-rolled SVG (no icon
 *  library import) so the public bundle stays a couple of anonymous GETs and
 *  nothing more. */
export function BadgeIcon({ type }) {
  switch (type) {
    case 'recommended':
      return <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.76 6.24 6.74.62-5.1 4.52 1.52 6.62L12 16.98l-5.92 3.52 1.52-6.62-5.1-4.52 6.74-.62L12 2.5z" /></svg>
    case 'new':
      return <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 5.6L19 9l-5.2 1.4L12 16l-1.8-5.6L5 9l5.2-1.4L12 2zM19 15l.9 2.6L22.5 18l-2.6.9L19 21.5l-.9-2.6-2.6-.9 2.6-.9L19 15z" /></svg>
    case 'discount':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="7.5" r="1.75" /><circle cx="16.5" cy="16.5" r="1.75" /><path d="M17 7L7 17" /></svg>
    case 'out_of_stock':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M6.5 6.5l11 11" /></svg>
    default:
      return null
  }
}

export const DEFAULT_CAT_EMOJI = '🍽️'

/** The price a guest actually pays — full price, unless an active discount
 *  badge knocks a percentage off. Centralized here so the card, the waiter
 *  list total and the copied text all agree with each other. */
export function effectivePrice(it) {
  const badge = activeBadge(it)
  if (badge === 'discount' && it.discount_percent > 0) {
    // Clamped defensively even though the admin input clamps too — a row
    // edited directly in Supabase, or saved before that clamp existed,
    // could carry an out-of-range percent, and this is the one place every
    // price on the site (card, search, waiter list, copied text) reads.
    const pct = Math.min(100, it.discount_percent)
    return Math.max(0, Math.round(it.price * (1 - pct / 100)))
  }
  return it.price
}
