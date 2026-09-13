import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Plus, FolderOpen, ForkKnife } from '@phosphor-icons/react'
import { listCategories, listItems, getUsageStats } from '../api'
import { useAdminLang } from '../i18n.jsx'

// Supabase Free plan caps (supabase.com/pricing) — the meters below are
// only ever as accurate as this pair, so if the plan changes, update here.
const FREE_DB_BYTES = 500 * 1024 * 1024        // 500 MB database size
const FREE_STORAGE_BYTES = 1024 * 1024 * 1024  // 1 GB file storage

function formatSize(bytes) {
  const mb = bytes / (1024 * 1024)
  if (mb < 1) return `${(bytes / 1024).toFixed(0)} KB`
  if (mb < 100) return `${mb.toFixed(1)} MB`
  if (mb < 1024) return `${mb.toFixed(0)} MB`
  return `${(mb / 1024).toFixed(2)} GB`
}

function barClass(pct) {
  if (pct >= 90) return 'danger'
  if (pct >= 70) return 'warn'
  return ''
}

export default function Dashboard({ email }) {
  const { t } = useAdminLang()
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [usage, setUsage] = useState(null)
  const [usageError, setUsageError] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([listCategories(), listItems()])
      .then(([categories, items]) => {
        if (cancelled) return
        setStats({
          categories: categories.length,
          items: items.length,
          published: items.filter(i => i.published).length,
          withPhoto: items.filter(i => i.photo_url).length,
          withoutPhoto: items.filter(i => !i.photo_url)
        })
      })
      .catch(err => { if (!cancelled) setError(err.message) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    getUsageStats()
      .then(data => { if (!cancelled) setUsage(data) })
      .catch(() => { if (!cancelled) setUsageError(t.dashboard.usageLoadError) })
    return () => { cancelled = true }
  }, [t])

  return (
    <>
      <div className="adm-head">
        <div>
          <div className="adm-eyebrow">{t.dashboard.eyebrow}</div>
          <h1>{t.dashboard.title}</h1>
          <p className="adm-lede" style={{ marginBottom: 0 }}>{t.dashboard.lede(email)}</p>
        </div>
        <div className="adm-actions">
          <a className="adm-btn" href="/" target="_blank" rel="noopener noreferrer">{t.dashboard.openMenu}<ArrowUpRight size={13} weight="bold" /></a>
        </div>
      </div>

      {error && <div className="adm-note adm-note--danger"><b>{t.dashboard.loadError}</b>{error}</div>}
      {!stats && !error && <div className="adm-loading"><span className="adm-spinner" />{t.common.loading}</div>}

      {stats && (
        <>
          <div className="adm-grid3" style={{ marginBottom: 22 }}>
            <div className="adm-stat"><b>{stats.categories}</b><span>{t.dashboard.statCategories}</span></div>
            <div className="adm-stat"><b>{stats.items}</b><span>{t.dashboard.statItems}</span></div>
            <div className="adm-stat"><b>{stats.published}</b><span>{t.dashboard.statPublished}</span></div>
            <div className="adm-stat"><b>{stats.withPhoto}</b><span>{t.dashboard.statPhoto}</span></div>
          </div>

          {stats.withoutPhoto.length > 0 && (
            <div className="adm-note adm-note--warn">
              <b>{t.dashboard.noPhotoWarn(stats.withoutPhoto.length)}</b>
              {t.dashboard.noPhotoHint}
            </div>
          )}

          <div className="adm-panel" style={{ marginBottom: 22 }}>
            <div className="adm-panel-head">
              <h2>{t.dashboard.usageTitle}</h2>
              <span className="adm-tier-badge">{t.dashboard.usageTier}</span>
            </div>

            {usageError && <div className="adm-note adm-note--danger">{usageError}</div>}
            {!usage && !usageError && <div className="adm-loading"><span className="adm-spinner" />{t.common.loading}</div>}

            {usage && (
              <>
                <div className="adm-usage">
                  <div className="adm-usage-head">
                    <b>{t.dashboard.usageFiles(usage.storageFileCount)}</b>
                    <i>{formatSize(usage.storageBytes)} {t.dashboard.usageOf} {formatSize(FREE_STORAGE_BYTES)}</i>
                  </div>
                  <div className={`adm-usage-bar ${barClass((usage.storageBytes / FREE_STORAGE_BYTES) * 100)}`}>
                    <span style={{ width: `${Math.min(100, (usage.storageBytes / FREE_STORAGE_BYTES) * 100)}%` }} />
                  </div>
                </div>
                <div className="adm-usage">
                  <div className="adm-usage-head">
                    <b>{t.dashboard.usageDb}</b>
                    <i>{formatSize(usage.dbBytes)} {t.dashboard.usageOf} {formatSize(FREE_DB_BYTES)}</i>
                  </div>
                  <div className={`adm-usage-bar ${barClass((usage.dbBytes / FREE_DB_BYTES) * 100)}`}>
                    <span style={{ width: `${Math.min(100, (usage.dbBytes / FREE_DB_BYTES) * 100)}%` }} />
                  </div>
                </div>
                <p className="adm-hint" style={{ marginTop: 14, marginBottom: 0 }}>{t.dashboard.usageNote}</p>
              </>
            )}
          </div>

          <div className="adm-panel">
            <div className="adm-panel-head"><h2>{t.dashboard.startTitle}</h2></div>
            <div className="adm-grid2">
              <Link className="adm-btn" to="/admin/categories"><FolderOpen size={14} weight="bold" />{t.dashboard.categoriesLink}</Link>
              <Link className="adm-btn" to="/admin/items"><ForkKnife size={14} weight="bold" />{t.dashboard.itemsLink}</Link>
            </div>
            <p className="adm-hint" style={{ marginTop: 16 }}>{t.dashboard.hint}</p>
            <div className="adm-actions" style={{ marginTop: 14 }}>
              <Link className="adm-btn adm-btn--primary adm-btn--sm" to="/admin/items"><Plus size={13} weight="bold" />{t.dashboard.addItem}</Link>
            </div>
          </div>
        </>
      )}
    </>
  )
}
