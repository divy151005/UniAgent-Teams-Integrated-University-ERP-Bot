import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, []);

  const colors = {
    success: { border: 'var(--accent3)', color: 'var(--accent3)' },
    error:   { border: 'var(--accent5)', color: 'var(--accent5)' },
    warning: { border: 'var(--accent4)', color: 'var(--accent4)' },
    info:    { border: 'var(--accent2)', color: 'var(--accent2)' },
  };
  const c = colors[type] || colors.success;

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
      background: 'var(--surface2)', border: `1px solid ${c.border}`,
      color: c.color, padding: '12px 20px', borderRadius: 10,
      fontFamily: 'DM Mono, monospace', fontSize: 12,
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      animation: 'fadeSlideUp 0.3s ease',
    }}>
      <span>⬤</span>
      <span style={{ color: 'var(--text)' }}>{message}</span>
      <span style={{ cursor: 'pointer', marginLeft: 8, opacity: 0.5 }} onClick={onClose}>✕</span>
    </div>
  );
}
