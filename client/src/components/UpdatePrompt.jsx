import { useEffect, useRef } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export default function UpdatePrompt() {
  const swRegistration = useRef(null);
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) { swRegistration.current = r; },
  });

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        swRegistration.current?.update();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  if (!needRefresh) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '5rem', left: '50%',
      transform: 'translateX(-50%)', zIndex: 9999,
      background: '#166534', color: '#fff',
      padding: '0.75rem 1.25rem', borderRadius: '0.75rem',
      display: 'flex', gap: '0.75rem', alignItems: 'center',
      boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: '0.9rem' }}>Neue Version verfügbar</span>
      <button
        onClick={() => updateServiceWorker(true)}
        style={{
          background: '#fff', color: '#166534', border: 'none',
          borderRadius: '0.4rem', padding: '0.3rem 0.75rem',
          fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
        }}
      >
        Aktualisieren
      </button>
      <button
        onClick={() => setNeedRefresh(false)}
        style={{
          background: 'transparent', color: '#fff', border: 'none',
          cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1,
        }}
      >
        ✕
      </button>
    </div>
  );
}