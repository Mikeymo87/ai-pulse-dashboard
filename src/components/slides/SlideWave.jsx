import { motion } from 'framer-motion';

const WAVE_ACCENT = ['#59BEC9', '#2EA84A', '#7DE69B'];

const CHAPTERS = [
  {
    waveLabel: 'WAVE 01',
    dateRange: 'Jan 30 – Feb 10, 2025',
    title: 'The Baseline',
    narrative: `When we launched the first AI Pulse Survey in January 2025, just over half the team reported positive feelings about AI, and 42% were using it daily. Confidence averaged 3.6 out of 5 — solid, but with room to grow. Curiosity was the dominant theme: people were interested and experimenting, but barriers like limited training, access gaps, and uncertainty about what was allowed were still slowing adoption.`,
  },
  {
    waveLabel: 'WAVE 02',
    dateRange: 'Aug 27 – Sept 12, 2025',
    title: 'The Momentum',
    narrative: `By August, something had shifted. Daily usage nearly doubled — jumping from 42% to 85% — as AI moved from something team members explored to something they relied on. Positive sentiment climbed to 67%, and the range of tools in use expanded well beyond the company's endorsed subscriptions. Experimentation had given way to integration, and integration was starting to look like transformation.`,
  },
  {
    waveLabel: 'WAVE 03',
    dateRange: 'Mar 18 – Mar 30, 2026',
    title: 'The New Normal',
    narrative: `Fourteen months in, AI is woven into the daily rhythm of how this team works. 92% of respondents use it every day. Positive sentiment held strong at 69%, and confidence continued climbing. Role and function data shows exactly who is using AI and how deeply. A significant share of the team is spending their own money on AI tools — not because they were asked to, but because they're convinced it makes their work better.`,
  },
];

const CONFIDENCE_THRESHOLD = [4, 3, 3];

function hexToRgb(hex) {
  const c = hex.replace('#', '');
  return [parseInt(c.slice(0,2),16), parseInt(c.slice(2,4),16), parseInt(c.slice(4,6),16)].join(',');
}

function getConfPct(distribution, threshold) {
  return distribution.filter(d => d.score >= threshold).reduce((sum, d) => sum + d.pct, 0);
}

function MiniSentimentBar({ sentimentTrend, surveyKey }) {
  const pos    = sentimentTrend.find(e => e.sentiment === 'Positive')?.[surveyKey]?.pct ?? 0;
  const mixed  = sentimentTrend.find(e => e.sentiment === 'Mixed')?.[surveyKey]?.pct ?? 0;
  const neg    = sentimentTrend.find(e => e.sentiment === 'Negative')?.[surveyKey]?.pct ?? 0;
  const unsure = sentimentTrend.find(e => e.sentiment === 'Unsure')?.[surveyKey]?.pct ?? 0;

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{
        fontSize: 9,
        color: '#797D80',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom: 7,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      }}>
        Sentiment distribution
      </div>
      <div style={{ display: 'flex', borderRadius: 4, overflow: 'hidden', height: 6, gap: 1 }}>
        {pos    > 0 && <div title={`Positive ${pos}%`}   style={{ width: `${pos}%`,    background: '#2EA84A' }} />}
        {mixed  > 0 && <div title={`Mixed ${mixed}%`}    style={{ width: `${mixed}%`,  background: '#FFCD00' }} />}
        {neg    > 0 && <div title={`Negative ${neg}%`}   style={{ width: `${neg}%`,    background: '#E5554F' }} />}
        {unsure > 0 && <div title={`Unsure ${unsure}%`}  style={{ width: `${unsure}%`, background: '#797D80' }} />}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
        {[['#2EA84A', 'Positive', pos], ['#FFCD00', 'Mixed', mixed], ['#E5554F', 'Negative', neg], ['#797D80', 'Unsure', unsure]]
          .filter(([, , pct]) => pct > 0)
          .map(([color, label, pct]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: 2, background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: '#797D80', fontFamily: 'Inter, sans-serif' }}>
                {label} {pct}%
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

function StatPill({ value, label, accentColor, delta }) {
  return (
    <div style={{
      background: `rgba(${hexToRgb(accentColor)},0.07)`,
      border: `1px solid rgba(${hexToRgb(accentColor)},0.18)`,
      borderRadius: 10,
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7, marginBottom: 7, flexWrap: 'wrap' }}>
        <div style={{
          fontSize: 36,
          fontWeight: 900,
          color: accentColor,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          fontFamily: 'Inter, sans-serif',
        }}>
          {value}
        </div>
        {delta !== null && delta !== undefined && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
            fontSize: 11,
            fontWeight: 700,
            color: delta >= 0 ? '#2EA84A' : '#E5554F',
            background: delta >= 0 ? 'rgba(46,168,74,0.12)' : 'rgba(229,85,79,0.12)',
            border: `1px solid ${delta >= 0 ? 'rgba(46,168,74,0.25)' : 'rgba(229,85,79,0.25)'}`,
            borderRadius: 5,
            padding: '2px 6px',
            fontFamily: 'Inter, sans-serif',
            marginBottom: 5,
            flexShrink: 0,
          }}>
            {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}%
          </div>
        )}
      </div>
      <div style={{
        fontSize: 10,
        color: '#797D80',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        fontFamily: 'Inter, sans-serif',
        lineHeight: 1.3,
      }}>
        {label}
      </div>
    </div>
  );
}

