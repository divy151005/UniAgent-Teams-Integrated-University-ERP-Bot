// Reusable UI primitives

export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', ...style,
    }}>
      {children}
    </div>
  );
}

export function Badge({ children, variant = 'gray' }) {
  const variants = {
    gray:   { bg: 'rgba(255,255,255,0.05)', color: 'var(--text2)' },
    purple: { bg: 'rgba(124,106,247,0.1)', color: 'var(--accent2)' },
    green:  { bg: 'rgba(52,211,153,0.1)', color: 'var(--accent3)' },
    amber:  { bg: 'rgba(245,158,11,0.1)', color: 'var(--accent4)' },
    red:    { bg: 'rgba(248,113,113,0.1)', color: 'var(--accent5)' },
  };
  const v = variants[variant] || variants.gray;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 10, padding: '3px 9px', borderRadius: 20,
      fontFamily: 'DM Mono, monospace', fontWeight: 500,
      background: v.bg, color: v.color,
    }}>{children}</span>
  );
}

export function StatCard({ label, value, sub, color, icon, accent }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '20px 22px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${accent}, transparent)`,
      }} />
      <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', marginBottom: 10 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 36, fontWeight: 700, color, lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6, fontFamily: 'DM Mono, monospace' }}>{sub}</div>}
      {icon && <div style={{ position: 'absolute', right: 18, top: 18, fontSize: 28, opacity: 0.12 }}>{icon}</div>}
    </div>
  );
}

export function Spinner() {
  return (
    <div style={{
      width: 20, height: 20, border: '2px solid var(--border2)',
      borderTopColor: 'var(--accent)', borderRadius: '50%',
      animation: 'spin 0.8s linear infinite', display: 'inline-block',
    }} />
  );
}

export function Btn({ children, onClick, variant = 'primary', disabled = false, style = {} }) {
  const variants = {
    primary: { background: 'var(--accent)', color: 'white' },
    ghost:   { background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border2)' },
    green:   { background: 'rgba(52,211,153,0.12)', color: 'var(--accent3)', border: '1px solid rgba(52,211,153,0.25)' },
    red:     { background: 'rgba(248,113,113,0.12)', color: 'var(--accent5)', border: '1px solid rgba(248,113,113,0.25)' },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '9px 18px', borderRadius: 8, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 600,
        transition: 'all 0.15s', opacity: disabled ? 0.5 : 1,
        ...variants[variant],
        ...style,
      }}
    >{children}</button>
  );
}

export function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 500 }}>{children}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'DM Mono, monospace', marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

export function Table({ headers, rows, onRowClick }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--surface2)' }}>
            {headers.map(h => (
              <th key={h} style={{
                padding: '11px 16px', textAlign: 'left', fontSize: 10,
                color: 'var(--text3)', letterSpacing: '1.5px', textTransform: 'uppercase',
                fontFamily: 'DM Mono, monospace', fontWeight: 400,
                borderBottom: '1px solid var(--border)',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}
              onClick={() => onRowClick && onRowClick(row)}
              style={{
                cursor: onRowClick ? 'pointer' : 'default',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { if (onRowClick) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              {row.cells.map((cell, j) => (
                <td key={j} style={{
                  padding: '13px 16px', fontSize: 13,
                  borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none',
                  verticalAlign: 'middle',
                }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LogTerminal({ logs }) {
  const levelColor = { INFO: 'var(--accent2)', SUCCESS: 'var(--accent3)', WARNING: 'var(--accent4)', ERROR: 'var(--accent5)' };
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
      <div style={{
        background: '#0d0d14', padding: '10px 16px', borderBottom: '1px solid var(--border)',
        display: 'flex', gap: 8, alignItems: 'center',
      }}>
        {['#ef4444','#f59e0b','#22c55e'].map(c => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
        ))}
        <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 6, fontFamily: 'DM Mono, monospace' }}>
          system.log — {logs.length} entries
        </span>
      </div>
      <div style={{ padding: '10px 0', maxHeight: 340, overflowY: 'auto', fontFamily: 'DM Mono, monospace', fontSize: 11 }}>
        {logs.map((l, i) => (
          <div key={l.id || i} style={{ display: 'flex', gap: 12, padding: '3px 16px' }}>
            <span style={{ color: 'var(--text3)', minWidth: 75 }}>
              {new Date(l.timestamp).toLocaleTimeString()}
            </span>
            <span style={{ color: levelColor[l.level] || 'var(--accent2)', minWidth: 80 }}>
              [{l.level}]
            </span>
            <span style={{ color: 'var(--text3)', minWidth: 120 }}>{l.source}</span>
            <span style={{ color: 'var(--text2)' }}>{l.event}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function intentBadge(intent) {
  const map = { announcement: 'purple', query: 'green', task: 'amber' };
  return <Badge variant={map[intent] || 'gray'}>{intent}</Badge>;
}

export function statusBadge(status) {
  if (!status) return null;
  const s = status.toLowerCase();
  const map = { routed: 'green', escalated: 'red', pending: 'amber', rejected: 'gray' };
  return <Badge variant={map[s] || 'gray'}>{status}</Badge>;
}
