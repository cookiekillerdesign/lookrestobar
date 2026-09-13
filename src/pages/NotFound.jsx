import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: '#0c0a08', color: '#f4efe4', fontFamily: 'Inter, sans-serif', textAlign: 'center', padding: 24 }}>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28 }}>Pagina nu a fost găsită</h1>
      <p style={{ color: '#a89c86' }}>Verifică adresa sau întoarce-te la meniu.</p>
      <Link to="/" style={{ color: '#cfa869', textDecoration: 'underline' }}>Înapoi la meniu</Link>
    </div>
  )
}