export default function SlideWave({ transforms, wave }) {
  const chapter = CHAPTERS[wave];
  const accent  = WAVE_ACCENT[wave];

  const positive       = transforms.sentimentTrend.find(e => e.sentiment === 'Positive');
  const confidence     = transforms.confidenceTrend;
  const frequency      = transforms.frequencyTrend;
  const responseCounts = transforms.responseCounts;

  const posPcts   = [0, 1, 2].map(i => positive?.[`s${i+1}`]?.pct ?? 0);
  const dailyPcts = [0, 1, 2].map(i => frequency[i]?.distribution?.find(d => d.label === 'Daily')?.pct ?? 0);

  const i = wave;
  const posPct     = posPcts[i];
  const posDelta   = i > 0 ? posPcts[i] - posPcts[i - 1] : null;
  const confPct    = Math.round(getConfPct(confidence[i]?.distribution ?? [], CONFIDENCE_THRESHOLD[i]));
  const confPrev   = i > 0 ? Math.round(getConfPct(confidence[i-1]?.distribution ?? [], CONFIDENCE_THRESHOLD[i-1])) : null;
  const confDelta  = i > 0 ? confPct - confPrev : null;
  const dailyPct   = dailyPcts[i];
  const dailyDelta = i > 0 ? dailyPcts[i] - dailyPcts[i - 1] : null;
  const n          = responseCounts[i]?.n ?? 0;

  const pills = [
    { value: n,              label: 'Responses',          accentColor: accent, delta: null       },
    { value: `${posPct}%`,  label: 'Positive Sentiment', accentColor: accent, delta: posDelta   },
    { value: `${confPct}%`, label: 'Confident or Above', accentColor: accent, delta: confDelta  },
    { value: `${dailyPct}%`,label: 'Daily Usage',         accentColor: accent, delta: dailyDelta },
  ];

  if (i === 2) {
    const ownPocketPct    = transforms.ownPocketS3?.yesPct ?? 0;
    const acceleratingPct = transforms.momentumS3?.find(m => m.label === 'Accelerating')?.pct ?? 0;
    const topBenefitLabel = transforms.benefitsS3?.[0]?.label ?? 'Time Savings';
    const topBenefitPct   = transforms.benefitsS3?.[0]?.pct ?? 0;
    pills.push(
      { value: `${ownPocketPct}%`, label: 'Paying Own Pocket', accentColor: '#E5554F', delta: null },
      {
        value: acceleratingPct > 0 ? `${acceleratingPct}%` : `${topBenefitPct}%`,
        label: acceleratingPct > 0 ? 'See Momentum Accelerating' : topBenefitLabel,
        accentColor: '#7DE69B',
        delta: null,
      },
    );
  }

  const pillCols = pills.length > 4 ? 3 : 2;

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '36px 56px',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      {/* Header row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, flexShrink: 0 }}
      >
        <div style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 10,
          color: accent,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          flexShrink: 0,
        }}>
          {chapter.waveLabel}
        </div>

        <div style={{ width: 1, height: 16, background: `${accent}33`, flexShrink: 0 }} />

        <h2 style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 28,
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: '-0.02em',
          margin: 0,
          flexShrink: 0,
        }}>
          {chapter.title}
        </h2>

        <div style={{
          fontSize: 12,
          color: '#797D80',
          background: 'rgba(125,230,155,0.06)',
          border: '1px solid rgba(125,230,155,0.1)',
          borderRadius: 6,
          padding: '4px 10px',
          fontFamily: 'Inter, sans-serif',
          flexShrink: 0,
        }}>
          {chapter.dateRange}
        </div>
      </motion.div>

      {/* 2-column content */}
      <div style={{
        display: 'flex',
        gap: 48,
        flex: 1,
        alignItems: 'center',
        overflow: 'hidden',
        minHeight: 0,
      }}>
        {/* Left — narrative + sentiment bar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            flex: '0 0 52%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Left accent line */}
          <div style={{
            position: 'absolute',
            left: -20,
            top: 0,
            bottom: 0,
            width: 3,
            background: `linear-gradient(to bottom, ${accent}, transparent)`,
            borderRadius: 2,
          }} />

          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 15,
            color: '#c0c8d0',
            lineHeight: 1.75,
            margin: '0 0 0 8px',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 7,
            WebkitBoxOrient: 'vertical',
          }}>
            {chapter.narrative}
          </p>

          <div style={{ marginLeft: 8 }}>
            <MiniSentimentBar
              sentimentTrend={transforms.sentimentTrend}
              surveyKey={`s${i + 1}`}
            />
          </div>
        </motion.div>

        {/* Right — stat pills grid */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: `repeat(${pillCols}, 1fr)`,
            gap: 12,
            alignContent: 'center',
          }}
        >
          {pills.map((pill) => (
            <StatPill key={pill.label} {...pill} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
