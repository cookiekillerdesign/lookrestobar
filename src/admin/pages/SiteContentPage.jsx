import { useEffect, useState } from 'react'
import { Plus, Trash, CaretUp, CaretDown, Check } from '@phosphor-icons/react'
import { getSiteContent, saveSiteContent } from '../api'
import { useToast } from '../components/Toasts'
import { useAdminLang } from '../i18n.jsx'
import { CONTACT as DEFAULT_CONTACT } from '../../data/contact'
import { LEGAL_DOCS as DEFAULT_LEGAL_DOCS } from '../../pages/legal/content'
import { getDict } from '../../i18n/site'

const TOP_TABS = ['contact', 'footer', 'terms', 'privacy', 'gdpr', 'cookies']
const LEGAL_KEYS = ['terms', 'privacy', 'gdpr', 'cookies']
const LEGAL_ROW_ID = { terms: 'legal_terms', privacy: 'legal_privacy', gdpr: 'legal_gdpr', cookies: 'legal_cookies' }
const LEGAL_TAB_LABEL_KEY = { terms: 'tabTerms', privacy: 'tabPrivacy', gdpr: 'tabGdpr', cookies: 'tabCookies' }
const UPDATED_LOCALE = { ro: 'ro-RO', ru: 'ru-RU', en: 'en-GB' }

/** Small "saved ✓" flash next to a panel heading, same pattern as ItemEditor's autosave feedback. */
function useSavedFlash() {
  const [saved, setSaved] = useState(false)
  function flash() { setSaved(true); setTimeout(() => setSaved(false), 1400) }
  return [saved, flash]
}

function SavedFlag({ saved }) {
  const { t } = useAdminLang()
  if (!saved) return null
  return <span style={{ color: 'var(--a-live)', fontSize: 12.5 }}><Check size={12} weight="bold" style={{ verticalAlign: -1 }} /> {t.common.saved}</span>
}

/**
 * Everything a restaurant manager might need to change without touching
 * code: the contact/social details, the short footer tagline, and the four
 * legal pages. Each of the six tabs below is its own small self-contained
 * editor with its own load + autosave, all reading and writing the same
 * `site_content` table (see supabase/schema.sql §9 and src/content/siteContent.js,
 * which is what the public site actually reads).
 */
