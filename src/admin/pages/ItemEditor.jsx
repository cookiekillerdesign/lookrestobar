import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trash, Check, Star, Sparkle, Percent, Prohibit, CircleDashed } from '@phosphor-icons/react'
import { getItem, updateItem, deleteItem, listCategories, removeStorageObjects } from '../api'
import MediaDrop from '../components/MediaDrop'
import { useToast } from '../components/Toasts'
import Confirm from '../components/Confirm'
import { useAdminLang } from '../i18n.jsx'

/** Small "saved ✓" flash next to a field, so autosave (see below) gives
    visible confirmation without an intrusive toast for every keystroke. */
function useSavedFlash() {
  const [saved, setSaved] = useState(false)
  function flash() { setSaved(true); setTimeout(() => setSaved(false), 1400) }
  return [saved, flash]
}

function mergeTranslation(base, langCode, field, value) {
  return { ...(base || {}), [langCode]: { ...((base || {})[langCode] || {}), [field]: value } }
}

const BADGE_TYPES = ['none', 'recommended', 'new', 'discount', 'out_of_stock']
const BADGE_ICONS = { none: CircleDashed, recommended: Star, new: Sparkle, discount: Percent, out_of_stock: Prohibit }
const EXPIRY_PRESETS = [
  ['hour', 3600e3],
  ['day', 86400e3],
  ['week', 7 * 86400e3],
  ['month', 30 * 86400e3]
]

