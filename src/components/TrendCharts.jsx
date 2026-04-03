import { motion } from 'framer-motion';
import {
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import StruggleMap from './StruggleMap';
import AdoptionCurve from './AdoptionCurve';
import AdoptionScorecard from './AdoptionScorecard';
import { useTheme } from '../hooks/useTheme';
import { useIsMobile } from '../hooks/useIsMobile';

// axisStyle / gridStyle are computed per-render in TrendCharts using useTheme

const questionStyle = {
  color: 'var(--text-support)',
  fontSize: 13,
  fontStyle: 'italic',
  margin: '6px 0 0',
  lineHeight: 1.55,
  fontFamily: 'DM Sans, sans-serif',
  fontWeight: 400,
};

const insightContainerStyle = {
  marginTop: 16,
  padding: '11px 16px',
  borderLeft: '3px solid rgba(125,230,155,0.55)',
  background: 'rgba(125,230,155,0.06)',
  borderRadius: '0 10px 10px 0',
};

const insightTextStyle = {
  color: 'var(--text-bridge)',
  fontSize: 13,
  fontStyle: 'italic',
  margin: 0,
  lineHeight: 1.7,
  fontFamily: 'DM Sans, sans-serif',
};

const insightLabelStyle = {
  color: 'var(--accent-mint)',
  fontWeight: 700,
  fontStyle: 'normal',
  marginRight: 6,
  letterSpacing: '0.02em',
};

// ─── Survey period → label mapping ───────────────────────────────────────────
const PERIOD_LABEL = {
  'Jan–Feb 2025': { survey: 'Survey 1', date: 'Jan–Feb 2025' },
  'Aug–Sep 2025': { survey: 'Survey 2', date: 'Aug–Sep 2025' },
  'Mar 2026':     { survey: 'Survey 3', date: 'Mar 2026' },
};

// ─── Custom two-line X-axis tick (Survey # + date) ────────────────────────────
function CustomXTick({ x, y, payload }) {
  const info = PERIOD_LABEL[payload.value] || { survey: payload.value, date: '' };
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0} y={0} dy={14}
        textAnchor="middle"
        fill="var(--chart-label)"
        fontSize={11}
        fontWeight={700}
        fontFamily="DM Sans, sans-serif"
      >
        {info.survey}
      </text>
      {info.date && (
        <text
          x={0} y={0} dy={26}
          textAnchor="middle"
          fill="var(--chart-subtext)"
          fontSize={9.5}
          fontFamily="DM Sans, sans-serif"
        >
          ({info.date})
        </text>
      )}
    </g>
  );
}

// ─── Dynamic Y-axis domain helper ─────────────────────────────────────────────
// Pads min/max of the data values and clamps to allowed range.
function autoDomain(values, pad, clampMin, clampMax) {
  const lo = Math.max(clampMin, parseFloat((Math.min(...values) - pad).toFixed(2)));
  const hi = Math.min(clampMax, parseFloat((Math.max(...values) + pad).toFixed(2)));
  return [lo, hi];
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, suffix = '%' }) {
  if (!active || !payload?.length) return null;
  // Show the friendly survey label in the tooltip header
  const info = PERIOD_LABEL[label];
  const header = info ? `${info.survey} (${info.date})` : label;
  return (
    <div
      style={{
        background: 'var(--tooltip-bg)',
        border: '1px solid rgba(125,230,155,0.35)',
        borderRadius: 10,
        padding: '10px 14px',
        fontFamily: 'DM Sans, sans-serif',
        fontSize: 12,
        color: 'var(--text-medium)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
      }}
    >
      <p style={{ color: 'var(--accent-mint)', fontWeight: 700, margin: '0 0 6px', letterSpacing: '0.02em' }}>{header}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color, margin: '2px 0' }}>
          {entry.name}: <strong>{entry.value}{suffix}</strong>
        </p>
      ))}
    </div>
  );
}

