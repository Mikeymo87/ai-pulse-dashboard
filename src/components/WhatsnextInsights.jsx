import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const MONO = "'JetBrains Mono', 'Fira Code', monospace";
const SANS = "'Plus Jakarta Sans', DM Sans, sans-serif";

// ── Priority config (per plan spec colors) ────────────────────────────────────
const PRIORITIES = [
  {
    id: 'workflow-pilots', num: '01', category: 'WORKFLOW', color: '#2EA84A',
    title: 'Run workflow redesign pilots',
    fallback: 'Three quarters of the team are already integrating or transforming how they work with AI. The next move is making that change visible and repeatable at the team level, not just the individual level.',
    action: 'Pick one recurring workflow per team — a brief, a report, a campaign kickoff — and redesign it end-to-end with AI in the loop. Measure before and after.',
    getAnchor: (t) => {
      const pct = ['Integration','Transformation'].reduce((s, st) => s + (t.stageTrend?.find(e => e.stage === st)?.s3?.pct ?? 0), 0);
      return { val: `${Math.round(pct)}%`, label: 'at integration or transformation — ready for team-level redesign' };
    },
  },
  {
    id: 'tool-stack', num: '02', category: 'TOOLS', color: '#FFCD00',
    title: 'Rationalize the tool stack',
    fallback: 'Staff aren\'t waiting for permission — they\'re paying out of pocket and building their own stack. That\'s not a discipline problem, it\'s a signal that demand has outrun what\'s been officially sanctioned. The Council needs a clear picture of what\'s actually winning in the wild before making any decisions.',
    action: 'Ask your top five AI users what tools they\'re actually using and why, then take that list to IT — get clarity on what\'s winning before deciding what to standardize. This is a Council-level decision.',
    getAnchor: (t) => {
      const ownPocket = Math.round(t.ownPocketS3?.yesPct ?? 32);
      const tooMany   = Math.round(t.barriersTrend?.find(b => b.barrier?.toLowerCase().includes('too many'))?.s3?.pct ?? 16);
      return { val: `${ownPocket}%`, label: `pay out of pocket · ${tooMany}% cite too many tools as a barrier` };
    },
  },
  {
    id: 'access-integration', num: '03', category: 'ACCESS', color: '#E5554F',
    title: 'Fix access and integration',
    fallback: 'People aren\'t frustrated with AI — they\'re frustrated with the walls around it. When someone can\'t connect AI to the files and systems they use every day, the friction lands as a personal blocker, not a technical one.',
    action: 'Map the three most-requested integrations — shared files, project management, email — and take a specific request to IT. One unlocked connection is more motivating than a broad access policy.',
    getAnchor: (t) => {
      const access = Math.round(t.barriersTrend?.find(b => b.barrier?.toLowerCase().includes('access') || b.barrier?.toLowerCase().includes('limited'))?.s3?.pct ?? 11);
      return { val: `${access}%`, label: 'cite limited access as a barrier — open text shows this is far more widespread' };
    },
  },
  {
    id: 'role-enablement', num: '04', category: 'ENABLEMENT', color: '#59BEC9',
    title: 'Build role-based enablement',
    fallback: 'Nearly everyone feels confident — but that confidence has a ceiling. Generic training got us here; the gap that remains is about people not seeing how AI applies to their specific job, their specific workflows, their specific output.',
    action: 'Run one function-specific lab per team — bring 3 real deliverables from that team\'s actual work and rebuild them with AI in the room. That\'s more useful than another hour of general AI literacy.',
    getAnchor: (t) => {
      const highConf = Math.round((t.confidenceTrend?.[2]?.distribution ?? []).filter(d => d.score >= 4).reduce((s,d) => s+d.pct, 0));
      const anyConf  = Math.round((t.confidenceTrend?.[2]?.distribution ?? []).filter(d => d.score >= 3).reduce((s,d) => s+d.pct, 0));
      const gap = anyConf - highConf;
      return { val: `${gap > 0 ? gap : 26}%`, label: 'feel confident but NOT very/extremely confident — the practical enablement gap' };
    },
  },
  {
    id: 'performance-narrative', num: '05', category: 'NARRATIVE', color: '#7DE69B',
    title: 'Reset the performance narrative',
    fallback: 'When 87% of people rate AI as important to their work, there\'s real risk that "using AI" becomes a performance rather than a practice. The goal isn\'t more AI activity — it\'s better work. That distinction needs to come from the top.',
    action: 'At the next all-hands or team meeting, say it plainly: we don\'t measure AI by how often people use it. We measure it by whether the work got better. One sentence from a leader does more than a policy doc.',
    getAnchor: (t) => {
      const imp     = Math.round((t.importanceTrend?.[2]?.distribution ?? []).filter(d => d.score >= 4).reduce((s,d) => s+d.pct, 0) || 87);
      const partner = Math.round((t.benefitsS3 ?? []).find(b => (b.label ?? b.benefit)?.toLowerCase().includes('strategic'))?.pct ?? 42);
      return { val: `${imp}%`, label: `rate AI highly important · ${partner}% already use it as a strategic thought partner` };
    },
  },
  {
    id: 'rd-lane', num: '06', category: 'INNOVATION', color: '#2EA84A',
    title: 'Create a small R&D lane',
    fallback: 'You already have builders — people at transformation stage who are experimenting on their own time with their own tools. They don\'t need a pilot program. They need a budget, permission, and someone to share what they find with the rest of the team.',
    action: 'Identify your three most active AI experimenters and give each of them $500 a month to spend on tools, courses, or time to build something with no deadline and no defined outcome — just "show us what you learned." That\'s how you turn hobbyists into your innovation engine.',
    getAnchor: (t) => {
      const pct = Math.round(t.stageTrend?.find(e => e.stage === 'Transformation')?.s3?.pct ?? 25);
      return { val: `${pct}%`, label: 'already at transformation stage — internal builders ready for a dedicated lane' };
    },
  },
];

