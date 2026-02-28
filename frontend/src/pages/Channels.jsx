import { useState, useEffect } from 'react';
import { channelsApi } from '../services/api.js';
import { SectionTitle, Spinner, Badge } from '../components/UI.jsx';

export default function Channels() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    channelsApi.getAll()
      .then(d => setChannels(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalStudents = channels.reduce((a, c) => a + (c.memberCount || 0), 0);

  return (
    <div>
      <SectionTitle sub={`${channels.length} channels mapped · ${totalStudents} total students`}>Teams Channels</SectionTitle>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {channels.map(c => (
            <div key={c.channelId} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 18, transition: 'all 0.2s', cursor: 'default',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ fontSize: 22, marginBottom: 10 }}>💬</div>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, fontWeight: 600, color: 'var(--text)', marginBottom: 6, wordBreak: 'break-all' }}>
                {c.channelName}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>
                {c.program?.department?.code} · Year {c.year}
                {c.section ? ` · Section ${c.section}` : ''}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>{c.channelId}</span>
                <span style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'DM Mono, monospace' }}>👤 {c.memberCount}</span>
              </div>
            </div>
          ))}
          {/* Add placeholder */}
          <div style={{
            border: '1px dashed var(--border2)', borderRadius: 12, padding: 18,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            opacity: 0.4, minHeight: 140, cursor: 'not-allowed',
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>+</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>Add Channel</div>
          </div>
        </div>
      )}
    </div>
  );
}
