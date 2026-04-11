import { useEffect } from 'react';

export function WhatsAppNotification({ phone, message, onDismiss, autoDismissMs = 6000 }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(timer);
  }, [message, autoDismissMs, onDismiss]);

  return (
    <div className="wa-popup" style={{ marginBottom: '0.75rem' }}>
      <div className="wa-popup-icon">💬</div>
      <div>
        <strong>WhatsApp (simulated)</strong><br />
        To: {phone}<br />
        "{message}"
      </div>
      <button onClick={onDismiss} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.1rem', padding: '0 4px' }}>✕</button>
    </div>
  );
}