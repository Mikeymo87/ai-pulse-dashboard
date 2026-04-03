import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, FileText } from './Icons';
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts';
import { useTheme } from '../hooks/useTheme';

// ─── Brand palette — green first, mint, teal, yellow, red ────────────────────
const C = {
  green:  '#2EA84A',
  mint:   '#7DE69B',
  teal:   '#59BEC9',
  yellow: '#FFCD00',
  red:    '#E5554F',
  gray:   '#797D80',
};

// Ramp: index 0 = best/highest (green) → index 4 = worst/lowest (red)
const RAMP = [C.green, C.mint, C.teal, C.yellow, C.red];

function rampColor(index, total) {
  const i = Math.round((index / Math.max(total - 1, 1)) * (RAMP.length - 1));
  return RAMP[i];
}

// ─── Survey instrument metadata ──────────────────────────────────────────────
const SURVEY_META = {
  s1: {
    label: 'Survey 1', period: 'January – February 2025',
    questions: [
      { id: 'sentiment',   text: 'How do you feel about AI in your work right now?',                                 options: ['Positive', 'Mixed', 'Unsure', 'Negative'] },
      { id: 'familiarity', text: 'How familiar are you with AI tools and capabilities? (1 = Unfamiliar → 5 = Expert)', options: ['1 – Unfamiliar', '2 – Heard of it', '3 – Know a bit', '4 – Experimented', '5 – Expert'] },
      { id: 'confidence',  text: 'How confident are you using AI in your daily work?',                               options: ['Not confident at all', 'Somewhat confident', 'Confident', 'Very Confident'] },
      { id: 'importance',  text: 'How important is AI to your current role? (1 = Not at all → 5 = Essential)',       options: ['1', '2', '3', '4', '5'] },
      { id: 'frequency',   text: 'How often do you use AI tools?',                                                   options: ['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never'] },
      { id: 'barriers',    text: 'What are the biggest barriers preventing you from using AI more?',                 options: ['select all that apply'] },
      { id: 'openEnded',   text: 'How do you see AI changing your work / what are you already using it for?',        options: ['open text'] },
    ],
  },
  s2: {
    label: 'Survey 2', period: 'August – September 2025',
    questions: [
      { id: 'sentiment',   text: 'How do you feel about AI in your work right now?',                                 options: ['Positive', 'Mixed', 'Unsure', 'Negative'] },
      { id: 'familiarity', text: 'How familiar are you with AI tools and capabilities? (1 = Unfamiliar → 5 = Expert)', options: ['1 – Unfamiliar', '2 – Heard of it', '3 – Know a bit', '4 – Experimented', '5 – Expert'] },
      { id: 'confidence',  text: 'How confident are you using AI in your daily work?',                               options: ['Somewhat confident', 'Confident', 'Very Confident'] },
      { id: 'importance',  text: 'How important is AI to your current role? (1 = Not at all → 5 = Essential)',       options: ['1', '2', '3', '4', '5'] },
      { id: 'frequency',   text: 'How often do you use AI tools?',                                                   options: ['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never'] },
      { id: 'stage',       text: 'Where are you on your personal AI adoption journey?',                              options: ['Curiosity', 'Understanding', 'Experimentation', 'Integration', 'Transformation'] },
      { id: 'barriers',    text: 'What are the biggest barriers preventing you from using AI more?',                 options: ['select all that apply'] },
      { id: 'tools',       text: 'Which AI tools have you used in the past 30 days?',                               options: ['select all that apply'] },
      { id: 'openEnded',   text: 'What are you currently using AI for in your work?',                               options: ['open text'] },
    ],
  },
  s3: {
    label: 'Survey 3', period: 'March 2026',
    questions: [
      { id: 'sentiment',   text: 'How do you feel about AI in your work right now?',                                 options: ['Positive', 'Mixed', 'Unsure', 'Negative'] },
      { id: 'familiarity', text: 'How familiar are you with AI tools and capabilities? (1 = Unfamiliar → 5 = Expert)', options: ['1 – Unfamiliar', '2 – Heard of it', '3 – Know a bit', '4 – Experimented', '5 – Expert'] },
      { id: 'confidence',  text: 'How confident are you using AI in your daily work?',                               options: ['Somewhat confident', 'Confident', 'Very Confident', 'Extremely Confident'] },
      { id: 'importance',  text: 'How important is AI to your current role? (1 = Not at all → 5 = Essential)',       options: ['1', '2', '3', '4', '5'] },
      { id: 'frequency',   text: 'How often do you use AI tools?',                                                   options: ['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never'] },
      { id: 'stage',       text: 'Where are you on your personal AI adoption journey?',                              options: ['Curiosity', 'Understanding', 'Experimentation', 'Integration', 'Transformation'] },
      { id: 'barriers',    text: 'What are the biggest barriers preventing you from using AI more?',                 options: ['select all that apply'] },
      { id: 'tools',       text: 'Which AI tools have you used in the past 30 days?',                               options: ['select all that apply'] },
      { id: 'benefits',    text: 'What benefits have you experienced from using AI in your work?',                   options: ['select all that apply'] },
      { id: 'ownPocket',   text: 'Are you paying out of pocket for AI tools not provided by Baptist Health?',        options: ['Yes', 'No'] },
      { id: 'momentum',    text: 'How would you describe AI adoption momentum in MarCom right now?',                 options: ['single choice'] },
    ],
  },
};

