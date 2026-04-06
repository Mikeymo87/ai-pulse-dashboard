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
    callout: 'Audit the current tool landscape, define a core stack with clear use cases for each tool, and publish a one-page decision guide so staff know what to use — and how to request exceptions.',
    getAnchor: (t) => {
      const ownPocket = Math.round(t.ownPocketS3?.yesPct ?? 32);
      const tooMany   = Math.round(t.barriersTrend?.find(b => b.barrier?.toLowerCase().includes('too many'))?.s3?.pct ?? 16);
      return { val: `${ownPocket}%`, label: `pay out of pocket for AI tools — ${tooMany}% cite too many tools as a barrier` };
    },
  },
  {
    id: 3, num: '03', category: 'ACCESS', color: '#FFCD00',
    title: 'Fix access and integration',
    callout: 'Map the three most common integration blockers (shared files, email, project management) and escalate as a formal IT request — with business impact data from this survey attached.',
    getAnchor: () => ({ val: '77%', label: 'use tools beyond the official stack — workarounds signal unmet integration needs' }),
  },
  {
    id: 4, num: '04', category: 'ENABLEMENT', color: '#7DE69B',
    title: 'Build role-based enablement',
    callout: 'Design one function-specific AI lab per team — 90 minutes, built around that team\'s actual work — with a follow-up office hours slot two weeks later to close the gap between session and practice.',
    getAnchor: (t) => {
      const pct = (t.confidenceTrend?.[2]?.distribution ?? []).filter(d => d.score >= 4).reduce((s,d) => s+d.pct, 0);
      return { val: `${Math.round(pct) || 67}%`, label: 'very or extremely confident — uneven across roles and functions' };
    },
  },
  {
    id: 5, num: '05', category: 'NARRATIVE', color: '#59BEC9',
    title: 'Reset the performance narrative',
    callout: 'Replace AI usage metrics with outcome metrics in team check-ins — ask "what did AI help you do better?" instead of "did you use AI?" and share strong examples publicly to model the right behavior.',
    getAnchor: (t) => {
      const pct = (t.importanceTrend?.[2]?.distribution ?? []).filter(d => d.score >= 4).reduce((s,d) => s+d.pct, 0);
      return { val: `${Math.round(pct) || 87}%`, label: 'rate AI highly important — making performative use a real risk' };
    },
  },
  {
    id: 6, num: '06', category: 'R&D', color: '#2EA84A',
    title: 'Create a small R&D lane',
    callout: 'Give three volunteer builders a small budget, a 30-day window, and a simple brief — build something that saves your team time. Share results at the next all-hands and fast-track anything worth scaling.',
    getAnchor: (t) => {
      const pct = t.stageTrend?.find(e => e.stage === 'Transformation')?.s3?.pct ?? 25;
      return { val: `${Math.round(pct)}%`, label: 'already at transformation stage — builders are ready for a dedicated lane' };
    },
  },
];

// ── Wave 4 scorecard rows ─────────────────────────────────────────────────────
const SCORECARD_ROWS = [
  {
    metric: 'Integration + Transformation',
    targetLabel: 'Move above 80%', targetDisplay: '80%',
    direction: 'above', threshold: 80,
    getVal: (t) => {
      const pct = ['Integration','Transformation'].reduce((s, st) => s + (t.stageTrend?.find(e => e.stage === st)?.s3?.pct ?? 0), 0);
      return Math.round(pct);
    },
    unit: '%',
  },
  {
    metric: 'Very / extremely confident',
    targetLabel: 'Move above 75%', targetDisplay: '75%',
    direction: 'above', threshold: 75,
    getVal: (t) => Math.round((t.confidenceTrend?.[2]?.distribution ?? []).filter(d => d.score >= 4).reduce((s,d) => s+d.pct, 0)),
    unit: '%',
  },
  {
    metric: 'Time / priorities as a barrier',
    targetLabel: 'Pull below 25%', targetDisplay: '<25%',
    direction: 'below', threshold: 25,
    getVal: (t) => Math.round(t.barriersTrend?.find(b => b.barrier?.toLowerCase().includes('time'))?.s3?.pct ?? 34),
    unit: '%',
  },
  {
    metric: 'Too many tools as a barrier',
    targetLabel: 'Pull below 10%', targetDisplay: '<10%',
    direction: 'below', threshold: 10,
    getVal: (t) => Math.round(t.barriersTrend?.find(b => b.barrier?.toLowerCase().includes('too many'))?.s3?.pct ?? 16),
    unit: '%',
  },
  {
    metric: 'Strategic thought partner benefit',
    targetLabel: 'Move above 50%', targetDisplay: '50%',
    direction: 'above', threshold: 50,
    getVal: (t) => Math.round((t.benefitsS3 ?? []).find(b => (b.label ?? b.benefit)?.toLowerCase().includes('strategic'))?.pct ?? 42),
    unit: '%',
  },
  {
    metric: 'Out-of-pocket tool spend',
    targetLabel: 'Reduce via sanctioned support', targetDisplay: '↓',
    direction: 'below', threshold: 20,
    getVal: (t) => Math.round(t.ownPocketS3?.yesPct ?? 32),
    unit: '%',
  },
];

