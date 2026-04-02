import { motion } from 'framer-motion';

const WAVE_ACCENT = ['#59BEC9', '#2EA84A', '#7DE69B'];

const CHAPTERS = [
  {
    waveLabel: 'Wave 01',
    dateRange: 'Jan 30 – Feb 10, 2025',
    title: 'The Baseline',
    eyebrow: 'Where the story begins',
    narrative: `When we launched the first AI Pulse Survey in January 2025, just over half the team reported positive feelings about AI, and 42% were using it daily. Confidence averaged 3.6 out of 5 — solid, but with real room to grow. Curiosity was the dominant theme: people were interested, experimenting, leaning in. But barriers like limited training, access gaps, and uncertainty about what was allowed were still slowing adoption down.`,
  },
  {
    waveLabel: 'Wave 02',
    dateRange: 'Aug 27 – Sept 12, 2025',
    title: 'The Momentum',
    eyebrow: 'Something shifts',
    narrative: `By August, something had shifted. Daily usage nearly doubled — jumping from 42% to 85% — as AI moved from something team members explored to something they relied on. Positive sentiment climbed to 67%, and the range of tools in use expanded well beyond the company's endorsed subscriptions. Experimentation had given way to integration, and integration was starting to look like transformation.`,
  },
  {
    waveLabel: 'Wave 03',
    dateRange: 'Mar 18 – Mar 30, 2026',
    title: 'The New Normal',
    eyebrow: '14 months in — this is who you are now',
    narrative: `Fourteen months in, AI is woven into the daily rhythm of how this team works. 92% of respondents use it every day. Positive sentiment held strong at 69%, and confidence continued climbing. A significant share of the team is spending their own money on AI tools — not because they were asked to, but because they're convinced it makes their work better. This is no longer an experiment. It's identity.`,
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

function SentimentBar({ sentimentTrend, surveyKey }) {
  const pos    = sentimentTrend.find(e => e.sentiment === 'Positive')?.[surveyKey]?.pct ?? 0;
  const mixed  = sentimentTrend.find(e => e.sentiment === 'Mixed')?.[surveyKey]?.pct ?? 0;
  const neg    = sentimentTrend.find(e => e.sentiment === 'Negative')?.[surveyKey]?.pct ?? 0;
  const unsure = sentimentTrend.find(e => e.sentiment === 'Unsure')?.[surveyKey]?.pct ?? 0;

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{
        fontSize: 10,
        color: '#797D80',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        marginBottom: 8,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      }}>
        Sentiment distribution
      </div>
      <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', height: 8, gap: 1 }}>
        {pos    > 0 && <div title={`Positive ${pos}%`}   style={{ width: `${pos}%`,    background: '#2EA84A', transition: 'width 0.6s ease' }} />}
        {mixed  > 0 && <div title={`Mixed ${mixed}%`}    style={{ width: `${mixed}%`,  background: '#FFCD00', transition: 'width 0.6s ease' }} />}
        {neg    > 0 && <div title={`Negative ${neg}%`}   style={{ width: `${neg}%`,    background: '#E5554F', transition: 'width 0.6s ease' }} />}
        {unsure > 0 && <div title={`Unsure ${unsure}%`}  style={{ width: `${unsure}%`, background: '#797D80', transition: 'width 0.6s ease' }} />}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
        {[['#2EA84A', 'Positive', pos], ['#FFCD00', 'Mixed', mixed], ['#E5554F', 'Negative', neg], ['#797D80', 'Unsure', unsure]]
          .filter(([, , pct]) => pct > 0)
          .map(([color, label, pct]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: 2, background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#9ca8b4', fontFamily: 'DM Sans, sans-serif' }}>
                {label} <strong style={{ color: '#e0e4e8' }}>{pct}%</strong>
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

function BigStat({ value, label, accentColor, delta, delay = 0 }) {
  const rgb = hexToRgb(accentColor);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      style={{
        background: `rgba(${rgb},0.06)`,
        border: `1px solid rgba(${rgb},0.15)`,
        borderTop: `3px solid ${accentColor}`,
        borderRadius: 12,
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
        <div style={{
          fontFamily: "'Plus Jakarta Sans', DM Sans, sans-serif",
          fontSize: 'clamp(40px, 4.5vw, 56px)',
          fontWeight: 900,
          color: accentColor,
          lineHeight: 1,
          letterSpacing: '-0.03em',
        }}>
          {value}
        </div>
        {delta !== null && delta !== undefined && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
            fontSize: 12,
            fontWeight: 700,
            color: delta >= 0 ? '#2EA84A' : '#E5554F',
            background: delta >= 0 ? 'rgba(46,168,74,0.12)' : 'rgba(229,85,79,0.12)',
            border: `1px solid ${delta >= 0 ? 'rgba(46,168,74,0.25)' : 'rgba(229,85,79,0.25)'}`,
            borderRadius: 6,
            padding: '3px 8px',
            fontFamily: 'DM Sans, sans-serif',
            marginBottom: 7,
            flexShrink: 0,
          }}>
            {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}%
          </div>
        )}
      </div>
      <div style={{
        fontSize: 11,
        color: '#797D80',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        fontFamily: 'DM Sans, sans-serif',
        lineHeight: 1.3,
      }}>
        {label}
      </div>
    </motion.div>
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
    { value: `${dailyPct}%`,  label: 'Daily Usage',         accentColor: accent,     delta: dailyDelta },
    { value: `${posPct}%`,   label: 'Positive Sentiment',  accentColor: accent,     delta: posDelta   },
    { value: `${confPct}%`,  label: 'Confident or Higher', accentColor: accent,     delta: confDelta  },
    { value: n,               label: 'Voices This Wave',   accentColor: '#797D80',  delta: null       },
  ];

  if (i === 2) {
    const ownPocketPct    = transforms.ownPocketS3?.yesPct ?? 0;
    const acceleratingPct = transforms.momentumS3?.find(m => m.label === 'Accelerating')?.pct ?? 0;
    pills.push(
      { value: `${ownPocketPct}%`, label: 'Paying Own Pocket',          accentColor: '#E5554F', delta: null },
      { value: acceleratingPct > 0 ? `${acceleratingPct}%` : '—', label: 'See Momentum Accelerating', accentColor: '#7DE69B', delta: null },
    );
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '40px 56px 36px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Ambient glow behind stats */}
      <div style={{
        position: 'absolute',
        right: '5%',
        top: '20%',
        width: 360,
        height: 360,
        borderRadius: '50%',
        background: `radial-gradient(ellipse, rgba(${hexToRgb(accent)},0.07) 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Wave badge + date */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginBottom: 20,
          flexShrink: 0,
        }}
      >
        <div style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 11,
          color: accent,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          background: `rgba(${hexToRgb(accent)},0.1)`,
          border: `1px solid rgba(${hexToRgb(accent)},0.25)`,
          borderRadius: 6,
          padding: '4px 10px',
        }}>
          {chapter.waveLabel}
        </div>
        <div style={{
          width: 1, height: 16,
          background: `rgba(${hexToRgb(accent)},0.25)`,
          flexShrink: 0,
        }} />
        <div style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 12,
          color: '#797D80',
          letterSpacing: '0.04em',
        }}>
          {chapter.dateRange}
        </div>
      </motion.div>

      {/* 2-column body */}
      <div style={{
        display: 'flex',
        gap: 52,
        flex: 1,
        overflow: 'hidden',
        minHeight: 0,
      }}>
        {/* Left — title + narrative + sentiment */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            flex: '0 0 50%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Vertical accent bar */}
          <div style={{
            position: 'absolute',
            left: -24,
            top: 0,
            bottom: 0,
            width: 3,
            background: `linear-gradient(to bottom, ${accent}, transparent 80%)`,
            borderRadius: 2,
          }} />

          {/* Eyebrow */}
          <div style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 10,
            color: `${accent}99`,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginBottom: 10,
          }}>
            {chapter.eyebrow}
          </div>

          {/* Giant title */}
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', DM Sans, sans-serif",
            fontSize: 'clamp(48px, 5.5vw, 68px)',
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '-0.03em',
            lineHeight: 1.0,
            margin: '0 0 22px',
          }}>
            {chapter.title}
          </h2>

          {/* Narrative */}
          <p style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 'clamp(14px, 1.5vw, 17px)',
            color: '#b8c4cc',
            lineHeight: 1.75,
            margin: '0',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 6,
            WebkitBoxOrient: 'vertical',
            flex: 1,
          }}>
            {chapter.narrative}
          </p>

          {/* Sentiment bar */}
          <SentimentBar
            sentimentTrend={transforms.sentimentTrend}
            surveyKey={`s${i + 1}`}
          />
        </motion.div>

        {/* Right — stat grid */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: pills.length > 4 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
            gap: 14,
            alignContent: 'center',
          }}
        >
          {pills.map((pill, idx) => (
            <BigStat key={pill.label} {...pill} delay={0.22 + idx * 0.06} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
