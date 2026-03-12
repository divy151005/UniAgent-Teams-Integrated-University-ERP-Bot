import { useState, useEffect } from 'react';
import { messagesApi } from '../services/api.js';
import { Badge, Btn, Spinner, SectionTitle, Card } from '../components/UI.jsx';

export default function Messages({ showToast }) {
  const [tab, setTab] = useState('pending');
  const [pending, setPending] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [denied, setDenied] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMsg, setNewMsg] = useState({ rawText: '', fromUser: '' });
  const [posting, setPosting] = useState(false);
  const [selected, setSelected] = useState(null);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const all = await messagesApi.getAll();
      
      setPending(all.filter(m => m.status === 'PENDING'));
      setAccepted(all.filter(m => m.status === 'ROUTED'));
      setDenied(all.filter(m => m.status === 'REJECTED' || m.status === 'ESCALATED'));
    } catch (e) {
      showToast('Failed to load messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const approve = async (id) => {
    try {
      await messagesApi.approve(id);
      showToast('✅ Message APPROVED & sent to students!');
      loadMessages();
    } catch (e) {
      showToast('Approve failed: ' + e.message, 'error');
    }
  };

  const reject = async (id) => {
    try {
      await messagesApi.reject(id);
      showToast('❌ Message REJECTED');
      loadMessages();
    } catch (e) {
      showToast('Reject failed: ' + e.message, 'error');
    }
  };

  const postMessage = async () => {
    if (!newMsg.rawText.trim()) return;
    setPosting(true);
    try {
      await messagesApi.ingest(newMsg);
      showToast('📨 New message queued for review');
      setNewMsg({ rawText: '', fromUser: '' });
      loadMessages();
    } catch (e) {
      showToast('Post failed: ' + e.message, 'error');
    } finally {
      setPosting(false);
    }
  };

  const parseEntities = (json) => {
    try { return JSON.parse(json || '{}'); } catch { return {}; }
  };
  
  const parseChannels = (json) => {
    try { return JSON.parse(json || '[]'); } catch { return []; }
  };

  const TABS = [
    { id: 'pending', label: `Pending (${pending.length})`, badge: 'amber' },
    { id: 'accepted', label: `Accepted (${accepted.length})`, badge: 'green' },
    { id: 'denied', label: `Denied (${denied.length})`, badge: 'red' }
  ];

  const getMessagesForTab = () => {
    switch (tab) {
      case 'pending': return pending;
      case 'accepted': return accepted;
      case 'denied': return denied;
      default: return [];
    }
  };

  const messages = getMessagesForTab();

  return (
    <div>
      <SectionTitle sub="Review & approve messages before sending to student Teams channels">
        Teams Message Approval
      </SectionTitle>

      {/* Post New Message */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: '#64748b' }}>
          📤 Post New Admin Message
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            value={newMsg.fromUser}
            onChange={e => setNewMsg({ ...newMsg, fromUser: e.target.value })}
            placeholder="From: Dr. Sharma, HOD CSE"
            style={{
              flex: 1, minWidth: 280, padding: '12px 16px', border: '1px solid #334155', 
              borderRadius: 12, fontSize: 14, background: '#0f172a', color: 'white',
              outline: 'none', fontFamily: 'inherit'
            }}
          />
          <Btn onClick={postMessage} disabled={posting || !newMsg.rawText.trim()}>
            {posting ? <Spinner /> : 'Send for Review'}
          </Btn>
        </div>
        <textarea
          value={newMsg.rawText}
          onChange={e => setNewMsg({ ...newMsg, rawText: e.target.value })}
          placeholder="Type announcement for students... (NLP will auto-route to class channels)"
          style={{
            width: '100%', height: 100, marginTop: 12, padding: '12px 16px',
            border: '1px solid #334155', borderRadius: 12, fontSize: 14,
            background: '#0f172a', color: 'white', outline: 'none', resize: 'vertical',
            fontFamily: 'inherit', lineHeight: 1.5
          }}
        />
      </Card>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 24, background: '#1e293b', borderRadius: 16, padding: 4 }}>
        {TABS.map(({ id, label, badge }) => (
          <div 
            key={id}
            onClick={() => setTab(id)}
            style={{
              flex: 1, padding: '14px 20px', textAlign: 'center', cursor: 'pointer',
              borderRadius: 12, fontWeight: 600, fontSize: 14,
              background: tab === id ? '#0f172a' : 'transparent',
              color: tab === id ? 'white' : '#94a3b8',
              transition: 'all 0.2s ease', position: 'relative',
              boxShadow: tab === id ? '0 4px 12px rgba(0,0,0,0.3)' : 'none'
            }}
          >
            {label}
            <Badge variant={badge} style={{ position: 'absolute', right: 12, top: 12 }} />
          </div>
        ))}
      </div>

      {/* Messages Cards */}
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))' }}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', padding: 60, textAlign: 'center' }}>
            <Spinner />
            <div style={{ marginTop: 12, color: '#64748b', fontSize: 14 }}>Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <Card style={{ gridColumn: '1 / -1', padding: 60, textAlign: 'center' }}>
            <div style={{ color: '#64748b', fontSize: 16, marginBottom: 8 }}>No {tab} messages</div>
            <div style={{ color: '#475569', fontSize: 13 }}>Post a new message above to get started</div>
          </Card>
        ) : (
          messages.map(msg => (
            <Card key={msg.id} style={{ cursor: 'pointer', transition: 'box-shadow 0.2s' }} onClick={() => setSelected(msg)}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: 'white', lineHeight: 1.4 }}>
                    {msg.rawText.substring(0, 100)}{msg.rawText.length > 100 ? '...' : ''}
                  </div>
                  <div style={{ fontSize: 13, color: '#94a3b8' }}>{msg.fromUser}</div>
                </div>
                <Badge variant={msg.status?.toLowerCase() === 'routed' ? 'green' : msg.status === 'pending' ? 'amber' : 'red'}>
                  {msg.status || 'Unknown'}
                </Badge>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                {msg.intent && <Badge variant="purple">{msg.intent}</Badge>}
                {msg.erpSynced && <Badge variant="green">ERP</Badge>}
                <Badge variant="gray">
                  {parseChannels(msg.targetChannelsJson).length || 0} Channels
                </Badge>
                <Badge variant="gray">
                  {((msg.intentConfidence || 0) * 100).toFixed(0)}% Confidence
                </Badge>
              </div>

              {msg.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: 12, padding: '20px 0 8px 0', borderTop: '1px solid #334155' }}>
                  <Btn variant="green" onClick={(e) => {
                    e.stopPropagation();
                    approve(msg.id);
                  }} style={{ flex: 1, padding: '16px', fontSize: 15, fontWeight: 600 }}>
                    ✅ APPROVE & Send to {parseChannels(msg.targetChannelsJson).length || 'Students'}
                  </Btn>
                  <Btn variant="red" onClick={(e) => {
                    e.stopPropagation();
                    reject(msg.id);
                  }} style={{ flex: 1, padding: '16px', fontSize: 15, fontWeight: 600 }}>
                    ❌ DENY Message
                  </Btn>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div style={{ 
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 
        }} onClick={() => setSelected(null)}>
          <Card style={{ maxWidth: 700, maxHeight: '90vh', width: '100%', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 24, color: 'white' }}>
              {selected.rawText}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
              <div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                  NLP Analysis
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {selected.intent && <Badge variant="purple">{selected.intent}</Badge>}
                  <Badge variant="gray">{((selected.intentConfidence || 0)*100).toFixed(0)}%</Badge>
                  {selected.erpSynced && <Badge variant="green">ERP Synced</Badge>}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Target Channels
                </div>
                {parseChannels(selected.targetChannelsJson).map(cid => (
                  <Badge key={cid} variant="blue" style={{ marginBottom: 4, display: 'block' }}>
                    → {cid}
                  </Badge>
                ))}
                {parseChannels(selected.targetChannelsJson).length === 0 && (
                  <div style={{ color: '#ef4444', fontSize: 13 }}>No channels resolved</div>
                )}
              </div>
              {selected.entitiesJson && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Entities Extracted
                  </div>
                  <pre style={{ background: '#0f172a', padding: 16, borderRadius: 12, fontSize: 13, color: '#94a3b8', fontFamily: 'DM Mono, monospace', whiteSpace: 'pre-wrap' }}>
{JSON.stringify(parseEntities(selected.entitiesJson), null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #334155', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Btn variant="ghost" onClick={() => setSelected(null)}>Close</Btn>
              {selected.status === 'PENDING' && (
                <>
                  <Btn variant="green" onClick={() => approve(selected.id)}>Approve</Btn>
                  <Btn variant="red" onClick={() => reject(selected.id)}>Deny</Btn>
                </>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

