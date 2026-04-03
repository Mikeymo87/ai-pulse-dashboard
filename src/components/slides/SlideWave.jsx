import { motion } from 'framer-motion';

const MONO = "'JetBrains Mono', 'Fira Code', monospace";
const SANS = "'Plus Jakarta Sans', DM Sans, sans-serif";

const WAVE_ACCENT = ['#59BEC9', '#2EA84A', '#7DE69B'];

const CHAPTERS = [
  {
    waveLabel: 'Wave 01',
    dateRange: 'Jan 30 – Feb 10, 2025',
    eyebrow: 'Where the story begins',
    title: 'The Baseline',
    heroValue: '42%',
    heroLabel: 'Daily Usage — the starting point',
    narrative: `When we launched the first AI Pulse Survey in January 2025, just over half the team reported positive feelings about AI, and 42% were using it daily. Confidence averaged 3.6 out of 5 — solid, but with real room to grow. Curiosity was the dominant theme: people were interested and experimenting. But barriers like limited training, access gaps, and uncertainty about what was allowed were still slowing adoption down.`,
    thesis: 'In January 2025, the story began with an honest snapshot. The team was curious, engaged — and just barely getting started. Every number you see after this was built on that foundation.',
  },
  {
    waveLabel: 'Wave 02',
    dateRange: 'Aug 27 – Sept 12, 2025',
    eyebrow: 'Something irreversible happens',
    title: 'The Momentum',
    heroValue: '+43pp',
    heroLabel: 'Daily usage jump in 7 months',
    narrative: `By August, something had shifted. Daily usage nearly doubled — jumping from 42% to 85% — as AI moved from something team members explored to something they relied on. Positive sentiment climbed to 67%, and the range of tools in use expanded well beyond the company's endorsed subscriptions. Experimentation had given way to integration, and integration was starting to look like transformation.`,
    thesis: 'Between January and August, something irreversible happened. The tools that once felt experimental became essential. This is the slide that answers the question: when did this team decide?',
  },
  {
    waveLabel: 'Wave 03',
    dateRange: 'Mar 18 – Mar 30, 2026',
    eyebrow: '14 months in — this is who you are now',
    title: 'The New Normal',
    heroValue: '92%',
    heroLabel: 'Daily usage — 14 months later',
    narrative: `Fourteen months in, AI is woven into the daily rhythm of how this team works. 92% use it every day. Positive sentiment held strong at 69%, and confidence continued climbing. A significant share of the team is spending their own money on AI tools — not because they were asked to, but because they're convinced it makes their work better. This is no longer an experiment. It's identity.`,
    thesis: '92% daily. They didn\'t wait for permission — they decided. One in three is paying out of their own pocket to keep going. That\'s not compliance. That\'s conviction.',
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
    <div>
      <div style={{ fontSize: 9, color: '#797D80', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6, fontFamily: MONO }}>
        Sentiment distribution
      </div>
      <div style={{ display: 'flex', borderRadius: 4, overflow: 'hidden', height: 6, gap: 1 }}>
        {pos    > 0 && <div style={{ width: `${pos}%`,    background: '#2EA84A' }} />}
        {mixed  > 0 && <div style={{ width: `${mixed}%`,  background: '#FFCD00' }} />}
        {neg    > 0 && <div style={{ width: `${neg}%`,    background: '#E5554F' }} />}
        {unsure > 0 && <div style={{ width: `${unsure}%`, background: '#797D80' }} />}
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 6, flexWrap: 'wrap' }}>
        {[['#2EA84A','Positive',pos],['#FFCD00','Mixed',mixed],['#E5554F','Negative',neg],['#797D80','Unsure',unsure]]
          .filter(([,,p]) => p > 0)
          .map(([color, label, pct]) => (
            <span key={label} style={{ fontSize: 11, color: 'var(--text-bridge)', fontFamily: 'DM Sans, sans-serif' }}>
              <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: 2, background: color, marginRight: 5, verticalAlign: 'middle' }} />
              {label} <strong style={{ color: 'var(--text-medium)' }}>{pct}%</strong>
            </span>
          ))}
      </div>
    </div>
  );
}

function SupportStat({ value, label, accentColor, delta, delay = 0 }) {
  const rgb = hexToRgb(accentColor);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      style={{
        background: `rgba(${rgb},0.06)`,
        border: `1px solid rgba(${rgb},0.15)`,
        borderRadius: 10,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ fontFamily: SANS, fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 900, color: accentColor, lineHeight: 1, letterSpacing: '-0.03em' }}>
          {value}
        </div>
        {delta !== null && delta !== undefined && (
          <div style={{
            fontSize: 11, fontWeight: 700,
            color: delta >= 0 ? '#2EA84A' : '#E5554F',
            background: delta >= 0 ? 'rgba(46,168,74,0.12)' : 'rgba(229,85,79,0.12)',
            border: `1px solid ${delta >= 0 ? 'rgba(46,168,74,0.25)' : 'rgba(229,85,79,0.25)'}`,
            borderRadius: 5, padding: '2px 7px',
            fontFamily: 'DM Sans, sans-serif', marginBottom: 4, flexShrink: 0,
          }}>
            {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}%
          </div>
        )}
      </div>
      <div style={{ fontSize: 10, color: '#797D80', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'DM Sans, sans-serif' }}>
        {label}
      </div>
    </motion.div>
  );
}

