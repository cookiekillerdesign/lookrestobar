import { Link } from 'react-router-dom'
import { MapPin, Phone, InstagramLogo, FacebookLogo, TiktokLogo } from '@phosphor-icons/react'
import logoHorizontal from '../assets/logo-horizontal.svg'
import logoVertical from '../assets/logo-vertical.svg'
import { getDict } from '../i18n/site'
import { useContact, useFooterNote } from '../content/siteContent'

/** Shared footer for the menu and every legal page — one place to keep the
 *  contacts, socials, legal links and credit line in sync. Laid out as three
 *  columns (brand, contacts, socials) over a bottom bar (legal links +
 *  credit) on wide screens, collapsing to one centered stack on phones —
 *  the same content as before, just given real structure instead of one
 *  long centered list.
 *
 *  Contacts and the tagline come from the admin-editable `site_content`
 *  table when a row exists there, falling back to the bundled defaults
 *  otherwise — see src/content/siteContent.js. */
export default function SiteFooter({ lang }) {
  const t = getDict(lang)
  const CONTACT = useContact()
  const footerNote = useFooterNote(lang, t.footerNote)
  return (
    <footer className="lm-footer">
      <div className="lm-wrap lm-footer-inner">
        <div className="lm-footer-top">
          <div className="lm-footer-col lm-footer-brand">
            {/* Vertical wordmark on narrow screens, horizontal on wide ones —
                swapped by CSS (display: none) rather than JS so there's no
                layout flash and no duplicate markup to keep in sync. */}
            <img src={logoVertical} alt="LOOK Restobar & Terrace" className="lm-footer-logo lm-footer-logo-v" />
            <img src={logoHorizontal} alt="LOOK Restobar & Terrace" className="lm-footer-logo lm-footer-logo-h" />
            <p className="lm-footer-note">{footerNote}</p>
          </div>

          <div className="lm-footer-col">
            <span className="lm-footer-col-title">{t.footerContacts}</span>
            <a className="lm-footer-row" href={CONTACT.maps} target="_blank" rel="noopener noreferrer">
              <MapPin size={16} weight="bold" />{CONTACT.address}
            </a>
            <a className="lm-footer-row" href={CONTACT.phoneHref}>
              <Phone size={16} weight="bold" />{CONTACT.phoneDisplay}
            </a>
          </div>

          <div className="lm-footer-col">
            <span className="lm-footer-col-title">{t.followLabel}</span>
            <div className="lm-footer-socials">
              <a className="lm-social-btn" href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <InstagramLogo size={18} weight="bold" />
              </a>
              <a className="lm-social-btn" href={CONTACT.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FacebookLogo size={18} weight="bold" />
              </a>
              <a className="lm-social-btn" href={CONTACT.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <TiktokLogo size={18} weight="bold" />
              </a>
            </div>
          </div>
        </div>

        <div className="lm-footer-divider" />

        <div className="lm-footer-bottom">
          <nav className="lm-footer-legal" aria-label="Legal">
            <Link to="/legal/terms" className="lm-footer-legal-link">{t.legalTerms}</Link>
            <Link to="/legal/privacy" className="lm-footer-legal-link">{t.legalPrivacy}</Link>
            <Link to="/legal/gdpr" className="lm-footer-legal-link">{t.legalGdpr}</Link>
            <Link to="/legal/cookies" className="lm-footer-legal-link">{t.legalCookies}</Link>
          </nav>
          <p className="lm-credit">
            {t.madeWith}{' '}
            <a href="https://cookiekiller.online" target="_blank" rel="noopener noreferrer">cookiekiller.online</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
