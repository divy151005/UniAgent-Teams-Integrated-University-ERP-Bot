import { useState, useEffect } from 'react';
import { messagesApi } from '../services/api.js';
import { Table, Badge, Btn, Spinner, intentBadge, statusBadge, SectionTitle } from '../components/UI.jsx';

export default function Messages({ showToast }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [selected, setSelected] = useState(null);
  const [newMsg, setNewMsg]     = useState({ rawText: '', fromUser: '' });
  const [posting, setPosting]   = useState(false);

  const load = async () => {
    try {
      const params = {};
      if (filter === 'pending' || filter === 'routed' || filter === 'escalated') params.status = filter;
      else if (filter === 'announcement' || filter === 'query' || filter === 'task') params.intent = filter;
      const data = await messagesApi.getAll(params);
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const approve = async (id) => {
    try {
      await messagesApi.approve(id);
      showToast('✓ Message approved and routed');
      load();
      if (selected?.id === id) setSelected(prev => ({ ...prev, status: 'ROUTED' }));
    } catch (e) { showToast('Failed: ' + e.message, 'error'); }
  };

  const reject = async (id) => {
    try {
      await messagesApi.reject(id);
      showToast('Message rejected', 'warning');
      load();
      if (selected?.id === id) setSelected(prev => ({ ...prev, status: 'REJECTED' }));
    } catch (e) { showToast('Failed: ' + e.message, 'error'); }
  };

  const postMessage = async () => {
    if (!newMsg.rawText.trim()) return;
    setPosting(true);
    try {
      const result = await messagesApi.ingest({ rawText: newMsg.rawText, fromUser: newMsg.fromUser || 'Admin' });
      showToast(`✓ Message processed → ${result.status}`);
      setNewMsg({ rawText: '', fromUser: '' });
      load();
    } catch (e) { showToast('Failed: ' + e.message, 'error'); } finally { setPosting(false); }
  };

  const parseEntities = (json) => {
    try { return JSON.parse(json || '{}'); } catch { return {}; }
  };
  const parseChannels = (json) => {
    try { return JSON.parse(json || '[]'); } catch { return []; }
  };

  const FILTERS = ['all', 'pending', 'routed', 'escalated', 'announcement', 'query', 'task'];

  return (
    <div>
      <SectionTitle sub="All messages processed through the NLP pipeline">Message Queue</SectionTitle>

      {/* Post new message */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--text2)' }}>Post New Message</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <input
            value={newMsg.fromUser}
            onChange={e => setNewMsg(p => ({ ...p, fromUser: e.target.value }))}
            placeholder="From (e.g. Dr. Sharma, HOD-CSE)"
            style={{
              width: 240, background: 'var(--surface2)', border: '1px solid var(--border2)',
              borderRadius: 8, padding: '9px 12px', color: 'var(--text)',
              fontFamily: 'Syne, sans-serif', fontSize: 12, outline: 'none',
            }}
          />
          <Btn onClick={postMessage} disabled={posting || !newMsg.rawText.trim()}>
            {posting ? <Spinner /> : '↑ Process Message'}
          </Btn>
        </div>
        <textarea
          value={newMsg.rawText}
          onChange={e => setNewMsg(p => ({ ...p, rawText: e.target.value }))}
          placeholder="Enter announcement or query text..."
          style={{
            width: '100%', minHeight: 72, background: 'var(--surface2)', border: '1px solid var(--border2)',
            borderRadius: 8, padding: '10px 12px', color: 'var(--text)',
            fontFamily: 'Syne, sans-serif', fontSize: 13, outline: 'none', resize: 'vertical',
          }}
        />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--surface2)', padding: 4, borderRadius: 10, width: 'fit-content' }}>
        {FILTERS.map(f => (
          <div key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            color: filter === f ? 'var(--text)' : 'var(--text2)',
            background: filter === f ? 'var(--surface)' : 'transparent',
            boxShadow: filter === f ? '0 1px 4px rgba(0,0,0,0.4)' : 'none',
            transition: 'all 0.15s',
          }}>{f.charAt(0).toUpperCase() + f.slice(1)}</div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        {/* Table */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div>
          ) : (
            <Table
              headers={['Time', 'From', 'Message', 'Intent', 'Status', 'Channels', 'Actions']}
              onRowClick={setSelected}
              rows={messages.map(m => ({
                data: m,
                cells: [
                  <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'DM Mono, monospace', whiteSpace: 'nowrap' }}>
                    {new Date(m.createdAt).toLocaleTimeString()}
                  </span>,
                  <span style={{ fontSize: 12, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap' }}>{m.fromUser}</span>,
                  <span style={{ fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap', color: 'var(--text2)' }}>
                    {m.rawText}
                  </span>,
                  intentBadge(m.intent),
                  statusBadge(m.status),
                  <span style={{ fontSize: 11, fontFamily: 'DM Mono, monospace' }}>
                    {parseChannels(m.targetChannelsJson).length} ch
                    {m.erpSynced && <Badge variant="green" style={{ marginLeft: 4, fontSize: 9 }}>ERP</Badge>}
                  </span>,
                  <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 6 }}>
                    {m.status === 'PENDING' && <>
                      <Btn variant="green" onClick={() => approve(m.id)} style={{ padding: '4px 10px', fontSize: 10 }}>Approve</Btn>
                      <Btn variant="red" onClick={() => reject(m.id)} style={{ padding: '4px 10px', fontSize: 10 }}>Reject</Btn>
                    </>}
                  </div>,
                ],
              }))}
            />
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div style={{
            width: 340, flexShrink: 0, background: 'var(--surface2)', border: '1px solid var(--border2)',
            borderRadius: 12, padding: 20, animation: 'slideInRight 0.25s ease',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>MSG #{selected.id}</span>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>

            <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'DM Mono, monospace', marginBottom: 10 }}>
              {new Date(selected.createdAt).toLocaleString()} · {selected.fromUser}
            </div>

            <div style={{
              fontSize: 13, color: 'var(--text)', lineHeight: 1.6,
              padding: 14, background: 'var(--surface)', borderRadius: 8,
              borderLeft: '3px solid var(--accent)', marginBottom: 16,
            }}>{selected.rawText}</div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', marginBottom: 8 }}>NLP Output</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {intentBadge(selected.intent)}
                {statusBadge(selected.status)}
                <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>
                  {((selected.intentConfidence || 0) * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', marginBottom: 8 }}>Entities</div>
              {Object.entries(parseEntities(selected.entitiesJson)).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 8, marginBottom: 4, fontSize: 12 }}>
                  <span style={{ color: 'var(--accent2)', fontFamily: 'DM Mono, monospace', fontSize: 11 }}>{k}</span>
                  <span style={{ color: 'var(--text)' }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', marginBottom: 8 }}>Target Channels</div>
              {parseChannels(selected.targetChannelsJson).length > 0
                ? parseChannels(selected.targetChannelsJson).map(cid => (
                  <div key={cid} style={{ fontSize: 11, color: 'var(--accent3)', fontFamily: 'DM Mono, monospace', marginBottom: 3 }}>→ {cid}</div>
                ))
                : <div style={{ fontSize: 12, color: 'var(--text3)' }}>No channels resolved</div>
              }
              {selected.erpSynced && <div style={{ marginTop: 8 }}><Badge variant="green">ERP Event: {selected.erpEventId}</Badge></div>}
            </div>

            {selected.status === 'PENDING' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn variant="green" onClick={() => approve(selected.id)} style={{ flex: 1 }}>Approve & Route</Btn>
                <Btn variant="red" onClick={() => reject(selected.id)} style={{ flex: 1 }}>Reject</Btn>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
