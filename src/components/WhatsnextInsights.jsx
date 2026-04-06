import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const MONO = "'JetBrains Mono', 'Fira Code', monospace";
const SANS = "'Plus Jakarta Sans', DM Sans, sans-serif";

// ── Priority config ───────────────────────────────────────────────────────────
const PRIORITIES = [
  {
    id: 1, num: '01', category: 'WORKFLOW', color: '#2EA84A',
    title: 'Run workflow redesign pilots',
    callout: 'Identify three high-frequency MarCom workflows and run a 60-day redesign pilot with a small cross-functional team — measuring cycle time and revision rounds before and after.',
    getAnchor: (t) => {
      const pct = ['Integration','Transformation']
        .reduce((s, st) => s + (t.stageTrend?.find(e => e.stage === st)?.s3?.pct ?? 0), 0);
      return { val: `${Math.round(pct)}%`, label: 'at integration or transformation — ready for deeper redesign' };
    },
  },
  {
    id: 2, num: '02', category: 'TOOLS', color: '#59BEC9',
    title: 'Rationalize the tool stack',
    getAnchor: (t) => {
      const ownPocket = Math.round(t.ownPocketS3?.yesPct ?? 32);
      const tooMany   = Math.round(t.barriersTrend?.find(b => b.barrier?.toLowerCase().includes('too many'))?.s3?.pct ?? 16);
      return { val: `${ownPocket}%`, label: `pay out of pocket for AI tools — ${tooMany}% cite too many tools as a barrier` };
    },
  },
  {
    id: 3, num: '03', category: 'ACCESS', color: '#E5554F',
    title: 'Fix access and integration',
    getAnchor: () => ({ val: '77%', label: 'use tools beyond the official stack — workarounds signal unmet integration needs' }),
  },
  {
    id: 4, num: '04', category: 'ENABLEMENT', color: '#FFCD00',
    title: 'Build role-based enablement',
    getAnchor: (t) => {
      const pct = (t.confidenceTrend?.[2]?.distribution ?? []).filter(d => d.score >= 4).reduce((s,d) => s+d.pct, 0);
      return { val: `${Math.round(pct) || 67}%`, label: 'very or extremely confident — uneven across roles and functions' };
    },
  },
  {
    id: 5, num: '05', category: 'NARRATIVE', color: '#7DE69B',
    title: 'Reset the performance narrative',
    getAnchor: (t) => {
      const pct = (t.importanceTrend?.[2]?.distribution ?? []).filter(d => d.score >= 4).reduce((s,d) => s+d.pct, 0);
      return { val: `${Math.round(pct) || 87}%`, label: 'rate AI highly important — making performative use a real risk' };
    },
  },
  {
    id: 6, num: '06', category: 'R&D', color: '#59BEC9',
    title: 'Create a small R&D lane',
    getAnchor: (t) => {
      const pct = t.stageTrend?.find(e => e.stage === 'Transformation')?.s3?.pct ?? 25;
      return { val: `${Math.round(pct)}%`, label: 'already at transformation stage — builders are ready for a dedicated lane' };
    },
  },
];

// ── Open text card config ─────────────────────────────────────────────────────
const OPEN_TEXT_CARDS = [
  {
    id: 'aspiration-gap', color: '#FFCD00', category: 'ASPIRATION GAP',
    title: 'Hoping vs. doing',
    getStat: (t) => {
      const ag = t.openTextInsights?.aspirationGap ?? {};
      return { val: `${ag.pct ?? 0}%`, label: `of respondents (n=${ag.count ?? 0}) write inspired excitement text but use AI less than weekly` };
    },
    getQuote: (t) => t.openTextInsights?.aspirationGap?.quotes?.[0]?.text ?? null,
  },
  {
    id: 'tool-mindset', color: '#59BEC9', category: 'TOOL → MINDSET',
    title: 'How tool choice shapes AI thinking',
    getStat: (t) => {
      const tm = t.openTextInsights?.toolMindset ?? {};
      return { val: `${tm.claude?.count ?? 0} vs ${tm.chatgpt?.count ?? 0}`, label: 'Claude users vs. ChatGPT users — different language, different mental model of AI value' };
    },
    getQuote: (t) => t.openTextInsights?.toolMindset?.claude?.sampleQuote ?? null,
  },
  {
    id: 'leadership-voices', color: '#7DE69B', category: 'LEADERSHIP VOICES',
    title: 'Informal adoption leaders already exist',
    getStat: (t) => {
      const lv = t.openTextInsights?.leadershipVoices ?? {};
      return { val: `${lv.pct ?? 0}%`, label: `of staff (n=${lv.count ?? 0}) use leadership language around AI adoption in open text` };
    },
    getQuote: (t) => t.openTextInsights?.leadershipVoices?.quotes?.[0] ?? null,
  },
  {
    id: 'blocked-investors', color: '#E5554F', category: 'BLOCKED INVESTORS',
    title: 'Paying out of pocket, hitting org friction',
    getStat: (t) => {
      const bi = t.openTextInsights?.blockedInvestors ?? {};
      return { val: `${bi.pct ?? 0}%`, label: `of staff (n=${bi.count ?? 0}) pay for AI tools AND face organizational access barriers` };
    },
    getQuote: (t) => t.openTextInsights?.blockedInvestors?.quotes?.[0] ?? null,
  },
];