// ─── Shared question block wrapper ───────────────────────────────────────────
function QB({ label, question, children, fullWidth = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.36, ease: 'easeOut' }}
      style={{
        gridColumn: fullWidth ? '1 / -1' : undefined,
        background: 'var(--surface-green)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div>
        <span style={{ display: 'inline-block', fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 800, color: 'var(--accent-mint)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 4 }}>
          {label}
        </span>
        <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontStyle: 'italic', color: 'var(--text-support)', lineHeight: 1.6 }}>
          "{question}"
        </p>
      </div>
      {children}
    </motion.div>
  );
}

// ─── Visual 1: Sentiment pill cards ──────────────────────────────────────────
const SENT_STYLE = {
  'Positive': { color: C.green,  bg: 'rgba(46,168,74,0.12)',   border: 'rgba(46,168,74,0.28)' },
  'Mixed':    { color: C.yellow, bg: 'rgba(255,205,0,0.12)',   border: 'rgba(255,205,0,0.28)' },
  'Unsure':   { color: C.teal,   bg: 'rgba(89,190,201,0.12)',  border: 'rgba(89,190,201,0.28)' },
  'Negative': { color: C.red,    bg: 'rgba(229,85,79,0.10)',   border: 'rgba(229,85,79,0.22)' },
};

function SentimentPills({ distribution, label, question }) {
  const items = distribution.filter(d => d.count > 0);
  if (!items.length) return null;
  return (
    <QB label={label} question={question} fullWidth>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {items.map(d => {
          const s = SENT_STYLE[d.label] || SENT_STYLE['Unsure'];
          return (
            <div key={d.label} style={{ flex: '1 1 120px', minWidth: 100, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: '16px 18px' }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 34, fontWeight: 900, color: s.color, lineHeight: 1 }}>{d.pct}%</div>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600, color: 'var(--text-medium)', marginTop: 4 }}>{d.label}</div>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: 'var(--text-support)', marginTop: 2 }}>{d.count} respondents</div>
            </div>
          );
        })}
      </div>
    </QB>
  );
}

// ─── Visual 2: Score column tiles (green first → red last) ───────────────────
// For Familiarity and Importance — distribution already sorted high→low
function ScoreTiles({ distribution, label, question }) {
  if (!distribution?.length) return null;
  const maxPct = Math.max(...distribution.map(d => d.pct), 1);
  return (
    <QB label={label} question={question}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        {distribution.map((d, i) => {
          const color = rampColor(i, distribution.length);
          const h = 28 + ((d.pct / maxPct) * 60);
          return (
            <div key={d.label || d.score} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, minWidth: 0 }}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color, lineHeight: 1 }}>{d.pct}%</span>
              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: h }}
                viewport={{ once: true }}
                transition={{ duration: 0.42, delay: i * 0.055, ease: 'easeOut' }}
                style={{ width: '100%', background: color, opacity: 0.82, borderRadius: '5px 5px 0 0', minHeight: 6 }}
              />
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: 'var(--text-support)', textAlign: 'center', lineHeight: 1.3, wordBreak: 'break-word' }}>
                {d.label || `Score ${d.score}`}
              </span>
            </div>
          );
        })}
      </div>
    </QB>
  );
}