// ── Open text config ──────────────────────────────────────────────────────────
const OPEN_TEXT_CARDS = [
  {
    id: 'aspiration-gap', color: '#FFCD00', category: 'ASPIRATION GAP',
    title: 'Hoping vs. doing',
    getStat: (t) => { const ag = t.openTextInsights?.aspirationGap ?? {}; return { val: `${ag.pct ?? 0}%`, label: `of respondents (n=${ag.count ?? 0}) write inspired excitement but use AI less than weekly` }; },
    getQuote: (t) => t.openTextInsights?.aspirationGap?.quotes?.[0]?.text ?? null,
  },
  {
    id: 'tool-mindset', color: '#59BEC9', category: 'TOOL → MINDSET',
    title: 'How tool choice shapes AI thinking',
    getStat: (t) => { const tm = t.openTextInsights?.toolMindset ?? {}; return { val: `${tm.claude?.count ?? 0} vs ${tm.chatgpt?.count ?? 0}`, label: 'Claude users vs. ChatGPT users — different language, different mental model' }; },
    getQuote: (t) => t.openTextInsights?.toolMindset?.claude?.sampleQuote ?? null,
  },
  {
    id: 'leadership-voices', color: '#7DE69B', category: 'LEADERSHIP VOICES',
    title: 'Informal adoption leaders already exist',
    getStat: (t) => { const lv = t.openTextInsights?.leadershipVoices ?? {}; return { val: `${lv.pct ?? 0}%`, label: `of staff (n=${lv.count ?? 0}) use leadership language around AI adoption in open text` }; },
    getQuote: (t) => t.openTextInsights?.leadershipVoices?.quotes?.[0] ?? null,
  },
  {
    id: 'blocked-investors', color: '#E5554F', category: 'BLOCKED INVESTORS',
    title: 'Paying out of pocket, hitting org friction',
    getStat: (t) => { const bi = t.openTextInsights?.blockedInvestors ?? {}; return { val: `${bi.pct ?? 0}%`, label: `of staff (n=${bi.count ?? 0}) pay for AI tools AND face organizational access barriers` }; },
    getQuote: (t) => t.openTextInsights?.blockedInvestors?.quotes?.[0] ?? null,
  },
];

