// Topbar.jsx
export default function Topbar({ page }) {
  const titles = {
    dashboard: 'Dashboard',
    pipeline: 'NLP Pipeline',
    messages: 'Message Queue',
    knowledge: 'Knowledge Graph',
    channels: 'Teams Channels',
    events: 'ERP Events',
    logs: 'System Logs',
  };
  return (
    <header style={{
      background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      padding: '0 28px', height: 56, display: 'flex', alignItems: 'center', gap: 14,
      position: 'sticky', top: 0, zIndex: 9, flexShrink: 0,
    }}>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 500, flex: 1 }}>
        {titles[page]}
      </div>
      {[
        { label: 'NLP ●', color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)' },
        { label: 'KG ●',  color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)' },
        { label: 'ERP ●', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
      ].map(p => (
        <span key={p.label} style={{
          fontSize: 10, padding: '3px 10px', borderRadius: 20,
          color: p.color, background: p.bg, border: `1px solid ${p.border}`,
          fontFamily: 'DM Mono, monospace', letterSpacing: 1,
        }}>{p.label}</span>
      ))}
      <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>
        {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
      </span>
    </header>
  );
}