export default function ItemEditor() {
  const { t, lang } = useAdminLang()
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [item, setItem] = useState(null)
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [pendingDelete, setPendingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saved, flash] = useSavedFlash()
  const [editLang, setEditLang] = useState('ro')
  const [customOpen, setCustomOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([getItem(id), listCategories()])
      .then(([it, cats]) => { if (!cancelled) { setItem(it); setCategories(cats) } })
      .catch(err => { if (!cancelled) setError(err.message) })
    return () => { cancelled = true }
  }, [id])

  async function save(patch) {
    setItem(cur => ({ ...cur, ...patch }))
    try {
      await updateItem(id, patch)
      flash()
    } catch (err) {
      toast.error(err)
    }
  }

  async function onPhotoUploaded(result) {
    const previousPath = item.storage_path
    await save({ photo_url: result.url, storage_path: result.path })
    if (previousPath && previousPath !== result.path) await removeStorageObjects([previousPath])
    toast.success(t.editor.photoSavedToast)
  }

  function setBadge(code) {
    const badge = code === 'none' ? null : code
    const patch = { badge }
    if (badge !== 'discount') patch.discount_percent = null
    if (!badge) patch.badge_expires_at = null
    save(patch)
  }

  function setExpiryPreset(ms) {
    setCustomOpen(false)
    save({ badge_expires_at: ms == null ? null : new Date(Date.now() + ms).toISOString() })
  }

  function setCustomExpiry(value) {
    if (!value) return
    save({ badge_expires_at: new Date(value).toISOString() })
  }

  async function confirmDelete() {
    setDeleting(true)
    try {
      await deleteItem(item)
      toast.success(t.editor.deletedToast(item.name))
      navigate('/admin/items')
    } catch (err) { toast.error(err); setDeleting(false) }
  }

  if (error) return <div className="adm-note adm-note--danger"><b>{t.common.error}</b>{error}</div>
  if (!item) return <div className="adm-loading"><span className="adm-spinner" />{t.common.loading}</div>

  return (
    <>
      <div className="adm-head">
        <div>
          <button type="button" className="adm-btn adm-btn--sm adm-btn--ghost" onClick={() => navigate('/admin/items')} style={{ marginBottom: 10 }}>
            <ArrowLeft size={12} weight="bold" />{t.editor.backToItems}
          </button>
          <h1>{item.name || t.editor.newTitle}</h1>
          <p className="adm-lede" style={{ marginBottom: 0 }}>
            {t.editor.autosaveHint}{' '}
            {saved && <span style={{ color: 'var(--a-live)' }}><Check size={12} weight="bold" style={{ verticalAlign: -1 }} /> {t.common.saved}</span>}
          </p>
        </div>
        <div className="adm-actions">
          <button type="button" className="adm-btn adm-btn--danger" onClick={() => setPendingDelete(true)}><Trash size={13} weight="bold" />{t.editor.delete}</button>
        </div>
      </div>

      <div className="adm-panel" style={{ marginBottom: 18 }}>
        <div className="adm-panel-head"><h2>{t.editor.photoTitle}</h2></div>
        <div className="adm-photo-grid">
          <div className="adm-thumb adm-thumb--photo">
            {item.photo_url ? <img src={item.photo_url} alt="" /> : <span>{t.editor.noPhoto}</span>}
          </div>
          <MediaDrop folder={`items/${id}`} onUploaded={onPhotoUploaded} />
        </div>
      </div>

      <div className="adm-panel" style={{ marginBottom: 18 }}>
        <div className="adm-panel-head"><h2>{t.editor.detailsTitle}</h2></div>

        <label className="adm-field">
          <span className="adm-label">{t.editor.category}</span>
          <select className="adm-select" value={item.category_id || ''} onChange={e => save({ category_id: e.target.value })}>
            {/* A dish whose category was deleted has category_id null, which
                matches no real <option> below — without this placeholder the
                select would silently default to showing the first category
                while the dish stayed uncategorized underneath. */}
            {!categories.some(c => c.id === item.category_id) && (
              <option value="" disabled>{t.items.noCategoryOption}</option>
            )}
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>

        <div className="adm-tabs">
          {['ro', 'ru', 'en'].map(code => (
            <button key={code} type="button" className={`adm-tab${editLang === code ? ' active' : ''}`} onClick={() => setEditLang(code)}>
              {code.toUpperCase()}
            </button>
          ))}
        </div>

        {editLang === 'ro' ? (
          <>
            <label className="adm-field">
              <span className="adm-label">{t.editor.name}</span>
              <input className="adm-input" value={item.name || ''} onChange={e => setItem(cur => ({ ...cur, name: e.target.value }))} onBlur={e => save({ name: e.target.value })} />
            </label>
            <label className="adm-field">
              <span className="adm-label">{t.editor.description}</span>
              <textarea className="adm-textarea" rows={3} value={item.description || ''} onChange={e => setItem(cur => ({ ...cur, description: e.target.value }))} onBlur={e => save({ description: e.target.value })} />
            </label>
          </>
        ) : (
          <>
            <p className="adm-hint" style={{ marginBottom: 14 }}>{t.editor.translationsHint}</p>
            <label className="adm-field">
              <span className="adm-label">{t.editor.name} ({editLang.toUpperCase()})</span>
              <input
                className="adm-input"
                value={item.translations?.[editLang]?.name || ''}
                onChange={e => setItem(cur => ({ ...cur, translations: mergeTranslation(cur.translations, editLang, 'name', e.target.value) }))}
                onBlur={e => save({ translations: mergeTranslation(item.translations, editLang, 'name', e.target.value) })}
              />
            </label>
            <label className="adm-field">
              <span className="adm-label">{t.editor.description} ({editLang.toUpperCase()})</span>
              <textarea
                className="adm-textarea" rows={3}
                value={item.translations?.[editLang]?.description || ''}
                onChange={e => setItem(cur => ({ ...cur, translations: mergeTranslation(cur.translations, editLang, 'description', e.target.value) }))}
                onBlur={e => save({ translations: mergeTranslation(item.translations, editLang, 'description', e.target.value) })}
              />
            </label>
          </>
        )}

        <div className="adm-row">
          <label className="adm-field">
            <span className="adm-label">{t.editor.price}</span>
            <input className="adm-input" type="number" min="0" step="1" value={item.price ?? 0} onChange={e => setItem(cur => ({ ...cur, price: Number(e.target.value) }))} onBlur={e => save({ price: Number(e.target.value) || 0 })} />
          </label>
          <label className="adm-field">
            <span className="adm-label">{t.editor.weight}</span>
            <input className="adm-input" placeholder={t.editor.weightPh} value={item.weight || ''} onChange={e => setItem(cur => ({ ...cur, weight: e.target.value }))} onBlur={e => save({ weight: e.target.value })} />
          </label>
        </div>

        <label className="adm-check">
          <input type="checkbox" checked={Boolean(item.signature)} onChange={e => save({ signature: e.target.checked })} />
          {t.editor.signature}
        </label>

        <label className="adm-check">
          <input type="checkbox" checked={Boolean(item.published)} onChange={e => save({ published: e.target.checked })} />
          {t.editor.published}
        </label>
      </div>

      <div className="adm-panel" style={{ marginBottom: 18 }}>
        <div className="adm-panel-head"><h2>{t.editor.badgeTitle}</h2></div>
        <p className="adm-hint" style={{ marginTop: -6, marginBottom: 14 }}>{t.editor.badgeHint}</p>

        <div className="adm-badge-picker">
          {BADGE_TYPES.map(code => {
            const BadgeIcon = BADGE_ICONS[code]
            return (
              <button
                key={code}
                type="button"
                className={`adm-badge-chip adm-badge-chip--${code}${(item.badge || 'none') === code ? ' active' : ''}`}
                onClick={() => setBadge(code)}
              >
                <BadgeIcon size={13} weight={code === 'none' ? 'regular' : 'fill'} />
                {t.editor[code === 'none' ? 'badgeNone' : code === 'recommended' ? 'badgeRecommended' : code === 'new' ? 'badgeNew' : code === 'discount' ? 'badgeDiscount' : 'badgeOutOfStock']}
              </button>
            )
          })}
        </div>

        {item.badge === 'discount' && (
          <label className="adm-field" style={{ marginTop: 14, maxWidth: 200 }}>
            <span className="adm-label">{t.editor.discountPercent}</span>
            <input
              className="adm-input" type="number" min="0" max="100" step="1"
              placeholder={t.editor.discountPercentPh}
              value={item.discount_percent ?? ''}
              onChange={e => setItem(cur => ({ ...cur, discount_percent: e.target.value === '' ? null : Number(e.target.value) }))}
              onBlur={e => {
                // The min/max attributes above only affect the spinner arrows —
                // a typed 500 or -10 sails right through onChange, and without
                // clamping here it would get saved as-is: a >100% "discount"
                // makes effectivePrice() go negative on the public menu, and a
                // negative one silently shows full price. Clamp on the way out.
                const n = e.target.value === '' ? null : Math.max(0, Math.min(100, Number(e.target.value)))
                setItem(cur => ({ ...cur, discount_percent: n }))
                save({ discount_percent: n })
              }}
            />
          </label>
        )}

        {item.badge && (
          <div style={{ marginTop: 18 }}>
            <span className="adm-label">{t.editor.expiryTitle}</span>
            <p className="adm-hint" style={{ marginTop: 2, marginBottom: 10 }}>{t.editor.expiryHint}</p>
            <div className="adm-duration-picker">
              <button type="button" className={`adm-duration-chip${!item.badge_expires_at ? ' active' : ''}`} onClick={() => setExpiryPreset(null)}>{t.editor.expiryNever}</button>
              {EXPIRY_PRESETS.map(([key, ms]) => (
                <button key={key} type="button" className="adm-duration-chip" onClick={() => setExpiryPreset(ms)}>
                  {t.editor[`expiry${key[0].toUpperCase()}${key.slice(1)}`]}
                </button>
              ))}
              <button type="button" className={`adm-duration-chip${customOpen ? ' active' : ''}`} onClick={() => setCustomOpen(o => !o)}>{t.editor.expiryCustom}</button>
            </div>
            {customOpen && (
              <label className="adm-field" style={{ marginTop: 10, maxWidth: 260 }}>
                <span className="adm-label">{t.editor.expiryCustomLabel}</span>
                <input className="adm-input" type="datetime-local" onChange={e => setCustomExpiry(e.target.value)} />
              </label>
            )}
            {item.badge_expires_at && (
              <p className="adm-hint" style={{ marginTop: 10 }}>
                {t.editor.expiryUntil(new Date(item.badge_expires_at).toLocaleString(lang === 'ro' ? 'ro-RO' : lang === 'ru' ? 'ru-RU' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }))}
              </p>
            )}
          </div>
        )}
      </div>

      <Confirm
        open={pendingDelete}
        title={t.editor.deleteTitle(item.name)}
        body={t.editor.deleteBody}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(false)}
      />
    </>
  )
}
