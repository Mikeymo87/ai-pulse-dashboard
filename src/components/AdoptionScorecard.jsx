import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ─── Shared chart utilities ───────────────────────────────────────────────────
const axisStyle = { fill: '#797D80', fontSize: 11, fontFamily: 'DM Sans, sans-serif' };
const gridStyle = { stroke: 'rgba(125,230,155,0.07)', strokeDasharray: '3 3' };

const PERIOD_LABEL = {
  'Jan–Feb 2025': { survey: 'Survey 1', date: 'Jan–Feb 2025' },
  'Aug–Sep 2025': { survey: 'Survey 2', date: 'Aug–Sep 2025' },
  'Mar 2026':     { survey: 'Survey 3', date: 'Mar 2026' },
};

function CustomXTick({ x, y, payload }) {
  const info = PERIOD_LABEL[payload.value] || { survey: payload.value, date: '' };
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={14} textAnchor="middle" fill="#e0e0e0" fontSize={11} fontWeight={700} fontFamily="DM Sans, sans-serif">
        {info.survey}
      </text>
      {info.date && (
        <text x={0} y={0} dy={26} textAnchor="middle" fill="#797D80" fontSize={9.5} fontFamily="DM Sans, sans-serif">
          ({info.date})
        </text>
      )}
    </g>
  );
}

function ChartTooltip({ active, payload, label, suffix = '%' }) {
  if (!active || !payload?.length) return null;
  const info = PERIOD_LABEL[label];
  const header = info ? `${info.survey} (${info.date})` : label;
  return (
    <div style={{
      background: '#1a1d1e',
      border: '1px solid rgba(125,230,155,0.35)',
      borderRadius: 10,
      padding: '10px 14px',
      fontFamily: 'DM Sans, sans-serif',
      fontSize: 12,
      color: '#e0e0e0',
      boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
    }}>
      <p style={{ color: '#7DE69B', fontWeight: 700, margin: '0 0 6px' }}>{header}</p>
      {payload.map(entry => (
        <p key={entry.name} style={{ color: entry.color, margin: '2px 0' }}>
          {entry.name}: <strong>{entry.value}{suffix}</strong>
        </p>
      ))}
    </div>
  );
}

function autoDomain(values, pad, clampMin, clampMax) {
  const lo = Math.max(clampMin, parseFloat((Math.min(...values) - pad).toFixed(2)));
  const hi = Math.min(clampMax, parseFloat((Math.max(...values) + pad).toFixed(2)));
  return [lo, hi];
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ values, color }) {
  const W = 88, H = 64, padX = 8, padY = 10;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => ({
    x: padX + (i / (values.length - 1)) * (W - padX * 2),
    y: H - padY - ((v - min) / range) * (H - padY * 2),
  }));
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  return (
    <svg width={W} height={H + 16} style={{ overflow: 'visible' }}>
      {/* Area fill */}
      <path
        d={`${path} L${pts[pts.length - 1].x.toFixed(1)},${H} L${pts[0].x.toFixed(1)},${H} Z`}
        fill={color}
        fillOpacity={0.1}
      />
      {/* Line */}
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeOpacity={0.6} />
      {/* Dots */}
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x} cy={p.y}
          r={i === pts.length - 1 ? 4.5 : 3}
          fill={color}
          fillOpacity={i === pts.length - 1 ? 1 : 0.35}
        />
      ))}
      {/* Value labels above each dot */}
      {pts.map((p, i) => (
        <text
          key={`val-${i}`}
          x={p.x} y={p.y - 8}
          textAnchor="middle"
          fill={i === pts.length - 1 ? color : '#797D80'}
          fontSize={i === pts.length - 1 ? 9 : 8}
          fontWeight={i === pts.length - 1 ? 700 : 400}
          fontFamily="DM Sans, sans-serif"
          fillOpacity={i === pts.length - 1 ? 1 : 0.7}
        >
          {typeof values[i] === 'number' && values[i] % 1 !== 0 ? values[i].toFixed(1) : Math.round(values[i])}
        </text>
      ))}
      {/* S1/S2/S3 labels below */}
      {['S1', 'S2', 'S3'].map((lbl, i) => (
        <text
          key={lbl}
          x={pts[i].x} y={H + 13}
          textAnchor="middle"
          fill="#797D80"
          fontSize={8}
          fontFamily="DM Sans, sans-serif"
          letterSpacing="0.04em"
        >
          {lbl}
        </text>
      ))}
    </svg>
  );
}