// ── Wave 4 scorecard rows ─────────────────────────────────────────────────────
const SCORECARD_ROWS = [
  {
    metric: 'Integration + Transformation',
    targetLabel: 'Move above 80%',
    direction: 'above', threshold: 80,
    getVal: (t) => {
      const pct = ['Integration','Transformation'].reduce((s, st) => s + (t.stageTrend?.find(e => e.stage === st)?.s3?.pct ?? 0), 0);
      return Math.round(pct);
    },
    unit: '%',
  },
  {
    metric: 'Very / extremely confident',
    targetLabel: 'Move above 75%',
    direction: 'above', threshold: 75,
    getVal: (t) => Math.round((t.confidenceTrend?.[2]?.distribution ?? []).filter(d => d.score >= 4).reduce((s,d) => s+d.pct, 0)),
    unit: '%',
  },
  {
    metric: 'Time / priorities as a barrier',
    targetLabel: 'Pull below 25%',
    direction: 'below', threshold: 25,
    getVal: (t) => Math.round(t.barriersTrend?.find(b => b.barrier?.toLowerCase().includes('time'))?.s3?.pct ?? 34),
    unit: '%',
  },
  {
    metric: 'Too many tools as a barrier',
    targetLabel: 'Pull below 10%',
    direction: 'below', threshold: 10,
    getVal: (t) => Math.round(t.barriersTrend?.find(b => b.barrier?.toLowerCase().includes('too many'))?.s3?.pct ?? 16),
    unit: '%',
  },
  {
    metric: 'Strategic thought partner benefit',
    targetLabel: 'Move above 50%',
    direction: 'above', threshold: 50,
    getVal: (t) => Math.round((t.benefitsS3 ?? []).find(b => (b.label ?? b.benefit)?.toLowerCase().includes('strategic'))?.pct ?? 42),
    unit: '%',
  },
  {
    metric: 'Out-of-pocket tool spend',
    targetLabel: 'Reduce via sanctioned support',
    direction: 'below', threshold: 20,
    getVal: (t) => Math.round(t.ownPocketS3?.yesPct ?? 32),
    unit: '%',
  },
];

// ── Shared shimmer ────────────────────────────────────────────────────────────
function Shimmer({ lines = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: lines }, (_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.15 }}
          style={{
            height: 13,
            width: `${[100, 92, 74][i] ?? 80}%`,
            borderRadius: 4,
            background: 'var(--skeleton-line-2, rgba(125,230,155,0.1))',
          }}
        />
      ))}
    </div>
  );
}