// ── Scorecard rows ────────────────────────────────────────────────────────────
const SCORECARD_ROWS = [
  { metric: 'Integration + Transformation', targetDisplay: '>80%', targetLabel: 'Move above 80%', direction: 'above', threshold: 80, unit: '%',
    getVal: (t) => Math.round(['Integration','Transformation'].reduce((s, st) => s + (t.stageTrend?.find(e => e.stage === st)?.s3?.pct ?? 0), 0)) },
  { metric: 'Very / extremely confident',   targetDisplay: '>75%', targetLabel: 'Move above 75%', direction: 'above', threshold: 75, unit: '%',
    getVal: (t) => Math.round((t.confidenceTrend?.[2]?.distribution ?? []).filter(d => d.score >= 4).reduce((s,d) => s+d.pct, 0)) },
  { metric: 'Time as a barrier',            targetDisplay: '<25%', targetLabel: 'Pull below 25%',  direction: 'below', threshold: 25, unit: '%',
    getVal: (t) => Math.round(t.barriersTrend?.find(b => b.barrier?.toLowerCase().includes('time'))?.s3?.pct ?? 34) },
  { metric: 'Too many tools as a barrier',  targetDisplay: '<10%', targetLabel: 'Pull below 10%',  direction: 'below', threshold: 10, unit: '%',
    getVal: (t) => Math.round(t.barriersTrend?.find(b => b.barrier?.toLowerCase().includes('too many'))?.s3?.pct ?? 16) },
  { metric: 'Strategic thought partner',    targetDisplay: '>50%', targetLabel: 'Move above 50%',  direction: 'above', threshold: 50, unit: '%',
    getVal: (t) => Math.round((t.benefitsS3 ?? []).find(b => (b.label ?? b.benefit)?.toLowerCase().includes('strategic'))?.pct ?? 42) },
  { metric: 'Out-of-pocket tool spend',     targetDisplay: '↓',    targetLabel: 'Reduce via sanctioned support', direction: 'below', threshold: 20, unit: '%',
    getVal: (t) => Math.round(t.ownPocketS3?.yesPct ?? 32) },
];

// ── Shimmer skeleton ──────────────────────────────────────────────────────────
function TextShimmer({ lines = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {Array.from({ length: lines }, (_, i) => (
        <motion.div key={i}
          animate={{ opacity: [0.25, 0.5, 0.25] }}
          transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.18 }}
          style={{ height: 11, width: `${[100, 88, 64][i] ?? 76}%`, borderRadius: 3, background: 'var(--skeleton-line-2, rgba(125,230,155,0.08))' }}
        />
      ))}
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ pill, pillColor = '#2EA84A', title, accent, subtitle, style = {} }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}
      style={{ marginBottom: 32, ...style }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: `${pillColor}12`, border: `1px solid ${pillColor}30`, borderRadius: 20, padding: '4px 13px', marginBottom: 14 }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: pillColor }} />
        <span style={{ fontFamily: MONO, fontSize: 10, color: pillColor, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700 }}>{pill}</span>
      </div>
      <h2 style={{ fontFamily: SANS, fontSize: 'clamp(24px, 2.8vw, 36px)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.1, margin: '0 0 10px' }}>
        {title}{accent && <> <span style={{ color: pillColor }}>{accent}</span></>}
      </h2>
      {subtitle && <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: 'var(--text-support)', margin: 0, maxWidth: 600, lineHeight: 1.6 }}>{subtitle}</p>}
    </motion.div>
  );
}

