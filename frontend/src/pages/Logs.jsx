import { useState, useEffect } from 'react';
import { logsApi } from '../services/api.js';
import { SectionTitle, Spinner, LogTerminal, Badge } from '../components/UI.jsx';

export default function Logs() {
  const [logs, setLogs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');

  const load = async () => {
    try {
      const data = await logsApi.getAll({ limit: 100 });
      setLogs(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { load(); const t = setInterval(load, 8000); return () => clearInterval(t); }, []);

  const filtered = filter === 'all' ? logs : logs.filter(l => l.level === filter.toUpperCase());

  const levelCount = (l) => logs.filter(x => x.level === l).length;

  const levelColor = { INFO: 'purple', SUCCESS: 'green', WARNING: 'amber', ERROR: 'red' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <SectionTitle sub="Real-time agent activity — NLP · KG · ERP · Teams">System Logs</SectionTitle>
        <button onClick={load} style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text2)', padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontFamily: 'DM Mono, monospace', fontSize: 11 }}>
          ↺ Refresh
        </button>
      </div>

      {/* Summary pills */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {['all', 'INFO', 'SUCCESS', 'WARNING', 'ERROR'].map(f => (
          <div key={f} onClick={() => setFilter(f.toLowerCase())} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
            background: filter === f.toLowerCase() ? 'var(--surface2)' : 'transparent',
            border: `1px solid ${filter === f.toLowerCase() ? 'var(--border2)' : 'transparent'}`,
            borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'DM Mono, monospace',
            color: filter === f.toLowerCase() ? 'var(--text)' : 'var(--text3)',
            transition: 'all 0.15s',
          }}>
            {f === 'all' ? `All (${logs.length})` : `${f} (${levelCount(f)})`}
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{
            background: '#0d0d14', padding: '10px 16px', borderBottom: '1px solid var(--border)',
            display: 'flex', gap: 8, alignItems: 'center',
          }}>
            {['#ef4444','#f59e0b','#22c55e'].map(c => (
              <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
            ))}
            <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 6, fontFamily: 'DM Mono, monospace' }}>
              system.log — {filtered.length} entries — live
            </span>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse-dot 2s infinite' }} />
              <span style={{ fontSize: 10, color: 'var(--accent3)', fontFamily: 'DM Mono, monospace' }}>LIVE</span>
            </div>
          </div>
          <div style={{ padding: '10px 0', maxHeight: 'calc(100vh - 350px)', overflowY: 'auto', fontFamily: 'DM Mono, monospace', fontSize: 11 }}>
            {filtered.map((l, i) => {
              const lc = { INFO: 'var(--accent2)', SUCCESS: 'var(--accent3)', WARNING: 'var(--accent4)', ERROR: 'var(--accent5)' }[l.level] || 'var(--text2)';
              return (
                <div key={l.id || i} style={{
                  display: 'flex', gap: 12, padding: '4px 16px',
                  borderBottom: i < filtered.length-1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                }}>
                  <span style={{ color: 'var(--text3)', minWidth: 80 }}>
                    {new Date(l.timestamp).toLocaleTimeString()}
                  </span>
                  <span style={{ color: lc, minWidth: 75 }}>[{l.level}]</span>
                  <span style={{ color: 'var(--accent2)', minWidth: 130 }}>{l.source}</span>
                  <span style={{ color: 'var(--text2)', flex: 1 }}>{l.event}</span>
                  {l.messageId && (
                    <span style={{ color: 'var(--text3)', marginLeft: 8 }}>→ MSG #{l.messageId}</span>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>No logs</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
