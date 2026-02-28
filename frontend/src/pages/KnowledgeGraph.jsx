import { useState, useEffect } from 'react';
import { knowledgeGraphApi } from '../services/api.js';
import { SectionTitle, Spinner } from '../components/UI.jsx';

const typeColors = {
  SCHOOL: { bg: 'rgba(124,106,247,0.12)', color: '#a78bfa' },
  DEPARTMENT: { bg: 'rgba(52,211,153,0.1)', color: '#34d399' },
  PROGRAM: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  CHANNEL: { bg: 'rgba(248,113,113,0.1)', color: '#f87171' },
};

function TypeBadge({ type }) {
  const c = typeColors[type] || {};
  return (
    <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, letterSpacing: 1, fontFamily: 'DM Mono, monospace', ...c }}>
      {type}
    </span>
  );
}

function ChannelNode({ channel }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 7, marginLeft: 60, fontSize: 12 }}>
      <span style={{ fontSize: 10, color: 'var(--text3)' }}>└</span>
      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: 'var(--text2)', flex: 1 }}>{channel.channelName}</span>
      <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>👤 {channel.memberCount}</span>
      <TypeBadge type="CHANNEL" />
    </div>
  );
}

function ProgramNode({ prog }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div onClick={() => setOpen(!open)} style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8,
        marginLeft: 40, cursor: 'pointer', transition: 'background 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <span style={{ fontSize: 10, color: 'var(--text3)' }}>{open ? '▾' : '▸'}</span>
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: 'var(--text)', flex: 1 }}>
          {prog.name} <span style={{ color: 'var(--text3)' }}>({prog.durationYears}yr)</span>
        </span>
        <TypeBadge type="PROGRAM" />
      </div>
      {open && (prog.channels || []).map(ch => <ChannelNode key={ch.channelId} channel={ch} />)}
    </div>
  );
}

function DeptNode({ dept }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div onClick={() => setOpen(!open)} style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 8,
        marginLeft: 20, cursor: 'pointer', transition: 'background 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <span style={{ fontSize: 10, color: 'var(--text3)' }}>{open ? '▾' : '▸'}</span>
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: 'var(--text)', flex: 1 }}>
          {dept.name} <span style={{ color: 'var(--text3)' }}>({dept.code})</span>
        </span>
        <TypeBadge type="DEPARTMENT" />
      </div>
      {open && (dept.programs || []).map(p => <ProgramNode key={p.id} prog={p} />)}
    </div>
  );
}

function SchoolNode({ school }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 4 }}>
      <div onClick={() => setOpen(!open)} style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '9px 8px', borderRadius: 8,
        cursor: 'pointer', transition: 'background 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>{open ? '▾' : '▸'}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', flex: 1 }}>{school.name}</span>
        <TypeBadge type="SCHOOL" />
      </div>
      {open && (school.departments || []).map(d => <DeptNode key={d.id} dept={d} />)}
    </div>
  );
}

export default function KnowledgeGraph() {
  const [graph, setGraph] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    knowledgeGraphApi.getGraph()
      .then(setGraph)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const countChannels = (schools) => {
    return schools?.reduce((a, s) => a + s.departments?.reduce((b, d) => b + d.programs?.reduce((c, p) => c + (p.channels?.length || 0), 0) || 0, 0) || 0, 0) || 0;
  };
  const totalStudents = (schools) => {
    let total = 0;
    schools?.forEach(s => s.departments?.forEach(d => d.programs?.forEach(p => p.channels?.forEach(ch => total += ch.memberCount))));
    return total;
  };

  return (
    <div>
      <SectionTitle sub="Academic hierarchy: Schools → Departments → Programs → Channels">Knowledge Graph</SectionTitle>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Tree */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Schema Explorer</div>
            {(graph?.schools || []).map(s => <SchoolNode key={s.id} school={s} />)}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Stats */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--surface2)' }}>
                    {['Entity', 'Count', 'Type'].map(h => (
                      <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 10, color: 'var(--text3)', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', fontWeight: 400, borderBottom: '1px solid var(--border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Schools', count: graph?.schools?.length || 0, type: 'SCHOOL' },
                    { label: 'Departments', count: graph?.schools?.reduce((a,s) => a + (s.departments?.length||0), 0) || 0, type: 'DEPARTMENT' },
                    { label: 'Programs', count: graph?.schools?.reduce((a,s) => a + s.departments?.reduce((b,d) => b + (d.programs?.length||0), 0)||0, 0) || 0, type: 'PROGRAM' },
                    { label: 'Channels', count: graph?.totalChannels || countChannels(graph?.schools), type: 'CHANNEL' },
                    { label: 'Total Students', count: totalStudents(graph?.schools), type: 'USER' },
                  ].map((row, i, arr) => (
                    <tr key={row.label}>
                      <td style={{ padding: '13px 16px', fontSize: 13, borderBottom: i < arr.length-1 ? '1px solid var(--border)' : 'none' }}>{row.label}</td>
                      <td style={{ padding: '13px 16px', fontSize: 16, fontFamily: 'DM Mono, monospace', fontWeight: 600, borderBottom: i < arr.length-1 ? '1px solid var(--border)' : 'none' }}>{row.count}</td>
                      <td style={{ padding: '13px 16px', borderBottom: i < arr.length-1 ? '1px solid var(--border)' : 'none' }}>
                        <TypeBadge type={row.type} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* DB Schema */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ background: '#0d0d14', padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>
                schema.sql — PostgreSQL / H2
              </div>
              <pre style={{ padding: '18px 20px', fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--text2)', lineHeight: 1.8, overflow: 'auto' }}>
{`\u001b[35mSchool\u001b[0m(id, name, code)
  └─ \u001b[32mDepartment\u001b[0m(id, name, code, school_id)
       └─ \u001b[33mProgram\u001b[0m(id, name, duration_years, dept_id)
            └─ \u001b[31mTeamsChannel\u001b[0m(channel_id, name, year, 
                          section, member_count, program_id)

\u001b[35mMessage\u001b[0m(id, raw_text, from_user, intent,
         confidence, entities_json,
         target_channels_json, status,
         erp_synced, erp_event_id, created_at)

\u001b[32mErpEvent\u001b[0m(event_id, title, event_type,
          event_date, department, status,
          source_message_id, created_at)

\u001b[33mSystemLog\u001b[0m(id, timestamp, source,
           event, level, message_id)`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