// ── Priority card ─────────────────────────────────────────────────────────────
function PriorityCard({ p, anchor, aiData, loading, index }) {
  const c = p.color;
  const isNarrative = c === '#7DE69B'; // mint — use slightly darker for text
  const textColor = isNarrative ? '#4db86e' : c;

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: 'var(--card-bg, rgba(30,36,37,0.95))',
        border: `1px solid ${c}20`,
        borderRadius: 16,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Color accent bar */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${c}, ${c}88)` }} />

      <div style={{ padding: '22px 24px 20px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>

        {/* Badge row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            background: `${c}15`, border: `1px solid ${c}28`, borderRadius: 20,
            padding: '3px 11px', fontFamily: MONO, fontSize: 9, fontWeight: 700,
            letterSpacing: '0.14em', color: textColor,
          }}>
            {p.category}
          </span>
          <span style={{ fontFamily: MONO, fontSize: 22, color: c, opacity: 0.12, fontWeight: 900, letterSpacing: '-0.02em' }}>{p.num}</span>
        </div>

        {/* Title */}
        <div style={{ fontFamily: SANS, fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.015em', lineHeight: 1.2 }}>
          {p.title}
        </div>

        {/* Anchor stat — always visible */}
        <div style={{
          background: `${c}0e`, border: `1px solid ${c}22`, borderLeft: `3px solid ${c}`,
          borderRadius: 8, padding: '12px 14px',
          display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap',
        }}>
          <span style={{ fontFamily: SANS, fontSize: 'clamp(26px, 2.6vw, 32px)', fontWeight: 900, color: textColor, lineHeight: 1, letterSpacing: '-0.03em', flexShrink: 0 }}>
            {anchor.val}
          </span>
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--text-support)', lineHeight: 1.4 }}>
            {anchor.label}
          </span>
        </div>

        {/* AI body text — shimmer while loading, fallback if API fails */}
        <div style={{ flex: 1, minHeight: 52 }}>
          {loading
            ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: c, opacity: 0.7 }} />
                  <span style={{ fontFamily: MONO, fontSize: 9, color: textColor, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.7 }}>
                    AI analysis loading…
                  </span>
                </motion.div>
                <TextShimmer lines={3} />
              </div>
            )
            : (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
                style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--text-bridge)', lineHeight: 1.65, margin: 0 }}>
                {aiData?.body ?? p.fallback ?? ''}
              </motion.p>
            )
          }
        </div>

        {/* AI action line */}
        {!loading && (aiData?.action || p.action) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
            style={{ borderTop: `1px solid ${c}15`, paddingTop: 12, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ color: textColor, fontSize: 12, fontWeight: 700, flexShrink: 0, paddingTop: 1 }}>→</span>
            <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text-medium)', lineHeight: 1.5 }}>
              {aiData?.action || p.action}
            </p>
          </motion.div>
        )}
        {loading && (
          <div style={{ borderTop: `1px solid ${c}15`, paddingTop: 12 }}>
            <TextShimmer lines={1} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Open text card ────────────────────────────────────────────────────────────
function OpenTextCard({ card, stat, quote, aiData, loading, index }) {
  const c = card.color;
  const isNarrative = c === '#7DE69B';
  const textColor = isNarrative ? '#4db86e' : c;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: 'var(--card-bg, rgba(30,36,37,0.95))',
        border: `1px solid ${c}20`,
        borderLeft: `3px solid ${c}`,
        borderRadius: 14,
        padding: '22px 22px 20px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ background: `${c}15`, border: `1px solid ${c}28`, borderRadius: 20, padding: '3px 11px', fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: textColor }}>
          {card.category}
        </span>
      </div>

      <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.25 }}>
        {card.title}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: SANS, fontSize: 'clamp(20px, 2.2vw, 26px)', fontWeight: 900, color: textColor, lineHeight: 1, letterSpacing: '-0.02em', flexShrink: 0 }}>
          {stat.val}
        </span>
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--text-support)', lineHeight: 1.4 }}>
          {stat.label}
        </span>
      </div>

      {quote && (
        <div style={{ background: `${c}08`, border: `1px solid ${c}18`, borderRadius: 8, padding: '10px 13px' }}>
          <span style={{ color: textColor, fontSize: '1.1em', lineHeight: 0, verticalAlign: '-0.1em', marginRight: 5, fontFamily: 'Georgia, serif', opacity: 0.7 }}>&ldquo;</span>
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--text-bridge)', fontStyle: 'italic', lineHeight: 1.55 }}>
            {typeof quote === 'string' ? quote : quote.text ?? ''}
          </span>
        </div>
      )}

      <div style={{ flex: 1, minHeight: 42 }}>
        {loading
          ? <TextShimmer lines={2} />
          : (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
              style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--text-bridge)', lineHeight: 1.65, margin: 0 }}>
              {aiData?.body ?? ''}
            </motion.p>
          )
        }
      </div>

      {!loading && aiData?.action && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
          style={{ borderTop: `1px solid ${c}15`, paddingTop: 10, display: 'flex', gap: 7, alignItems: 'flex-start' }}>
          <span style={{ color: textColor, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>→</span>
          <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--text-support)', lineHeight: 1.5 }}>{aiData.action}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Wave 4 scorecard ──────────────────────────────────────────────────────────
function Wave4Scorecard({ transforms }) {
  const rows = SCORECARD_ROWS.map(r => {
    const val = r.getVal(transforms ?? {});
    const onTrack = r.direction === 'above' ? val >= r.threshold : val <= r.threshold;
    return { ...r, val, onTrack };
  });

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}
      style={{ marginTop: 72 }}>
      <SectionHeader
        pill="Wave 4" pillColor="#2EA84A"
        title="Measuring" accent="what matters"
        subtitle="Live Wave 3 numbers against the targets set in the readout. When Survey 4 data comes in, the Current column updates automatically."
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {rows.map((row, i) => (
          <motion.div key={row.metric}
            initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.06 }}
            style={{
              background: 'var(--card-bg, rgba(30,36,37,0.95))',
              border: `1px solid ${row.onTrack ? 'rgba(46,168,74,0.22)' : 'rgba(125,230,155,0.1)'}`,
              borderRadius: 12,
              padding: '18px 20px',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}
          >
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text-medium)', lineHeight: 1.35 }}>
              {row.metric}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Current */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontFamily: MONO, fontSize: 9, color: 'var(--text-support)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Now</span>
                <span style={{ fontFamily: SANS, fontSize: 'clamp(22px, 2.3vw, 28px)', fontWeight: 900, color: row.onTrack ? '#2EA84A' : 'var(--text-medium)', lineHeight: 1, letterSpacing: '-0.02em' }}>
                  {row.val}{row.unit}
                </span>
              </div>
              <span style={{ color: '#2EA84A', fontSize: 14, opacity: 0.35, flexShrink: 0 }}>→</span>
              {/* Goal */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontFamily: MONO, fontSize: 9, color: '#2EA84A', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.7 }}>Goal</span>
                <span style={{ fontFamily: SANS, fontSize: 'clamp(22px, 2.3vw, 28px)', fontWeight: 900, color: '#2EA84A', lineHeight: 1, letterSpacing: '-0.02em' }}>
                  {row.targetDisplay}
                </span>
              </div>
            </div>

            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: 'var(--text-support)', lineHeight: 1.4, opacity: 0.75 }}>
              {row.targetLabel}
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
  const fetchedRef                = useRef(false);

  const anchors = PRIORITIES.map(p => p.getAnchor(transforms ?? {}));

  useEffect(() => {
    if (fetchedRef.current) return;
    if (!transforms) return; // wait for data
    fetchedRef.current = true;

    async function fetchInsights() {
      try {
        const t = transforms;
        const intTransPct = Math.round(['Integration','Transformation'].reduce((s, st) => s + (t.stageTrend?.find(e => e.stage === st)?.s3?.pct ?? 0), 0));
        const s3ConfHigh  = Math.round((t.confidenceTrend?.[2]?.distribution ?? []).filter(d => d.score >= 4).reduce((s,d) => s+d.pct, 0));
        const s3ConfAny   = Math.round((t.confidenceTrend?.[2]?.distribution ?? []).filter(d => d.score >= 3).reduce((s,d) => s+d.pct, 0));
        const impPct      = Math.round((t.importanceTrend?.[2]?.distribution ?? []).filter(d => d.score >= 4).reduce((s,d) => s+d.pct, 0) || 87);
        const ownPocket   = Math.round(t.ownPocketS3?.yesPct ?? 32);
        const tooManyPct  = Math.round(t.barriersTrend?.find(b => b.barrier?.toLowerCase().includes('too many'))?.s3?.pct ?? 16);
        const timePct     = Math.round(t.barriersTrend?.find(b => b.barrier?.toLowerCase().includes('time'))?.s3?.pct ?? 34);
        const transPct    = Math.round(t.stageTrend?.find(e => e.stage === 'Transformation')?.s3?.pct ?? 25);
        const partner     = Math.round((t.benefitsS3 ?? []).find(b => (b.label ?? b.benefit)?.toLowerCase().includes('strategic'))?.pct ?? 42);
        const ag          = t.openTextInsights?.aspirationGap ?? {};
        const lv          = t.openTextInsights?.leadershipVoices ?? {};
        const bi          = t.openTextInsights?.blockedInvestors ?? {};
        const tm          = t.openTextInsights?.toolMindset ?? {};

        // Conditionally include vault data
        const vaultSection = vaultUnlocked && t.byRole
          ? `\nLEADERSHIP VAULT: ${JSON.stringify({ byRole: t.byRole, byFunction: t.byFunction })}`
          : '';

        // Top S3 supplemental tools for context
        const topTools = (t.toolsS3 ?? []).slice(0, 6).map(tool => `${tool.label} (${tool.count})`).join(', ');

        const prompt = `You are a strategic advisor to the Baptist Health MarCom leadership team. Wave 3 AI adoption survey, n=101.

