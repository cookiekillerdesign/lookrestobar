import { Link } from 'react-router-dom'
import LogoMark from './LogoMark.jsx'
import { CONTACT } from '../data/contact'
import { getDict } from '../i18n/site'

/** Shared footer for the menu and every legal page — one place to keep the
 *  contacts, socials, legal links and credit line in sync. */
export default function SiteFooter({ lang }) {
  const t = getDict(lang)
  return (
    <footer className="lm-footer">
      <LogoMark className="lm-footer-mark" />
      <b>LOOK Restobar &amp; Terrace</b>
      <div className="lm-footer-contacts">
        <a className="lm-footer-link" href={CONTACT.maps} target="_blank" rel="noopener noreferrer">{CONTACT.address}</a>
        <a className="lm-footer-phone" href={CONTACT.phoneHref}>{CONTACT.phoneDisplay}</a>
      </div>
      <div className="lm-footer-follow">
        {t.followLabel}: <a className="lm-footer-link" href={CONTACT.instagram} target="_blank" rel="noopener noreferrer">Instagram</a> &amp;{' '}
        <a className="lm-footer-link" href={CONTACT.facebook} target="_blank" rel="noopener noreferrer">Facebook</a> &amp;{' '}
        <a className="lm-footer-link" href={CONTACT.tiktok} target="_blank" rel="noopener noreferrer">TikTok</a>
      </div>
      <nav className="lm-footer-legal" aria-label="Legal">
        <Link to="/legal/terms" className="lm-footer-legal-link">{t.legalTerms}</Link>
        <Link to="/legal/privacy" className="lm-footer-legal-link">{t.legalPrivacy}</Link>
        <Link to="/legal/gdpr" className="lm-footer-legal-link">{t.legalGdpr}</Link>
        <Link to="/legal/cookies" className="lm-footer-legal-link">{t.legalCookies}</Link>
      </nav>
      <p className="lm-note">{t.footerNote}</p>
      <p className="lm-credit">
        {t.madeWith}{' '}
        <a href="https://cookiekiller.online" target="_blank" rel="noopener noreferrer">cookiekiller.online</a>
      </p>
    </footer>
  )
}
