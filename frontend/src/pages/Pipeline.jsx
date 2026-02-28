import { useState } from 'react';
import { nlpApi, messagesApi } from '../services/api.js';
import { Badge, Btn, Spinner, intentBadge } from '../components/UI.jsx';

const STEPS = [
  { label: 'Ingest',    icon: '⬇', desc: 'Receive from Teams' },
  { label: 'Classify',  icon: '◈', desc: 'Intent detection' },
  { label: 'Extract',   icon: '✦', desc: 'Entity recognition' },
  { label: 'Resolve KG',icon: '⬡', desc: 'Knowledge graph' },
  { label: 'Policy',    icon: '⚙', desc: 'Route decision' },
  { label: 'Generate',  icon: '✎', desc: 'Response text' },
  { label: 'Deliver',   icon: '✓', desc: 'Post to channels' },
];

const SAMPLES = [
  "Attention all 3rd year B.Tech CSE students: Mid-semester exams begin on March 20th. Timetable attached.",
  "All departments: Cultural fest registrations open till March 1. Please circulate to all students.",
  "1st year ECE batch: Lab session rescheduled to Friday 2 PM.",
  "What is the deadline for project submission for CSE 2nd year?",
  "Fee payment deadline for all programs extended to March 10th.",
  "2nd year Mechanical students: Submit your internship reports by this Friday.",
];