STATS: ${intTransPct}% integration/transformation, 90% daily use, 69% positive sentiment, ${s3ConfHigh}% very/extremely confident (${s3ConfAny}% any confidence — ${s3ConfAny - s3ConfHigh}pt gap), ${impPct}% rate AI highly important, ${partner}% strategic thought partner, ${ownPocket}% pay out of pocket, ${tooManyPct}% too many tools barrier, ${timePct}% time barrier, ${transPct}% at transformation stage.
OPEN TEXT: aspiration-gap=${ag.pct ?? 0}% (n=${ag.count ?? 0}); leadership-voices=${lv.pct ?? 0}% (n=${lv.count ?? 0}); blocked-investors=${bi.pct ?? 0}% (n=${bi.count ?? 0}); tool-mindset (from open-text language analysis, not the tools question): ${tm.claude?.count ?? 0} respondents write in Claude-style language vs ${tm.chatgpt?.count ?? 0} in ChatGPT-style language.${vaultSection}

CRITICAL TOOL CONTEXT — READ CAREFULLY BEFORE WRITING ANYTHING ABOUT TOOLS:
The official Baptist Health MarCom endorsed tools are: OpenAI ChatGPT (Enterprise), Microsoft Copilot, Adobe Firefly, and Jasper. Everyone on the team has access to these. The Survey 3 tools question specifically asked: "Besides the AI tools the company officially endorses (ChatGPT, Copilot, Adobe Firefly, etc.), what other AI tools do you use?" — so ChatGPT, Copilot, and Firefly DO NOT appear in the tool data below because they were intentionally excluded from the question. The 77% "unofficial tools" figure means 77% use ADDITIONAL tools ON TOP OF the official stack, not instead of it.
TOP SUPPLEMENTAL TOOLS (beyond the official stack): ${topTools || 'Gemini (44), NotebookLM (43), Claude (27), Otter.ai (17), WISPR Flow (14), Perplexity (12)'}.
When writing about tools: never imply the team doesn't use ChatGPT — they all have it. The insight is that staff are self-assembling personal stacks on top of the official tools because the official answer on what else to use is unclear.