// ─── Visual 3: Donut chart (Confidence) ──────────────────────────────────────
// Shows confident vs not-confident split — few slices, color-coded
function DonutChart({ distribution, label, question }) {
  const theme = useTheme();
  if (!distribution?.length) return null;
  // Assign colors: best label first = green, worst = red
  const data = distribution.map((d, i) => ({
    name: d.label,
    value: d.pct,
    color: rampColor(i, distribution.length),
  }));
  const topItem = data[0];

  return (
    <QB label={label} question={question}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        {/* Donut */}
        <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
          <PieChart width={140} height={140}>
            <Pie
              data={data}
              cx={65}
              cy={65}
              innerRadius={42}
              outerRadius={62}
              paddingAngle={2}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} opacity={0.85} />
              ))}
            </Pie>
            <ReTooltip
              formatter={(v, name) => [`${v}%`, name]}
              contentStyle={{
                background: 'var(--surface-green)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 12,
              }}
            />
          </PieChart>
          {/* Center label */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 900, color: topItem.color, lineHeight: 1 }}>{topItem.value}%</span>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 9, color: 'var(--text-support)', marginTop: 2, textAlign: 'center', maxWidth: 52, lineHeight: 1.3 }}>{topItem.name}</span>
          </div>
        </div>
        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          {data.map(d => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--text-medium)', fontWeight: 500 }}>{d.name}</span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, color: d.color }}>{d.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </QB>
  );
}

// ─── Visual 4: Importance — horizontal color-coded bars ───────────────────────
// One bar per score level, color-coded green→red, label on left
function ImportanceBars({ distribution, label, question }) {
  if (!distribution?.length) return null;
  const maxPct = Math.max(...distribution.map(d => d.pct), 1);
  return (
    <QB label={label} question={question}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {distribution.map((d, i) => {
          const color = rampColor(i, distribution.length);
          return (
            <div key={d.label || d.score} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 60, flexShrink: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 600, color: 'var(--text-support)', textAlign: 'right' }}>
                {d.label || `Score ${d.score}`}
              </span>
              <div style={{ flex: 1, height: 22, background: 'rgba(125,230,155,0.06)', borderRadius: 5, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(d.pct / maxPct) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.44, delay: i * 0.05, ease: 'easeOut' }}
                  style={{ height: '100%', background: color, opacity: 0.82, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 7 }}
                >
                  {(d.pct / maxPct) > 0.2 && (
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 800, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.35)' }}>
                      {d.pct}%
                    </span>
                  )}
                </motion.div>
              </div>
              {(d.pct / maxPct) <= 0.2 && (
                <span style={{ width: 28, flexShrink: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color }}>{d.pct}%</span>
              )}
            </div>
          );
        })}
      </div>
    </QB>
  );
}

// ─── Visual 5: Frequency area/line chart ─────────────────────────────────────
// Daily → Weekly → Monthly → Rarely → Never as a continuous curve
const FREQ_ORDER = ['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never'];

