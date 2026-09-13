import { useEffect, useState } from 'react'
import { DotsSixVertical, Plus, Trash, Eye, EyeSlash, CaretUp, CaretDown, Translate } from '@phosphor-icons/react'
import { listCategories, createCategory, updateCategory, deleteCategory, reorderCategories } from '../api'
import { useToast } from '../components/Toasts'
import Confirm from '../components/Confirm'
import { move, dragProps } from '../reorder'
import { useAdminLang } from '../i18n.jsx'

const DEFAULT_EMOJI = '🍽️'

function mergeTranslation(base, langCode, field, value) {
  return { ...(base || {}), [langCode]: { ...((base || {})[langCode] || {}), [field]: value } }
}

export default function CategoriesPage() {
  const { t } = useAdminLang()
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')
  const [dragIndex, setDragIndex] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [expanded, setExpanded] = useState(() => new Set())
  const [justAddedId, setJustAddedId] = useState(null)
  const toast = useToast()

  useEffect(() => {
    if (!justAddedId) return
    const el = document.getElementById(`cat-row-${justAddedId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('just-added')
      setTimeout(() => el.classList.remove('just-added'), 1800)
    }
    const id = setTimeout(() => setJustAddedId(null), 1800)
    return () => clearTimeout(id)
  }, [justAddedId])

  useEffect(() => {
    let cancelled = false
    listCategories().then(data => { if (!cancelled) setItems(data) }).catch(err => { if (!cancelled) setError(err.message) })
    return () => { cancelled = true }
  }, [])

  async function applyOrder(next) {
    const previous = items
    setItems(next)
    try { await reorderCategories(next.map(c => c.id)) } catch (err) { setItems(previous); toast.error(err) }
  }
  function reorder(from, to) { applyOrder(move(items, from, to)) }

  async function patch(cat, fields) {
    const previous = items
    setItems(list => list.map(c => c.id === cat.id ? { ...c, ...fields } : c))
    try { await updateCategory(cat.id, fields) } catch (err) { setItems(previous); toast.error(err) }
  }

  function toggleExpanded(id) {
    setExpanded(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  async function addCategory() {
    try {
      const created = await createCategory({ name: t.categories.newName, slug: `categorie-${Date.now().toString(36)}`, emoji: DEFAULT_EMOJI, published: true })
      setItems(list => [...(list || []), created])
      toast.success(t.categories.addedToast)
      setJustAddedId(created.id)
    } catch (err) { toast.error(err) }
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await deleteCategory(pendingDelete.id)
      setItems(list => list.filter(c => c.id !== pendingDelete.id))
      toast.success(t.categories.deletedToast(pendingDelete.name))
      setPendingDelete(null)
    } catch (err) { toast.error(err) } finally { setDeleting(false) }
  }

  return (
    <>
      <div className="adm-head">
        <div>
          <div className="adm-eyebrow">{t.categories.eyebrow}</div>
          <h1>{t.categories.title}</h1>
          <p className="adm-lede" style={{ marginBottom: 0 }}>{t.categories.lede}</p>
        </div>
        <div className="adm-actions">
          <button type="button" className="adm-btn adm-btn--primary" onClick={addCategory}><Plus size={13} weight="bold" />{t.categories.newBtn}</button>
        </div>
      </div>

      {error && <div className="adm-note adm-note--danger"><b>{t.common.error}</b>{error}</div>}
      {!items && !error && <div className="adm-loading"><span className="adm-spinner" />{t.common.loading}</div>}
      {items && items.length === 0 && <div className="adm-empty"><b>{t.categories.emptyTitle}</b>{t.categories.emptyBody}</div>}

      {items && items.length > 0 && (
        <div className="adm-list">
          {items.map((c, i) => {
            const isOpen = expanded.has(c.id)
            return (
              <div key={c.id} id={`cat-row-${c.id}`} className={`adm-cat-row${dragIndex === i ? ' dragging' : ''}`}>
                <div className="adm-item" {...dragProps(i, dragIndex, setDragIndex, reorder)}>
                  <div className="adm-drag" title="Trageți pentru a schimba ordinea"><DotsSixVertical size={17} weight="bold" /></div>

                  <div className={`adm-thumb adm-thumb--emoji${!c.emoji ? ' is-placeholder' : ''}`} aria-hidden="true">{c.emoji || DEFAULT_EMOJI}</div>

                  <input
                    className="adm-input adm-input--sm adm-input--emoji"
                    value={c.emoji || ''}
                    // Generous on purpose: maxLength counts UTF-16 code units,
                    // not visible characters, and a compound emoji like the
                    // very on-brand 🧑‍🍳 (cook) is already 5 units — a limit
                    // of 4 silently chopped it mid-sequence into something
                    // broken. 16 comfortably covers any realistic ZWJ emoji
                    // while still stopping someone from pasting a paragraph.
                    maxLength={16}
                    placeholder={DEFAULT_EMOJI}
                    title={t.categories.emojiHint}
                    onChange={e => setItems(list => list.map(x => x.id === c.id ? { ...x, emoji: e.target.value } : x))}
                    onBlur={e => patch(c, { emoji: e.target.value })}
                  />

                  <input
                    className="adm-input adm-input--sm"
                    style={{ maxWidth: 220 }}
                    value={c.name}
                    onChange={e => setItems(list => list.map(x => x.id === c.id ? { ...x, name: e.target.value } : x))}
                    onBlur={e => patch(c, { name: e.target.value })}
                  />

                  <div className="adm-actions">
                    <button type="button" className={`adm-btn adm-btn--sm adm-btn--ghost${isOpen ? ' on' : ''}`} onClick={() => toggleExpanded(c.id)} title={t.categories.translations}>
                      <Translate size={13} weight="bold" />
                    </button>
                    <button type="button" className="adm-btn adm-btn--sm adm-btn--ghost" onClick={() => reorder(i, i - 1)} disabled={i === 0} aria-label={t.common.up}><CaretUp size={12} weight="bold" /></button>
                    <button type="button" className="adm-btn adm-btn--sm adm-btn--ghost" onClick={() => reorder(i, i + 1)} disabled={i === items.length - 1} aria-label={t.common.down}><CaretDown size={12} weight="bold" /></button>
                    <button type="button" className="adm-btn adm-btn--sm adm-btn--ghost" onClick={() => patch(c, { published: !c.published })} title={c.published ? t.common.hide : t.common.show}>
                      {c.published ? <Eye size={13} weight="bold" /> : <EyeSlash size={13} weight="bold" />}
                    </button>
                    <button type="button" className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => setPendingDelete(c)} aria-label={t.common.delete}><Trash size={12} weight="bold" /></button>
                  </div>
                </div>

                {isOpen && (
                  <div className="adm-cat-translations">
                    <label className="adm-field">
                      <span className="adm-label">{t.categories.nameRu}</span>
                      <input
                        className="adm-input adm-input--sm"
                        value={c.translations?.ru?.name || ''}
                        onChange={e => setItems(list => list.map(x => x.id === c.id ? { ...x, translations: mergeTranslation(x.translations, 'ru', 'name', e.target.value) } : x))}
                        onBlur={e => patch(c, { translations: mergeTranslation(c.translations, 'ru', 'name', e.target.value) })}
                      />
                    </label>
                    <label className="adm-field" style={{ marginBottom: 0 }}>
                      <span className="adm-label">{t.categories.nameEn}</span>
                      <input
                        className="adm-input adm-input--sm"
                        value={c.translations?.en?.name || ''}
                        onChange={e => setItems(list => list.map(x => x.id === c.id ? { ...x, translations: mergeTranslation(x.translations, 'en', 'name', e.target.value) } : x))}
                        onBlur={e => patch(c, { translations: mergeTranslation(c.translations, 'en', 'name', e.target.value) })}
                      />
                    </label>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Confirm
        open={Boolean(pendingDelete)}
        title={t.categories.deleteTitle(pendingDelete?.name || '')}
        body={t.categories.deleteBody}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  )
}
