import { motion } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ─── Shared axis / grid style ─────────────────────────────────────────────────
const axisStyle = { fill: '#797D80', fontSize: 11, fontFamily: 'Inter, sans-serif' };
const gridStyle = { stroke: 'rgba(125,230,155,0.07)', strokeDasharray: '3 3' };

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, suffix = '%' }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#1a1d1e',
        border: '1px solid rgba(125,230,155,0.35)',
        borderRadius: 10,
        padding: '10px 14px',
        fontFamily: 'Inter, sans-serif',
        fontSize: 12,
        color: '#e0e0e0',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      }}
    >
      <p style={{ color: '#7DE69B', fontWeight: 700, marginBottom: 6 }}>{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color, marginBottom: 2 }}>
          {entry.name}: <strong>{entry.value}{suffix}</strong>
        </p>
      ))}
    </div>
  );
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, tag, tagColor, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay, ease: 'easeOut' }}
      style={{
        background: 'rgba(29,77,82,0.35)',
        border: '1px solid rgba(125,230,155,0.15)',
        borderRadius: 16,
        padding: '22px 24px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      {/* Card header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <p style={{ color: '#e0e0e0', fontWeight: 700, fontSize: 15, margin: 0 }}>{title}</p>
          {subtitle && (
            <p style={{ color: '#797D80', fontSize: 11, margin: '3px 0 0', fontWeight: 400 }}>{subtitle}</p>
          )}
        </div>
        <span
          style={{
            background: tagColor || 'rgba(125,230,155,0.12)',
            color: tagColor ? '#1a1d1e' : '#7DE69B',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.06em',
            padding: '3px 9px',
            borderRadius: 20,
            whiteSpace: 'nowrap',
            marginLeft: 12,
            flexShrink: 0,
          }}
        >
          {tag}
        </span>
      </div>

      {children}
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function TrendCharts({ transforms }) {
  const {
    sentimentTrend,
    familiarityTrend,
    frequencyTrend,
    importanceTrend,
  } = transforms;

  // ── 1. Sentiment data: pivot sentimentTrend into per-period rows ──────────
  const sentimentData = ['Jan–Feb 2025', 'Aug–Sep 2025', 'Mar 2026'].map((period, i) => {
    const key = ['s1', 's2', 's3'][i];
    const row = { period };
    for (const entry of sentimentTrend) {
      row[entry.sentiment] = entry[key]?.pct ?? 0;
    }
    return row;
  });
  const showUnsure = sentimentData.some(d => (d['Unsure'] ?? 0) > 0);

  // ── 2. Familiarity data ───────────────────────────────────────────────────
  const familiarityData = familiarityTrend.map(s => ({
    period: s.period,
    'Avg Score': s.avg ?? 0,
  }));

  // ── 3. Frequency data: Daily % and Never % ────────────────────────────────
  const frequencyData = frequencyTrend.map(s => {
    const daily = s.distribution.find(d => d.label === 'Daily')?.pct ?? 0;
    const never = s.distribution.find(d => d.label === 'Never')?.pct ?? 0;
    return { period: s.period, 'Daily Use': daily, 'Never': never };
  });

  // ── 4. Importance data ────────────────────────────────────────────────────
  const importanceData = importanceTrend.map(s => ({
    period: s.period,
    'Avg Score': s.avg ?? 0,
  }));

  return (
    <section
      id="trends"
      style={{
        maxWidth: 1140,
        margin: '0 auto',
        padding: '80px 24px',
      }}
    >
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: 44, textAlign: 'center' }}
      >
        <p
          style={{
            color: '#7DE69B',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 10,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          14-Month Trend
        </p>
        <h2
          style={{
            color: '#e0e0e0',
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 900,
            margin: 0,
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.15,
          }}
        >
          The Trend Lines Tell the Story
        </h2>
      </motion.div>

      {/* 2×2 chart grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
          gap: 20,
        }}
      >
        {/* ── Chart 1: Sentiment Shift ───────────────────────────────────── */}
        <ChartCard
          title="Sentiment Shift"
          subtitle="How the team feels about AI — Positive, Mixed, Negative"
          tag="SENTIMENT"
          delay={0}
        >
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={sentimentData} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
              <CartesianGrid {...gridStyle} vertical={false} />
              <XAxis dataKey="period" tick={axisStyle} tickLine={false} axisLine={false} />
              <YAxis tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="Positive"
                stroke="#2EA84A"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#2EA84A', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Mixed"
                stroke="#FFCD00"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#FFCD00', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Negative"
                stroke="#E5554F"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#E5554F', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
              {showUnsure && (
                <Line
                  type="monotone"
                  dataKey="Unsure"
                  stroke="#59BEC9"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#59BEC9', strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ── Chart 2: AI Familiarity ────────────────────────────────────── */}
        <ChartCard
          title="AI Familiarity"
          subtitle="Average self-reported familiarity score (1–5 scale)"
          tag="FAMILIARITY"
          delay={0.1}
        >
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={familiarityData} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="familiarityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#59BEC9" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#59BEC9" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridStyle} vertical={false} />
              <XAxis dataKey="period" tick={axisStyle} tickLine={false} axisLine={false} />
              <YAxis
                tick={axisStyle}
                tickLine={false}
                axisLine={false}
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
              />
              <Tooltip content={<ChartTooltip suffix="" />} />
              <Area
                type="monotone"
                dataKey="Avg Score"
                stroke="#59BEC9"
                strokeWidth={2.5}
                fill="url(#familiarityGrad)"
                dot={{ r: 4, fill: '#59BEC9', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ── Chart 3: Frequency of Use ──────────────────────────────────── */}
        <ChartCard
          title="Frequency of Use"
          subtitle="Daily users growing, non-users declining"
          tag="FREQUENCY"
          delay={0.2}
        >
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={frequencyData} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
              <CartesianGrid {...gridStyle} vertical={false} />
              <XAxis dataKey="period" tick={axisStyle} tickLine={false} axisLine={false} />
              <YAxis tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="Daily Use"
                stroke="#7DE69B"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#7DE69B', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Never"
                stroke="#E5554F"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={{ r: 4, fill: '#E5554F', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ── Chart 4: Importance to Role ────────────────────────────────── */}
        <ChartCard
          title="Importance to Role"
          subtitle="Average rated importance of AI to their job (1–5 scale)"
          tag="IMPORTANCE"
          delay={0.3}
        >
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={importanceData} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="importanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2EA84A" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2EA84A" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridStyle} vertical={false} />
              <XAxis dataKey="period" tick={axisStyle} tickLine={false} axisLine={false} />
              <YAxis
                tick={axisStyle}
                tickLine={false}
                axisLine={false}
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
              />
              <Tooltip content={<ChartTooltip suffix="" />} />
              <Area
                type="monotone"
                dataKey="Avg Score"
                stroke="#2EA84A"
                strokeWidth={2.5}
                fill="url(#importanceGrad)"
                dot={{ r: 4, fill: '#2EA84A', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </section>
  );
}
