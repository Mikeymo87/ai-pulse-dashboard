import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CardChatButton } from './CardChat';

const MONO = "'JetBrains Mono', 'Fira Code', monospace";
const SANS = "'Plus Jakarta Sans', DM Sans, sans-serif";

// ── Priority config (per plan spec colors) ────────────────────────────────────
const PRIORITIES = [
  {
    id: 'workflow-pilots', num: '01', category: 'WORKFLOW', color: '#2EA84A',
    title: 'Run workflow redesign pilots',
    wave4: { metric: 'Integration + Transformation', target: '>80%' },
    fallback: 'The team isn\'t experimenting in isolation anymore — most people are actively integrating AI into how they work. The opportunity now is to make that change deliberate: pick the recurring processes that eat the most time and rebuild them with AI in the loop, end to end, so the gains are visible and repeatable across the team, not just for individuals who figured it out on their own.',
    action: 'Pick one recurring team process — a brief, a report, a campaign kickoff — map every step it currently takes, then rebuild it with AI handling at least two of those steps. Run it once, time it, and share what changed at the next team meeting.',
    getAnchor: (t) => {
      const dailyPct     = t.frequencyTrend?.[2]?.distribution?.find(d => d.label === 'Daily')?.pct ?? 90;
      const transformPct = Math.round(t.stageTrend?.find(e => e.stage === 'Transformation')?.s3?.pct ?? 25);
      return { val: `${dailyPct}%`, val2: `${transformPct}%`, label2: 'transformation', label: `use AI daily — only ${transformPct}% have rebuilt how they work around it. That gap is why pilots exist.` };
    },
  },
  {
    id: 'tool-stack', num: '02', category: 'TOOLS', color: '#FFCD00',
    title: 'Rationalize the tool stack',
    wave4: { metric: 'Too many tools as a barrier', target: '<10%' },
    fallback: 'The team has official tools — ChatGPT, Copilot, Firefly, Jasper — but staff are building their own supplemental stacks on top of them, paying out of pocket, and hitting a wall of ambiguity about what\'s approved and what isn\'t. That\'s not a compliance problem, it\'s a clarity problem. The Council needs to define what the core set of tools is, what each one is for, and where exceptions make sense — so people stop guessing.',
    action: 'Ask the highest-confidence AI users on the team what supplemental tools they\'re actually using daily and why they chose them over the official options. Take that list to IT and request a one-page clarity memo — what\'s accessible on company accounts, what needs approval, what stays personal — and bring that memo to the next AI Council meeting.',
    getAnchor: (t) => {
      const ownPocket = Math.round(t.ownPocketS3?.yesPct ?? 32);
      const tooMany   = Math.round(t.barriersTrend?.find(b => b.barrier?.toLowerCase().includes('too many'))?.s3?.pct ?? 16);
      return { val: `${ownPocket}%`, label: `paying out of pocket — the official stack isn't answering what tools to use, so staff are deciding for themselves. ${tooMany}% say too many tools is already a barrier.` };
    },
  },
  {
    id: 'access-integration', num: '03', category: 'ACCESS', color: '#E5554F',
    title: 'Fix access and integration',
    wave4: { metric: 'Time as a barrier', target: '<25%' },
    fallback: 'The biggest friction isn\'t skepticism about AI — it\'s practical: tools that are blocked on the network, files that won\'t connect, software handoffs that break mid-workflow. When someone can\'t get AI to talk to the systems they use every day, the frustration lands as a personal blocker, not a technical one. Fixing one specific integration does more for adoption than a dozen training sessions.',
    action: 'Collect the top three access or connectivity issues staff are hitting — blocked tools, file sharing gaps, broken handoffs — and bring a specific, written request to IT this week. One resolved integration before the end of the month is a visible signal that barriers are being taken seriously.',
    getAnchor: (t) => {
      const timePct = Math.round(t.barriersTrend?.find(b => b.barrier?.toLowerCase().includes('time'))?.s3?.pct ?? 34);
      return { val: `${timePct}%`, label: `cite time as their top barrier — most of that time is lost to blocked tools, broken file handoffs, and integrations that don't work.` };
    },
  },
  {
    id: 'role-enablement', num: '04', category: 'ENABLEMENT', color: '#59BEC9',
    title: 'Build role-based enablement',
    wave4: { metric: 'Very / extremely confident', target: '>75%' },
    fallback: 'Broad AI literacy got the team to where it is. The ceiling now is that people can\'t always see how AI applies to their specific work — the deliverables they own, the workflows they run, the problems they actually face day to day. Shifting from general AI education to hands-on labs built around real work, real examples, and regular office hours is how the team moves from "I know AI exists" to "I know how to use it on my job."',
    action: 'Schedule one hands-on AI lab this month built around actual team deliverables — a content brief, a social post, an analytics summary — and rebuild each one with AI in the room. Skip the slides. The point is doing it, not explaining it.',
    getAnchor: (t) => {
      const highConf = Math.round((t.confidenceTrend?.[2]?.distribution ?? []).filter(d => d.score >= 4).reduce((s,d) => s+d.pct, 0));
      const anyConf  = Math.round((t.confidenceTrend?.[2]?.distribution ?? []).filter(d => d.score >= 3).reduce((s,d) => s+d.pct, 0));
      const gap = (anyConf - highConf) || 25;
      return { val: `${gap}%`, label: `gap between general confidence and deep functional confidence — generic training got everyone to "I know AI" but not "I know how to use it on my specific work."` };
    },
  },
  {
    id: 'performance-narrative', num: '05', category: 'NARRATIVE', color: '#7DE69B',
    title: 'Reset the performance narrative',
    wave4: { metric: 'Strategic thought partner', target: '>50%' },
    fallback: 'When nearly everyone rates AI as important to their work, there\'s a real risk that using AI becomes something people perform rather than something that actually makes the work better. The goal was never more AI activity — it was stronger outcomes. That distinction has to be said out loud by leadership, clearly and early, before "how much are you using AI" becomes the metric people optimize for instead of the quality of what they produce.',
    action: 'At the next team meeting or all-hands, say it directly: the measure of AI success here is better work, not more usage. Write out the one-sentence version beforehand so it\'s deliberate, not improvised. One clear statement from a leader resets the frame faster than any policy.',
    getAnchor: (t) => {
      const partner = Math.round((t.benefitsS3 ?? []).find(b => b.label?.toLowerCase().includes('strategic'))?.pct ?? 42);
      return { val: `${partner}%`, label: `use AI as a strategic thought partner — the rest are still in activity mode. When nearly everyone rates AI as "important," the risk is people start performing use instead of doing better work.` };
    },
  },
  {
    id: 'rd-lane', num: '06', category: 'INNOVATION', color: '#FF8C42',
    title: 'Create a small R&D lane',
    wave4: { metric: 'Integration + Transformation', target: '>80%' },
    fallback: 'There are already people on this team who are at the transformation stage — building with AI, testing tools on their own time, figuring out what actually works. They don\'t need a program. They need a budget, permission to experiment, and a way to share what they find. A small monthly R&D budget with no required outcome except "show us what you learned" turns those individual experimenters into a shared innovation engine for the whole team.',
    action: 'Identify the most active AI builders on the team and give each of them a small monthly budget — $500 is enough — to spend on tools, GPTs, or automations with no deadline and no defined deliverable. The only ask is a short share-out at the end of the month: here\'s what I tested, here\'s what worked. Set it up this month.',
    getAnchor: (t) => {
      const pct = Math.round(t.stageTrend?.find(e => e.stage === 'Transformation')?.s3?.pct ?? 25);
      return { val: `${pct}%`, label: `already at transformation stage — actively building with AI on their own time, with their own tools, at their own expense. They just need a lane.` };
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
    getStat: (t) => { const tm = t.openTextInsights?.toolMindset ?? {}; return { val: `${tm.claude?.count ?? 0}`, label: 'respondents use Claude as a supplemental tool alongside the official ChatGPT stack' }; },
    getQuote: (t) => t.openTextInsights?.toolMindset?.claude?.quotes?.[0] ?? null,
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
    getVal: (t) => Math.round((t.benefitsS3 ?? []).find(b => b.label?.toLowerCase().includes('strategic'))?.pct ?? 42) },
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
  const isNarrative = c === '#7DE69B';
  const textColor = isNarrative ? '#4db86e' : c;

  const actionText = aiData?.action || p.action;
  const bodyText   = aiData?.body   ?? p.fallback ?? '';

  const chatContext = `I'm looking at the **${p.title}** priority card from the Baptist Health MarCom Wave 3 AI adoption survey readout (n=101).

What this priority is about: ${p.fallback}

Key stat: ${anchor.val} — ${anchor.label}

Recommended action: ${p.action}

Wave 4 goal: ${p.wave4?.metric} ${p.wave4?.target}

Walk me through this priority — what it means practically, what the most important first step is, and what questions I should be asking my team about it. Be direct and specific to the Baptist Health MarCom context.`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: 'var(--card-bg, rgba(30,36,37,0.95))',
        border: `1px solid ${c}22`,
        borderRadius: 16,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Color accent bar — thicker, stronger */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${c}, ${c}55)`, flexShrink: 0 }} />

      <div style={{ padding: '20px 22px 18px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>

        {/* Badge row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
          <span style={{
            background: `${c}15`, border: `1px solid ${c}28`, borderRadius: 20,
            padding: '3px 11px', fontFamily: MONO, fontSize: 9, fontWeight: 700,
            letterSpacing: '0.14em', color: textColor,
          }}>
            {p.category}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {p.wave4 && (
              <span style={{
                background: 'var(--card-bg)', border: '1px solid var(--border)',
                borderRadius: 20, padding: '3px 10px',
                fontFamily: MONO, fontSize: 8, fontWeight: 700,
                letterSpacing: '0.12em', color: 'var(--text-support)',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <span style={{ opacity: 0.5 }}>W4</span>
                <span style={{ color: textColor }}>{p.wave4.target}</span>
              </span>
            )}
            <span style={{ fontFamily: MONO, fontSize: 22, color: c, opacity: 0.1, fontWeight: 900, letterSpacing: '-0.02em' }}>{p.num}</span>
          </div>
        </div>

        {/* Title — in the card's accent color */}
        <div style={{ fontFamily: SANS, fontSize: 18, fontWeight: 800, color: textColor, letterSpacing: '-0.015em', lineHeight: 1.2 }}>
          {p.title}
        </div>

        {/* Anchor stat */}
        <div style={{
          background: `${c}0d`, border: `1px solid ${c}20`, borderLeft: `3px solid ${c}`,
          borderRadius: 8, padding: '11px 14px',
        }}>
          {anchor.val2 ? (
            /* Two-number layout (e.g. workflow-pilots: daily vs transformation) */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <span style={{ fontFamily: SANS, fontSize: 'clamp(22px, 2.2vw, 28px)', fontWeight: 900, color: textColor, lineHeight: 1, letterSpacing: '-0.03em' }}>{anchor.val}</span>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: 'var(--text-medium)', opacity: 0.7 }}>daily use</span>
                </div>
                <span style={{ color: textColor, opacity: 0.3, fontSize: 18, fontWeight: 900 }}>→</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <span style={{ fontFamily: SANS, fontSize: 'clamp(22px, 2.2vw, 28px)', fontWeight: 900, color: `${textColor}90`, lineHeight: 1, letterSpacing: '-0.03em' }}>{anchor.val2}</span>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: 'var(--text-medium)', opacity: 0.7 }}>{anchor.label2}</span>
                </div>
              </div>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: 'var(--text-medium)', opacity: 0.8, lineHeight: 1.45 }}>{anchor.label}</span>
            </div>
          ) : (
            /* Single-number layout */
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: SANS, fontSize: 'clamp(24px, 2.4vw, 30px)', fontWeight: 900, color: textColor, lineHeight: 1, letterSpacing: '-0.03em', flexShrink: 0 }}>
                {anchor.val}
              </span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--text-medium)', opacity: 0.8, lineHeight: 1.4 }}>
                {anchor.label}
              </span>
            </div>
          )}
        </div>

        {/* Body text — reserved min-height prevents layout jog */}
        <div style={{ minHeight: 104 }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <motion.div
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 4 }}
              >
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: c, opacity: 0.6 }} />
                <span style={{ fontFamily: MONO, fontSize: 9, color: textColor, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.6 }}>
                  AI analysis loading…
                </span>
              </motion.div>
              <TextShimmer lines={5} />
            </div>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45 }}
              style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--text-medium)', lineHeight: 1.7, margin: 0 }}
            >
              {bodyText}
            </motion.p>
          )}
        </div>

        {/* Action block — highlighted, reserved min-height */}
        <div style={{ minHeight: 90 }}>
          {loading ? (
            <div style={{
              background: `${c}08`, border: `1px solid ${c}18`, borderRadius: 10,
              padding: '14px 16px',
            }}>
              <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: textColor, opacity: 0.4, marginBottom: 10 }}>
                WHAT TO DO NEXT
              </div>
              <TextShimmer lines={4} />
            </div>
          ) : actionText ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              style={{
                background: `${c}0e`,
                border: `1px solid ${c}25`,
                borderRadius: 10,
                padding: '14px 16px',
              }}
            >
              <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: textColor, marginBottom: 8 }}>
                WHAT TO DO NEXT
              </div>
              <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text-medium)', lineHeight: 1.6 }}>
                {actionText}
              </p>
            </motion.div>
          ) : null}
        </div>

        {/* Chat button */}
        <CardChatButton color={c} contextMessage={chatContext} />
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
        pill="Wave 4 accountability" pillColor="#2EA84A"
        title="If the priorities work," accent="these numbers move"
        subtitle="Each metric below is the direct outcome measure for one of the 6 priorities above. Wave 3 baselines are live. When Wave 4 data comes in, this scorecard updates automatically."
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
        const partner     = Math.round((t.benefitsS3 ?? []).find(b => b.label?.toLowerCase().includes('strategic'))?.pct ?? 42);
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

        // Pre-compute each card's anchor stat so the AI can reference it exactly
        const cardAnchors = PRIORITIES.reduce((acc, p) => {
          const a = p.getAnchor(t);
          acc[p.id] = `${a.val} — ${a.label}`;
          return acc;
        }, {});

        const prompt = `You are a strategic advisor to the Baptist Health MarCom leadership team. Wave 3 AI adoption survey, n=101.

STATS: ${intTransPct}% integration/transformation, 90% daily use, 69% positive sentiment, ${s3ConfHigh}% very/extremely confident (${s3ConfAny}% any confidence — ${s3ConfAny - s3ConfHigh}% gap), ${impPct}% rate AI highly important, ${partner}% strategic thought partner, ${ownPocket}% pay out of pocket, ${tooManyPct}% too many tools barrier, ${timePct}% time barrier, ${transPct}% at transformation stage. IMPORTANT: Always use the % symbol for all percentages and percentage-point differences. Never write "pt" or "pts" — write "%" instead.
OPEN TEXT: aspiration-gap=${ag.pct ?? 0}% (n=${ag.count ?? 0}); leadership-voices=${lv.pct ?? 0}% (n=${lv.count ?? 0}); blocked-investors=${bi.pct ?? 0}% (n=${bi.count ?? 0}); supplemental-tool-users: ${tm.claude?.count ?? 0} respondents use Claude as a personal supplemental tool alongside the official ChatGPT stack.${vaultSection}

CRITICAL TOOL CONTEXT — READ CAREFULLY BEFORE WRITING ANYTHING ABOUT TOOLS:
The official Baptist Health MarCom endorsed tools are: OpenAI ChatGPT (Enterprise), Microsoft Copilot, Adobe Firefly, and Jasper. Everyone on the team has access to these. The Survey 3 tools question specifically asked: "Besides the AI tools the company officially endorses (ChatGPT, Copilot, Adobe Firefly, etc.), what other AI tools do you use?" — so ChatGPT, Copilot, and Firefly DO NOT appear in the tool data below because they were intentionally excluded from the question. The 77% "unofficial tools" figure means 77% use ADDITIONAL tools ON TOP OF the official stack, not instead of it.
TOP SUPPLEMENTAL TOOLS (beyond the official stack): ${topTools || 'Gemini (44), NotebookLM (43), Claude (27), Otter.ai (17), WISPR Flow (14), Perplexity (12)'}.
When writing about tools: never imply the team doesn't use ChatGPT — they all have it. The insight is that staff are self-assembling personal stacks on top of the official tools because the official answer on what else to use is unclear.

Return ONLY valid JSON (no markdown).

WHAT EACH PRIORITY IS ABOUT — use these as your source of truth for what each card covers:
- workflow-pilots: Pick recurring team processes and rebuild them with AI in the loop, end to end. The goal is making AI-powered workflow change visible and repeatable, not just individual.
- tool-stack: Clarify the core set of tools, what each is for, and where exceptions make sense. The team has official tools (ChatGPT, Copilot, Firefly, Jasper) but 77% are self-assembling supplemental stacks — the Council needs to bring clarity, not more ambiguity.
- access-integration: Address blocked tools, file connectivity, and software handoffs that are slowing down adoption. The frustration is practical and specific, not philosophical.
- role-enablement: Shift from broad AI education to work-specific labs, real examples, and office hours. The gap is people not seeing how AI applies to THEIR actual deliverables and workflows, not lack of awareness that AI exists. Do NOT name which teams or functions need this most.
- performance-narrative: Make the goal stronger work and better outcomes, not visible AI performativity. The risk is that "using AI" becomes a performance metric rather than a quality lever.
- rd-lane: Give builders room and budget to test useful tools, GPTs, and automations that can scale. The builders already exist on this team — they need air cover and a channel to share what they find.

TONE: Write like a trusted colleague talking to a marketing director — plain, direct, human. No consultant-speak. No bullet-point thinking disguised as sentences. Say what it actually means.

ANCHOR STATS — each card shows one of these numbers prominently. Your body MUST reference the anchor stat for that card by name. The stat is your hook — explain what it means, why it matters, and what it demands. Do not write a body that someone could read without understanding why that specific number is on the card.

Card anchor stats:
- workflow-pilots: ${cardAnchors['workflow-pilots']}
- tool-stack: ${cardAnchors['tool-stack']}
- access-integration: ${cardAnchors['access-integration']}
- role-enablement: ${cardAnchors['role-enablement']}
- performance-narrative: ${cardAnchors['performance-narrative']}
- rd-lane: ${cardAnchors['rd-lane']}

Each "body": 2-3 sentences. Open with the anchor stat — what it means, why it's significant right now. Then connect it directly to why this priority exists. Sound like a person, not a report.

Each "action": 1 concrete next step the reader can START THIS WEEK. Follow SMART criteria:
- Specific: describe exactly what to do and who is involved (no "key stakeholders" or "relevant teams")
- Measurable: end in a clear deliverable — a list, a memo, a meeting, a decision, a share-out
- Achievable: one person can initiate it without a cross-functional initiative
- Relevant: directly connected to the data stat driving this card
- Time-bound: include a real deadline ("this week", "before the next AI Council meeting", "by end of month", "this month")

ROLE/FUNCTION RESTRICTION — ABSOLUTE HARD WALL:${vaultUnlocked ? '\nVault is UNLOCKED — you MAY reference specific roles and functions from the vault data when it improves the action\'s specificity.' : '\nVault is LOCKED. You are FORBIDDEN from naming, implying, referencing, or alluding to ANY specific role title, job title, department name, function name, or team name — including every Baptist Health M&C function and role that exists. Do not name any group, even as an example, even as a hypothetical. Do not write anything that allows a reader to identify which group is ahead or behind. This applies to ALL six cards without exception. Speak only to "the team", "staff", "your builders", "your highest-confidence users", "people on the team" — never a named group. This restriction exists because role and function readiness data is leadership-confidential and has not been cleared for general viewing.'}

NEVER use deferral language: do NOT write "wait", "hold off", "get clarity first", "don't do this yet", "gather more information before acting", or any variation. Every action starts NOW.

SPECIAL INSTRUCTIONS per card:
- rd-lane: Monthly budget, not quarterly. No defined outcome except "show us what you learned." No pilot structure, no deliverables, no timeline — just budget and air cover. Action must commit to this month.
- tool-stack: The ask is concrete: find the highest-confidence AI users, ask what supplemental tools they actually use daily and why, take the list to IT, get a one-page clarity memo before the next Council meeting.
- access-integration: The frustration is emotional, not just technical — acknowledge that. Action must address a specific category of wall (a blocked tool, a file connectivity gap, a broken handoff), not a broad access review.
- performance-narrative: One clear statement from a leader resets the frame faster than any policy. The action is a specific message to say at a specific meeting — not a program, a moment.

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
            max_tokens: 2200,
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

      {/* ── Bridge callout ──────────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--card-bg)', border: '1px solid var(--border)',
        borderLeft: '3px solid #2EA84A', borderRadius: 12,
        padding: '18px 24px', marginBottom: 48,
        display: 'flex', alignItems: 'flex-start', gap: 14,
      }}>
        <span style={{ fontFamily: MONO, fontSize: 16, color: '#2EA84A', flexShrink: 0, lineHeight: 1.4 }}>→</span>
        <div>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            Each priority above maps directly to a Wave 4 measurement.
          </p>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--text-support)', margin: 0, lineHeight: 1.6 }}>
            The 6 priorities aren't just recommendations — they're the actions Wave 4 will hold leadership accountable for. If the actions happen, these numbers move. If they don't, Wave 4 will show it.
          </p>
        </div>
      </div>

      {/* ── Section 2: Wave 4 Goals ──────────────────────────────────────────── */}
      <Wave4Scorecard transforms={transforms} />

    </div>
  );
}