export default function SlideWave({ transforms, wave }) {
  const chapter = CHAPTERS[wave];
  const accent  = WAVE_ACCENT[wave];
  const rgb     = hexToRgb(accent);

  const positive       = transforms.sentimentTrend.find(e => e.sentiment === 'Positive');
  const confidence     = transforms.confidenceTrend;
  const frequency      = transforms.frequencyTrend;
  const responseCounts = transforms.responseCounts;

  const posPcts   = [0, 1, 2].map(i => positive?.[`s${i+1}`]?.pct ?? 0);
  const dailyPcts = [0, 1, 2].map(i => frequency[i]?.distribution?.find(d => d.label === 'Daily')?.pct ?? 0);

  const i = wave;
  const posPct    = posPcts[i];
  const posDelta  = i > 0 ? posPcts[i] - posPcts[i - 1] : null;
  const confPct   = Math.round(getConfPct(confidence[i]?.distribution ?? [], CONFIDENCE_THRESHOLD[i]));
  const confPrev  = i > 0 ? Math.round(getConfPct(confidence[i-1]?.distribution ?? [], CONFIDENCE_THRESHOLD[i-1])) : null;
  const confDelta = i > 0 ? confPct - confPrev : null;
  const n         = responseCounts[i]?.n ?? 0;

  const supportStats = [
    { value: `${posPct}%`,  label: 'Positive Sentiment',  accentColor: accent,     delta: posDelta  },
    { value: `${confPct}%`, label: 'Confident or Higher', accentColor: accent,     delta: confDelta },
    { value: n,              label: 'Voices This Wave',   accentColor: '#797D80',  delta: null      },
  ];

  if (i === 2) {
    const ownPocketPct = transforms.ownPocketS3?.yesPct ?? 0;
    supportStats.push({ value: `${ownPocketPct}%`, label: 'Paying Own Pocket', accentColor: '#E5554F', delta: null });
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '28px 56px 24px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', right: '8%', top: '15%',
        width: 380, height: 380, borderRadius: '50%',
        background: `radial-gradient(ellipse, rgba(${rgb},0.08) 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* ── TOP BAND ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18, flexShrink: 0 }}
      >
        <div style={{
          fontFamily: MONO, fontSize: 11, color: accent,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          background: `rgba(${rgb},0.1)`, border: `1px solid rgba(${rgb},0.25)`,
          borderRadius: 6, padding: '4px 11px',
        }}>
          {chapter.waveLabel}
        </div>
        <div style={{ width: 1, height: 16, background: `rgba(${rgb},0.25)`, flexShrink: 0 }} />
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#797D80' }}>{chapter.dateRange}</div>
        <div style={{ width: 1, height: 16, background: 'rgba(128,128,128,0.2)', flexShrink: 0 }} />
        <div style={{ fontFamily: MONO, fontSize: 10, color: `rgba(${rgb},0.7)`, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          {chapter.eyebrow}
        </div>
      </motion.div>

      {/* ── HERO BAND ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 40,
        marginBottom: 18, flexShrink: 0,
        paddingBottom: 18,
        borderBottom: `1px solid rgba(${rgb},0.12)`,
      }}>
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 16 }}
        >
          <div style={{ width: 4, height: 68, background: `linear-gradient(to bottom, ${accent}, transparent)`, borderRadius: 2, flexShrink: 0 }} />
          <h2 style={{ fontFamily: SANS, fontSize: 'clamp(48px, 6vw, 72px)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.035em', lineHeight: 0.95, margin: 0 }}>
            {chapter.title}
          </h2>
        </motion.div>

        {/* Hero number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'right', flexShrink: 0 }}
        >
          <div style={{
            fontFamily: SANS, fontSize: 'clamp(68px, 8.5vw, 100px)',
            fontWeight: 900, color: accent, lineHeight: 0.95,
            letterSpacing: '-0.04em',
            textShadow: `0 0 60px rgba(${rgb},0.4), 0 0 120px rgba(${rgb},0.18)`,
          }}>
            {chapter.heroValue}
          </div>
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#797D80', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 5, textAlign: 'right' }}>
            {chapter.heroLabel}
          </div>
        </motion.div>
      </div>

      {/* ── CONTENT BAND ── */}
      <div style={{ display: 'flex', gap: 44, flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {/* Left: narrative + sentiment */}
        <motion.div
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.22 }}
          style={{ flex: '0 0 52%', display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}
        >
          <p style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 'clamp(13px, 1.4vw, 15px)',
            color: 'var(--text-bridge)', lineHeight: 1.8, margin: 0,
            flex: 1,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 5,
            WebkitBoxOrient: 'vertical',
          }}>
            {chapter.narrative}
          </p>
          <SentimentBar sentimentTrend={transforms.sentimentTrend} surveyKey={`s${i + 1}`} />
        </motion.div>

        {/* Right: supporting stats */}
        <motion.div
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.28 }}
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: supportStats.length > 3 ? 'repeat(2, 1fr)' : '1fr',
            gap: 10,
            alignContent: 'start',
          }}
        >
          {supportStats.map((s, idx) => (
            <SupportStat key={s.label} {...s} delay={0.32 + idx * 0.07} />
          ))}
        </motion.div>
      </div>

      {/* ── THESIS LINE ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.42 }}
        style={{
          marginTop: 14, flexShrink: 0,
          borderLeft: `3px solid rgba(${rgb},0.4)`,
          paddingLeft: 14,
        }}
      >
        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 13,
          color: 'var(--text-dim)',
          fontStyle: 'italic',
          lineHeight: 1.6,
          margin: 0,
        }}>
          {chapter.thesis}
        </p>
      </motion.div>
    </div>
  );
}
