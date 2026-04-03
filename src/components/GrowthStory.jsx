import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';

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
    narrative: `January 2025 was day one of two things at once: the baseline survey, and the launch of the transformation effort itself. A formal AI training program was underway. Enterprise subscriptions for ChatGPT, Jasper, Gemini, Copilot, and Adobe Firefly were being provisioned. The guiding philosophy — "Human-first, AI-forward" — had just been introduced. The survey captured the team at the starting line: curious, cautiously optimistic, 42% already using AI daily, but still navigating real barriers around training, access, and clarity about what was allowed.`,
  },
  {
    waveLabel: 'WAVE 02',
    dateRange: 'Aug 27 – Sept 12, 2025',
    watermark: '02',
    title: 'The Momentum',
    narrative: `Eight months of deliberate work showed up in the numbers. Daily usage nearly doubled — from 42% to 85% — as AI moved from something people explored to something they depended on. The cohort feeling "not confident at all" was completely eliminated. Positive sentiment climbed to 67%. And the range of tools in use had expanded well beyond the company's endorsed subscriptions — a sign that people weren't just following the program. They were running ahead of it.`,
  },
  {
    waveLabel: 'WAVE 03',
    dateRange: 'Mar 18 – Mar 30, 2026',
    watermark: '03',
    title: 'The New Normal',
    narrative: `The national average for daily AI use at work is 8%. This team is at 92%. That's not a rounding error — it's more than ten times the national benchmark, and it's the proof that "Human-first, AI-forward" wasn't just a philosophy. It became a practice. Positive sentiment held strong at 69%. Confidence kept climbing. Survey 3 introduced new questions that revealed the full picture for the first time: who is using AI, in what roles, and how deeply it has changed the way they work. Time savings and quality improvements top the list of benefits. And one number stands apart from all the rest — a significant share of the team is now spending their own money on AI tools. Not because anyone asked them to. Because they're convinced.`,
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
        fontSize: 12,
        color: 'var(--text-support)',
        letterSpacing: '0.08em',
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
              <span style={{ fontSize: 12, color: 'var(--text-support)', fontFamily: 'DM Sans, sans-serif' }}>
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
          fontWeight: 800,
          color: accentColor,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
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
            letterSpacing: '0.02em',
            marginBottom: 7,
            flexShrink: 0,
          }}>
            {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}%
          </div>
        )}
      </div>
      <div style={{
        fontSize: 13,
        color: 'var(--text-support)',
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        fontFamily: 'DM Sans, sans-serif',
      }}>
        {label}
      </div>
    </div>
  );
}

// ── Narrative bridge between wave cards ───────────────────────────────────────
const BRIDGE_COPY = [
  // Between Wave 1 → Wave 2
  `That shift didn't happen by chance. Between January and August, a deliberate playbook was activated: an AI Council was formed, enterprise subscriptions were provisioned for every team member, hands-on role-specific workshops launched, and near-daily tips landed in team channels. A dedicated AI Sherpa was appointed to coach individuals through real blockers. The 'Invent Tomorrow' recognition program made wins visible. Curiosity, it turns out, needs infrastructure.`,
  // Between Wave 2 → Wave 3
  `By September 2025, the team's daily AI usage was more than ten times the national average of 8%. But the work wasn't finished — it was compounding. The six months that followed would reveal something the numbers alone couldn't capture: how personally invested people had become. Not just in their workflows. In the tools themselves.`,
];

function ConnectorLine({ index }) {
  const copy = BRIDGE_COPY[index];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0 20px' }}>
      <div style={{
        width: 1,
        height: 32,
        background: 'linear-gradient(to bottom, rgba(46,168,74,0.3), rgba(125,230,155,0.15))',
        marginBottom: 28,
      }} />
      {copy && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            color: 'var(--text-bridge)',
            fontSize: 16,
            fontWeight: 400,
            fontStyle: 'italic',
            lineHeight: 1.75,
            textAlign: 'center',
            maxWidth: 560,
            margin: '0 auto',
            fontFamily: 'DM Sans, sans-serif',
            padding: '0 24px',
          }}
        >
          {copy.replace(/\s+/g, ' ').trim()}
        </motion.p>
      )}
      <div style={{
        width: 1,
        height: 32,
        background: 'linear-gradient(to bottom, rgba(125,230,155,0.15), rgba(46,168,74,0.3))',
        marginTop: 28,
      }} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
