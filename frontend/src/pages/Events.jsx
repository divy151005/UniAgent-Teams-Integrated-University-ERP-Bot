import { useState, useEffect } from 'react';
import { eventsApi } from '../services/api.js';
import { SectionTitle, Spinner, Badge, Table } from '../components/UI.jsx';

const eventColor = {
  exam: 'red',
  cultural_fest: 'purple',
  fee_deadline: 'amber',
  schedule_change: 'amber',
  lab_session: 'green',
  seminar: 'purple',
};

const statusColor = {
  SCHEDULED: 'purple',
  REGISTRATION_OPEN: 'green',
  CONFIRMED: 'green',
  CANCELLED: 'red',
  COMPLETED: 'gray',
};

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');

  useEffect(() => {
    const params = {};
    if (filter !== 'all') params.type = filter;
    eventsApi.getAll(params)
      .then(d => setEvents(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div>
      <SectionTitle sub={`${events.length} events synced via POST /api/events`}>ERP Events</SectionTitle>

      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--surface2)', padding: 4, borderRadius: 10, width: 'fit-content' }}>
        {['all','exam','cultural_fest','fee_deadline','schedule_change'].map(f => (
          <div key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 12px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer',
            color: filter === f ? 'var(--text)' : 'var(--text2)',
            background: filter === f ? 'var(--surface)' : 'transparent',
            transition: 'all 0.15s', fontFamily: 'DM Mono, monospace',
          }}>{f.replace(/_/g, ' ')}</div>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>
      ) : (
        <Table
          headers={['Event ID', 'Title', 'Type', 'Date', 'Department', 'Status', 'Source']}
          rows={events.map(e => ({
            cells: [
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--text3)' }}>{e.eventId}</span>,
              <span style={{ fontSize: 13, fontWeight: 500 }}>{e.title}</span>,
              <Badge variant={eventColor[e.eventType] || 'gray'}>{(e.eventType || '').replace(/_/g, ' ')}</Badge>,
              <span style={{ fontSize: 12, fontFamily: 'DM Mono, monospace', color: 'var(--text2)' }}>{e.eventDate}</span>,
              <span style={{ fontSize: 12 }}>{e.department}</span>,
              <Badge variant={statusColor[e.status] || 'gray'}>{(e.status || '').replace(/_/g, ' ').toLowerCase()}</Badge>,
              <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>
                {e.sourceMessageId ? `MSG #${e.sourceMessageId}` : 'Manual'}
              </span>,
            ],
          }))}
        />
      )}
    </div>
  );
}