export default function Pipeline({ showToast }) {
  const [input, setInput]       = useState('');
  const [sender, setSender]     = useState('Dr. Sharma (HOD)');
  const [result, setResult]     = useState(null);
  const [currentStep, setStep]  = useState(-1);
  const [processing, setProcessing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const runAnalysis = async () => {
    if (!input.trim()) return;
    setResult(null);
    setProcessing(true);

    // Animate steps
    for (let i = 0; i < STEPS.length; i++) {
      setStep(i);
      await new Promise(r => setTimeout(r, 380));
    }

    try {
      const r = await nlpApi.analyze({ rawText: input, fromUser: sender });
      setResult(r);
    } catch (e) {
      showToast('Analysis failed: ' + e.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const submitToQueue = async () => {
    if (!input.trim()) return;
    setSubmitting(true);
    try {
      await messagesApi.ingest({ rawText: input, fromUser: sender });
      showToast('✓ Message processed and added to queue');
      setInput('');
      setResult(null);
      setStep(-1);
    } catch (e) {
      showToast('Submit failed: ' + e.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 500, marginBottom: 4 }}>
          NLP Processing Pipeline
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>
          Ingest → Classify → Extract → Resolve KG → Policy → Generate → Deliver
        </div>
      </div>

      {/* Input */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <input
            value={sender}
            onChange={e => setSender(e.target.value)}
            placeholder="Sender..."
            style={{
              width: 200, background: 'var(--surface2)', border: '1px solid var(--border2)',
              borderRadius: 8, padding: '10px 14px', color: 'var(--text)',
              fontFamily: 'Syne, sans-serif', fontSize: 12, outline: 'none',
            }}
          />
          <Btn onClick={runAnalysis} disabled={processing || !input.trim()} style={{ minWidth: 130 }}>
            {processing ? <Spinner /> : '▶ Analyze'}
          </Btn>
          {result && (
            <Btn onClick={submitToQueue} disabled={submitting} variant="green" style={{ minWidth: 150 }}>
              {submitting ? <Spinner /> : '↑ Submit to Queue'}
            </Btn>
          )}
        </div>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') runAnalysis(); }}
          placeholder="Type or paste a message to analyze... (Ctrl+Enter to run)"
          style={{
            width: '100%', minHeight: 90, background: 'var(--surface2)', border: '1px solid var(--border2)',
            borderRadius: 10, padding: '12px 14px', color: 'var(--text)',
            fontFamily: 'Syne, sans-serif', fontSize: 13, outline: 'none', resize: 'vertical',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border2)'}
        />

        {/* Sample prompts */}
        <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {SAMPLES.map((s, i) => (
            <span key={i} onClick={() => setInput(s)} style={{
              fontSize: 10, padding: '3px 10px', borderRadius: 12,
              background: 'rgba(124,106,247,0.08)', color: 'var(--accent2)',
              border: '1px solid rgba(124,106,247,0.15)', cursor: 'pointer',
              fontFamily: 'DM Mono, monospace', transition: 'all 0.15s',
            }}
              onMouseEnter={e => e.target.style.background = 'rgba(124,106,247,0.18)'}
              onMouseLeave={e => e.target.style.background = 'rgba(124,106,247,0.08)'}
            >
              {s.slice(0, 45)}…
            </span>
          ))}
        </div>
      </div>

      {/* Pipeline Visualizer */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', overflow: 'auto', paddingBottom: 8 }}>
          {STEPS.map((s, i) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 100 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 18, transition: 'all 0.3s',
                  border: `2px solid ${currentStep > i ? 'var(--accent3)' : currentStep === i ? 'var(--accent)' : 'var(--border2)'}`,
                  background: currentStep > i ? 'rgba(52,211,153,0.1)' : currentStep === i ? 'rgba(124,106,247,0.15)' : 'var(--surface2)',
                  boxShadow: currentStep === i ? '0 0 14px rgba(124,106,247,0.3)' : 'none',
                  opacity: currentStep < i && currentStep >= 0 ? 0.5 : 1,
                }}>
                  {currentStep > i ? '✓' : s.icon}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 8, textAlign: 'center', fontFamily: 'DM Mono, monospace' }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 9, color: 'var(--text3)', textAlign: 'center', opacity: 0.6 }}>
                  {s.desc}
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  flex: 1, height: 2, minWidth: 20, margin: '-18px 0 0 0',
                  background: currentStep > i ? 'var(--accent3)' : 'var(--border)',
                  transition: 'background 0.3s',
                }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      {result && (
        <div style={{
          background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 14,
          padding: 24, animation: 'fadeSlideUp 0.3s ease',
        }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 500, marginBottom: 18 }}>
            Pipeline Results
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {/* Intent */}
            <div>
              <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', marginBottom: 10 }}>Intent</div>
              {intentBadge(result.intent)}
              <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'DM Mono, monospace', marginTop: 8 }}>
                confidence: {((result.intentConfidence || 0) * 100).toFixed(0)}%
              </div>
              <div style={{ height: 4, background: 'var(--border)', borderRadius: 4, marginTop: 6, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${((result.intentConfidence || 0) * 100).toFixed(0)}%`,
                  background: 'var(--accent)', borderRadius: 4,
                }} />
              </div>
            </div>

            {/* Entities */}
            <div>
              <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', marginBottom: 10 }}>Entities Extracted</div>
              {result.entities && Object.entries(result.entities).map(([k, v]) => (
                <span key={k} style={{
                  display: 'inline-block', margin: 2, fontSize: 10, padding: '2px 8px', borderRadius: 6,
                  background: 'rgba(124,106,247,0.1)', color: 'var(--accent2)',
                  border: '1px solid rgba(124,106,247,0.2)', fontFamily: 'DM Mono, monospace',
                }}>{k}: {v}</span>
              ))}
              {(!result.entities || Object.keys(result.entities).length === 0) && (
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>None detected</span>
              )}
            </div>

            {/* Resolution */}
            <div>
              <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', marginBottom: 10 }}>KG Resolution</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'DM Mono, monospace', marginBottom: 6 }}>
                Policy: <span style={{ color: result.policyDecision === 'ROUTE_TO_CHANNELS' ? 'var(--accent3)' : 'var(--accent4)' }}>{result.policyDecision}</span>
              </div>
              {(result.resolvedChannels || []).length > 0
                ? (result.resolvedChannels || []).map(cid => (
                  <div key={cid} style={{ fontSize: 11, color: 'var(--accent3)', fontFamily: 'DM Mono, monospace', marginBottom: 3 }}>→ {cid}</div>
                ))
                : <div style={{ fontSize: 12, color: 'var(--accent4)' }}>
                  {result.intent === 'query' ? 'Escalated to admin' : 'No channels matched'}
                </div>
              }
              {result.erpSyncRequired && (
                <div style={{ marginTop: 10 }}>
                  <Badge variant="green">ERP Sync Required</Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Code panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
        {[
          { title: 'entity_resolution_algorithm.py', code: `def resolve_audience(text):
    # Step 1: NER extraction
    year = extract_year(text)    # regex pattern
    dept = extract_dept(text)    # keyword lookup

    # Step 2: Knowledge Graph query
    if year and dept:
        channels = kg.query(
            dept=dept, year=year
        )
    elif dept:
        channels = kg.query(dept=dept)
    else:
        channels = []  # escalate

    # Step 3: Return channel IDs
    return [c.channelId for c in channels]` },
          { title: 'policy_engine.py', code: `def apply_policy(intent, channels, entities):
    if intent == "announcement":
        if channels:
            route_to_channels(channels)
            if entities.get("event_type"):
                post_to_erp("/api/events")
            return "ROUTED"
        else:
            escalate_to_admin()
            return "ESCALATED"

    elif intent == "query":
        # Try FAQ lookup first
        answer = faq.lookup(entities)
        if answer:
            return respond(answer)
        return escalate()   # ESCALATED

    elif intent == "task":
        distribute_task(channels)
        return "ROUTED"` },
        ].map(p => (
          <div key={p.title} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ background: '#0d0d14', padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>
              {p.title}
            </div>
            <pre style={{ padding: '16px 20px', fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--text2)', lineHeight: 1.7, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
              {p.code}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