// ─── Single scorecard tile ─────────────────────────────────────────────────────
function ScorecardTile({ label, tag, value, unit, delta, deltaLabel, sparkValues, color, delay, expandedChart }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      <div style={{
        background: 'rgba(29,77,82,0.35)',
        border: '1px solid rgba(125,230,155,0.12)',
        borderRadius: 18,
        overflow: 'hidden',
        // Colored top accent strip
        borderTop: `4px solid ${color}`,
      }}>
        {/* ── Tile body — two column layout ── */}
        <div style={{ padding: '26px 32px 22px', display: 'flex', alignItems: 'stretch', gap: 0 }}>

          {/* LEFT: metric identity */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

            {/* Metric label */}
            <span style={{
              color: '#797D80',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.11em',
              textTransform: 'uppercase',
              fontFamily: 'DM Sans, sans-serif',
              marginBottom: 12,
            }}>
              {label}
            </span>

            {/* Hero number */}
            <span style={{
              color,
              fontSize: 'clamp(44px, 4.2vw, 58px)',
              fontWeight: 800,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              lineHeight: 1,
              letterSpacing: '-0.025em',
              marginBottom: 6,
            }}>
              {value}
            </span>

            {/* Unit */}
            <span style={{
              color: 'rgba(224,224,224,0.45)',
              fontSize: 14,
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 400,
              marginBottom: 'auto',
              paddingBottom: 18,
            }}>
              {unit}
            </span>

            {/* Delta row — pinned to bottom */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{
                background: 'rgba(46,168,74,0.12)',
                border: '1px solid rgba(46,168,74,0.25)',
                borderRadius: 20,
                padding: '3px 10px',
                color: '#2EA84A',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.02em',
                fontFamily: 'DM Sans, sans-serif',
                whiteSpace: 'nowrap',
              }}>
                ↑ {delta}
              </span>
              <span style={{
                color: '#797D80',
                fontSize: 13,
                fontFamily: 'DM Sans, sans-serif',
              }}>
                {deltaLabel}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div style={{
            width: 1,
            background: 'rgba(125,230,155,0.08)',
            margin: '0 28px',
            flexShrink: 0,
          }} />

          {/* RIGHT: sparkline */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Sparkline values={sparkValues} color={color} />
          </div>
        </div>

        {/* ── Expand toggle ── */}
        <button
          onClick={() => setOpen(v => !v)}
          style={{
            width: '100%',
            padding: '12px 36px',
            background: open ? 'rgba(125,230,155,0.07)' : 'transparent',
            border: 'none',
            borderTop: '1px solid rgba(125,230,155,0.08)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 13,
            fontWeight: 600,
            color: '#7DE69B',
            letterSpacing: '0.03em',
            transition: 'background 0.2s',
            textAlign: 'left',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(125,230,155,0.11)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = open ? 'rgba(125,230,155,0.07)' : 'transparent'; }}
        >
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.22 }}
            style={{ display: 'inline-block', fontSize: 10 }}
          >
            ▼
          </motion.span>
          {open ? 'Hide trend chart' : 'View 3-survey trend ↓'}
        </button>

        {/* ── Expanded chart ── */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="chart"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.32, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                padding: '24px 36px 32px',
                borderTop: '1px solid rgba(125,230,155,0.06)',
              }}>
                {expandedChart}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────