// ── Priority card ─────────────────────────────────────────────────────────────
function PriorityCard({ p, anchor, aiData, loading, index }) {
  const c = p.color;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22,1,0.36,1] }}
      style={{
        background: 'var(--card-bg, rgba(35,40,41,0.9))',
        border: `1px solid ${c}30`,
        borderTop: `3px solid ${c}`,
        borderRadius: 14,
        padding: '20px 22px',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ background: `${c}15`, border: `1px solid ${c}30`, borderRadius: 20, padding: '3px 10px', fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: c }}>
          {p.category}
        </span>
        <span style={{ fontFamily: MONO, fontSize: 11, color: c, opacity: 0.45, fontWeight: 700, letterSpacing: '0.08em' }}>{p.num}</span>
      </div>

      <div style={{ fontFamily: SANS, fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.25 }}>
        {p.title}
      </div>

      <div style={{ background: `${c}12`, borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: SANS, fontSize: 'clamp(26px, 2.8vw, 34px)', fontWeight: 900, color: c, lineHeight: 1, letterSpacing: '-0.03em', flexShrink: 0 }}>
          {anchor.val}
        </span>
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--text-support)', lineHeight: 1.4 }}>
          {anchor.label}
        </span>
      </div>

      <div style={{ flex: 1 }}>
        {loading ? <Shimmer /> : (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
            style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text-bridge)', lineHeight: 1.65, margin: 0 }}>
            {aiData?.body ?? ''}
          </motion.p>
        )}
      </div>

      {/* Highlighted callout — shown when card has a specific prescribed action */}
      {p.callout && (
        <div style={{
          background: `${c}12`,
          border: `1px solid ${c}35`,
          borderLeft: `3px solid ${c}`,
          borderRadius: 8,
          padding: '10px 12px',
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
        }}>
          <span style={{ color: c, fontSize: 14, flexShrink: 0, lineHeight: 1.4 }}>★</span>
          <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text-medium)', lineHeight: 1.55 }}>
            {p.callout}
          </p>
        </div>
      )}

      {!loading && aiData?.action && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }}
          style={{ borderTop: `1px solid ${c}25`, paddingTop: 12, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <span style={{ color: c, fontSize: 13, fontWeight: 700, flexShrink: 0, paddingTop: 1 }}>→</span>
          <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--text-support)', lineHeight: 1.55 }}>{aiData.action}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Open text card ────────────────────────────────────────────────────────────
function OpenTextCard({ card, stat, quote, aiData, loading, index }) {
  const c = card.color;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22,1,0.36,1] }}
      style={{
        background: 'var(--card-bg, rgba(35,40,41,0.9))',
        border: `1px solid ${c}25`,
        borderLeft: `3px solid ${c}`,
        borderRadius: 14,
        padding: '20px 22px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ background: `${c}15`, border: `1px solid ${c}30`, borderRadius: 20, padding: '3px 10px', fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: c }}>
          {card.category}
        </span>
      </div>

      <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.25 }}>
        {card.title}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: SANS, fontSize: 'clamp(22px, 2.4vw, 30px)', fontWeight: 900, color: c, lineHeight: 1, letterSpacing: '-0.02em', flexShrink: 0 }}>
          {stat.val}
        </span>
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--text-support)', lineHeight: 1.4 }}>
          {stat.label}
        </span>
      </div>

      {quote && (
        <div style={{ background: `${c}08`, border: `1px solid ${c}18`, borderRadius: 8, padding: '10px 12px' }}>
          <span style={{ color: c, fontSize: '1.2em', lineHeight: 0, verticalAlign: '-0.15em', marginRight: 4, fontFamily: 'Georgia, serif' }}>&ldquo;</span>
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--text-bridge)', fontStyle: 'italic', lineHeight: 1.55 }}>
            {typeof quote === 'string' ? quote : quote.text ?? ''}
          </span>
        </div>
      )}

      <div style={{ flex: 1, marginTop: 2 }}>
        {loading ? <Shimmer lines={2} /> : (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
            style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--text-bridge)', lineHeight: 1.6, margin: 0 }}>
            {aiData?.body ?? ''}
          </motion.p>
        )}
      </div>

      {!loading && aiData?.action && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
          style={{ borderTop: `1px solid ${c}20`, paddingTop: 10, display: 'flex', gap: 7, alignItems: 'flex-start' }}>
          <span style={{ color: c, fontSize: 12, fontWeight: 700, flexShrink: 0, paddingTop: 1 }}>→</span>
          <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--text-support)', lineHeight: 1.5 }}>{aiData.action}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Wave 4 Scorecard ──────────────────────────────────────────────────────────
