import LogoMark from '../../pages/LogoMark.jsx'
import { useAdminLang } from '../i18n.jsx'

/**
 * What the panel shows before anything is wired up. Not an error — the
 * project simply hasn't been connected to Supabase yet.
 */
export default function Setup() {
  const { t } = useAdminLang()
  return (
    <div className="adm">
      <div className="adm-login">
        <div className="adm-login-card" style={{ maxWidth: 560 }}>
          <div className="adm-login-mark"><LogoMark className="adm-mark-icon" />{t.setup.mark}</div>
          <h1>{t.setup.title}</h1>
          <p className="adm-lede" style={{ marginBottom: 24 }}>{t.setup.lede}</p>
          <div className="adm-note">
            <b>{t.setup.howTitle}</b>
            {t.setup.steps}
          </div>
          <p className="adm-hint">{t.setup.hint}</p>
          <p className="adm-hint" style={{ marginTop: 16 }}>{t.setup.guide}</p>
          <div className="adm-actions" style={{ marginTop: 26 }}><a className="adm-btn" href="/">{t.setup.toMenu}</a></div>
        </div>
      </div>
    </div>
  )
}
