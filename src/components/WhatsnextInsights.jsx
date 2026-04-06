import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const MONO = "'JetBrains Mono', 'Fira Code', monospace";
const SANS = "'Plus Jakarta Sans', DM Sans, sans-serif";

// ── Priority config — static structure ───────────────────────────────────────
const PRIORITIES = [
  {
    id: 1, num: '01', category: 'WORKFLOW', color: '#2EA84A',
    title: 'Run workflow redesign pilots',
    getAnchor: (t) => {
      const pct = ['Integration', 'Transformation']
        .reduce((s, st) => s + (t.stageTrend?.find(e => e.stage === st)?.s3?.pct ?? 0), 0);
      return { val: `${Math.round(pct)}%`, label: 'at integration or transformation stage — ready for deeper redesign' };
    },
  },
  {
    id: 2, num: '02', category: 'TOOLS', color: '#59BEC9',
    title: 'Rationalize the tool stack',
    getAnchor: (t) => {
      const toolBar = t.barriersTrend?.find(b => b.barrier?.toLowerCase().includes('too many'));
      const toolPct = Math.round(toolBar?.s3?.pct ?? 16);
      const ownPocket = Math.round(t.ownPocketS3?.yesPct ?? 32);
      return { val: `${ownPocket}%`, label: `pay out of pocket for AI tools — and ${toolPct}% cite too many tools as a barrier` };
    },
  },
  {
    id: 3, num: '03', category: 'ACCESS', color: '#E5554F',
    title: 'Fix access and integration',
    getAnchor: (t) => {
      const pct = Math.round(t.ownPocketS3?.yesPct ?? 32);
      const unofficial = 77;
      return { val: `${unofficial}%`, label: 'use tools beyond the official stack — workarounds signal access friction' };
    },
  },
  {
    id: 4, num: '04', category: 'ENABLEMENT', color: '#FFCD00',
    title: 'Build role-based enablement',
    getAnchor: (t) => {
      const pct = (t.confidenceTrend?.[2]?.distribution ?? [])
        .filter(d => d.score >= 4).reduce((s, d) => s + d.pct, 0);
      return { val: `${Math.round(pct) || 67}%`, label: 'very or extremely confident — strong progress but uneven across roles' };
    },
  },
  {
    id: 5, num: '05', category: 'NARRATIVE', color: '#7DE69B',
    title: 'Reset the performance narrative',
    getAnchor: (t) => {
      const pct = (t.importanceTrend?.[2]?.distribution ?? [])
        .filter(d => d.score >= 4).reduce((s, d) => s + d.pct, 0);
      return { val: `${Math.round(pct) || 87}%`, label: 'rate AI as highly important — the stakes make performative use a real risk' };
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

// ── Shimmer skeleton ──────────────────────────────────────────────────────────
function Shimmer() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[100, 92, 78].map((w, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.15 }}
          style={{
            height: 13,
            width: `${w}%`,
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
  const bgAlpha = `${c}15`;
  const borderAlpha = `${c}30`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: 'var(--card-bg, rgba(35,40,41,0.9))',
        border: `1px solid ${borderAlpha}`,
        borderTop: `3px solid ${c}`,
        borderRadius: 14,
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* Top row: category badge + number */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          background: bgAlpha,
          border: `1px solid ${borderAlpha}`,
          borderRadius: 20,
          padding: '3px 10px',
          fontFamily: MONO,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.12em',
          color: c,
        }}>
          {p.category}
        </span>
        <span style={{
          fontFamily: MONO,
          fontSize: 11,
          color: c,
          opacity: 0.5,
          fontWeight: 700,
          letterSpacing: '0.08em',
        }}>
          {p.num}
        </span>
      </div>

      {/* Title */}
      <div style={{
        fontFamily: SANS,
        fontSize: 17,
        fontWeight: 800,
        color: 'var(--text-primary)',
        letterSpacing: '-0.01em',
        lineHeight: 1.25,
      }}>
        {p.title}
      </div>

      {/* Anchor stat */}
      <div style={{
        background: bgAlpha,
        borderRadius: 10,
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'baseline',
        gap: 10,
        flexWrap: 'wrap',
      }}>
        <span style={{
          fontFamily: SANS,
          fontSize: 'clamp(28px, 3vw, 36px)',
          fontWeight: 900,
          color: c,
          lineHeight: 1,
          letterSpacing: '-0.03em',
          flexShrink: 0,
        }}>
          {anchor.val}
        </span>
        <span style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 13,
          color: 'var(--text-support)',
          lineHeight: 1.4,
        }}>
          {anchor.label}
        </span>
      </div>

      {/* AI body — shimmer or text */}
      <div style={{ flex: 1 }}>
        {loading ? <Shimmer /> : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {aiData?.body && (
              <p style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 14,
                color: 'var(--text-bridge)',
                lineHeight: 1.65,
                margin: 0,
              }}>
                {aiData.body}
              </p>
            )}
          </motion.div>
        )}
      </div>

      {/* Action */}
      {!loading && aiData?.action && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            borderTop: `1px solid ${borderAlpha}`,
            paddingTop: 12,
            display: 'flex',
            gap: 8,
            alignItems: 'flex-start',
          }}
        >
          <span style={{ color: c, fontSize: 13, fontWeight: 700, flexShrink: 0, paddingTop: 1 }}>→</span>
          <p style={{
            margin: 0,
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 13,
            color: 'var(--text-support)',
            lineHeight: 1.55,
          }}>
            {aiData.action}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function WhatsnextInsights({ transforms, vaultUnlocked }) {
  const [aiResults, setAiResults]   = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(false);
  const fetchedRef                  = useRef(false);

  // Compute anchor stats immediately from transforms
  const anchors = PRIORITIES.map(p => p.getAnchor(transforms ?? {}));

  useEffect(() => {
    if (fetchedRef.current || !transforms) return;
    fetchedRef.current = true;

    async function fetchInsights() {
      try {
        const t = transforms;

        // Key stats for the prompt
        const s3PosPct   = Math.round(t.sentimentTrend?.find(e => e.sentiment === 'Positive')?.s3?.pct ?? 69);
        const s3DailyPct = Math.round(t.frequencyTrend?.[2]?.distribution?.find(d => d.label === 'Daily')?.pct ?? 90);
        const intTransPct = Math.round(['Integration','Transformation']
          .reduce((s, st) => s + (t.stageTrend?.find(e => e.stage === st)?.s3?.pct ?? 0), 0));
        const s3ConfPct  = Math.round((t.confidenceTrend?.[2]?.distribution ?? []).filter(d => d.score >= 4).reduce((s,d) => s+d.pct, 0));
        const impPct     = Math.round((t.importanceTrend?.[2]?.distribution ?? []).filter(d => d.score >= 4).reduce((s,d) => s+d.pct, 0) || 87);
        const ownPocket  = Math.round(t.ownPocketS3?.yesPct ?? 32);
        const tooManyPct = Math.round(t.barriersTrend?.find(b => b.barrier?.toLowerCase().includes('too many'))?.s3?.pct ?? 16);
        const timePct    = Math.round(t.barriersTrend?.find(b => b.barrier?.toLowerCase().includes('time'))?.s3?.pct ?? 34);
        const transPct   = Math.round(t.stageTrend?.find(e => e.stage === 'Transformation')?.s3?.pct ?? 25);
        const topBenefits = (t.benefitsS3 ?? []).slice(0, 3).map(b => `${b.label ?? b.benefit} (${Math.round(b.pct)}%)`).join(', ');

        const prompt = `You are analyzing Baptist Health MarCom Wave 3 AI adoption survey data (n=101, Mar 2026).

KEY WAVE 3 STATS:
- 69% positive sentiment, 90% daily AI use, 74% at Integration or Transformation stage
- ${s3ConfPct}% very/extremely confident, ${impPct}% rate AI as highly important (4-5)
- 77% use tools beyond official stack, ${ownPocket}% pay out of pocket for AI tools
- ${tooManyPct}% cite "too many tools" as barrier, ${timePct}% cite time/competing priorities
- ${transPct}% at Transformation stage, top benefits: ${topBenefits}

Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "priorities": [
    { "id": 1, "headline": "12-word max", "body": "2-3 sentences anchored to the data above", "action": "1 concrete next step starting with an action verb" },
    { "id": 2, ... },
    { "id": 3, ... },
    { "id": 4, ... },
    { "id": 5, ... },
    { "id": 6, ... }
  ]
}

The 6 priorities in order:
1. Run workflow redesign pilots (74% integration/transformation — depth of use varies)
2. Rationalize the tool stack (77% unofficial tools, ${ownPocket}% paying out of pocket)
3. Fix access and integration (AI works in isolation; staff can't connect it to real systems)
4. Build role-based enablement (${s3ConfPct}% very confident — uneven across roles and functions)
5. Reset the performance narrative (${impPct}% rate AI highly important but open text reveals pressure to perform AI rather than use it well)
6. Create a small R&D lane (${transPct}% at transformation stage — builders ready for a dedicated space)

Tone: direct, evidence-grounded, no hype. Write for a marketing leadership audience.`;

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
            max_tokens: 1600,
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        let raw = data.content?.[0]?.text ?? '';
        // Strip markdown fences if present
        raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
        const parsed = JSON.parse(raw);
        const map = {};
        (parsed.priorities ?? []).forEach(p => { map[p.id] = p; });
        setAiResults(map);
      } catch (err) {
        console.error('WhatsnextInsights fetch error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
  }, [transforms]);

  return (
    <section style={{ padding: '56px 40px 0', maxWidth: 1400, margin: '0 auto' }}>

      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: 36 }}
      >
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(46,168,74,0.08)',
          border: '1px solid rgba(46,168,74,0.2)',
          borderRadius: 20,
          padding: '4px 14px',
          marginBottom: 16,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2EA84A' }} />
          <span style={{
            fontFamily: MONO,
            fontSize: 10,
            color: '#2EA84A',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}>
            Wave 3 findings
          </span>
        </div>

        <h2 style={{
          fontFamily: SANS,
          fontSize: 'clamp(26px, 3vw, 38px)',
          fontWeight: 900,
          color: 'var(--text-primary)',
          letterSpacing: '-0.025em',
          lineHeight: 1.1,
          margin: '0 0 10px',
        }}>
          6 priorities for{' '}
          <span style={{ color: '#2EA84A' }}>what leaders should do next</span>
        </h2>
        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 16,
          color: 'var(--text-support)',
          margin: 0,
          maxWidth: 640,
        }}>
          These come directly from what staff said in the survey. Each card shows the data behind the priority and a concrete next step.
        </p>
      </motion.div>

      {/* 3×2 priority grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
      }}>
        {PRIORITIES.map((p, i) => (
          <PriorityCard
            key={p.id}
            p={p}
            anchor={anchors[i]}
            aiData={aiResults?.[p.id] ?? null}
            loading={loading}
            index={i}
          />
        ))}
      </div>

      {error && (
        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 13,
          color: 'var(--text-support)',
          textAlign: 'center',
          marginTop: 20,
          opacity: 0.6,
        }}>
          Could not load AI interpretation — anchor data above is from the live survey.
        </p>
      )}

    </section>
  );
}
