import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { X } from '@phosphor-icons/react';
import { useAdminLang } from '../i18n.jsx';

const ToastContext = createContext({ push: () => {}, success: () => {}, error: () => {} });

let seq = 0;

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setItems(list => list.filter(t => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) { clearTimeout(timer); timers.current.delete(id); }
  }, []);

  const push = useCallback((message, tone = 'info') => {
    const id = ++seq;
    setItems(list => [...list, { id, message: String(message), tone }]);
    // Errors stay put until dismissed: the one message you actually need to
    // read is the one most likely to vanish while you're looking elsewhere.
    if (tone !== 'error') {
      timers.current.set(id, setTimeout(() => dismiss(id), 4200));
    }
    return id;
  }, [dismiss]);

  const value = useRef(null);
  value.current = {
    push,
    success: (m) => push(m, 'success'),
    error: (m) => push(m && m.message ? m.message : m, 'error')
  };

  const timersRef = timers.current;
  useEffect(() => () => timersRef.forEach(clearTimeout), [timersRef]);

  const { t: dict } = useAdminLang();

  return (
    <ToastContext.Provider value={value.current}>
      {children}
      <div className="adm-toasts" role="status" aria-live="polite">
        {items.map(item => (
          <div key={item.id} className={`adm-toast adm-toast--${item.tone}`}>
            <span>{item.message}</span>
            <button type="button" onClick={() => dismiss(item.id)} aria-label={dict.common.close || 'Close'}>
              <X size={14} weight="bold" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