Return ONLY valid JSON (no markdown).

TONE: Write like a trusted colleague talking to a marketing director — plain, direct, human. No consultant-speak ("leverage synergies", "operationalize", "strategic imperative"). No bullet-point thinking disguised as sentences. Say what it actually means, not what sounds impressive.

Each "body": 2 sentences that explain why this matters RIGHT NOW for this specific team. Ground it in the numbers above. Sound like a person, not a report.

Each "action": 1 realistic, specific next step — something a marketing leader could actually do this month, not a program or initiative. No "conduct an audit" or "develop a framework."

SPECIAL INSTRUCTIONS:
- rd-lane: Our team has builders already at transformation stage experimenting on their own. The action is giving them a monthly R&D budget (not quarterly — monthly) and permission to experiment with no defined outcome except "show us what you learned." No structured pilot, no deliverables, no timeline — just budget and air cover.
- tool-stack: The team already has ChatGPT, Copilot, and Firefly as official tools. The question is what to do about the unofficial supplemental stack that 77% are building on their own (Gemini, NotebookLM, Claude, Otter.ai, etc.). This recommendation goes to the AI Council. The action is NOT "conduct an audit" — it's to ask the top 5 highest-confidence AI users what supplemental tools they're actually using daily and why, take that list to IT, and get clarity before deciding what to fund or standardize. Get the intelligence first, then decide.
- access-integration: People aren't frustrated with AI — they're frustrated with the walls around it. The access problem is emotional, not just technical. Acknowledge that.
- performance-narrative: The risk isn't that people aren't using AI. It's that "sport mode" is emerging — people feel pressure to perform AI use rather than actually benefit from it. That's what needs to be reset.