export default function AdoptionScorecard({ transforms }) {
  const { sentimentTrend, familiarityTrend, importanceTrend, confidenceTrend } = transforms;

  // ── Sentiment ────────────────────────────────────────────────────────────────
  const sentimentData = ['Jan–Feb 2025', 'Aug–Sep 2025', 'Mar 2026'].map((period, i) => {
    const key = ['s1', 's2', 's3'][i];
    const row = { period };
    for (const entry of sentimentTrend) {
      row[entry.sentiment] = entry[key]?.pct ?? 0;
    }
    return row;
  });
  const posEntry = sentimentTrend.find(e => e.sentiment === 'Positive') || {};
  const s1Pos = posEntry.s1?.pct ?? 0;
  const s2Pos = posEntry.s2?.pct ?? 0;
  const s3Pos = posEntry.s3?.pct ?? 0;
  const showUnsure = sentimentData.some(d => (d['Unsure'] ?? 0) > 0);

  // ── Familiarity ──────────────────────────────────────────────────────────────
  const familiarityData = familiarityTrend.map(s => ({ period: s.period, 'Avg Score': s.avg ?? 0 }));
  const [s1Fam, s2Fam, s3Fam] = familiarityData.map(d => d['Avg Score']);
  const famDomain = autoDomain(familiarityData.map(d => d['Avg Score']), 0.25, 1, 5);

  // ── Importance ───────────────────────────────────────────────────────────────
  const importanceData = importanceTrend.map(s => ({ period: s.period, 'Avg Score': s.avg ?? 0 }));
  const [s1Imp, s2Imp, s3Imp] = importanceData.map(d => d['Avg Score']);
  const impDomain = autoDomain(importanceData.map(d => d['Avg Score']), 0.25, 1, 5);

  // ── Confidence ───────────────────────────────────────────────────────────────
  const confidenceData = confidenceTrend.map(s => ({
    period: s.period,
    'Confident or Higher': s.distribution.filter(d => d.score >= 3).reduce((sum, d) => sum + d.pct, 0),
  }));
  const [s1Conf, s2Conf, s3Conf] = confidenceData.map(d => d['Confident or Higher']);
  const confDomain = autoDomain(confidenceData.map(d => d['Confident or Higher']), 5, 0, 100);

  const tiles = [
    {
      label: 'Positive Sentiment',
      tag: 'Sentiment',
      value: `${s3Pos}%`,
      unit: 'of the team',
      delta: `${s3Pos - s1Pos} pts`,
      deltaLabel: 'gain since Survey 1',
      sparkValues: [s1Pos, s2Pos, s3Pos],
      color: '#2EA84A',
      delay: 0,
      expandedChart: (
        <>
          <p style={{ color: '#e0e0e0', fontWeight: 700, fontSize: 15, margin: '0 0 18px', fontFamily: 'DM Sans, sans-serif' }}>
            Sentiment Shift — Survey 1 → 2 → 3
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sentimentData} margin={{ top: 4, right: 8, bottom: 20, left: -10 }}>
              <CartesianGrid {...gridStyle} vertical={false} />
              <XAxis dataKey="period" tick={<CustomXTick />} tickLine={false} axisLine={false} height={42} interval={0} />
              <YAxis tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="Positive" stroke="#2EA84A" strokeWidth={2.5}
                dot={{ r: 4, fill: '#2EA84A', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Mixed" stroke="#FFCD00" strokeWidth={2.5}
                dot={{ r: 4, fill: '#FFCD00', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Negative" stroke="#E5554F" strokeWidth={2.5}
                dot={{ r: 4, fill: '#E5554F', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              {showUnsure && (
                <Line type="monotone" dataKey="Unsure" stroke="#59BEC9" strokeWidth={2}
                  strokeDasharray="4 4" dot={{ r: 3, fill: '#59BEC9', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </>
      ),
    },
    {
      label: 'AI Familiarity',
      tag: 'Familiarity',
      value: (s3Fam ?? 0).toFixed(1),
      unit: '/ 5.0 avg score',
      delta: `+${((s3Fam ?? 0) - (s1Fam ?? 0)).toFixed(1)} pts`,
      deltaLabel: 'average score gain since S1',
      sparkValues: [s1Fam ?? 0, s2Fam ?? 0, s3Fam ?? 0],
      color: '#59BEC9',
      delay: 0.1,
      expandedChart: (
        <>
          <p style={{ color: '#e0e0e0', fontWeight: 700, fontSize: 15, margin: '0 0 18px', fontFamily: 'DM Sans, sans-serif' }}>
            AI Familiarity — Survey 1 → 2 → 3
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={familiarityData} margin={{ top: 4, right: 8, bottom: 20, left: -10 }}>
              <defs>
                <linearGradient id="sc-famGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#59BEC9" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#59BEC9" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridStyle} vertical={false} />
              <XAxis dataKey="period" tick={<CustomXTick />} tickLine={false} axisLine={false} height={42} interval={0} />
              <YAxis tick={axisStyle} tickLine={false} axisLine={false} domain={famDomain} tickFormatter={v => v.toFixed(1)} />
              <Tooltip content={<ChartTooltip suffix="" />} />
              <Area type="monotone" dataKey="Avg Score" stroke="#59BEC9" strokeWidth={2.5}
                fill="url(#sc-famGrad)" dot={{ r: 4, fill: '#59BEC9', strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </>
      ),
    },
    {
      label: 'Confidence',
      tag: 'Confidence',
      value: `${Math.round(s3Conf ?? 0)}%`,
      unit: 'feel confident',
      delta: `+${Math.round((s3Conf ?? 0) - (s1Conf ?? 0))} pts`,
      deltaLabel: 'gain since Survey 1',
      sparkValues: [s1Conf ?? 0, s2Conf ?? 0, s3Conf ?? 0],
      color: '#FFCD00',
      delay: 0.2,
      expandedChart: (
        <>
          <p style={{ color: '#e0e0e0', fontWeight: 700, fontSize: 15, margin: '0 0 18px', fontFamily: 'DM Sans, sans-serif' }}>
            Confidence Over Time — Survey 1 → 2 → 3
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={confidenceData} margin={{ top: 4, right: 8, bottom: 20, left: -10 }}>
              <defs>
                <linearGradient id="sc-confGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFCD00" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FFCD00" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridStyle} vertical={false} />
              <XAxis dataKey="period" tick={<CustomXTick />} tickLine={false} axisLine={false} height={42} interval={0} />
              <YAxis tick={axisStyle} tickLine={false} axisLine={false} domain={confDomain} tickFormatter={v => `${Math.round(v)}%`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="Confident or Higher" stroke="#FFCD00" strokeWidth={2.5}
                fill="url(#sc-confGrad)" dot={{ r: 4, fill: '#FFCD00', strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </>
      ),
    },
    {
      label: 'Importance to Role',
      tag: 'Importance',
      value: (s3Imp ?? 0).toFixed(1),
      unit: '/ 5.0 avg score',
      delta: `+${((s3Imp ?? 0) - (s1Imp ?? 0)).toFixed(1)} pts`,
      deltaLabel: 'average score gain since S1',
      sparkValues: [s1Imp ?? 0, s2Imp ?? 0, s3Imp ?? 0],
      color: '#7DE69B',
      delay: 0.3,
      expandedChart: (
        <>
          <p style={{ color: '#e0e0e0', fontWeight: 700, fontSize: 15, margin: '0 0 18px', fontFamily: 'DM Sans, sans-serif' }}>
            Importance to Role — Survey 1 → 2 → 3
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={importanceData} margin={{ top: 4, right: 8, bottom: 20, left: -10 }}>
              <defs>
                <linearGradient id="sc-impGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2EA84A" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2EA84A" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridStyle} vertical={false} />
              <XAxis dataKey="period" tick={<CustomXTick />} tickLine={false} axisLine={false} height={42} interval={0} />
              <YAxis tick={axisStyle} tickLine={false} axisLine={false} domain={impDomain} tickFormatter={v => v.toFixed(1)} />
              <Tooltip content={<ChartTooltip suffix="" />} />
              <Area type="monotone" dataKey="Avg Score" stroke="#2EA84A" strokeWidth={2.5}
                fill="url(#sc-impGrad)" dot={{ r: 4, fill: '#2EA84A', strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </>
      ),
    },
  ];

  return (
    <div style={{ marginBottom: 0 }}>
      {/* Section label */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: 24 }}
      >
        <p style={{
          color: '#7DE69B', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.13em', textTransform: 'uppercase',
          margin: '0 0 8px', fontFamily: 'DM Sans, sans-serif',
        }}>
          Adoption Scorecard — Survey 3 Snapshot
        </p>
        <p style={{ color: '#797D80', fontSize: 15, margin: 0, fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6 }}>
          Four key metrics at a glance. Expand any tile to see the full 3-survey trend.
        </p>
      </motion.div>

      {/* 2×2 tile grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 24,
      }}>
        {tiles.map(tile => (
          <ScorecardTile key={tile.label} {...tile} />
        ))}
      </div>
    </div>
  );
}
