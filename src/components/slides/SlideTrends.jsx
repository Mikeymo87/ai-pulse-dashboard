import { motion } from 'framer-motion';
import {
  LineChart, Line,
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

// ─── Shared axis/grid styles ─────────────────────────────────────────────────
const axisStyle = { fill: '#797D80', fontSize: 10, fontFamily: 'DM Sans, sans-serif' };
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
      <text x={0} y={0} dy={13} textAnchor="middle" fill="#e0e0e0" fontSize={10} fontWeight={700} fontFamily="DM Sans, sans-serif">
        {info.survey}
      </text>
      {info.date && (
        <text x={0} y={0} dy={24} textAnchor="middle" fill="#797D80" fontSize={9} fontFamily="DM Sans, sans-serif">
          ({info.date})
        </text>
      )}
    </g>
  );
}

function autoDomain(values, pad, clampMin, clampMax) {
  const lo = Math.max(clampMin, parseFloat((Math.min(...values) - pad).toFixed(2)));
  const hi = Math.min(clampMax, parseFloat((Math.max(...values) + pad).toFixed(2)));
  return [lo, hi];
}

function ChartTooltip({ active, payload, label, suffix = '%' }) {
  if (!active || !payload?.length) return null;
  const info = PERIOD_LABEL[label];
  const header = info ? `${info.survey} (${info.date})` : label;
  return (
    <div style={{
      background: '#1a1d1e',
      border: '1px solid rgba(125,230,155,0.35)',
      borderRadius: 8,
      padding: '8px 12px',
      fontFamily: 'DM Sans, sans-serif',
      fontSize: 12,
      color: '#e0e0e0',
    }}>
      <p style={{ color: '#7DE69B', fontWeight: 700, margin: '0 0 5px' }}>{header}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color, margin: '1px 0' }}>
          {entry.name}: <strong>{entry.value}{suffix}</strong>
        </p>
      ))}
    </div>
  );
}