// ─── Chart Card ───────────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, question, tag, tagColor, insight, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay, ease: 'easeOut' }}
      style={{
        background: 'var(--surface-green)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '28px 32px 24px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 16, margin: 0, fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.01em' }}>
            {title}
          </p>
          {subtitle && (
            <p style={{ color: 'var(--text-support)', fontSize: 15, margin: '6px 0 0', fontWeight: 400, fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6 }}>
              {subtitle}
            </p>
          )}
          {question && <p style={questionStyle}>{question}</p>}
        </div>
        <span
          style={{
            background: tagColor || 'rgba(125,230,155,0.12)',
            color: tagColor ? '#1a1d1e' : 'var(--accent-mint)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.06em',
            padding: '3px 9px',
            borderRadius: 20,
            whiteSpace: 'nowrap',
            marginLeft: 12,
            flexShrink: 0,
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          {tag}
        </span>
      </div>

      {/* Chart */}
      {children}

      {/* Insight callout */}
      {insight && (
        <div style={insightContainerStyle}>
          <p style={insightTextStyle}>
            <span style={insightLabelStyle}>What this tells us:</span>
            {insight}
          </p>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function TrendCharts({ transforms }) {
  const theme = useTheme();
  const isLight = theme === 'light';
  const isMobile = useIsMobile();
  const axisStyle = { fill: isLight ? '#555a60' : '#797D80', fontSize: 12, fontFamily: 'DM Sans, sans-serif' };
  const gridStyle = { stroke: isLight ? 'rgba(46,168,74,0.09)' : 'rgba(125,230,155,0.07)', strokeDasharray: '3 3' };

  const { frequencyTrend, familiarityTrend } = transforms;

  // ── Frequency (Daily vs Never) — the "too dramatic to hide" chart ──────────
  const frequencyData = frequencyTrend.map(s => {
    const daily = s.distribution.find(d => d.label === 'Daily')?.pct ?? 0;
    const never = s.distribution.find(d => d.label === 'Never')?.pct ?? 0;
    return { period: s.period, 'Daily Use': daily, 'Never': never };
  });
  const s1Daily = frequencyData[0]?.['Daily Use'] ?? 0;
  const s3Daily = frequencyData[2]?.['Daily Use'] ?? 0;
  const s1Never = frequencyData[0]?.['Never'] ?? 0;
  const s3Never = frequencyData[2]?.['Never'] ?? 0;

  return (
    <section id="trends" style={{ maxWidth: 1360, margin: '0 auto', padding: isMobile ? '48px 16px' : '80px 32px' }}>

      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: 56, textAlign: 'center' }}
      >
        <p style={{
          color: 'var(--accent-mint)', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.13em', textTransform: 'uppercase',
          marginBottom: 12, fontFamily: 'DM Sans, sans-serif',
        }}>
          14-Month Trend
        </p>
        <h2 style={{
          color: 'var(--text-primary)', fontSize: 'clamp(30px, 4vw, 44px)',
          fontWeight: 800, margin: '0 0 16px', fontFamily: "'Plus Jakarta Sans', sans-serif",
          lineHeight: 1.1, letterSpacing: '-0.025em',
        }}>
          The Numbers Tell the Story
        </h2>
        <p style={{
          margin: 0, fontSize: 16, color: 'var(--text-support)',
          lineHeight: 1.65, fontFamily: 'DM Sans, sans-serif',
          maxWidth: 540, marginInline: 'auto',
        }}>
          Four key adoption metrics — plus the single number that changes every conversation.
        </p>
      </motion.div>

      {/* ── Adoption Scorecard — 4 expandable metric tiles ─────────────────── */}
      <AdoptionScorecard transforms={transforms} />

      {/* ── Divider before the hero chart ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{ margin: '52px 0 36px', display: 'flex', alignItems: 'center', gap: 16 }}
      >
        <div style={{ flex: 1, height: 1, background: 'rgba(125,230,155,0.15)' }} />
        <span style={{
          color: 'var(--accent-mint)', fontSize: 10, fontWeight: 700,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap',
        }}>
          The Number That Can't Be Hidden
        </span>
        <div style={{ flex: 1, height: 1, background: 'rgba(125,230,155,0.15)' }} />
      </motion.div>

      {/* ── Frequency of Use — hero full-width chart ──────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        style={{
          background: 'var(--surface-green)',
          border: '1px solid rgba(125,230,155,0.15)',
          borderTop: '4px solid var(--accent-mint)',
          borderRadius: 18,
          padding: isMobile ? '24px 16px 20px' : '36px 44px 32px',
        }}
      >
        {/* Card header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
            <div>
              <p style={{
                color: 'var(--accent-mint)',
                fontSize: 'clamp(28px, 3.5vw, 40px)',
                fontWeight: 800,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                letterSpacing: '-0.02em',
                lineHeight: 1,
                margin: '0 0 8px',
              }}>
                {s1Daily}% → {s3Daily}%
              </p>
              <p style={{
                color: 'var(--text-primary)',
                fontSize: 17,
                fontWeight: 500,
                fontFamily: 'DM Sans, sans-serif',
                letterSpacing: '0.015em',
                margin: '0 0 8px',
              }}>
                Daily AI use across the team — 14 months
              </p>
              <p style={{
                color: '#797D80',
                fontSize: 14,
                fontStyle: 'italic',
                fontFamily: 'DM Sans, sans-serif',
                margin: 0,
                lineHeight: 1.55,
              }}>
                "How often do you currently use AI tools in your work?"
              </p>
            </div>
            {/* Stat callout */}
            <div style={{
              flexShrink: 0,
              background: 'rgba(125,230,155,0.08)',
              border: '1px solid rgba(125,230,155,0.2)',
              borderRadius: 14,
              padding: '16px 24px',
              textAlign: 'center',
              minWidth: 130,
            }}>
              <p style={{
                color: 'var(--accent-mint)', fontSize: 32, fontWeight: 800,
                fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '0 0 4px', lineHeight: 1,
              }}>
                +{s3Daily - s1Daily}
              </p>
              <p style={{ color: '#797D80', fontSize: 13, margin: 0, fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.03em' }}>
                percentage points<br />in 14 months
              </p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="chart-scroll">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={frequencyData} margin={{ top: 4, right: 50, bottom: 20, left: -10 }}>
            <CartesianGrid {...gridStyle} vertical={false} />
            <XAxis dataKey="period" tick={<CustomXTick />} tickLine={false} axisLine={false} height={42} interval={0} />
            <YAxis tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="Daily Use" stroke="#7DE69B" strokeWidth={3}
              dot={{ r: 5, fill: '#7DE69B', strokeWidth: 0 }} activeDot={{ r: 7 }} />
            <Line type="monotone" dataKey="Never" stroke="#E5554F" strokeWidth={2}
              strokeDasharray="5 4" dot={{ r: 4, fill: '#E5554F', strokeWidth: 0 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
        </div>

        {/* Insight callout */}
        <div style={{
          marginTop: 20,
          padding: '12px 16px',
          borderLeft: '3px solid rgba(125,230,155,0.55)',
          background: 'rgba(125,230,155,0.06)',
          borderRadius: '0 10px 10px 0',
        }}>
          <p style={{
            color: 'var(--text-bridge)', fontSize: 13, fontStyle: 'italic',
            margin: 0, lineHeight: 1.7, fontFamily: 'DM Sans, sans-serif',
          }}>
            <span style={{ color: 'var(--accent-mint)', fontWeight: 700, fontStyle: 'normal', marginRight: 6, letterSpacing: '0.02em' }}>What this tells us:</span>
            {`Daily use climbed from ${s1Daily}% in Survey 1 to ${s3Daily}% today — a ${s3Daily - s1Daily}-point leap in 14 months. Respondents who never use AI dropped from ${s1Never}% to ${s3Never}%. This is organic adoption, not mandated compliance. The team moved itself.`}
          </p>
        </div>
      </motion.div>

      {/* ── Adoption Bell Curve (S1 → S2 → S3, shifting left) ───────────── */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
        style={{
          background: 'var(--surface-green)',
          border: '1px solid rgba(125,230,155,0.15)',
          borderRadius: 16,
          padding: isMobile ? '20px 16px 16px' : '28px 32px 24px',
          marginTop: 20,
        }}
      >
        <AdoptionCurve familiarityTrend={familiarityTrend} />
      </motion.div>

      {/* ── Struggle Map (full-width, below the stage flow) ──────────────── */}
      <StruggleMap transforms={transforms} />

    </section>
  );
}
