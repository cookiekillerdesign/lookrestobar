import { Check, Globe } from '@phosphor-icons/react'
import { ADMIN_LANGS, ADMIN_LANG_LABELS, useAdminLang } from '../i18n.jsx'

export default function Settings({ email }) {
  const { lang, setLang, t } = useAdminLang()

  return (
    <>
      <div className="adm-head">
        <div>
          <div className="adm-eyebrow">{t.settings.eyebrow}</div>
          <h1>{t.settings.title}</h1>
          <p className="adm-lede" style={{ marginBottom: 0 }}>{t.settings.lede}</p>
        </div>
      </div>

      <div className="adm-panel" style={{ marginBottom: 18 }}>
        <div className="adm-panel-head"><h2><Globe size={16} weight="bold" style={{ verticalAlign: -2, marginRight: 8 }} />{t.settings.langTitle}</h2></div>
        <p className="adm-hint" style={{ marginBottom: 16 }}>{t.settings.langBody}</p>
        <div className="adm-chipset">
          {ADMIN_LANGS.map(code => (
            <button
              key={code}
              type="button"
              className={`adm-chip${lang === code ? ' on' : ''}`}
              onClick={() => setLang(code)}
            >
              {lang === code && <Check size={12} weight="bold" style={{ marginRight: 6, verticalAlign: -1 }} />}
              {ADMIN_LANG_LABELS[code]}
            </button>
          ))}
        </div>
        <p className="adm-hint" style={{ marginTop: 14 }}>{t.settings.langNote}</p>
      </div>

      <div className="adm-panel">
        <div className="adm-panel-head"><h2>{t.settings.accountTitle}</h2></div>
        <p className="adm-hint">{t.settings.accountEmail}: <b style={{ color: 'var(--a-paper)' }}>{email}</b></p>
      </div>
    </>
  )
}
