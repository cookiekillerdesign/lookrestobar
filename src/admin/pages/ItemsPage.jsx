import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, PencilSimple, Trash, Eye, EyeSlash, CaretUp, CaretDown, Star, DotsSixVertical } from '@phosphor-icons/react'
import { listCategories, listItems, createItem, updateItem, deleteItem, reorderItems } from '../api'
import { useToast } from '../components/Toasts'
import Confirm from '../components/Confirm'
import { move } from '../reorder'
import { useAdminLang } from '../i18n.jsx'

export default function ItemsPage() {
  const { t } = useAdminLang()
  const [categories, setCategories] = useState(null)
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [dragging, setDragging] = useState(null) // { catId, index } — mouse drag-reorder, alongside the up/down buttons that still cover touch and keyboard
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    Promise.all([listCategories(), listItems()])
      .then(([cats, its]) => { if (!cancelled) { setCategories(cats); setItems(its) } })
      .catch(err => { if (!cancelled) setError(err.message) })
    return () => { cancelled = true }
  }, [])

  function itemsFor(categoryId) {
    return (items || []).filter(i => i.category_id === categoryId)
  }

  // Deleting a category doesn't delete its dishes (schema: category_id sets
  // to null, and the delete-confirm dialog promises exactly that) — but
  // without this, those dishes would vanish from view entirely: this page
  // only ever renders items grouped under a real, existing category, so an
  // item with a null/dangling category_id had no panel to appear in and no
  // way back into the admin short of editing the database directly.
  const categoryIds = new Set((categories || []).map(c => c.id))
  const orphaned = (items || []).filter(i => !categoryIds.has(i.category_id))

  async function reorderWithin(categoryId, from, to) {
    const group = itemsFor(categoryId)
    const nextGroup = move(group, from, to)
    const others = items.filter(i => i.category_id !== categoryId)
    const previous = items
    setItems([...others, ...nextGroup])
    try { await reorderItems(nextGroup.map(i => i.id)) } catch (err) { setItems(previous); toast.error(err) }
  }

  // Native HTML5 drag-and-drop, scoped to the dish's own category (dragging
  // a card out of its section wouldn't make sense — items belong to a fixed
  // category, only their order within it changes). Doesn't fire on touch
  // screens, which is exactly why the up/down buttons stay right next to it.
  // The handle starts the drag; the whole card is the drop target, so a
  // guest doesn't have to hit a 14px target while dropping.
  function dragHandleProps(catId, index) {
    return {
      draggable: true,
      onDragStart: (e) => {
        setDragging({ catId, index })
        e.dataTransfer.effectAllowed = 'move'
        try { e.dataTransfer.setData('text/plain', String(index)) } catch { /* ignore */ }
      },
      onDragEnd: () => setDragging(null)
    }
  }
  function dropZoneProps(catId, index) {
    return {
      onDragOver: (e) => {
        if (dragging && dragging.catId === catId) { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }
      },
      onDrop: (e) => {
        e.preventDefault()
        if (dragging && dragging.catId === catId && dragging.index !== index) reorderWithin(catId, dragging.index, index)
        setDragging(null)
      }
    }
  }

  async function togglePublished(item) {
    const next = !item.published
    const previous = items
    setItems(list => list.map(i => i.id === item.id ? { ...i, published: next } : i))
    try {
      await updateItem(item.id, { published: next })
      toast.success(next ? t.items.shownToast(item.name) : t.items.hiddenToast(item.name))
    } catch (err) { setItems(previous); toast.error(err) }
  }

  async function addItem(categoryId) {
    try {
      const created = await createItem({ category_id: categoryId, name: t.items.newName, description: '', price: 0, published: true })
      navigate(`/admin/items/${created.id}`)
    } catch (err) { toast.error(err) }
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await deleteItem(pendingDelete)
      setItems(list => list.filter(i => i.id !== pendingDelete.id))
      toast.success(t.items.deletedToast(pendingDelete.name))
      setPendingDelete(null)
    } catch (err) { toast.error(err) } finally { setDeleting(false) }
  }

  return (
    <>
      <div className="adm-head">
        <div>
          <div className="adm-eyebrow">{t.items.eyebrow}</div>
          <h1>{t.items.title}</h1>
          <p className="adm-lede" style={{ marginBottom: 0 }}>{t.items.lede}</p>
        </div>
      </div>

      {error && <div className="adm-note adm-note--danger"><b>{t.common.error}</b>{error}</div>}
      {(!categories || !items) && !error && <div className="adm-loading"><span className="adm-spinner" />{t.common.loading}</div>}

      {categories && categories.length === 0 && (
        <div className="adm-empty"><b>{t.items.emptyFirst}</b>{t.items.emptyFirstBody}</div>
      )}

      {categories && categories.map(cat => {
        const group = itemsFor(cat.id)
        return (
          <div className="adm-panel" key={cat.id} style={{ marginBottom: 18 }}>
            <div className="adm-panel-head">
              <h2><span style={{ marginRight: 8 }}>{cat.emoji || '🍽️'}</span>{cat.name}</h2>
              <button type="button" className="adm-btn adm-btn--sm" onClick={() => addItem(cat.id)}><Plus size={12} weight="bold" />{t.items.addBtn}</button>
            </div>

            {group.length === 0 && <p className="adm-hint">{t.items.emptyCategory}</p>}

            {group.length > 0 && (
              <div className="adm-dish-grid">
                {group.map((it, i) => (
                  <div
                    className={`adm-dish-card${!it.published ? ' is-hidden' : ''}${dragging && dragging.catId === cat.id && dragging.index === i ? ' dragging' : ''}`}
                    key={it.id}
                    {...dropZoneProps(cat.id, i)}
                  >
                    <div className="adm-dish-drag" {...dragHandleProps(cat.id, i)} title={t.common.drag || 'Drag'}>
                      <DotsSixVertical size={14} weight="bold" />
                    </div>
                    <Link to={`/admin/items/${it.id}`} className="adm-dish-photo">
                      {it.photo_url
                        ? <img src={it.photo_url} alt="" loading="lazy" />
                        : <span className="adm-dish-photo-fallback">{cat.emoji || '🍽️'}</span>}
                      {it.weight && <span className="adm-dish-weight">{it.weight}</span>}
                      {it.signature && <span className="adm-dish-star" title={t.editor?.signature}><Star size={12} weight="fill" /></span>}
                      {!it.published && <span className="adm-dish-hidden-veil">{t.common.hiddenBadge}</span>}
                    </Link>
                    <div className="adm-dish-body">
                      <Link to={`/admin/items/${it.id}`} className="adm-dish-name">{it.name}</Link>
                      <span className="adm-dish-price">{it.price}<i>lei</i></span>
                    </div>
                    <div className="adm-dish-actions">
                      <button type="button" className="adm-icon-btn" onClick={() => reorderWithin(cat.id, i, i - 1)} disabled={i === 0} aria-label={t.common.up}><CaretUp size={12} weight="bold" /></button>
                      <button type="button" className="adm-icon-btn" onClick={() => reorderWithin(cat.id, i, i + 1)} disabled={i === group.length - 1} aria-label={t.common.down}><CaretDown size={12} weight="bold" /></button>
                      <button type="button" className="adm-icon-btn" onClick={() => togglePublished(it)} title={it.published ? t.common.hide : t.common.show}>
                        {it.published ? <Eye size={13} weight="bold" /> : <EyeSlash size={13} weight="bold" />}
                      </button>
                      <Link className="adm-icon-btn" to={`/admin/items/${it.id}`} aria-label={t.common.open}><PencilSimple size={12} weight="bold" /></Link>
                      <button type="button" className="adm-icon-btn adm-icon-btn--danger" onClick={() => setPendingDelete(it)} aria-label={t.common.delete}><Trash size={12} weight="bold" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {orphaned.length > 0 && (
        <div className="adm-panel adm-panel--warning" style={{ marginBottom: 18 }}>
          <div className="adm-panel-head">
            <h2><span style={{ marginRight: 8 }}>⚠️</span>{t.items.uncategorized}</h2>
          </div>
          <p className="adm-hint">{t.items.uncategorizedHint}</p>
          <div className="adm-dish-grid">
            {orphaned.map(it => (
              <div className={`adm-dish-card${!it.published ? ' is-hidden' : ''}`} key={it.id}>
                <Link to={`/admin/items/${it.id}`} className="adm-dish-photo">
                  {it.photo_url
                    ? <img src={it.photo_url} alt="" loading="lazy" />
                    : <span className="adm-dish-photo-fallback">🍽️</span>}
                  {it.weight && <span className="adm-dish-weight">{it.weight}</span>}
                  {!it.published && <span className="adm-dish-hidden-veil">{t.common.hiddenBadge}</span>}
                </Link>
                <div className="adm-dish-body">
                  <Link to={`/admin/items/${it.id}`} className="adm-dish-name">{it.name}</Link>
                  <span className="adm-dish-price">{it.price}<i>lei</i></span>
                </div>
                <div className="adm-dish-actions">
                  <button type="button" className="adm-icon-btn" onClick={() => togglePublished(it)} title={it.published ? t.common.hide : t.common.show}>
                    {it.published ? <Eye size={13} weight="bold" /> : <EyeSlash size={13} weight="bold" />}
                  </button>
                  <Link className="adm-icon-btn" to={`/admin/items/${it.id}`} aria-label={t.common.open}><PencilSimple size={12} weight="bold" /></Link>
                  <button type="button" className="adm-icon-btn adm-icon-btn--danger" onClick={() => setPendingDelete(it)} aria-label={t.common.delete}><Trash size={12} weight="bold" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Confirm
        open={Boolean(pendingDelete)}
        title={t.items.deleteTitle(pendingDelete?.name || '')}
        body={t.items.deleteBody}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  )
}
