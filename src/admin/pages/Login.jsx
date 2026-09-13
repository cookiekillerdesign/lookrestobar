import { useState } from 'react'
import LogoMark from '../../pages/LogoMark.jsx'
import { signIn } from '../api'
import { useAdminLang } from '../i18n.jsx'

export default function Login() {
  const { t } = useAdminLang()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    if (busy) return
    setError('')
    setBusy(true)
    try {
      await signIn(email, password)
      // No redirect here on purpose — AdminApp's auth listener swaps the
      // screen as soon as the session lands.
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="adm">
      <div className="adm-login">
        <div className="adm-login-card">
          <div className="adm-login-mark"><LogoMark className="adm-mark-icon" />{t.login.mark}</div>
          <h1>{t.login.title}</h1>
          <p className="adm-lede" style={{ marginBottom: 24 }}>{t.login.lede}</p>
          <form onSubmit={submit} noValidate>
            <label className="adm-field">
              <span className="adm-label">{t.login.email}</span>
              <input className="adm-input" type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoFocus />
            </label>
            <label className="adm-field">
              <span className="adm-label">{t.login.password}</span>
              <input className="adm-input" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </label>
            {error && <p className="adm-field-error" role="alert">{error}</p>}
            <button className="adm-btn adm-btn--primary" type="submit" disabled={busy || !email || !password}>
              {busy && <span className="adm-spinner" />}
              {busy ? t.login.checking : t.login.submit}
            </button>
          </form>
          <p className="adm-hint" style={{ marginTop: 20 }}>{t.login.forgot}</p>
        </div>
      </div>
    </div>
  )
}