function Wave4Scorecard({ transforms }) {
  const rows = SCORECARD_ROWS.map(r => {
    const val = r.getVal(transforms ?? {});
    const onTrack = r.direction === 'above' ? val >= r.threshold : val <= r.threshold;
    return { ...r, val, onTrack };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55 }}
      style={{ marginTop: 64 }}
    >
      {/* Section header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(46,168,74,0.08)', border: '1px solid rgba(46,168,74,0.2)', borderRadius: 20, padding: '4px 14px', marginBottom: 14 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2EA84A' }} />
          <span style={{ fontFamily: MONO, fontSize: 10, color: '#2EA84A', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>Wave 4</span>
        </div>
        <h2 style={{ fontFamily: SANS, fontSize: 'clamp(22px, 2.6vw, 32px)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.1, margin: '0 0 8px' }}>
          What success should look like <span style={{ color: '#2EA84A' }}>by the next survey</span>
        </h2>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: 'var(--text-support)', margin: 0 }}>
          Live Wave 3 numbers vs. Wave 4 targets — green means on track, coral means needs work.
        </p>
      </div>

      {/* Scorecard tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {rows.map((row, i) => (
          <motion.div
            key={row.metric}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            style={{
              background: 'var(--card-bg, rgba(35,40,41,0.9))',
              border: `1px solid ${row.onTrack ? 'rgba(46,168,74,0.2)' : 'rgba(229,85,79,0.18)'}`,
              borderRadius: 12,
              padding: '18px 20px',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--text-medium)', fontWeight: 600, lineHeight: 1.3 }}>{row.metric}</span>
              <span style={{
                fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                color: row.onTrack ? '#2EA84A' : '#E5554F',
                background: row.onTrack ? 'rgba(46,168,74,0.1)' : 'rgba(229,85,79,0.1)',
                border: `1px solid ${row.onTrack ? 'rgba(46,168,74,0.25)' : 'rgba(229,85,79,0.25)'}`,
                borderRadius: 20, padding: '2px 8px',
              }}>
                {row.onTrack ? 'ON TRACK' : 'NEEDS WORK'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: SANS, fontSize: 'clamp(28px, 3vw, 38px)', fontWeight: 900, color: row.onTrack ? '#2EA84A' : '#E5554F', lineHeight: 1, letterSpacing: '-0.03em' }}>
                {row.val}{row.unit}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontFamily: MONO, fontSize: 10, color: 'var(--text-support)', letterSpacing: '0.04em' }}>Wave 3</span>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--text-support)', opacity: 0.7 }}>
                  → {row.targetLabel}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function WhatsnextInsights({ transforms, vaultUnlocked }) {
  const [aiResults, setAiResults] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);
  const fetchedRef                = useRef(false);

  const anchors    = PRIORITIES.map(p => p.getAnchor(transforms ?? {}));
  const otStats    = OPEN_TEXT_CARDS.map(c => c.getStat(transforms ?? {}));
  const otQuotes   = OPEN_TEXT_CARDS.map(c => c.getQuote(transforms ?? {}));

  useEffect(() => {
    if (fetchedRef.current || !transforms) return;
    fetchedRef.current = true;

    async function fetchInsights() {
      try {
        const t = transforms;
        const intTransPct = Math.round(['Integration','Transformation'].reduce((s, st) => s + (t.stageTrend?.find(e => e.stage === st)?.s3?.pct ?? 0), 0));
        const s3ConfPct   = Math.round((t.confidenceTrend?.[2]?.distribution ?? []).filter(d => d.score >= 4).reduce((s,d) => s+d.pct, 0));
        const impPct      = Math.round((t.importanceTrend?.[2]?.distribution ?? []).filter(d => d.score >= 4).reduce((s,d) => s+d.pct, 0) || 87);
        const ownPocket   = Math.round(t.ownPocketS3?.yesPct ?? 32);
        const tooManyPct  = Math.round(t.barriersTrend?.find(b => b.barrier?.toLowerCase().includes('too many'))?.s3?.pct ?? 16);
        const timePct     = Math.round(t.barriersTrend?.find(b => b.barrier?.toLowerCase().includes('time'))?.s3?.pct ?? 34);
        const transPct    = Math.round(t.stageTrend?.find(e => e.stage === 'Transformation')?.s3?.pct ?? 25);
        const topBenefits = (t.benefitsS3 ?? []).slice(0, 3).map(b => `${b.label ?? b.benefit} (${Math.round(b.pct)}%)`).join(', ');
        const ag          = t.openTextInsights?.aspirationGap ?? {};
        const lv          = t.openTextInsights?.leadershipVoices ?? {};
        const bi          = t.openTextInsights?.blockedInvestors ?? {};
        const tm          = t.openTextInsights?.toolMindset ?? {};

        const prompt = `You are analyzing Baptist Health MarCom Wave 3 AI adoption survey data (n=101, Mar 2026).

KEY STATS:
- ${intTransPct}% Integration/Transformation, 90% daily use, 69% positive sentiment
- ${s3ConfPct}% very/extremely confident, ${impPct}% rate AI highly important
- 77% use unofficial tools, ${ownPocket}% pay out of pocket, ${tooManyPct}% cite too many tools, ${timePct}% cite time as barrier
- ${transPct}% at Transformation stage, top benefits: ${topBenefits}
- Aspiration gap: ${ag.pct ?? 0}% (n=${ag.count ?? 0}) write inspired text but use AI < weekly
- Leadership voices: ${lv.pct ?? 0}% (n=${lv.count ?? 0}) show informal adoption leadership in open text
- Blocked investors: ${bi.pct ?? 0}% (n=${bi.count ?? 0}) pay for AI AND face org friction
- Tool mindset: ${tm.claude?.count ?? 0} Claude users vs ${tm.chatgpt?.count ?? 0} ChatGPT users

Return ONLY valid JSON. No markdown, no explanation:
{
  "priorities": [
    { "id": 1, "body": "2-3 sentences grounded in data", "action": "1 concrete next step, action verb first" },
    { "id": 2, "body": "...", "action": "..." },
    { "id": 3, "body": "...", "action": "..." },
    { "id": 4, "body": "...", "action": "..." },
    { "id": 5, "body": "...", "action": "..." },
    { "id": 6, "body": "...", "action": "..." }
  ],
  "openText": [
    { "id": "aspiration-gap", "body": "2 sentences on what this gap means for leadership", "action": "1 concrete action" },
    { "id": "tool-mindset", "body": "...", "action": "..." },
    { "id": "leadership-voices", "body": "...", "action": "..." },
    { "id": "blocked-investors", "body": "...", "action": "..." }
  ]
}

Priorities: 1=workflow redesign, 2=tool stack, 3=access/integration, 4=role-based enablement, 5=performance narrative, 6=R&D lane.
Open text: aspiration-gap=hoping vs doing, tool-mindset=Claude vs ChatGPT language, leadership-voices=informal champions, blocked-investors=paying+blocked.
Tone: direct, evidence-grounded, no hype. Audience: marketing leadership team.`;

        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 2200,
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        let raw = data.content?.[0]?.text ?? '';
        raw = raw.replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/```\s*$/i,'').trim();
        const parsed = JSON.parse(raw);

        const priorityMap = {};
        (parsed.priorities ?? []).forEach(p => { priorityMap[p.id] = p; });
        const otMap = {};
        (parsed.openText ?? []).forEach(o => { otMap[o.id] = o; });

        setAiResults({ priorities: priorityMap, openText: otMap });
      } catch (err) {
        console.error('WhatsnextInsights error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
  }, [transforms]);

  return (
    <div style={{ padding: '56px 40px 0', maxWidth: 1400, margin: '0 auto' }}>

      {/* ── Section 1: 6 Leadership Priorities ─────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ marginBottom: 36 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(46,168,74,0.08)', border: '1px solid rgba(46,168,74,0.2)', borderRadius: 20, padding: '4px 14px', marginBottom: 16 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2EA84A' }} />
          <span style={{ fontFamily: MONO, fontSize: 10, color: '#2EA84A', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>Wave 3 findings</span>
        </div>
        <h2 style={{ fontFamily: SANS, fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.1, margin: '0 0 10px' }}>
          6 priorities for{' '}<span style={{ color: '#2EA84A' }}>what leaders should do next</span>
        </h2>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, color: 'var(--text-support)', margin: 0, maxWidth: 640 }}>
          These come directly from what staff said in the survey. Each card shows the data behind the priority and a concrete next step.
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 64 }}>
        {PRIORITIES.map((p, i) => (
          <PriorityCard key={p.id} p={p} anchor={anchors[i]} aiData={aiResults?.priorities?.[p.id] ?? null} loading={loading} index={i} />
        ))}
      </div>

      {/* ── Section 2: Open Text Evidence ──────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(89,190,201,0.08)', border: '1px solid rgba(89,190,201,0.2)', borderRadius: 20, padding: '4px 14px', marginBottom: 16 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#59BEC9' }} />
          <span style={{ fontFamily: MONO, fontSize: 10, color: '#59BEC9', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>Open text intelligence</span>
        </div>
        <h2 style={{ fontFamily: SANS, fontSize: 'clamp(22px, 2.6vw, 32px)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.1, margin: '0 0 8px' }}>
          What they're actually saying
        </h2>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: 'var(--text-support)', margin: 0, maxWidth: 560 }}>
          Four patterns from the open-text responses — with real quotes from the survey.
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 0 }}>
        {OPEN_TEXT_CARDS.map((card, i) => (
          <OpenTextCard key={card.id} card={card} stat={otStats[i]} quote={otQuotes[i]} aiData={aiResults?.openText?.[card.id] ?? null} loading={loading} index={i} />
        ))}
      </div>

      {/* ── Section 3: Wave 4 Scorecard ────────────────────────────────────── */}
      <Wave4Scorecard transforms={transforms} />

      {error && (
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--text-support)', textAlign: 'center', marginTop: 20, opacity: 0.6 }}>
          Could not load AI interpretation — anchor data above is live from the survey.
        </p>
      )}

    </div>
  );
}