{"priorities":[
{"id":"workflow-pilots","body":"...","action":"..."},
{"id":"tool-stack","body":"...","action":"..."},
{"id":"access-integration","body":"...","action":"..."},
{"id":"role-enablement","body":"...","action":"..."},
{"id":"performance-narrative","body":"...","action":"..."},
{"id":"rd-lane","body":"...","action":"..."}
]}`;

        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1800,
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        let raw = data.content?.[0]?.text ?? '';
        raw = raw.replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/```\s*$/i,'').trim();
        const parsed = JSON.parse(raw);

        const pMap = {};
        (parsed.priorities ?? []).forEach(p => { pMap[p.id] = p; });
        setAiResults({ priorities: pMap });
      } catch (err) {
        console.error('WhatsnextInsights AI error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
  }, [transforms, vaultUnlocked]);

  return (
    <div style={{ padding: '56px 40px 0', maxWidth: 1400, margin: '0 auto' }}>

      {/* ── Section 1: Leadership Priorities ───────────────────────────────── */}
      <SectionHeader
        pill="Wave 3 findings" pillColor="#2EA84A"
        title="6 priorities for" accent="what leaders should do next"
        subtitle="These come directly from what staff said in the survey. Each card shows the data behind the priority. AI interpretation loads in after a moment."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 80 }}>
        {PRIORITIES.map((p, i) => (
          <PriorityCard
            key={p.id} p={p} anchor={anchors[i]} index={i}
            aiData={aiResults?.priorities?.[p.id]}
            loading={loading}
          />
        ))}
      </div>

      {/* ── Section 2: Wave 4 Goals ──────────────────────────────────────────── */}
      <Wave4Scorecard transforms={transforms} />

    </div>
  );
}
