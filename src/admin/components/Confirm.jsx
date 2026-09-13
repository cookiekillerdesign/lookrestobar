import { useEffect, useRef } from 'react';
import { useAdminLang } from '../i18n.jsx';

/**
 * Blocking confirmation for anything that can't be undone.
 * Deliberately not window.confirm(): the browser dialog can't say what will
 * be deleted alongside the thing you clicked (uploaded files, for instance).
 */
export default function Confirm({ open, title, body, confirmLabel, cancelLabel, tone = 'danger', busy = false, onConfirm, onCancel }) {
  const { t } = useAdminLang();
  confirmLabel = confirmLabel || t.common.delete;
  cancelLabel = cancelLabel || t.common.cancel;
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === 'Escape' && !busy) onCancel(); };
    addEventListener('keydown', onKey);
    const focusTimer = setTimeout(() => confirmRef.current?.focus(), 40);
    return () => { removeEventListener('keydown', onKey); clearTimeout(focusTimer); };
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div className="adm-dialog-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onCancel(); }}>
      <div className="adm-dialog" role="dialog" aria-modal="true" aria-label={title}>
        <h3>{title}</h3>
        <p>{body}</p>
        <div className="adm-actions">
          <button type="button" className="adm-btn adm-btn--ghost" onClick={onCancel} disabled={busy}>{cancelLabel}</button>
          <button
            ref={confirmRef}
            type="button"
            className={`adm-btn ${tone === 'danger' ? 'adm-btn--danger' : 'adm-btn--primary'}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy && <span className="adm-spinner" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
