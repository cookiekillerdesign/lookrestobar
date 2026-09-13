import { useEffect, useState } from 'react'
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from '../lib/supabaseConfig'
import { CONTACT as DEFAULT_CONTACT } from '../data/contact'
import { getLegalDoc as getDefaultLegalDoc } from '../pages/legal/content'

/*
 * Admin-editable site content (contacts, the short footer tagline, and the
 * four legal pages) — same "read straight from Supabase, fall back to a
 * bundled default" shape as content.js/publicApi.js use for the menu
 * itself. Every key lives as one row in `site_content` (see schema.sql §9);
 * a key with no row yet just means nobody has edited that section from the
 * admin panel, so the bundled default (the real, accurate copy already
 * shipped in this file) is shown instead — a guest never sees a blank page.
 *
 * Deliberately one small hand-rolled fetch per hook rather than a single
 * shared cache: this mirrors how the menu/legal pages already each keep
 * their own language & theme state independently (see LegalPage.jsx), and
 * a single-row PostgREST GET is cheap enough that there's nothing to gain
 * from more machinery here.
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

/** Fetches one `site_content` row by id. Returns null if unconfigured, missing, or on any error. */
async function fetchRow(id, signal) {
  if (!isSupabaseConfigured) return null
  try {
    const rows = await get(`site_content?select=data,updated_at&id=eq.${id}`, signal)
    return rows && rows[0] ? rows[0] : null
  } catch {
    return null
  }
}

/** Contact details (address, phone, maps/social links) — used by the footer and the menu's "coming soon" link. */
export function useContact() {
  const [contact, setContact] = useState(DEFAULT_CONTACT)
  useEffect(() => {
    const controller = new AbortController()
    fetchRow('contact', controller.signal).then(row => {
      if (row && row.data && Object.keys(row.data).length) setContact({ ...DEFAULT_CONTACT, ...row.data })
    })
    return () => controller.abort()
  }, [])
  return contact
}

/** Short tagline under the logo in the footer, per language. Falls back to the given default when no override is saved. */
export function useFooterNote(lang, fallback) {
  const [note, setNote] = useState(fallback)
  useEffect(() => { setNote(fallback) }, [fallback])
  useEffect(() => {
    const controller = new AbortController()
    fetchRow('footer', controller.signal).then(row => {
      const text = row?.data?.[lang]
      if (text) setNote(text)
    })
    return () => controller.abort()
  }, [lang])
  return note
}

const LEGAL_ROW_ID = { terms: 'legal_terms', privacy: 'legal_privacy', gdpr: 'legal_gdpr', cookies: 'legal_cookies' }
const UPDATED_FALLBACK_LOCALE = { ro: 'ro-RO', ru: 'ru-RU', en: 'en-GB' }

function formatUpdated(iso, lang) {
  try {
    return new Intl.DateTimeFormat(UPDATED_FALLBACK_LOCALE[lang] || 'ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso))
  } catch {
    return ''
  }
}

/**
 * One legal document (terms/privacy/gdpr/cookies) in the given language.
 * Returns { title, sections, updated, loading } — `updated` is a real,
 * always-accurate date once an admin has saved that page (derived from the
 * database row's own timestamp), or the bundled copy's fixed date otherwise.
 */
export function useLegalDoc(key, lang) {
  const [doc, setDoc] = useState(() => getDefaultLegalDoc(key, lang))
  useEffect(() => {
    setDoc(getDefaultLegalDoc(key, lang))
  }, [key, lang])
  useEffect(() => {
    const rowId = LEGAL_ROW_ID[key]
    if (!rowId) return
    const controller = new AbortController()
    fetchRow(rowId, controller.signal).then(row => {
      if (!row || !row.data) return
      const body = row.data[lang] || row.data.ro
      if (body && body.title && Array.isArray(body.sections)) {
        setDoc({ title: body.title, sections: body.sections, updated: formatUpdated(row.updated_at, lang) })
      }
    })
    return () => controller.abort()
  }, [key, lang])
  return doc
}
