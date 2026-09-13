import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Menu from './pages/Menu.jsx'
import NotFound from './pages/NotFound.jsx'
import LegalPage from './pages/legal/LegalPage.jsx'

// The admin panel (auth, forms, upload code, Supabase client) is only ever
// opened by staff. Keeping it in its own chunk means guests scanning the
// table QR code never download a single byte of it.
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'))

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/legal/:doc" element={<LegalPage />} />
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
