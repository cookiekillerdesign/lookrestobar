import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Menu from './pages/Menu.jsx'
import NotFound from './pages/NotFound.jsx'
import LegalPage from './pages/legal/LegalPage.jsx'

// The admin panel (auth, forms, upload code, Supabase client) is only ever
// opened by staff. Keeping it in its own chunk means guests scanning the
// table QR code never download a single byte of it.
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'))

// React Router doesn't reset scroll position on navigation the way a real
// page load does — clicking a legal-page link in the footer (at the bottom
// of a long menu) used to land on that page still scrolled to the bottom,
// since the browser has no reason to move the viewport on its own. This
// jumps to the top on every route change (switching between legal pages via
// the footer counts too), without touching the smooth scrollToCategory()
// behavior inside the menu itself — that only ever changes scroll position
// without changing the URL, so this effect never fires for it.
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <Suspense fallback={null}>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/legal/:doc" element={<LegalPage />} />
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
