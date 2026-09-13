import { useEffect, useState } from 'react'
import { NavLink, Route, Routes, Navigate } from 'react-router-dom'
import { SquaresFour, FolderOpen, ForkKnife, Gear, SignOut, ArrowUpRight } from '@phosphor-icons/react'
import LogoMark from '../pages/LogoMark.jsx'
import { supabase } from '../lib/supabase'
import { isSupabaseConfigured } from '../lib/supabaseConfig'
import { checkAdmin, signOut } from './api'
import { ToastProvider } from './components/Toasts'
import { AdminLangProvider, useAdminLang } from './i18n.jsx'
import Setup from './pages/Setup'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CategoriesPage from './pages/CategoriesPage'
import ItemsPage from './pages/ItemsPage'
import ItemEditor from './pages/ItemEditor'
import Settings from './pages/Settings'
import './admin.css'

export default function AdminApp() {
  return (
    <AdminLangProvider>
      <AdminAppInner />
    </AdminLangProvider>
  )
}

function AdminAppInner() {
  const { t } = useAdminLang()
  const [session, setSession] = useState(undefined) // undefined = still checking
  const [admin, setAdmin] = useState(null)          // null = not checked yet

  useEffect(() => { document.title = 'Admin · LOOK Restobar' }, [])

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) { setSession(null); return }
    let cancelled = false
    supabase.auth.getSession().then(({ data }) => { if (!cancelled) setSession(data.session || null) })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => { setSession(next || null); setAdmin(null) })
    return () => { cancelled = true; sub.subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    if (!session) return
    let cancelled = false
    checkAdmin().then(ok => { if (!cancelled) setAdmin(ok) })
    return () => { cancelled = true }
  }, [session])

  if (!isSupabaseConfigured) return <Setup />

  if (session === undefined) {
    return <div className="adm"><div className="adm-login"><div className="adm-loading"><span className="adm-spinner" />{t.checking.access}</div></div></div>
  }

  if (!session) return <ToastProvider><Login /></ToastProvider>

  if (admin === null) {
    return <div className="adm"><div className="adm-login"><div className="adm-loading"><span className="adm-spinner" />{t.checking.rights}</div></div></div>
  }

  const NAV = [
    { to: '/admin', end: true, label: t.nav.overview, icon: SquaresFour },
    { to: '/admin/categories', end: false, label: t.nav.categories, icon: FolderOpen },
    { to: '/admin/items', end: false, label: t.nav.items, icon: ForkKnife },
    { to: '/admin/settings', end: false, label: t.nav.settings, icon: Gear }
  ]

  if (admin === false) {
    return (
      <div className="adm">
        <div className="adm-login">
          <div className="adm-login-card">
            <div className="adm-login-mark"><LogoMark className="adm-mark-icon" />{t.login.mark}</div>
            <h1>{t.locked.title}</h1>
            <p className="adm-lede">{t.locked.lede(session.user.email)}</p>
            <div className="adm-note">
              <b>{t.locked.howTitle}</b>
              {t.locked.step(session.user.email)}
            </div>
            <div className="adm-actions"><button type="button" className="adm-btn" onClick={() => signOut()}>{t.nav.logout}</button></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ToastProvider>
      <div className="adm">
        <div className="adm-shell">
          <aside className="adm-side">
            <div className="adm-brand">
              <span className="adm-brand-mark"><LogoMark className="adm-mark-icon" /></span>
              <span className="adm-brand-text">
                <b>LOOK Restobar</b>
                <i>{t.nav.panel}</i>
              </span>
            </div>
            <nav className="adm-nav">
              {NAV.map(({ to, end, label, icon: Icon }) => (
                <NavLink key={to} to={to} end={end} className={({ isActive }) => `adm-navlink${isActive ? ' active' : ''}`}>
                  <span className="adm-navlink-ic"><Icon size={16} weight="bold" /></span>
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="adm-side-foot">
              <div className="adm-side-user">{session.user.email}</div>
              <a className="adm-btn adm-btn--sm adm-btn--ghost" href="/" target="_blank" rel="noopener noreferrer" style={{ width: '100%', marginBottom: 8 }}>
                {t.nav.menu}<ArrowUpRight size={11} weight="bold" />
              </a>
              <button type="button" className="adm-btn adm-btn--sm adm-btn--ghost" style={{ width: '100%' }} onClick={() => signOut()}>
                <SignOut size={12} weight="bold" />{t.nav.logout}
              </button>
            </div>
          </aside>
          <main className="adm-main">
            <Routes>
              <Route index element={<Dashboard email={session.user.email} />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="items" element={<ItemsPage />} />
              <Route path="items/:id" element={<ItemEditor />} />
              <Route path="settings" element={<Settings email={session.user.email} />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
