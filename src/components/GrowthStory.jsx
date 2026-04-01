import { motion } from 'framer-motion';

// Wave accent colors ordered by story arc:
//   Wave 1 (Baseline)   = turquoise — neutral starting point
//   Wave 2 (Momentum)   = BH green  — positive / growing
//   Wave 3 (New Normal) = mint      — peak highlight
const WAVE_ACCENT = ['#59BEC9', '#2EA84A', '#7DE69B'];

const CHAPTERS = [
  {
    waveLabel: 'WAVE 01',
    dateRange: 'Jan 30 – Feb 10, 2025',
    watermark: '01',
    title: 'The Baseline',
    narrative: `When we launched the first AI Pulse Survey in January 2025, just over half the team reported positive feelings about AI, and 42% were using it daily. Confidence averaged 3.6 out of 5 — solid, but with room to grow. Curiosity was the dominant theme: people were interested and experimenting, but barriers like limited training, access gaps, and uncertainty about what was allowed were still slowing adoption.`,
  },
  {
    waveLabel: 'WAVE 02',
    dateRange: 'Aug 27 – Sept 12, 2025',
    watermark: '02',
    title: 'The Momentum',
    narrative: `By August, something had shifted. Daily usage nearly doubled — jumping from 42% to 85% — as AI moved from something team members explored to something they relied on. Positive sentiment climbed to 67%, and the range of tools in use expanded well beyond the company's endorsed subscriptions. The introduction of AI journey stages in this survey told a nuanced story: experimentation had given way to integration, and integration was starting to look like transformation.`,
  },
  {
    waveLabel: 'WAVE 03',
    dateRange: 'Mar 18 – Mar 30, 2026',
    watermark: '03',
    title: 'The New Normal',
    narrative: `Fourteen months in, AI is woven into the daily rhythm of how this team works. 92% of respondents use it every day — a figure that would have seemed ambitious at the start. Positive sentiment held strong at 69%, and confidence continued climbing. Survey 3 introduced new questions that revealed the full picture: for the first time, role and function data shows exactly who is using AI and how deeply. Benefits data confirms that time savings and quality improvements are the top outcomes. And one number stands above the rest — a significant share of the team is spending their own money on AI tools, not because they were asked to, but because they're convinced it makes their work better.`,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const c = hex.replace('#', '');
  return [parseInt(c.slice(0,2),16), parseInt(c.slice(2,4),16), parseInt(c.slice(4,6),16)].join(',');
}

// Minimum score that maps to "Confident" per survey scale:
//   S1: score 4 = "Confident" (scale tops at 5 = "Very Confident")
//   S2: score 3 = "Confident" (scale tops at 4 = "Very Confident")
//   S3: score 3 = "Confident" (scale tops at 5 = "Extremely Confident")
const CONFIDENCE_THRESHOLD = [4, 3, 3];

function getConfidentOrAbovePct(distribution, threshold) {
  return distribution
    .filter(d => d.score >= threshold)
    .reduce((sum, d) => sum + d.pct, 0);
}

// ── Mini sentiment distribution bar ──────────────────────────────────────────
function MiniSentimentBar({ sentimentTrend, surveyKey }) {
  const pos    = sentimentTrend.find(e => e.sentiment === 'Positive')?.[surveyKey]?.pct ?? 0;
  const mixed  = sentimentTrend.find(e => e.sentiment === 'Mixed')?.[surveyKey]?.pct ?? 0;
  const neg    = sentimentTrend.find(e => e.sentiment === 'Negative')?.[surveyKey]?.pct ?? 0;
  const unsure = sentimentTrend.find(e => e.sentiment === 'Unsure')?.[surveyKey]?.pct ?? 0;

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{
        fontSize: 10,
        color: '#797D80',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom: 8,
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
      <div style={{ display: 'flex', gap: 14, marginTop: 7, flexWrap: 'wrap' }}>
        {[['#2EA84A', 'Positive', pos], ['#FFCD00', 'Mixed', mixed], ['#E5554F', 'Negative', neg], ['#797D80', 'Unsure', unsure]].map(([color, label, pct]) =>
          pct > 0 ? (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: 2, background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: '#797D80', fontFamily: 'Inter, sans-serif' }}>
                {label} {pct}%
              </span>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}

// ── Stat pill with optional delta badge ───────────────────────────────────────
function StatPill({ value, label, accentColor, delta }) {
  return (
    <div style={{
      background: `rgba(${hexToRgb(accentColor)},0.08)`,
      border: `1px solid rgba(${hexToRgb(accentColor)},0.2)`,
      borderRadius: 12,
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
    }}>
      {/* Large number + inline delta */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
        marginBottom: 9,
        flexWrap: 'wrap',
      }}>
        <div style={{
          fontSize: 44,
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
            gap: 3,
            fontSize: 12,
            fontWeight: 700,
            color: delta >= 0 ? '#2EA84A' : '#E5554F',
            background: delta >= 0 ? 'rgba(46,168,74,0.12)' : 'rgba(229,85,79,0.12)',
            border: `1px solid ${delta >= 0 ? 'rgba(46,168,74,0.25)' : 'rgba(229,85,79,0.25)'}`,
            borderRadius: 6,
            padding: '3px 8px',
            fontFamily: 'Inter, sans-serif',
            marginBottom: 7,
            flexShrink: 0,
          }}>
            {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}%
          </div>
        )}
      </div>
      <div style={{
        fontSize: 11,
        color: 'var(--text-support)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        fontFamily: 'Inter, sans-serif',
      }}>
        {label}
      </div>
    </div>
  );
}

