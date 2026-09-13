import { useEffect, useMemo, useRef, useState } from 'react'
import {
  List, X, MagnifyingGlass, Heart, Trash, ForkKnife, ArrowUpRight, Minus, Plus
} from '@phosphor-icons/react'
import { fetchMenu } from '../content/publicApi'
import LogoMark from './LogoMark.jsx'
import DishCard from './DishCard.jsx'
import SiteFooter from './SiteFooter.jsx'
import { MENUS, menuName } from '../data/menus'
import { CONTACT } from '../data/contact'
import { fold, activeBadge, DEFAULT_CAT_EMOJI, effectivePrice } from './menuHelpers.jsx'
import { SITE_LANGS, SITE_LANG_LABELS, getDict, loc } from '../i18n/site'
import logoHorizontal from '../assets/logo-horizontal.svg'
import './Menu.css'

function readJSON(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback }
}
function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* private mode etc. — ignore */ }
}

export default function Menu() {
  const [{ categories, items }, setData] = useState({ categories: [], items: [] })
  const [loaded, setLoaded] = useState(false)
  const [selection, setSelection] = useState(() => readJSON('look-menu-selection', {}))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('look-menu-theme') || '' } catch { return '' } })
  const [lang, setLang] = useState(() => { try { return localStorage.getItem('look-menu-lang') || 'ro' } catch { return 'ro' } })
  const [navHidden, setNavHidden] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [flashId, setFlashId] = useState(null)
  const [activeMenuId, setActiveMenuId] = useState('sala')
  const [navDrawerOpen, setNavDrawerOpen] = useState(false)
  const toastTimer = useRef(null)
  const pulseRef = useRef({})
  const searchInputRef = useRef(null)
  const t = getDict(lang)
  const activeMenu = MENUS.find(m => m.id === activeMenuId) || MENUS[0]

  useEffect(() => {
    const ctrl = new AbortController()
    fetchMenu(ctrl.signal).then(({ categories, items }) => {
      setData({ categories, items })
      setLoaded(true)
    })
    return () => ctrl.abort()
  }, [])

  useEffect(() => { writeJSON('look-menu-selection', selection) }, [selection])
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme || '')
    try { localStorage.setItem('look-menu-theme', theme) } catch { /* ignore */ }
  }, [theme])
  useEffect(() => {
    try { localStorage.setItem('look-menu-lang', lang) } catch { /* ignore */ }
  }, [lang])

  // Auto-hide the top header on scroll-down, reveal it on scroll-up — same
  // idea as cookiekiller's header. The category tab bar never hides: it just
  // slides up to hug the very top the moment the header tucks away, so a
  // guest can always jump between categories no matter how far they've
  // scrolled.
  useEffect(() => {
    let lastY = window.scrollY
    let ticking = false
    function onScroll() {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(() => {
        const y = window.scrollY
        const delta = y - lastY
        if (y < 80) setNavHidden(false)
        else if (delta > 4) setNavHidden(true)
        else if (delta < -4) setNavHidden(false)
        lastY = y
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the search overlay on Escape; autofocus its input on open.
  useEffect(() => {
    if (!searchOpen) { setSearchQuery(''); return }
    function onKey(e) { if (e.key === 'Escape') setSearchOpen(false) }
    document.addEventListener('keydown', onKey)
    const id = setTimeout(() => searchInputRef.current?.focus(), 60)
    return () => { document.removeEventListener('keydown', onKey); clearTimeout(id) }
  }, [searchOpen])

  // Close the nav/settings drawer on Escape.
  useEffect(() => {
    if (!navDrawerOpen) return
    function onKey(e) { if (e.key === 'Escape') setNavDrawerOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [navDrawerOpen])

  const byId = useMemo(() => {
    const m = {}
    items.forEach(it => { m[it.id] = it })
    return m
  }, [items])

  const catById = useMemo(() => {
    const m = {}
    categories.forEach(c => { m[c.id] = c })
    return m
  }, [categories])

  // Searches across every language at once (name + description + the dish's
  // own category name) so a guest typing in Russian still finds a dish only
  // translated on the RO base row, and vice versa, and a guest who types the
  // section name ("pește", "burger") finds every dish in it even when that
  // word never appears in the individual dish's own text — quality over
  // cleverness, no fuzzy scoring, just an instant, reliable substring match
  // that stays fast at this catalog size.
  const searchResults = useMemo(() => {
    const qWords = fold(searchQuery).trim().split(/\s+/).filter(Boolean)
    if (!qWords.length) return []
    return items.filter(it => {
      const cat = catById[it.category_id]
      const hay = fold([
        it.name, it.description,
        it.translations?.ru?.name, it.translations?.ru?.description,
        it.translations?.en?.name, it.translations?.en?.description,
        cat?.name, cat?.translations?.ru?.name, cat?.translations?.en?.name
      ].filter(Boolean).join(' '))
      // Every query word must show up somewhere in the dish's text — order
      // and extra words don't matter, so "pui salata" and "salata cu pui"
      // both find the same dishes. A Cyrillic word of 4+ letters also
      // matches any Cyrillic word in the dish that shares its stem (курица
      // ~ куриный/куриное/курицей, рыба ~ рыбу/рыбой) so Russian's heavy
      // noun/adjective inflection doesn't hide an otherwise obvious match —
      // this was the biggest real gap: "курица" found only 1 of 5 chicken
      // dishes because the rest only ever say куриный/куриное, and a short
      // word like "рыба" missed every dish entirely once declined.
      // Scoped to Cyrillic on purpose: the same trick on Latin text turns
      // up unrelated words that happen to share a short prefix (searching
      // "salate" would otherwise also surface "salam"/"salată-as-a-garnish"
      // dishes, or even the English word "salad" in a translation).
      const hayWords = hay.split(/\s+/).filter(Boolean)
      const cyr = /[Ѐ-ӿ]/
      function stemEq(a, b) {
        const len = Math.max(3, Math.min(a.length, b.length) - 2)
        if (a.length < len || b.length < len) return false
        return a.slice(0, len) === b.slice(0, len)
      }
      return qWords.every(w => {
        if (hay.includes(w)) return true
        if (w.length < 4 || !cyr.test(w)) return false
        return hayWords.some(hw => hw.length >= 4 && cyr.test(hw) && stemEq(w, hw))
      })
    }).slice(0, 30)
  }, [items, catById, searchQuery])

  function goToItem(it) {
    setSearchOpen(false)
    setTimeout(() => {
      const el = document.getElementById('item-' + it.id)
      if (!el) return
      const header = document.querySelector('.lm-topbar')
      const catnav = document.querySelector('.lm-catnav-wrap')
      const offset = (catnav ? catnav.offsetHeight : 0) + (navHidden ? 0 : (header ? header.offsetHeight : 0)) + 16
      const y = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top: y, behavior: 'smooth' })
      setFlashId(it.id)
      setTimeout(() => setFlashId(f => f === it.id ? null : f), 1600)
    }, 80)
  }

  const itemsByCategory = useMemo(() => {
    const m = {}
    items.forEach(it => { (m[it.category_id] ||= []).push(it) })
    return m
  }, [items])

  function showToast(msg) {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 1800)
  }

  function setQty(id, qty) {
    qty = Math.max(0, qty)
    setSelection(sel => {
      const next = { ...sel }
      if (qty === 0) delete next[id]; else next[id] = qty
      return next
    })
  }

  function toggleFav(item) {
    if (activeBadge(item) === 'out_of_stock') return
    const cur = selection[item.id] || 0
    if (cur > 0) { setQty(item.id, 0); return }
    setQty(item.id, 1)
    pulseRef.current[item.id] = true
    showToast(t.addedToast(loc(item, lang, 'name')))
  }

  const totalCount = Object.values(selection).reduce((a, b) => a + b, 0)
  const totalSum = Object.entries(selection).reduce((a, [id, q]) => a + (byId[id] ? effectivePrice(byId[id]) * q : 0), 0)

  function scrollToCategory(id) {
    const el = document.getElementById('sec-' + id)
    if (!el) return
    const header = document.querySelector('.lm-topbar')
    const catnav = document.querySelector('.lm-catnav-wrap')
    const offset = (header ? header.offsetHeight : 0) + (catnav ? catnav.offsetHeight : 0) + 8
    const y = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top: y, behavior: 'smooth' })
  }

  async function copyList() {
    const ids = Object.keys(selection)
    if (!ids.length) { showToast(t.emptyListToast); return }
    const lines = ids.map(id => `${selection[id]}× ${loc(byId[id], lang, 'name')} — ${effectivePrice(byId[id]) * selection[id]} lei`)
    const text = `${t.copyHeader}\n${lines.join('\n')}\n${t.copyTotal}: ${totalSum} lei`
    try { await navigator.clipboard.writeText(text); showToast(t.copiedToast) }
    catch { showToast(t.copyFailedToast) }
  }

  return (
    <div className="lm-root">
      <div className="lm-ambient"><span /><span /></div>

      <header className={`lm-topbar${navHidden ? ' lm-topbar-hidden' : ''}`}>
        <div className="lm-wrap lm-topbar-inner">
          <div className="lm-brand">
            <img src={logoHorizontal} alt="LOOK Restobar & Terrace" className="lm-brand-logo" />
          </div>
          <div className="lm-topbar-actions">
            {activeMenu.live && (
              <button className="lm-icon-btn" onClick={() => setSearchOpen(true)} aria-label={t.search}>
                <MagnifyingGlass size={17} weight="bold" />
              </button>
            )}
            <button className="lm-icon-btn" onClick={() => setNavDrawerOpen(true)} aria-label={t.menuAndSettings}>
              <List size={18} weight="bold" />
            </button>
          </div>
        </div>
      </header>

      <section className="lm-hero lm-wrap">
        <LogoMark className="lm-hero-mark" />
        <h1>{t.heroPre}<em>{t.heroEm}</em></h1>
        <div className="lm-divider"><i /></div>
      </section>

      {activeMenu.live && (
        <div className={`lm-catnav-wrap${navHidden ? ' lm-nav-hidden' : ''}`}>
          <nav className="lm-catnav">
            {categories.map((c, ci) => (
              <button key={c.id} className="lm-cat-btn" data-hue={ci % 6} onClick={() => scrollToCategory(c.id)}>
                <span className="lm-cat-btn-ic">{c.emoji || DEFAULT_CAT_EMOJI}</span>
                <span>{loc(c, lang, 'name')}</span>
              </button>
            ))}
          </nav>
        </div>
      )}

      <main className="lm-wrap">
        {!loaded && <div className="lm-loading"><span className="lm-spinner" />{t.loading}</div>}

        {!activeMenu.live && (
          <div className="lm-comingsoon">
            <span className="lm-comingsoon-emoji">{activeMenu.emoji}</span>
            <h2>{menuName(activeMenu, lang)}</h2>
            <p>{t.menuComingSoonBody}</p>
            <a className="lm-btn primary" href={CONTACT.officialSite} target="_blank" rel="noopener noreferrer">
              {t.menuSeeOfficial}<ArrowUpRight size={13} weight="bold" />
            </a>
          </div>
        )}

        {activeMenu.live && categories.map((c, ci) => (
          <section className="lm-section" id={`sec-${c.id}`} key={c.id}>
            <div className="lm-section-head">
              <span className="lm-section-ic" data-hue={ci % 6}>{c.emoji || DEFAULT_CAT_EMOJI}</span>
              <div className="lm-section-headtxt">
                <h2>{loc(c, lang, 'name')}</h2>
              </div>
              <div className="lm-rule" />
              <span className="lm-count-chip">{(itemsByCategory[c.id] || []).length}</span>
            </div>
            <div className="lm-grid">
              {(itemsByCategory[c.id] || []).map(it => {
                const qty = selection[it.id] || 0
                const pulse = pulseRef.current[it.id]
                if (pulse) setTimeout(() => { pulseRef.current[it.id] = false }, 500)
                return (
                  <DishCard
                    key={it.id}
                    id={`item-${it.id}`}
                    it={it} cat={c} lang={lang} t={t}
                    qty={qty} pulse={pulse} flashed={flashId === it.id}
                    onToggleFav={() => toggleFav(it)}
                    onQty={(q) => setQty(it.id, q)}
                  />
                )
              })}
            </div>
          </section>
        ))}
      </main>

      <SiteFooter lang={lang} />

      <button className={`lm-fab${totalCount === 0 ? ' hide' : ''}`} onClick={() => setDrawerOpen(true)}>
        <Heart size={20} weight="fill" />
        <span>{t.myList}</span>
        <span className="lm-count">{totalCount}</span>
      </button>

      <div className={`lm-overlay${drawerOpen ? ' show' : ''}`} onClick={() => setDrawerOpen(false)} />
      <div className={`lm-drawer${drawerOpen ? ' show' : ''}`}>
        <div className="lm-drawer-handle" />
        <div className="lm-drawer-head">
          <div><h3>{t.waiterTitle}</h3><p>{t.waiterSubtitle}</p></div>
          <button className="lm-icon-btn" onClick={() => setDrawerOpen(false)} aria-label={t.close}>
            <X size={17} weight="bold" />
          </button>
        </div>
        <div className="lm-drawer-body">
          {totalCount === 0 ? (
            <div className="lm-empty-state">
              <ForkKnife size={30} weight="thin" />
              <div>{t.emptyListTitle}<br />{t.emptyListHint}</div>
            </div>
          ) : Object.keys(selection).map(id => {
            const it = byId[id]
            if (!it) return null
            const q = selection[id]
            return (
              <div className="lm-sel-row" key={id}>
                <div className="lm-info"><b>{loc(it, lang, 'name')}</b><span>{effectivePrice(it)} lei{it.weight ? ' · ' + it.weight : ''}</span></div>
                <div className="lm-qty">
                  <button onClick={() => setQty(id, q - 1)} aria-label={t.less}><Minus size={12} weight="bold" /></button>
                  <span>{q}</span>
                  <button onClick={() => setQty(id, q + 1)} aria-label={t.more}><Plus size={12} weight="bold" /></button>
                </div>
                <button className="lm-rm" onClick={() => setQty(id, 0)} aria-label={t.remove}>
                  <Trash size={15} weight="bold" />
                </button>
              </div>
            )
          })}
        </div>
        <div className="lm-drawer-foot">
          <div className="lm-drawer-total"><span>{t.estimatedTotal}</span><b>{totalSum} lei</b></div>
          <div className="lm-btn-row">
            <button className="lm-btn" onClick={() => setSelection({})}>{t.clear}</button>
            <button className="lm-btn primary" onClick={copyList}>{t.copyList}</button>
          </div>
        </div>
      </div>

      <div className={`lm-overlay${searchOpen ? ' show' : ''}`} onClick={() => setSearchOpen(false)} />
      <div className={`lm-search-sheet${searchOpen ? ' show' : ''}`}>
        <div className="lm-search-bar">
          <MagnifyingGlass size={18} weight="bold" />
          <input
            ref={searchInputRef}
            type="text"
            inputMode="search"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button className="lm-icon-btn" onClick={() => setSearchOpen(false)} aria-label={t.close}>
            <X size={17} weight="bold" />
          </button>
        </div>
        <div className="lm-search-results">
          {searchQuery.trim() === '' ? (
            <div className="lm-empty-state"><div>{t.searchHint}</div></div>
          ) : searchResults.length === 0 ? (
            <div className="lm-empty-state"><div>{t.searchEmpty}</div></div>
          ) : (
            <div className="lm-grid">
              {searchResults.map(it => {
                const cat = catById[it.category_id]
                const qty = selection[it.id] || 0
                const pulse = pulseRef.current[it.id]
                if (pulse) setTimeout(() => { pulseRef.current[it.id] = false }, 500)
                return (
                  <div className="lm-search-card" key={it.id} onClick={() => goToItem(it)}>
                    <DishCard
                      it={it} cat={cat} lang={lang} t={t}
                      qty={qty} pulse={pulse} flashed={false}
                      onToggleFav={() => toggleFav(it)}
                      onQty={(q) => setQty(it.id, q)}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className={`lm-overlay${navDrawerOpen ? ' show' : ''}`} onClick={() => setNavDrawerOpen(false)} />
      <div className={`lm-navdrawer${navDrawerOpen ? ' show' : ''}`}>
        <div className="lm-drawer-head">
          <div><h3>{t.menuAndSettings}</h3></div>
          <button className="lm-icon-btn" onClick={() => setNavDrawerOpen(false)} aria-label={t.close}>
            <X size={17} weight="bold" />
          </button>
        </div>
        <div className="lm-navdrawer-body">
          <div className="lm-navdrawer-section">
            <span className="lm-navdrawer-section-title">{t.drawerMenusTitle}</span>
            {MENUS.map(m => (
              <button
                key={m.id}
                className={`lm-menu-row${activeMenuId === m.id ? ' active' : ''}`}
                onClick={() => { setActiveMenuId(m.id); setNavDrawerOpen(false) }}
              >
                <span className="lm-menu-row-ic">{m.emoji}</span>
                <span className="lm-menu-row-name">{menuName(m, lang)}</span>
                {!m.live && <span className="lm-menu-row-tag">{t.menuComingSoon}</span>}
              </button>
            ))}
          </div>

          {activeMenu.live && categories.length > 0 && (
            <div className="lm-navdrawer-section">
              <span className="lm-navdrawer-section-title">{t.drawerCategoriesTitle}</span>
              {categories.map((c, ci) => (
                <button key={c.id} className="lm-navdrawer-cat" onClick={() => { scrollToCategory(c.id); setNavDrawerOpen(false) }}>
                  <span className="lm-cat-btn-ic" data-hue={ci % 6}>{c.emoji || DEFAULT_CAT_EMOJI}</span>
                  <span>{loc(c, lang, 'name')}</span>
                </button>
              ))}
            </div>
          )}

          <div className="lm-navdrawer-section">
            <span className="lm-navdrawer-section-title">{t.drawerSettingsTitle}</span>
            <div className="lm-settings-row">
              <span className="lm-settings-label">{t.switchLang}</span>
              <div className="lm-langswitch" role="group" aria-label={t.switchLang}>
                {SITE_LANGS.map(code => (
                  <button key={code} className={`lm-lang-btn${lang === code ? ' active' : ''}`} onClick={() => setLang(code)}>
                    {SITE_LANG_LABELS[code]}
                  </button>
                ))}
              </div>
            </div>
            <div className="lm-settings-row">
              <span className="lm-settings-label">{t.theme}</span>
              <div className="lm-langswitch" role="group" aria-label={t.theme}>
                <button className={`lm-lang-btn${theme !== 'light' ? ' active' : ''}`} onClick={() => setTheme('')}>{t.themeDark}</button>
                <button className={`lm-lang-btn${theme === 'light' ? ' active' : ''}`} onClick={() => setTheme('light')}>{t.themeLight}</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`lm-toast${toast ? ' show' : ''}`}>{toast}</div>
    </div>
  )
}
