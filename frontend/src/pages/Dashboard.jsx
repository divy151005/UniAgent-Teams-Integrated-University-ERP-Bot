import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { dashboardApi } from '../services/api.js';
import { StatCard, LogTerminal, intentBadge, statusBadge, Badge, Spinner } from '../components/UI.jsx';

const COLORS = { announcement: '#7c6af7', query: '#34d399', task: '#f59e0b' };

export default function Dashboard({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const d = await dashboardApi.getStats();
      setData(d);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <Spinner />
    </div>
  );

  if (!data) return <div style={{ color: 'var(--text3)', textAlign: 'center', padding: 40 }}>
    <div style={{ fontSize: 32, marginBottom: 12 }}>⚠</div>
    <div>Could not connect to backend. Is Spring Boot running on port 8080?</div>
    <div style={{ fontSize: 12, marginTop: 8, fontFamily: 'DM Mono, monospace', color: 'var(--accent4)' }}>
      cd backend && mvn spring-boot:run
    </div>
  </div>;

  const intentData = data.intentBreakdown
    ? Object.entries(data.intentBreakdown).map(([k, v]) => ({ name: k, value: Number(v) }))
    : [];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 500, marginBottom: 4 }}>
          University Administration Agent
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>
          Automated routing · NLP processing · ERP integration · Teams sync
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Routed Today" value={data.routedMessages || 0} sub="messages delivered" color="var(--accent3)" accent="var(--accent3)" icon="✓" />
        <StatCard label="Total Channels" value={data.totalChannels || 0} sub="Teams channels" color="var(--accent2)" accent="var(--accent)" icon="⊞" />
        <StatCard label="Pending Review" value={data.pendingMessages || 0} sub="awaiting approval" color="var(--accent4)" accent="var(--accent4)" icon="◷" />
        <StatCard label="Escalated" value={data.escalatedMessages || 0} sub="need attention" color="var(--accent5)" accent="var(--accent5)" icon="⚡" />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Intent Pie */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 500, marginBottom: 16 }}>Intent Distribution</div>
          {intentData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={intentData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                    {intentData.map(entry => (
                      <Cell key={entry.name} fill={COLORS[entry.name] || '#555'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8 }}
                    labelStyle={{ color: 'var(--text3)' }}
                    itemStyle={{ color: 'var(--text)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {intentData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontFamily: 'DM Mono, monospace' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[d.name] || '#555' }} />
                    <span style={{ color: 'var(--text2)' }}>{d.name}</span>
                    <span style={{ color: 'var(--text)', marginLeft: 'auto', minWidth: 20 }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div style={{ color: 'var(--text3)', fontSize: 12, textAlign: 'center', padding: 30 }}>No data</div>}
        </div>

        {/* Recent Messages */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 500 }}>Recent Messages</div>
            <span style={{ fontSize: 11, color: 'var(--accent2)', cursor: 'pointer', fontFamily: 'DM Mono, monospace' }}
              onClick={() => onNavigate('messages')}>View all →</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(data.recentMessages || []).slice(0, 4).map(m => (
              <div key={m.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%', marginTop: 6, flexShrink: 0,
                  background: m.status === 'ROUTED' ? 'var(--accent3)' : m.status === 'ESCALATED' ? 'var(--accent5)' : 'var(--accent4)',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: 'var(--text)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.rawText}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>
                    {m.fromUser} · {m.intent}
                  </div>
                </div>
                {statusBadge(m.status)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ERP Events */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 500, marginBottom: 14 }}>ERP Events (Synced)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {(data.upcomingEvents || []).map(e => (
            <div key={e.eventId} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 16, transition: 'border-color 0.2s',
            }}>
              <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'DM Mono, monospace', marginBottom: 6 }}>{e.eventId}</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>{e.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'DM Mono, monospace', display: 'flex', gap: 12, marginBottom: 10 }}>
                <span>{e.eventDate}</span><span>{e.department}</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Badge variant={e.eventType === 'exam' ? 'red' : e.eventType === 'cultural_fest' ? 'purple' : 'amber'}>
                  {(e.eventType || '').replace('_', ' ')}
                </Badge>
                <Badge variant="green">{(e.status || '').replace('_', ' ').toLowerCase()}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Logs */}
      <LogTerminal logs={data.recentLogs || []} />
    </div>
  );
}
