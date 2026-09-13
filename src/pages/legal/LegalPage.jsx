import { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'
import LogoMark from '../LogoMark.jsx'
import SiteFooter from '../SiteFooter.jsx'
import { SITE_LANGS, SITE_LANG_LABELS, getDict } from '../../i18n/site'
import { getLegalDoc, LEGAL_KEYS } from './content'
import '../Menu.css'
import './legal.css'

export default function LegalPage() {
  const { doc } = useParams()
  const [lang, setLang] = useState(() => { try { return localStorage.getItem('look-menu-lang') || 'ro' } catch { return 'ro' } })
  const [theme] = useState(() => { try { return localStorage.getItem('look-menu-theme') || '' } catch { return '' } })
  const t = getDict(lang)

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme || '') }, [theme])
  useEffect(() => { try { localStorage.setItem('look-menu-lang', lang) } catch { /* ignore */ } }, [lang])

  if (!LEGAL_KEYS.includes(doc)) return <Navigate to="/" replace />
  const content = getLegalDoc(doc, lang)

  return (
    <div className="lm-root lm-legal">
      <div className="lm-ambient"><span /><span /></div>

      <header className="lm-topbar">
        <div className="lm-wrap lm-topbar-inner">
          <Link to="/" className="lm-brand lm-brand-link">
            <LogoMark className="lm-brand-mark" />
            <div className="lm-brand-txt"><b>LOOK</b><span>Restobar &amp; Terrace</span></div>
          </Link>
          <div className="lm-langswitch" role="group" aria-label={t.switchLang}>
            {SITE_LANGS.map(code => (
              <button key={code} className={`lm-lang-btn${lang === code ? ' active' : ''}`} onClick={() => setLang(code)}>
                {SITE_LANG_LABELS[code]}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="lm-wrap lm-legal-main">
        <Link to="/" className="lm-legal-back"><ArrowLeft size={13} weight="bold" />{t.backToMenu}</Link>
        <h1 className="lm-legal-title">{content.title}</h1>
        <p className="lm-legal-updated">{lang === 'ru' ? 'Обновлено' : lang === 'en' ? 'Updated' : 'Actualizat'}: {content.updated}</p>
        <div className="lm-legal-body">
          {content.sections.map((s, i) => (
            <section key={i} className="lm-legal-section">
              <h2>{s.h}</h2>
              <p>{s.p}</p>
            </section>
          ))}
        </div>
      </main>

      <SiteFooter lang={lang} />
    </div>
  )
}