// ── Connector line between wave cards ─────────────────────────────────────────
function ConnectorLine() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 60 }}>
      <div style={{
        width: 1,
        flex: 1,
        background: 'linear-gradient(to bottom, rgba(46,168,74,0.3), rgba(125,230,155,0.2))',
      }} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
// presentationWave: when 0/1/2, show only that chapter (no section header)
export default function GrowthStory({ transforms, presentationWave }) {
  const positive       = transforms.sentimentTrend.find(e => e.sentiment === 'Positive');
  const confidence     = transforms.confidenceTrend;
  const frequency      = transforms.frequencyTrend;
  const responseCounts = transforms.responseCounts;
  const sentimentTrend = transforms.sentimentTrend;

  // Pre-compute per-survey values for delta calculations
  const posPcts   = [positive?.s1?.pct ?? 0, positive?.s2?.pct ?? 0, positive?.s3?.pct ?? 0];
  const dailyPcts = [0, 1, 2].map(i => frequency[i]?.distribution?.find(d => d.label === 'Daily')?.pct ?? 0);

  // Wave 3 new-question metrics
  const ownPocketPct     = transforms.ownPocketS3?.yesPct ?? 0;
  const acceleratingPct  = transforms.momentumS3?.find(m => m.label === 'Accelerating')?.pct ?? 0;
  const topBenefitLabel  = transforms.benefitsS3?.[0]?.label ?? 'Time Savings';
  const topBenefitPct    = transforms.benefitsS3?.[0]?.pct ?? 0;

  function getStats(i) {
    const accent      = WAVE_ACCENT[i];
    const n           = responseCounts[i]?.n ?? 0;
    const posPct      = posPcts[i];
    const posDelta    = i > 0 ? posPcts[i] - posPcts[i - 1] : null;
    const confPct     = getConfidentOrAbovePct(confidence[i]?.distribution ?? [], CONFIDENCE_THRESHOLD[i]);
    const confPrevPct = i > 0 ? getConfidentOrAbovePct(confidence[i - 1]?.distribution ?? [], CONFIDENCE_THRESHOLD[i - 1]) : null;
    const confDelta   = i > 0 ? confPct - confPrevPct : null;
    const dailyPct    = dailyPcts[i];
    const dailyDelta  = i > 0 ? dailyPcts[i] - dailyPcts[i - 1] : null;

    const base = [
      { value: n,              label: 'Responses',          accentColor: accent, delta: null       },
      { value: `${posPct}%`,  label: 'Positive Sentiment', accentColor: accent, delta: posDelta   },
      { value: `${confPct}%`, label: 'Confident or Above', accentColor: accent, delta: confDelta  },
      { value: `${dailyPct}%`,label: 'Daily Usage',         accentColor: accent, delta: dailyDelta },
    ];

    // Wave 3 only: two additional pills for new survey questions
    if (i === 2) {
      base.push(
        {
          value: `${ownPocketPct}%`,
          label: 'Paying Own Pocket',
          accentColor: '#E5554F',
          delta: null,
        },
        {
          value: acceleratingPct > 0 ? `${acceleratingPct}%` : `${topBenefitPct}%`,
          label: acceleratingPct > 0 ? 'See Momentum Accelerating' : topBenefitLabel,
          accentColor: '#7DE69B',
          delta: null,
        },
      );
    }

    return base;
  }

  // In presentation mode, show only the requested wave; otherwise show all.
  const indicesToShow = (presentationWave !== undefined && presentationWave !== null)
    ? [presentationWave]
    : [0, 1, 2];

  return (
    <section style={{
      padding: presentationWave !== undefined && presentationWave !== null ? '48px 48px' : '80px 48px',
      maxWidth: 1100,
      margin: '0 auto',
      boxSizing: 'border-box',
      width: '100%',
    }}>
      {/* Section header — hidden in presentation mode (single-wave slides) */}
      {(presentationWave === undefined || presentationWave === null) && (
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <div style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 11,
            color: '#7DE69B',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            01  —  The Journey
          </div>
          <h2 style={{
            fontSize: 40,
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            margin: 0,
            fontFamily: 'Inter, sans-serif',
          }}>
            Three Waves, One Story
          </h2>
          <p style={{
            color: 'var(--text-support)',
            fontSize: 15,
            marginTop: 12,
            fontFamily: 'Inter, sans-serif',
          }}>
            How AI adoption evolved across Baptist Health MarCom
          </p>
        </div>
      )}

      {/* Wave chapters */}
      {indicesToShow.map((i) => {
        const chapter = CHAPTERS[i];
        const accent  = WAVE_ACCENT[i];
        const stats   = getStats(i);

        return (
          <div key={chapter.waveLabel}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
              viewport={{ once: true, amount: 0.15 }}
              style={{
                background: 'rgba(29,77,82,0.22)',
                borderLeft: `3px solid ${accent}`,
                borderTopLeftRadius: 4,
                borderBottomLeftRadius: 4,
                borderTopRightRadius: 20,
                borderBottomRightRadius: 20,
                padding: 48,
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                gap: 64,
                alignItems: 'flex-start',
                boxShadow: '0 2px 40px rgba(0,0,0,0.35)',
              }}
            >
              {/* Watermark number */}
              <div style={{
                fontSize: 160,
                fontWeight: 900,
                color: 'rgba(125,230,155,0.05)',
                position: 'absolute',
                right: -10,
                top: -20,
                lineHeight: 1,
                userSelect: 'none',
                pointerEvents: 'none',
                fontFamily: 'Inter, sans-serif',
              }}>
                {chapter.watermark}
              </div>

              {/* Left column */}
              <div style={{ flex: 1, position: 'relative', zIndex: 1, minWidth: 0 }}>
                {/* Wave label + date badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    fontSize: 10,
                    color: accent,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                  }}>
                    {chapter.waveLabel}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: 'var(--text-support)',
                    background: 'rgba(125,230,155,0.07)',
                    border: '1px solid rgba(125,230,155,0.12)',
                    borderRadius: 6,
                    padding: '4px 10px',
                    fontFamily: 'Inter, sans-serif',
                  }}>
                    {chapter.dateRange}
                  </div>
                </div>

                {/* Chapter title */}
                <h3 style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.95)',
                  letterSpacing: '-0.02em',
                  marginTop: 10,
                  marginBottom: 0,
                  fontFamily: 'Inter, sans-serif',
                  textShadow: '0 0 30px rgba(125,230,155,0.1)',
                }}>
                  {chapter.title}
                </h3>

                {/* Narrative — full paragraph */}
                <p style={{
                  fontSize: 14.5,
                  color: 'var(--text-support)',
                  fontWeight: 400,
                  lineHeight: 1.75,
                  maxWidth: 520,
                  marginTop: 14,
                  fontFamily: 'Inter, sans-serif',
                }}>
                  {chapter.narrative}
                </p>

                {/* Mini sentiment bar */}
                <MiniSentimentBar sentimentTrend={sentimentTrend} surveyKey={`s${i + 1}`} />
              </div>

              {/* Right column — stat pills */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12,
                minWidth: i === 2 ? 320 : 300,
                flexShrink: 0,
                position: 'relative',
                zIndex: 1,
                alignSelf: 'flex-start',
              }}>
                {stats.map(stat => (
                  <StatPill
                    key={stat.label}
                    value={stat.value}
                    label={stat.label}
                    accentColor={stat.accentColor}
                    delta={stat.delta}
                  />
                ))}
              </div>
            </motion.div>

            {/* Connector between chapters — only in normal scroll mode */}
            {(presentationWave === undefined || presentationWave === null) && i < CHAPTERS.length - 1 && <ConnectorLine />}
          </div>
        );
      })}
    </section>
  );
}