// presentationWave: when 0/1/2, show only that chapter (no section header)
export default function GrowthStory({ transforms, presentationWave }) {
  const theme   = useTheme();
  const isLight = theme === 'light';
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
      maxWidth: 1360,
      margin: '0 auto',
      boxSizing: 'border-box',
      width: '100%',
    }}>
      {/* Section header — hidden in presentation mode (single-wave slides) */}
      {(presentationWave === undefined || presentationWave === null) && (
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--accent-mint)',
            letterSpacing: '0.13em',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}>
            The Journey
          </div>
          <h2 style={{
            fontSize: 'clamp(30px, 4vw, 44px)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em',
            lineHeight: 1.1,
            margin: '0 0 16px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            Three Waves, One Story
          </h2>
          <p style={{
            color: 'var(--text-support)',
            fontSize: 16,
            lineHeight: 1.65,
            margin: 0,
            fontFamily: 'DM Sans, sans-serif',
          }}>
            How AI adoption evolved across Baptist Health MarCom — January 2025 to March 2026
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
                background: 'var(--card-bg)',
                borderLeft: `3px solid ${accent}`,
                borderTopLeftRadius: 4,
                borderBottomLeftRadius: 4,
                borderTopRightRadius: 20,
                borderBottomRightRadius: 20,
                padding: 48,
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                gap: 80,
                alignItems: 'flex-start',
                boxShadow: isLight ? '0 2px 16px rgba(0,0,0,0.08)' : '0 2px 40px rgba(0,0,0,0.35)',
              }}
            >
              {/* Watermark number */}
              <div style={{
                fontSize: 160,
                fontWeight: 800,
                color: 'rgba(125,230,155,0.05)',
                position: 'absolute',
                right: -10,
                top: -20,
                lineHeight: 1,
                userSelect: 'none',
                pointerEvents: 'none',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
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
                    fontFamily: 'DM Sans, sans-serif',
                  }}>
                    {chapter.dateRange}
                  </div>
                </div>

                {/* Chapter title */}
                <h3 style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                  marginTop: 10,
                  marginBottom: 0,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  textShadow: '0 0 30px rgba(125,230,155,0.1)',
                }}>
                  {chapter.title}
                </h3>

                {/* Narrative — full paragraph */}
                <p style={{
                  fontSize: 16,
                  color: 'var(--text-support)',
                  fontWeight: 400,
                  lineHeight: 1.75,
                  maxWidth: 520,
                  marginTop: 14,
                  fontFamily: 'DM Sans, sans-serif',
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
                minWidth: i === 2 ? 480 : 440,
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
            {(presentationWave === undefined || presentationWave === null) && i < CHAPTERS.length - 1 && <ConnectorLine index={i} />}
          </div>
        );
      })}

      {/* Closing bridge — transitions into ConvictionMoment */}
      {(presentationWave === undefined || presentationWave === null) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          style={{ textAlign: 'center', padding: '48px 24px 16px', maxWidth: 600, margin: '0 auto' }}
        >
          <div style={{
            width: 1,
            height: 40,
            background: 'linear-gradient(to bottom, rgba(125,230,155,0.2), rgba(229,85,79,0.3))',
            margin: '0 auto 32px',
          }} />
          <p style={{
            color: 'var(--text-bridge)',
            fontSize: 17,
            fontWeight: 400,
            fontStyle: 'italic',
            lineHeight: 1.75,
            fontFamily: 'DM Sans, sans-serif',
            margin: 0,
          }}>
            The national average for daily AI use at work is 8%. This team reached 92%.
            That gap — more than ten times the national benchmark — is the direct result
            of leadership that modeled the change, built the infrastructure, and trusted
            a team of 117 to run with it. What comes next is the number that proves it wasn't top-down.
          </p>
        </motion.div>
      )}
    </section>
  );
}
