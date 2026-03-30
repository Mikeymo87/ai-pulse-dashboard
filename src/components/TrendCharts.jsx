import { motion } from 'framer-motion';
import {
  LineChart, Line,
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

// ─── Shared style constants ───────────────────────────────────────────────────
const axisStyle = { fill: '#797D80', fontSize: 11, fontFamily: 'Inter, sans-serif' };
const gridStyle = { stroke: 'rgba(125,230,155,0.07)', strokeDasharray: '3 3' };

const questionStyle = {
  color: 'rgba(121,125,128,0.75)',
  fontSize: 10,
  fontStyle: 'italic',
  margin: '4px 0 0',
  lineHeight: 1.4,
  fontFamily: 'Inter, sans-serif',
  fontWeight: 400,
};

const insightContainerStyle = {
  marginTop: 12,
  padding: '9px 12px',
  borderLeft: '3px solid rgba(125,230,155,0.55)',
  background: 'rgba(125,230,155,0.06)',
  borderRadius: '0 8px 8px 0',
};

const insightTextStyle = {
  color: 'rgba(224,224,224,0.80)',
  fontSize: 11,
  fontStyle: 'italic',
  margin: 0,
  lineHeight: 1.55,
  fontFamily: 'Inter, sans-serif',
};

const insightLabelStyle = {
  color: '#7DE69B',
  fontWeight: 700,
  fontStyle: 'normal',
  marginRight: 4,
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
        fill="#e0e0e0"
        fontSize={11}
        fontWeight={700}
        fontFamily="Inter, sans-serif"
      >
        {info.survey}
      </text>
      {info.date && (
        <text
          x={0} y={0} dy={26}
          textAnchor="middle"
          fill="#797D80"
          fontSize={9.5}
          fontFamily="Inter, sans-serif"
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
      <p style={{ color: '#7DE69B', fontWeight: 700, margin: '0 0 6px' }}>{header}</p>
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
        background: 'rgba(29,77,82,0.35)',
        border: '1px solid rgba(125,230,155,0.15)',
        borderRadius: 16,
        padding: '22px 24px 18px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: '#e0e0e0', fontWeight: 700, fontSize: 15, margin: 0, fontFamily: 'Inter, sans-serif' }}>
            {title}
          </p>
          {subtitle && (
            <p style={{ color: '#797D80', fontSize: 11, margin: '3px 0 0', fontWeight: 400, fontFamily: 'Inter, sans-serif' }}>
              {subtitle}
            </p>
          )}
          {question && <p style={questionStyle}>{question}</p>}
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
            fontFamily: 'Inter, sans-serif',
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

// ─── Stage label shortener ────────────────────────────────────────────────────
const STAGE_SHORT = {
  Curiosity: 'Curiosity',
  Understanding: 'Understanding',
  Experimentation: 'Experiment.',
  Integration: 'Integration',
  Transformation: 'Transform.',
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function TrendCharts({ transforms }) {
  const {
    sentimentTrend,
    familiarityTrend,
    frequencyTrend,
    importanceTrend,
    confidenceTrend,
    stageTrend,
    barriersTrend,
  } = transforms;

  // ── 1. Sentiment ─────────────────────────────────────────────────────────
  const sentimentData = ['Jan–Feb 2025', 'Aug–Sep 2025', 'Mar 2026'].map((period, i) => {
    const key = ['s1', 's2', 's3'][i];
    const row = { period };
    for (const entry of sentimentTrend) {
      row[entry.sentiment] = entry[key]?.pct ?? 0;
    }
    return row;
  });
  const showUnsure = sentimentData.some(d => (d['Unsure'] ?? 0) > 0);

  // ── 2. Familiarity avg ────────────────────────────────────────────────────
  const familiarityData = familiarityTrend.map(s => ({
    period: s.period,
    'Avg Score': s.avg ?? 0,
  }));
  const famDomain = autoDomain(familiarityData.map(d => d['Avg Score']), 0.25, 1, 5);

  // ── 3. Frequency (Daily vs Never) ─────────────────────────────────────────
  const frequencyData = frequencyTrend.map(s => {
    const daily = s.distribution.find(d => d.label === 'Daily')?.pct ?? 0;
    const never = s.distribution.find(d => d.label === 'Never')?.pct ?? 0;
    return { period: s.period, 'Daily Use': daily, 'Never': never };
  });

  // ── 4. Importance avg ────────────────────────────────────────────────────
  const importanceData = importanceTrend.map(s => ({
    period: s.period,
    'Avg Score': s.avg ?? 0,
  }));
  const impDomain = autoDomain(importanceData.map(d => d['Avg Score']), 0.25, 1, 5);

  // ── 5. Confidence — normalized to "Confident or Higher" (score >= 3) ─────
  const confidenceData = confidenceTrend.map(s => ({
    period: s.period,
    'Confident or Higher': s.distribution
      .filter(d => d.score >= 3)
      .reduce((sum, d) => sum + d.pct, 0),
  }));
  const confDomain = autoDomain(
    confidenceData.map(d => d['Confident or Higher']),
    5, 0, 100
  );

  // ── 6. Journey Stage (S2 vs S3 only) ─────────────────────────────────────
  const stageData = stageTrend.map(e => ({
    stage: STAGE_SHORT[e.stage] || e.stage,
    'Survey 2 (Aug–Sep 2025)': e.s2.pct,
    'Survey 3 (Mar 2026)': e.s3.pct,
  }));
  const advancedStages = ['Experimentation', 'Integration', 'Transformation'];
  const s2AdvancedPct = stageTrend
    .filter(e => advancedStages.includes(e.stage))
    .reduce((sum, e) => sum + e.s2.pct, 0);
  const s3AdvancedPct = stageTrend
    .filter(e => advancedStages.includes(e.stage))
    .reduce((sum, e) => sum + e.s3.pct, 0);

  // ── 7. Top 5 Barriers ────────────────────────────────────────────────────
  const barriersData = [...barriersTrend]
    .sort((a, b) => (b.s3.pct - a.s3.pct) || (b.s2.pct - a.s2.pct) || (b.s1.pct - a.s1.pct))
    .slice(0, 5)
    .map(b => ({
    barrier: b.barrier,
    'Survey 1 (Jan–Feb 2025)': b.s1.pct,
    'Survey 2 (Aug–Sep 2025)': b.s2.pct,
    'Survey 3 (Mar 2026)': b.s3.pct,
  }));
  const topBarrier = barriersData[0];

  // ── Computed insight values ────────────────────────────────────────────────
  const s1PosPct   = sentimentData[0]?.['Positive'] ?? 0;
  const s3PosPct   = sentimentData[2]?.['Positive'] ?? 0;
  const s1NegPct   = sentimentData[0]?.['Negative'] ?? 0;
  const s3NegPct   = sentimentData[2]?.['Negative'] ?? 0;

  const s1FamAvg   = familiarityData[0]?.['Avg Score'] ?? 0;
  const s3FamAvg   = familiarityData[2]?.['Avg Score'] ?? 0;
  const famChange  = (s3FamAvg - s1FamAvg).toFixed(1);

  const s1Daily    = frequencyData[0]?.['Daily Use'] ?? 0;
  const s3Daily    = frequencyData[2]?.['Daily Use'] ?? 0;
  const s1Never    = frequencyData[0]?.['Never'] ?? 0;
  const s3Never    = frequencyData[2]?.['Never'] ?? 0;

  const s1ImpAvg   = importanceData[0]?.['Avg Score'] ?? 0;
  const s3ImpAvg   = importanceData[2]?.['Avg Score'] ?? 0;
  const impChange  = (s3ImpAvg - s1ImpAvg).toFixed(1);

  const s1ConfPct  = confidenceData[0]?.['Confident or Higher'] ?? 0;
  const s3ConfPct  = confidenceData[2]?.['Confident or Higher'] ?? 0;

  return (
    <section id="trends" style={{ maxWidth: 1140, margin: '0 auto', padding: '80px 24px' }}>

      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: 44, textAlign: 'center' }}
      >
        <p style={{
          color: '#7DE69B', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          marginBottom: 10, fontFamily: 'Inter, sans-serif',
        }}>
          14-Month Trend
        </p>
        <h2 style={{
          color: '#e0e0e0', fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: 900, margin: 0, fontFamily: 'Inter, sans-serif', lineHeight: 1.15,
        }}>
          The Trend Lines Tell the Story
        </h2>
      </motion.div>

      {/* Chart grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 20 }}>

        {/* ── 1. Sentiment Shift ─────────────────────────────────────────── */}
        <ChartCard
          title="Sentiment Shift"
          subtitle="How the team feels about AI across all three surveys"
          question="How would you describe your current feelings about Artificial Intelligence (AI)?"
          tag="SENTIMENT"
          delay={0}
          insight={`Positive sentiment is at ${s3PosPct}% today — up from ${s1PosPct}% in Survey 1. Negative responses dropped from ${s1NegPct}% to ${s3NegPct}%. The team's relationship with AI has grown more optimistic with every wave.`}
        >
          <ResponsiveContainer width="100%" height={230}>
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
        </ChartCard>

        {/* ── 2. AI Familiarity ──────────────────────────────────────────── */}
        <ChartCard
          title="AI Familiarity"
          subtitle="Average self-reported familiarity score (1–5 scale)"
          question="How would you best describe your familiarity with AI tools and their applications in marketing & communications?"
          tag="FAMILIARITY"
          delay={0.1}
          insight={`Average familiarity is now ${s3FamAvg.toFixed(1)} out of 5 — up from ${s1FamAvg.toFixed(1)} in Survey 1, a +${famChange} point climb over 14 months. The team has moved from observers to practitioners, and that trajectory shows no sign of flattening.`}
        >
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={familiarityData} margin={{ top: 4, right: 8, bottom: 20, left: -10 }}>
              <defs>
                <linearGradient id="familiarityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#59BEC9" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#59BEC9" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridStyle} vertical={false} />
              <XAxis dataKey="period" tick={<CustomXTick />} tickLine={false} axisLine={false} height={42} interval={0} />
              <YAxis
                tick={axisStyle} tickLine={false} axisLine={false}
                domain={famDomain}
                tickFormatter={v => v.toFixed(1)}
              />
              <Tooltip content={<ChartTooltip suffix="" />} />
              <Area type="monotone" dataKey="Avg Score" stroke="#59BEC9" strokeWidth={2.5}
                fill="url(#familiarityGrad)" dot={{ r: 4, fill: '#59BEC9', strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ── 3. Frequency of Use ────────────────────────────────────────── */}
        <ChartCard
          title="Frequency of Use"
          subtitle="Daily users growing; non-users declining"
          question="How often do you currently use AI tools in your work?"
          tag="FREQUENCY"
          delay={0.2}
          insight={`Daily use climbed from ${s1Daily}% in Survey 1 to ${s3Daily}% today. Respondents who never use AI dropped from ${s1Never}% to ${s3Never}%. The gap between daily users and non-users is closing fast — a clear sign of organic adoption taking hold.`}
        >
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={frequencyData} margin={{ top: 4, right: 8, bottom: 20, left: -10 }}>
              <CartesianGrid {...gridStyle} vertical={false} />
              <XAxis dataKey="period" tick={<CustomXTick />} tickLine={false} axisLine={false} height={42} interval={0} />
              <YAxis tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="Daily Use" stroke="#7DE69B" strokeWidth={2.5}
                dot={{ r: 4, fill: '#7DE69B', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Never" stroke="#E5554F" strokeWidth={2}
                strokeDasharray="5 4" dot={{ r: 4, fill: '#E5554F', strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ── 4. Importance to Role ──────────────────────────────────────── */}
        <ChartCard
          title="Importance to Role"
          subtitle="Average rated importance of AI to their job (1–5 scale)"
          question="How important is AI to the success of your individual or team work over the next 12 months?"
          tag="IMPORTANCE"
          delay={0.3}
          insight={`Rated importance reached ${s3ImpAvg.toFixed(1)} out of 5 in Survey 3 — up from ${s1ImpAvg.toFixed(1)} in Survey 1, a +${impChange} point increase. The department no longer sees AI as optional. That conviction is the engine behind sustained adoption.`}
        >
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={importanceData} margin={{ top: 4, right: 8, bottom: 20, left: -10 }}>
              <defs>
                <linearGradient id="importanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2EA84A" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2EA84A" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridStyle} vertical={false} />
              <XAxis dataKey="period" tick={<CustomXTick />} tickLine={false} axisLine={false} height={42} interval={0} />
              <YAxis
                tick={axisStyle} tickLine={false} axisLine={false}
                domain={impDomain}
                tickFormatter={v => v.toFixed(1)}
              />
              <Tooltip content={<ChartTooltip suffix="" />} />
              <Area type="monotone" dataKey="Avg Score" stroke="#2EA84A" strokeWidth={2.5}
                fill="url(#importanceGrad)" dot={{ r: 4, fill: '#2EA84A', strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ── 5. Confidence Over Time ────────────────────────────────────── */}
        <ChartCard
          title="Confidence Over Time"
          subtitle="% rating themselves Confident or higher (normalized across survey scales)"
          question="How confident are you today in your ability to use AI tools effectively in your role?"
          tag="CONFIDENCE"
          delay={0.4}
          insight={`${s3ConfPct}% of the team now rates themselves Confident or higher — up from ${s1ConfPct}% in Survey 1. That ${s3ConfPct - s1ConfPct}-point gain matters: confidence is what turns occasional users into daily practitioners.`}
        >
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={confidenceData} margin={{ top: 4, right: 8, bottom: 20, left: -10 }}>
              <defs>
                <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFCD00" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FFCD00" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridStyle} vertical={false} />
              <XAxis dataKey="period" tick={<CustomXTick />} tickLine={false} axisLine={false} height={42} interval={0} />
              <YAxis
                tick={axisStyle} tickLine={false} axisLine={false}
                domain={confDomain}
                tickFormatter={v => `${Math.round(v)}%`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="Confident or Higher" stroke="#FFCD00" strokeWidth={2.5}
                fill="url(#confidenceGrad)" dot={{ r: 4, fill: '#FFCD00', strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ── 6. AI Journey Stage Shift ─────────────────────────────────── */}
        <ChartCard
          title="AI Journey Stage Shift"
          subtitle="Survey 2 vs. Survey 3 — S1 did not include this question"
          question="Which stage best describes your current progress on the AI journey?"
          tag="JOURNEY STAGE"
          delay={0.5}
          insight={`${s3AdvancedPct}% of respondents are now at the Experimentation stage or beyond — up from ${s2AdvancedPct}% in Survey 2. The team isn't just learning about AI anymore. They are building it into how they work.`}
        >
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={stageData} margin={{ top: 4, right: 8, bottom: 4, left: -10 }}>
              <CartesianGrid {...gridStyle} vertical={false} />
              <XAxis dataKey="stage" tick={{ ...axisStyle, fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'Inter, sans-serif', color: '#797D80', paddingTop: 8 }} />
              <Bar dataKey="Survey 2 (Aug–Sep 2025)" fill="#59BEC9" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Survey 3 (Mar 2026)" fill="#7DE69B" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ── 7. Top 5 Barriers ─────────────────────────────────────────── */}
        <ChartCard
          title="Top 5 Barriers"
          subtitle="What's blocking AI adoption — and is it improving?"
          question="What do you think are the biggest barriers to using AI effectively in your role?"
          tag="BARRIERS"
          delay={0.6}
          insight={topBarrier ? `"${topBarrier.barrier}" remains the #1 barrier, cited by ${topBarrier['Survey 3 (Mar 2026)']}% in Survey 3${topBarrier['Survey 1 (Jan–Feb 2025)'] !== topBarrier['Survey 3 (Mar 2026)'] ? ` vs. ${topBarrier['Survey 1 (Jan–Feb 2025)']}% in Survey 1` : ' — unchanged since Survey 1'}. These are solvable organizational problems. Targeted enablement can directly move the needle.` : ''}
        >
          <ResponsiveContainer width="100%" height={360}>
            <BarChart
              data={barriersData}
              layout="vertical"
              barSize={10}
              barCategoryGap="25%"
              margin={{ top: 4, right: 8, bottom: 0, left: 4 }}
            >
              <CartesianGrid {...gridStyle} horizontal={false} />
              <YAxis
                dataKey="barrier"
                type="category"
                tick={{ ...axisStyle, fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={140}
              />
              <XAxis
                type="number"
                tick={axisStyle}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => `${v}%`}
                domain={[0, 'auto']}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'Inter, sans-serif', color: '#797D80', paddingTop: 8 }} />
              <Bar dataKey="Survey 1 (Jan–Feb 2025)" fill="#797D80" radius={[0, 3, 3, 0]} />
              <Bar dataKey="Survey 2 (Aug–Sep 2025)" fill="#59BEC9" radius={[0, 3, 3, 0]} />
              <Bar dataKey="Survey 3 (Mar 2026)" fill="#7DE69B" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>
    </section>
  );
}