// ── Priority card ─────────────────────────────────────────────────────────────
function PriorityCard({ p, anchor, index }) {
  const c = p.color;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22,1,0.36,1] }}
      style={{
        background: 'var(--card-bg, rgba(35,40,41,0.9))',
        border: `1px solid ${c}22`,
        borderRadius: 14,
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Color top bar */}
      <div style={{ height: 3, background: c }} />

      <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {/* Badge + number */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ background: `${c}18`, borderRadius: 20, padding: '3px 10px', fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: c }}>
            {p.category}
          </span>
          <span style={{ fontFamily: MONO, fontSize: 20, color: c, opacity: 0.18, fontWeight: 900, letterSpacing: '-0.02em' }}>{p.num}</span>
        </div>

        {/* Title */}
        <div style={{ fontFamily: SANS, fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.25 }}>
          {p.title}
        </div>

        {/* ★ Callout */}
        <div style={{
          background: `${c}10`,
          border: `1px solid ${c}30`,
          borderLeft: `3px solid ${c}`,
          borderRadius: 8,
          padding: '10px 12px',
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
          flex: 1,
        }}>
          <span style={{ color: c, fontSize: 13, flexShrink: 0, lineHeight: 1.5 }}>★</span>
          <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500, color: 'var(--text-medium)', lineHeight: 1.6 }}>
            {p.callout}
          </p>
        </div>

        {/* Anchor stat — bottom divider */}
        <div style={{ borderTop: `1px solid ${c}18`, paddingTop: 12, display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: SANS, fontSize: 'clamp(20px, 2vw, 26px)', fontWeight: 900, color: c, lineHeight: 1, letterSpacing: '-0.03em', flexShrink: 0 }}>
            {anchor.val}
          </span>
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--text-support)', lineHeight: 1.4 }}>
            {anchor.label}
          </span>
        </div>
      </div>
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
          Wave 4 Goals
        </h2>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: 'var(--text-support)', margin: 0 }}>
          Where we want to be by the next survey. Current Wave 3 numbers shown alongside each target.
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
              border: '1px solid rgba(125,230,155,0.12)',
              borderTop: '2px solid rgba(46,168,74,0.4)',
              borderRadius: 12,
              padding: '18px 20px',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}
          >
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--text-medium)', fontWeight: 600, lineHeight: 1.3 }}>
              {row.metric}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ fontFamily: MONO, fontSize: 9, color: 'var(--text-support)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Now</span>
                <span style={{ fontFamily: SANS, fontSize: 'clamp(24px, 2.5vw, 30px)', fontWeight: 900, color: row.onTrack ? '#2EA84A' : 'var(--text-medium)', lineHeight: 1, letterSpacing: '-0.02em' }}>
                  {row.val}{row.unit}
                </span>
              </div>
              <span style={{ color: '#2EA84A', fontSize: 16, opacity: 0.4, flexShrink: 0 }}>→</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ fontFamily: MONO, fontSize: 9, color: '#2EA84A', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.8 }}>Goal</span>
                <span style={{ fontFamily: SANS, fontSize: 'clamp(24px, 2.5vw, 30px)', fontWeight: 900, color: '#2EA84A', lineHeight: 1, letterSpacing: '-0.02em' }}>
                  {row.targetDisplay}
                </span>
              </div>
            </div>

            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--text-support)', lineHeight: 1.4 }}>
              {row.targetLabel}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function WhatsnextInsights({ transforms }) {
  const anchors = PRIORITIES.map(p => p.getAnchor(transforms ?? {}));

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 72 }}>
        {PRIORITIES.map((p, i) => (
          <PriorityCard key={p.id} p={p} anchor={anchors[i]} index={i} />
        ))}
      </div>

      {/* ── Section 2: Wave 4 Goals ──────────────────────────────────────────── */}
      <Wave4Scorecard transforms={transforms} />

    </div>
  );
}