export default function SiteContentPage() {
  const { t } = useAdminLang()
  const [tab, setTab] = useState('contact')

  const TAB_LABEL = {
    contact: t.site.tabContact, footer: t.site.tabFooter,
    terms: t.site.tabTerms, privacy: t.site.tabPrivacy, gdpr: t.site.tabGdpr, cookies: t.site.tabCookies
  }

  return (
    <>
      <div className="adm-head">
        <div>
          <div className="adm-eyebrow">{t.site.eyebrow}</div>
          <h1>{t.site.title}</h1>
          <p className="adm-lede">{t.site.lede}</p>
        </div>
      </div>

      <div className="adm-tabs" style={{ marginBottom: 22, flexWrap: 'wrap' }}>
        {TOP_TABS.map(k => (
          <button key={k} type="button" className={`adm-tab${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>
            {TAB_LABEL[k]}
          </button>
        ))}
      </div>

      {tab === 'contact' && <ContactEditor />}
      {tab === 'footer' && <FooterEditor />}
      {LEGAL_KEYS.includes(tab) && <LegalEditor key={tab} docKey={tab} />}
    </>
  )
}

/* --------------------------------------------------------------- contact */

function ContactEditor() {
  const { t } = useAdminLang()
  const toast = useToast()
  const [contact, setContact] = useState(null)
  const [saved, flash] = useSavedFlash()

  useEffect(() => {
    let cancelled = false
    getSiteContent('contact')
      .then(row => { if (!cancelled) setContact({ ...DEFAULT_CONTACT, ...(row?.data || {}) }) })
      .catch(err => { if (!cancelled) toast.error(err) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function save(patch) {
    const next = { ...contact, ...patch }
    setContact(next)
    try { await saveSiteContent('contact', next); flash() } catch (err) { toast.error(err) }
  }

  if (!contact) return <div className="adm-loading"><span className="adm-spinner" />{t.common.loading}</div>

  function field(key, label, hint) {
    return (
      <label className="adm-field">
        <span className="adm-label">{label}</span>
        <input
          className="adm-input"
          value={contact[key] || ''}
          onChange={e => setContact(c => ({ ...c, [key]: e.target.value }))}
          onBlur={e => save({ [key]: e.target.value })}
        />
        {hint && <p className="adm-hint" style={{ marginTop: 6 }}>{hint}</p>}
      </label>
    )
  }

  return (
    <div className="adm-panel">
      <div className="adm-panel-head"><h2>{t.site.contactTitle}</h2><SavedFlag saved={saved} /></div>
      <p className="adm-hint" style={{ marginBottom: 16 }}>{t.site.contactLede}</p>
      <div className="adm-row">
        {field('address', t.site.address)}
        {field('maps', t.site.maps)}
      </div>
      <div className="adm-row">
        {field('phoneDisplay', t.site.phoneDisplay)}
        {field('phoneHref', t.site.phoneHref, t.site.phoneHrefHint)}
      </div>
      <div className="adm-row">
        {field('instagram', t.site.instagram)}
        {field('facebook', t.site.facebook)}
        {field('tiktok', t.site.tiktok)}
      </div>
      {field('officialSite', t.site.officialSite, t.site.officialSiteHint)}
    </div>
  )
}

/* ---------------------------------------------------------------- footer */

function FooterEditor() {
  const { t } = useAdminLang()
  const toast = useToast()
  const [note, setNote] = useState(null)
  const [saved, flash] = useSavedFlash()

  useEffect(() => {
    let cancelled = false
    getSiteContent('footer')
      .then(row => {
        if (cancelled) return
        const defaults = { ro: getDict('ro').footerNote, ru: getDict('ru').footerNote, en: getDict('en').footerNote }
        setNote({ ...defaults, ...(row?.data || {}) })
      })
      .catch(err => { if (!cancelled) toast.error(err) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function save(code, value) {
    const next = { ...note, [code]: value }
    setNote(next)
    try { await saveSiteContent('footer', next); flash() } catch (err) { toast.error(err) }
  }

  if (!note) return <div className="adm-loading"><span className="adm-spinner" />{t.common.loading}</div>

  return (
    <div className="adm-panel">
      <div className="adm-panel-head"><h2>{t.site.footerTitle}</h2><SavedFlag saved={saved} /></div>
      <p className="adm-hint" style={{ marginBottom: 16 }}>{t.site.footerLede}</p>
      {['ro', 'ru', 'en'].map(code => (
        <label className="adm-field" key={code}>
          <span className="adm-label">{t.site[`footerNote${code[0].toUpperCase()}${code.slice(1)}`]}</span>
          <textarea
            className="adm-textarea" rows={2}
            value={note[code] || ''}
            onChange={e => setNote(n => ({ ...n, [code]: e.target.value }))}
            onBlur={e => save(code, e.target.value)}
          />
        </label>
      ))}
    </div>
  )
}

/* ----------------------------------------------------------------- legal */

function LegalEditor({ docKey }) {
  const { t, lang } = useAdminLang()
  const toast = useToast()
  const rowId = LEGAL_ROW_ID[docKey]
  const [doc, setDoc] = useState(null) // { ro: { title, sections }, ru: {...}, en: {...} }
  const [updatedAt, setUpdatedAt] = useState(null)
  const [editLang, setEditLang] = useState('ro')
  const [saved, flash] = useSavedFlash()

  useEffect(() => {
    let cancelled = false
    getSiteContent(rowId)
      .then(row => {
        if (cancelled) return
        if (row?.data && Object.keys(row.data).length) { setDoc(row.data); setUpdatedAt(row.updated_at) }
        else { setDoc(DEFAULT_LEGAL_DOCS[docKey]); setUpdatedAt(null) }
      })
      .catch(err => { if (!cancelled) toast.error(err) })
    setEditLang('ro')
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowId])

  async function save(nextDoc) {
    setDoc(nextDoc)
    try {
      const row = await saveSiteContent(rowId, nextDoc)
      setUpdatedAt(row.updated_at)
      flash()
    } catch (err) { toast.error(err) }
  }

  if (!doc) return <div className="adm-loading"><span className="adm-spinner" />{t.common.loading}</div>

  const body = doc[editLang] || { title: '', sections: [] }
  const sections = body.sections || []

  function patchBody(patch) { return { ...doc, [editLang]: { ...body, ...patch } } }
  function setLocalTitle(value) { setDoc(patchBody({ title: value })) }
  function saveTitle(value) { save(patchBody({ title: value })) }
  function setLocalSection(i, field, value) {
    setDoc(patchBody({ sections: sections.map((s, idx) => idx === i ? { ...s, [field]: value } : s) }))
  }
  function saveSection(i, field, value) {
    save(patchBody({ sections: sections.map((s, idx) => idx === i ? { ...s, [field]: value } : s) }))
  }
  function addSection() { save(patchBody({ sections: [...sections, { h: '', p: '' }] })) }
  function removeSection(i) { save(patchBody({ sections: sections.filter((_, idx) => idx !== i) })) }
  function moveSection(i, dir) {
    const j = i + dir
    if (j < 0 || j >= sections.length) return
    const next = [...sections]
    ;[next[i], next[j]] = [next[j], next[i]]
    save(patchBody({ sections: next }))
  }

  const updatedText = updatedAt
    ? t.site.updatedPreview(new Date(updatedAt).toLocaleDateString(UPDATED_LOCALE[lang] || 'ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }))
    : t.site.updatedNever

  return (
    <div className="adm-panel">
      <div className="adm-panel-head"><h2>{t.site[LEGAL_TAB_LABEL_KEY[docKey]]}</h2><SavedFlag saved={saved} /></div>
      <p className="adm-hint" style={{ marginBottom: 16 }}>{t.site.legalLede}</p>

      <div className="adm-tabs" style={{ marginBottom: 18 }}>
        {['ro', 'ru', 'en'].map(code => (
          <button key={code} type="button" className={`adm-tab${editLang === code ? ' active' : ''}`} onClick={() => setEditLang(code)}>
            {code.toUpperCase()}
          </button>
        ))}
      </div>

      <label className="adm-field">
        <span className="adm-label">{t.site.docTitle}</span>
        <input className="adm-input" value={body.title || ''} onChange={e => setLocalTitle(e.target.value)} onBlur={e => saveTitle(e.target.value)} />
      </label>

      <p className="adm-hint" style={{ marginTop: -6, marginBottom: 18 }}>{updatedText}</p>

      <span className="adm-label">{t.site.sectionsTitle}</span>
      {sections.length === 0 && <p className="adm-hint" style={{ marginTop: 6, marginBottom: 12 }}>{t.site.emptySections}</p>}

      <div style={{ marginTop: 10 }}>
        {sections.map((s, i) => (
          <div key={i} className="adm-legal-section-row">
            <div className="adm-legal-section-actions">
              <button type="button" className="adm-btn adm-btn--sm adm-btn--ghost" onClick={() => moveSection(i, -1)} disabled={i === 0} aria-label={t.common.up}><CaretUp size={12} weight="bold" /></button>
              <button type="button" className="adm-btn adm-btn--sm adm-btn--ghost" onClick={() => moveSection(i, 1)} disabled={i === sections.length - 1} aria-label={t.common.down}><CaretDown size={12} weight="bold" /></button>
              <button type="button" className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => removeSection(i)} aria-label={t.site.removeSection}><Trash size={12} weight="bold" /></button>
            </div>
            <label className="adm-field">
              <span className="adm-label">{t.site.sectionHeading}</span>
              <input className="adm-input" value={s.h || ''} onChange={e => setLocalSection(i, 'h', e.target.value)} onBlur={e => saveSection(i, 'h', e.target.value)} />
            </label>
            <label className="adm-field" style={{ marginBottom: 0 }}>
              <span className="adm-label">{t.site.sectionBody}</span>
              <textarea className="adm-textarea" rows={3} value={s.p || ''} onChange={e => setLocalSection(i, 'p', e.target.value)} onBlur={e => saveSection(i, 'p', e.target.value)} />
            </label>
          </div>
        ))}
        <button type="button" className="adm-btn adm-btn--sm" onClick={addSection}><Plus size={12} weight="bold" />{t.site.addSection}</button>
      </div>
    </div>
  )
}