function FrequencyArea({ distribution, label, question }) {
  const theme = useTheme();
  const isLight = theme === 'light';
  if (!distribution?.length) return null;

  const data = FREQ_ORDER
    .map(f => ({ name: f, pct: distribution.find(d => d.label === f)?.pct ?? 0 }))
    .filter((_, i, arr) => {
      // Drop trailing zeros
      const lastNonZero = arr.reduceRight((acc, d, idx) => (d.pct > 0 && acc === -1 ? idx : acc), -1);
      return i <= lastNonZero;
    });

  const axisStyle = { fill: isLight ? '#555a60' : '#797D80', fontSize: 11, fontFamily: 'DM Sans, sans-serif' };

  return (
    <QB label={label} question={question}>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={data} margin={{ top: 6, right: 16, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="freqGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={C.teal} stopOpacity={0.4} />
              <stop offset="95%" stopColor={C.teal} stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={isLight ? 'rgba(46,168,74,0.08)' : 'rgba(125,230,155,0.07)'} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={axisStyle} tickLine={false} axisLine={false} />
          <YAxis tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
          <ReTooltip
            formatter={v => [`${v}%`, 'Respondents']}
            contentStyle={{ background: 'var(--surface-green)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'DM Sans, sans-serif', fontSize: 12 }}
          />
          <Area type="monotone" dataKey="pct" stroke={C.teal} strokeWidth={2.5} fill="url(#freqGrad)"
            dot={{ r: 4, fill: C.teal, strokeWidth: 0 }} activeDot={{ r: 6 }} />
        </AreaChart>
      </ResponsiveContainer>
    </QB>
  );
}

// ─── Visual 6: Stage step display (Curiosity→Transformation, red→green) ──────
const STAGE_ORDER  = ['Curiosity', 'Understanding', 'Experimentation', 'Integration', 'Transformation'];
// Red = earliest/least advanced, Green = most advanced
const STAGE_COLORS = [C.red, C.yellow, C.teal, C.mint, C.green];

function StageSteps({ distribution, label, question }) {
  if (!distribution?.length) return null;
  const ordered = STAGE_ORDER.map((stage, i) => ({
    label: stage,
    color: STAGE_COLORS[i],
    ...(distribution.find(d => d.label === stage) || { pct: 0, count: 0 }),
  })).filter(d => d.count > 0);
  const maxPct = Math.max(...ordered.map(d => d.pct), 1);

  return (
    <QB label={label} question={question}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
        {ordered.map((d, i) => {
          const h = d.pct > 0 ? 26 + ((d.pct / maxPct) * 66) : 8;
          return (
            <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: d.pct > 0 ? d.color : 'var(--text-dim)' }}>
                {d.pct > 0 ? `${d.pct}%` : '—'}
              </span>
              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: h }}
                viewport={{ once: true }}
                transition={{ duration: 0.44, delay: i * 0.07, ease: 'easeOut' }}
                style={{ width: '100%', background: d.pct > 0 ? d.color : 'rgba(125,230,155,0.08)', opacity: d.pct > 0 ? 0.82 : 0.4, borderRadius: '5px 5px 0 0', minHeight: 6 }}
              />
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 9, fontWeight: 500, color: d.pct > 0 ? 'var(--text-medium)' : 'var(--text-dim)', textAlign: 'center', lineHeight: 1.3 }}>
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </QB>
  );
}

// ─── Visual 7: Ranked horizontal bar (barriers, tools, benefits, momentum) ────
function RankedBar({ distribution, label, question, color = C.teal, maxItems = 12, fullWidth = false }) {
  const items = (distribution || []).slice(0, maxItems);
  const maxPct = items[0]?.pct || 1;
  if (!items.length) return null;
  return (
    <QB label={label} question={question} fullWidth={fullWidth}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {items.map((d, i) => {
          const itemLabel = d.label || d.barrier || d.stage;
          return (
            <div key={itemLabel || i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 180, flexShrink: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 500, color: 'var(--text-medium)', textAlign: 'right', lineHeight: 1.35 }}>
                {itemLabel}
              </span>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 18, background: 'rgba(125,230,155,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(d.pct / maxPct) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.44, delay: i * 0.03, ease: 'easeOut' }}
                    style={{ height: '100%', background: color, opacity: 0.78, borderRadius: 4 }}
                  />
                </div>
                <span style={{ width: 32, flexShrink: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color }}>{d.pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </QB>
  );
}

// ─── Visual 8: Binary yes/no card ────────────────────────────────────────────
function BinaryCard({ yes, no, total, yesPct, noPct, label, question }) {
  return (
    <QB label={label} question={question}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1, background: 'rgba(229,85,79,0.10)', border: '1px solid rgba(229,85,79,0.22)', borderRadius: 10, padding: '16px 18px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 36, fontWeight: 900, color: C.red, lineHeight: 1 }}>{yesPct}%</div>
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: 'var(--text-support)', marginTop: 5 }}>Yes — {yes} of {total}</div>
        </div>
        <div style={{ flex: 1, background: 'rgba(125,230,155,0.08)', border: '1px solid rgba(125,230,155,0.18)', borderRadius: 10, padding: '16px 18px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 36, fontWeight: 900, color: C.mint, lineHeight: 1 }}>{noPct}%</div>
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: 'var(--text-support)', marginTop: 5 }}>No — {no} of {total}</div>
        </div>
      </div>
    </QB>
  );
}

// ─── Collapsible survey instrument ───────────────────────────────────────────
function SurveyArtifact({ wave }) {
  const [open, setOpen] = useState(false);
  const meta = SURVEY_META[wave];
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
      <button onClick={() => setOpen(v => !v)} style={{ width: '100%', background: 'var(--surface-green)', border: 'none', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: 'var(--text-support)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
          <FileText size={12} strokeWidth={1.75} style={{ color: 'var(--accent-mint)', opacity: 0.7 }} />
          View original survey instrument
        </span>
        {open ? <ChevronUp size={13} strokeWidth={2} style={{ color: 'var(--text-support)' }} /> : <ChevronDown size={13} strokeWidth={2} style={{ color: 'var(--text-support)' }} />}
      </button>
      {open && (
        <div style={{ background: 'var(--card-bg-dark)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: 'var(--text-support)' }}>{meta.label} · {meta.period}</p>
          {meta.questions.map((q, i) => (
            <div key={q.id} style={{ display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--accent-mint)', fontFamily: 'DM Sans, sans-serif', minWidth: 18, paddingTop: 2, flexShrink: 0 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <p style={{ margin: '0 0 5px', fontSize: 13, fontWeight: 600, color: 'var(--text-medium)', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5 }}>{q.text}</p>
                {!['open text', 'select all that apply', 'single choice'].includes(q.options[0]) ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 7px' }}>
                    {q.options.map(opt => (
                      <span key={opt} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: 'var(--text-support)', background: 'rgba(125,230,155,0.06)', border: '1px solid rgba(125,230,155,0.12)', borderRadius: 5, padding: '2px 7px' }}>{opt}</span>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: 11, fontStyle: 'italic', color: 'var(--text-dim)', fontFamily: 'DM Sans, sans-serif' }}>
                    {q.options[0] === 'open text' ? 'Open-ended' : q.options[0] === 'single choice' ? 'Single choice' : 'Select all that apply'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function SurveySnapshot({ wave, transforms }) {
  const {
    sentimentTrend, familiarityTrend, confidenceTrend, importanceTrend,
    frequencyTrend, barriersTrend, stageTrend,
    toolsS2, toolsS3, benefitsS3, ownPocketS3, momentumS3, responseCounts,
  } = transforms;

  const wIdx = { s1: 0, s2: 1, s3: 2 }[wave];
  const wKey = wave;
  const meta = SURVEY_META[wave];
  const rc   = responseCounts?.[wIdx];

  const sentimentDist   = (sentimentTrend ?? []).map(e => ({ label: e.sentiment, ...e[wKey] })).filter(d => d.count > 0);
  const familiarityDist = familiarityTrend?.[wIdx]?.distribution ?? [];
  const confidenceDist  = confidenceTrend?.[wIdx]?.distribution ?? [];
  const importanceDist  = importanceTrend?.[wIdx]?.distribution?.map(d => ({ label: `Score ${d.score}`, ...d })) ?? [];
  const frequencyDist   = frequencyTrend?.[wIdx]?.distribution ?? [];

  const barriersDist = (barriersTrend ?? [])
    .map(b => ({ label: b.barrier, ...b[wKey] }))
    .filter(b => b.count > 0)
    .sort((a, b) => b.count - a.count);

  const stageDist = (stageTrend ?? [])
    .map(e => ({ label: e.stage, ...e[wKey] }))
    .filter(e => e?.count > 0);

  const toolsDist = wave === 's2' ? (toolsS2 ?? []) : wave === 's3' ? (toolsS3 ?? []) : [];

  return (
    <div style={{ padding: '0 32px 80px', maxWidth: 1360, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
          <h2 style={{ margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{meta.label}</h2>
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--text-support)' }}>{meta.period}</span>
          {rc && (
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: 'var(--accent-mint)', background: 'rgba(125,230,155,0.10)', border: '1px solid rgba(125,230,155,0.20)', borderRadius: 20, padding: '2px 10px', letterSpacing: '0.05em' }}>
              {rc.n} responses
            </span>
          )}
        </div>
        <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--text-support)', lineHeight: 1.6 }}>
          How people actually answered each question in this wave — a clean snapshot of that moment in time.
        </p>
      </div>

      <SurveyArtifact wave={wave} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>

        {/* Sentiment — pill cards, full-width */}
        {sentimentDist.length > 0 && <SentimentPills distribution={sentimentDist} label="Sentiment" question="How do you feel about AI in your work right now?" />}

        {/* Familiarity — column tiles (green=Expert first) */}
        {familiarityDist.length > 0 && <ScoreTiles distribution={familiarityDist} label="AI Familiarity (1–5)" question="How familiar are you with AI tools and capabilities?" />}

        {/* Confidence — donut chart */}
        {confidenceDist.length > 0 && <DonutChart distribution={confidenceDist} label="Confidence" question="How confident are you using AI in your daily work?" />}

        {/* Importance — horizontal color bars */}
        {importanceDist.length > 0 && <ImportanceBars distribution={importanceDist} label="Importance to Role (1–5)" question="How important is AI to your current role?" />}

        {/* Frequency — area/line chart */}
        {frequencyDist.length > 0 && <FrequencyArea distribution={frequencyDist} label="Usage Frequency" question="How often do you use AI tools?" />}

        {/* Stage — step display, red→green (S2 + S3) */}
        {stageDist.length > 0 && <StageSteps distribution={stageDist} label="AI Journey Stage" question="Where are you on your personal AI adoption journey?" />}

        {/* Barriers — full-width, yellow (neutral/warning) */}
        {barriersDist.length > 0 && (
          <div style={{ gridColumn: '1 / -1' }}>
            <RankedBar distribution={barriersDist} label="Barriers" question="What are the biggest barriers preventing you from using AI more? (select all that apply)" color={C.yellow} maxItems={12} fullWidth />
          </div>
        )}

        {/* Tools — full-width, mint */}
        {toolsDist.length > 0 && (
          <div style={{ gridColumn: '1 / -1' }}>
            <RankedBar distribution={toolsDist} label="Tools Used" question="Which AI tools have you used in the past 30 days? (select all that apply)" color={C.mint} maxItems={14} fullWidth />
          </div>
        )}

        {/* Benefits — full-width, green */}
        {wave === 's3' && benefitsS3?.length > 0 && (
          <div style={{ gridColumn: '1 / -1' }}>
            <RankedBar distribution={benefitsS3} label="Benefits Experienced" question="What benefits have you experienced from using AI in your work? (select all that apply)" color={C.green} maxItems={12} fullWidth />
          </div>
        )}

        {/* Own Pocket — binary card (S3 only) */}
        {wave === 's3' && ownPocketS3 && <BinaryCard {...ownPocketS3} label="Personal Investment" question="Are you paying out of pocket for AI tools not provided by Baptist Health?" />}

        {/* Momentum — teal bars (S3 only) */}
        {wave === 's3' && momentumS3?.length > 0 && <RankedBar distribution={momentumS3} label="Department Momentum" question="How would you describe AI adoption momentum in MarCom right now?" color={C.teal} />}

      </div>
    </div>
  );
}