// ─── Chart definitions ───────────────────────────────────────────────────────
function buildCharts(transforms) {
  const {
    sentimentTrend, familiarityTrend, frequencyTrend,
    confidenceTrend, stageTrend, barriersTrend,
  } = transforms;

  const sentimentData = ['Jan–Feb 2025', 'Aug–Sep 2025', 'Mar 2026'].map((period, i) => {
    const key = ['s1', 's2', 's3'][i];
    const row = { period };
    for (const entry of sentimentTrend) row[entry.sentiment] = entry[key]?.pct ?? 0;
    return row;
  });
  const showUnsure = sentimentData.some(d => (d['Unsure'] ?? 0) > 0);
  const s1Pos = sentimentData[0]?.['Positive'] ?? 0;
  const s3Pos = sentimentData[2]?.['Positive'] ?? 0;
  const s1Neg = sentimentData[0]?.['Negative'] ?? 0;
  const s3Neg = sentimentData[2]?.['Negative'] ?? 0;

  const familiarityData = familiarityTrend.map(s => ({ period: s.period, 'Avg Score': s.avg ?? 0 }));
  const famDomain = autoDomain(familiarityData.map(d => d['Avg Score']), 0.25, 1, 5);
  const s1Fam = familiarityData[0]?.['Avg Score'] ?? 0;
  const s3Fam = familiarityData[2]?.['Avg Score'] ?? 0;

  const frequencyData = frequencyTrend.map(s => ({
    period: s.period,
    'Daily Use': s.distribution.find(d => d.label === 'Daily')?.pct ?? 0,
    'Never':     s.distribution.find(d => d.label === 'Never')?.pct ?? 0,
  }));
  const s1Daily = frequencyData[0]?.['Daily Use'] ?? 0;
  const s3Daily = frequencyData[2]?.['Daily Use'] ?? 0;
  const s1Never = frequencyData[0]?.['Never'] ?? 0;
  const s3Never = frequencyData[2]?.['Never'] ?? 0;

  const confidenceData = confidenceTrend.map(s => ({
    period: s.period,
    'Confident or Higher': s.distribution.filter(d => d.score >= 3).reduce((sum, d) => sum + d.pct, 0),
  }));
  const confDomain = autoDomain(confidenceData.map(d => d['Confident or Higher']), 5, 0, 100);
  const s1Conf = Math.round(confidenceData[0]?.['Confident or Higher'] ?? 0);
  const s3Conf = Math.round(confidenceData[2]?.['Confident or Higher'] ?? 0);

  const STAGE_SHORT = { Curiosity: 'Curiosity', Understanding: 'Understanding', Experimentation: 'Experiment.', Integration: 'Integration', Transformation: 'Transform.' };
  const stageData = stageTrend.map(e => ({
    stage: STAGE_SHORT[e.stage] || e.stage,
    'Survey 2': e.s2.pct,
    'Survey 3': e.s3.pct,
  }));
  const ADVANCED = ['Experimentation', 'Integration', 'Transformation'];
  const s2Adv = Math.round(stageTrend.filter(e => ADVANCED.includes(e.stage)).reduce((sum, e) => sum + e.s2.pct, 0));
  const s3Adv = Math.round(stageTrend.filter(e => ADVANCED.includes(e.stage)).reduce((sum, e) => sum + e.s3.pct, 0));

  const barriersData = [...barriersTrend]
    .filter(b => b.barrier !== 'No barriers')
    .sort((a, b) => (b.s3.pct - a.s3.pct) || (b.s2.pct - a.s2.pct))
    .slice(0, 5)
    .map(b => ({
      barrier: b.barrier,
      'S1': b.s1.pct,
      'S2': b.s2.pct,
      'S3': b.s3.pct,
    }));
  const topBarrier = [...barriersTrend].filter(b => b.barrier !== 'No barriers').sort((a,b) => b.s3.pct - a.s3.pct)[0];

  return {
    sentiment:   { data: sentimentData, showUnsure, s1Pos, s3Pos, s1Neg, s3Neg },
    frequency:   { data: frequencyData, s1Daily, s3Daily, s1Never, s3Never },
    familiarity: { data: familiarityData, famDomain, s1Fam, s3Fam },
    confidence:  { data: confidenceData, confDomain, s1Conf, s3Conf },
    journey:     { data: stageData, s2Adv, s3Adv },
    barriers:    { data: barriersData, topBarrier },
  };
}

