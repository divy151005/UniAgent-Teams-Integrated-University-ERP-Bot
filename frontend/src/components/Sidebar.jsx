const NAV = [
  { section: 'Core', items: [
    { id: 'dashboard', icon: '⬡', label: 'Dashboard' },
    { id: 'pipeline',  icon: '⟳', label: 'NLP Pipeline' },
    { id: 'messages',  icon: '✉', label: 'Messages', badge: true },
  ]},
  { section: 'System', items: [
    { id: 'knowledge', icon: '◈', label: 'Knowledge Graph' },
    { id: 'channels',  icon: '⊞', label: 'Channels' },
    { id: 'events',    icon: '◷', label: 'ERP Events' },
    { id: 'logs',      icon: '≡', label: 'System Logs' },
  ]},
];

export default function Sidebar({ page, onNavigate, pendingCount }) {
  return (
    <aside style={{
      width: 220, minWidth: 220, background: 'var(--surface)',
      borderRight: '1px solid var(--border)', display: 'flex',
      flexDirection: 'column', zIndex: 10, overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid var(--border)' }}>
        <div style={{
          fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700,
          background: 'linear-gradient(135deg, #a78bfa, #34d399)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>UniAgent</div>
        <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 2, fontFamily: 'DM Mono, monospace' }}>
          ERP · Teams · NLP
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto' }}>
        {NAV.map(section => (
          <div key={section.section} style={{ marginBottom: 8 }}>
            <div style={{
              fontSize: 9, color: 'var(--text3)', letterSpacing: 2,
              textTransform: 'uppercase', padding: '4px 8px 6px',
              fontFamily: 'DM Mono, monospace',
            }}>{section.section}</div>
            {section.items.map(item => {
              const active = page === item.id;
              return (
                <div key={item.id}
                  onClick={() => onNavigate(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 10px', borderRadius: 8, cursor: 'pointer',
                    fontSize: 13, fontWeight: 600, marginBottom: 2,
                    color: active ? 'var(--accent2)' : 'var(--text2)',
                    background: active ? 'rgba(124,106,247,0.13)' : 'transparent',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--border)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: 15, width: 18, textAlign: 'center' }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && pendingCount > 0 && (
                    <span style={{
                      background: 'var(--accent5)', color: 'white', fontSize: 10,
                      padding: '1px 6px', borderRadius: 10, fontFamily: 'DM Mono, monospace',
                    }}>{pendingCount}</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '14px 10px', borderTop: '1px solid var(--border)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, fontSize: 11,
          color: 'var(--text2)', padding: '8px 10px',
          background: 'var(--surface2)', borderRadius: 8,
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--accent3)',
            boxShadow: '0 0 8px var(--accent3)',
            animation: 'pulse-dot 2s infinite',
          }} />
          <span>Bot Online · Azure</span>
        </div>
        <div style={{ fontSize: 10, color: 'var(--text3)', textAlign: 'center', marginTop: 8, fontFamily: 'DM Mono, monospace' }}>
          Spring Boot 3.2 · React 18
        </div>
      </div>
    </aside>
  );
}