function ChartBlock({ id, chartData, chartH }) {
  const { data: d } = chartData;

  const CONFIG = {
    sentiment: {
      title: 'Sentiment Shift',
      tag: 'SENTIMENT',
      tagColor: '#2EA84A',
      insight: `Positive: ${chartData.s1Pos}% → ${chartData.s3Pos}% · Negative: ${chartData.s1Neg}% → ${chartData.s3Neg}%`,
      chart: (
        <LineChart data={d} margin={{ top: 4, right: 6, bottom: 30, left: -14 }}>
          <CartesianGrid {...gridStyle} vertical={false} />
          <XAxis dataKey="period" tick={<CustomXTick />} tickLine={false} axisLine={false} height={42} interval={0} />
          <YAxis tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
          <Tooltip content={<ChartTooltip />} />
          <Line type="monotone" dataKey="Positive" stroke="#2EA84A" strokeWidth={2.5} dot={{ r: 4, fill: '#2EA84A', strokeWidth: 0 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="Mixed"    stroke="#FFCD00" strokeWidth={2.5} dot={{ r: 4, fill: '#FFCD00', strokeWidth: 0 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="Negative" stroke="#E5554F" strokeWidth={2.5} dot={{ r: 4, fill: '#E5554F', strokeWidth: 0 }} activeDot={{ r: 6 }} />
          {chartData.showUnsure && (
            <Line type="monotone" dataKey="Unsure" stroke="#59BEC9" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3, fill: '#59BEC9', strokeWidth: 0 }} />
          )}
        </LineChart>
      ),
    },
    frequency: {
      title: 'Frequency of Use',
      tag: 'FREQUENCY',
      tagColor: '#7DE69B',
      insight: `Daily use: ${chartData.s1Daily}% → ${chartData.s3Daily}% · Never: ${chartData.s1Never}% → ${chartData.s3Never}%`,
      chart: (
        <LineChart data={d} margin={{ top: 4, right: 6, bottom: 30, left: -14 }}>
          <CartesianGrid {...gridStyle} vertical={false} />
          <XAxis dataKey="period" tick={<CustomXTick />} tickLine={false} axisLine={false} height={42} interval={0} />
          <YAxis tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
          <Tooltip content={<ChartTooltip />} />
          <Line type="monotone" dataKey="Daily Use" stroke="#7DE69B" strokeWidth={2.5} dot={{ r: 4, fill: '#7DE69B', strokeWidth: 0 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="Never"     stroke="#E5554F" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 4, fill: '#E5554F', strokeWidth: 0 }} activeDot={{ r: 6 }} />
        </LineChart>
      ),
    },
    familiarity: {
      title: 'AI Familiarity',
      tag: 'FAMILIARITY',
      tagColor: '#59BEC9',
      insight: `Avg score: ${chartData.s1Fam?.toFixed(1)} → ${chartData.s3Fam?.toFixed(1)} / 5 (+${(chartData.s3Fam - chartData.s1Fam).toFixed(1)} over 14 months)`,
      chart: (
        <AreaChart data={d} margin={{ top: 4, right: 6, bottom: 30, left: -14 }}>
          <defs>
            <linearGradient id="famGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#59BEC9" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#59BEC9" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid {...gridStyle} vertical={false} />
          <XAxis dataKey="period" tick={<CustomXTick />} tickLine={false} axisLine={false} height={42} interval={0} />
          <YAxis tick={axisStyle} tickLine={false} axisLine={false} domain={chartData.famDomain} tickFormatter={v => v.toFixed(1)} />
          <Tooltip content={<ChartTooltip suffix="" />} />
          <Area type="monotone" dataKey="Avg Score" stroke="#59BEC9" strokeWidth={2.5} fill="url(#famGrad)" dot={{ r: 4, fill: '#59BEC9', strokeWidth: 0 }} activeDot={{ r: 6 }} />
        </AreaChart>
      ),
    },
    confidence: {
      title: 'Confidence Over Time',
      tag: 'CONFIDENCE',
      tagColor: '#FFCD00',
      insight: `Confident or higher: ${chartData.s1Conf}% → ${chartData.s3Conf}% (+${chartData.s3Conf - chartData.s1Conf}pp over 14 months)`,
      chart: (
        <AreaChart data={d} margin={{ top: 4, right: 6, bottom: 30, left: -14 }}>
          <defs>
            <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#FFCD00" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#FFCD00" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid {...gridStyle} vertical={false} />
          <XAxis dataKey="period" tick={<CustomXTick />} tickLine={false} axisLine={false} height={42} interval={0} />
          <YAxis tick={axisStyle} tickLine={false} axisLine={false} domain={chartData.confDomain} tickFormatter={v => `${Math.round(v)}%`} />
          <Tooltip content={<ChartTooltip />} />
          <Area type="monotone" dataKey="Confident or Higher" stroke="#FFCD00" strokeWidth={2.5} fill="url(#confGrad)" dot={{ r: 4, fill: '#FFCD00', strokeWidth: 0 }} activeDot={{ r: 6 }} />
        </AreaChart>
      ),
    },
    journey: {
      title: 'AI Journey Stage',
      tag: 'JOURNEY STAGE',
      tagColor: '#7DE69B',
      insight: `Experiment. or beyond: ${chartData.s2Adv}% (S2) → ${chartData.s3Adv}% (S3). The team is moving from learning to building.`,
      chart: (
        <BarChart data={d} margin={{ top: 4, right: 6, bottom: 4, left: -14 }}>
          <CartesianGrid {...gridStyle} vertical={false} />
          <XAxis dataKey="stage" tick={{ ...axisStyle, fontSize: 9 }} tickLine={false} axisLine={false} />
          <YAxis tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'DM Sans, sans-serif', color: '#797D80', paddingTop: 4 }} />
          <Bar dataKey="Survey 2" fill="#59BEC9" radius={[3, 3, 0, 0]} />
          <Bar dataKey="Survey 3" fill="#7DE69B" radius={[3, 3, 0, 0]} />
        </BarChart>
      ),
    },
    barriers: {
      title: 'Top 5 Barriers',
      tag: 'BARRIERS',
      tagColor: '#E5554F',
      insight: chartData.topBarrier
        ? `"${chartData.topBarrier.barrier}" is the top barrier — cited by ${chartData.topBarrier.s3.pct}% in Survey 3.`
        : 'Top barriers to AI adoption across all three surveys.',
      chart: (
        <BarChart data={d} layout="vertical" barSize={8} barCategoryGap="22%" margin={{ top: 4, right: 8, bottom: 0, left: 4 }}>
          <CartesianGrid {...gridStyle} horizontal={false} />
          <YAxis dataKey="barrier" type="category" tick={{ ...axisStyle, fontSize: 9 }} tickLine={false} axisLine={false} width={120} />
          <XAxis type="number" tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} domain={[0, 'auto']} />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'DM Sans, sans-serif', color: '#797D80', paddingTop: 4 }} />
          <Bar dataKey="S1" name="Survey 1" fill="#797D80" radius={[0, 3, 3, 0]} />
          <Bar dataKey="S2" name="Survey 2" fill="#59BEC9" radius={[0, 3, 3, 0]} />
          <Bar dataKey="S3" name="Survey 3" fill="#7DE69B" radius={[0, 3, 3, 0]} />
        </BarChart>
      ),
    },
  };

  const cfg = CONFIG[id];
  if (!cfg) return null;

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(29,77,82,0.22)',
      border: '1px solid rgba(125,230,155,0.1)',
      borderRadius: 14,
      padding: '18px 20px 14px',
      overflow: 'hidden',
      minWidth: 0,
    }}>
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexShrink: 0 }}>
        <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: '#e0e0e0' }}>
          {cfg.title}
        </p>
        <span style={{
          background: `${cfg.tagColor}20`,
          color: cfg.tagColor,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.07em',
          padding: '2px 8px',
          borderRadius: 20,
          fontFamily: 'DM Sans, sans-serif',
          flexShrink: 0,
        }}>
          {cfg.tag}
        </span>
      </div>

      {/* Chart */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          {cfg.chart}
        </ResponsiveContainer>
      </div>

      {/* Insight */}
      <div style={{
        marginTop: 10,
        padding: '8px 10px',
        borderLeft: '3px solid rgba(125,230,155,0.5)',
        background: 'rgba(125,230,155,0.05)',
        borderRadius: '0 6px 6px 0',
        flexShrink: 0,
      }}>
        <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: 'rgba(224,224,224,0.75)', lineHeight: 1.5, fontStyle: 'italic' }}>
          <span style={{ color: '#7DE69B', fontWeight: 700, fontStyle: 'normal', marginRight: 4 }}>Key takeaway:</span>
          {cfg.insight}
        </p>
      </div>
    </div>
  );
}

export default function SlideTrends({ transforms, charts }) {
  const allChartData = buildCharts(transforms);

  const LABEL_MAP = {
    'sentiment,frequency': 'TREND LINES — ADOPTION',
    'familiarity,confidence': 'TREND LINES — READINESS',
    'journey,barriers': 'TREND LINES — LANDSCAPE',
  };
  const key = charts.join(',');
  const sectionLabel = LABEL_MAP[key] || 'TREND LINES';

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '28px 40px 24px',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      {/* Section label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 10,
          color: '#7DE69B',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginBottom: 16,
          flexShrink: 0,
        }}
      >
        {sectionLabel}
      </motion.div>

      {/* Chart columns */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          flex: 1,
          display: 'flex',
          gap: 16,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {charts.map((chartId) => (
          <ChartBlock key={chartId} id={chartId} chartData={allChartData[chartId]} />
        ))}
      </motion.div>
    </div>
  );
}
