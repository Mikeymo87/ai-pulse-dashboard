import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// ── Helpers ───────────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const c = hex.replace('#', '');
  return [parseInt(c.slice(0,2),16), parseInt(c.slice(2,4),16), parseInt(c.slice(4,6),16)].join(',');
}

function easeOutExpo(progress) {
  return 1 - Math.pow(2, -10 * progress);
}

// ── Animated count-up stat card ───────────────────────────────────────────────
function StatCard({ value, label, accentColor, delay }) {
  const [displayValue, setDisplayValue] = useState(0);
  const cardRef     = useRef(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animatedRef.current) {
          animatedRef.current = true;
          const duration  = 1200;
          const startTime = performance.now();
          function tick(now) {
            const elapsed  = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            setDisplayValue(Math.round(easeOutExpo(progress) * value));
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      style={{
        background: 'var(--surface-green)',
        borderTop: `2px solid ${accentColor}`,
        border: `1px solid rgba(255,255,255,0.06)`,
        borderTopColor: accentColor,
        borderRadius: 12,
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        boxShadow: `0 0 28px rgba(${hexToRgb(accentColor)}, 0.1)`,
      }}
    >
      <div style={{
        fontSize: 48,
        fontWeight: 800,
        color: accentColor,
        lineHeight: 1,
        letterSpacing: '-0.02em',
        fontFamily: 'Inter, sans-serif',
      }}>
        {displayValue}
      </div>
      <div style={{
        fontSize: 12,
        color: 'rgba(125,230,155,0.45)',
        letterSpacing: '0.08em',
        fontWeight: 500,
        textTransform: 'uppercase',
        marginTop: 8,
        fontFamily: 'Inter, sans-serif',
      }}>
        {label}
      </div>
    </motion.div>
  );
}

// ── Hero Section ──────────────────────────────────────────────────────────────
export default function Hero({ transforms }) {
  // Dynamic totals from live data
  const totalResponses = transforms.responseCounts.reduce((sum, s) => sum + s.n, 0);

  const s1Daily      = transforms.frequencyTrend[0]?.distribution?.find(d => d.label === 'Daily')?.pct ?? 0;
  const s3Daily      = transforms.frequencyTrend[2]?.distribution?.find(d => d.label === 'Daily')?.pct ?? 0;
  const posRow       = transforms.sentimentTrend.find(e => e.sentiment === 'Positive');
  const s1Pos        = posRow?.s1?.pct ?? 0;
  const s3Pos        = posRow?.s3?.pct ?? 0;
  const ownPocketPct = transforms.ownPocketS3?.yesPct ?? 0;
  const topBenefit   = transforms.benefitsS3?.[0]?.label ?? '';
  const topBenefitPct = transforms.benefitsS3?.[0]?.pct ?? 0;

  const stats = [
    { value: totalResponses, label: 'Total Responses', accentColor: '#7DE69B' },
    { value: 3,              label: 'Pulse Surveys',   accentColor: '#59BEC9' },
    { value: 14,             label: 'Months Tracked',  accentColor: '#FFCD00' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '72px 48px 52px',
      boxSizing: 'border-box',
    }}>
      {/* Ambient BH-green background glow */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 40%, rgba(46,168,74,0.13) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: 900,
      }}>
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 11,
            color: 'var(--text-support)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginBottom: 32,
            textAlign: 'center',
          }}
        >
          Baptist Health · Marketing &amp; Communications
        </motion.div>

        {/* Headline */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{
              fontSize: 'clamp(48px, 8vw, 72px)',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            AI Adoption
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            style={{
              fontSize: 'clamp(48px, 8vw, 72px)',
              fontWeight: 900,
              color: '#7DE69B',
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            In Motion
          </motion.div>
        </div>

        {/* Sub-tagline — dynamic response count */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{
            color: 'var(--text-support)',
            fontSize: 16,
            fontWeight: 400,
            marginTop: 16,
            marginBottom: 36,
            textAlign: 'center',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Three surveys. {totalResponses} responses. 14 months of transformation.
        </motion.p>

        {/* Stat cards — 3 items */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          width: '100%',
          maxWidth: 600,
        }}>
          {stats.map((stat, i) => (
            <StatCard
              key={stat.label}
              value={stat.value}
              label={stat.label}
              accentColor={stat.accentColor}
              delay={0.6 + i * 0.1}
            />
          ))}
        </div>

        {/* Executive summary card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.85 }}
          style={{
            marginTop: 40,
            maxWidth: 720,
            width: '100%',
            background: 'rgba(29,77,82,0.28)',
            border: '1px solid rgba(125,230,155,0.15)',
            borderLeft: '3px solid #7DE69B',
            borderRadius: 16,
            borderTopLeftRadius: 4,
            borderBottomLeftRadius: 4,
            padding: '28px 32px',
            boxSizing: 'border-box',
            textAlign: 'left',
          }}
        >
          <div style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 10,
            color: '#7DE69B',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            Executive Summary
          </div>

          {/* Paragraph 1 — The arc */}
          <p style={{
            fontSize: 15,
            lineHeight: 1.85,
            color: 'rgba(255,255,255,0.85)',
            fontFamily: 'Inter, sans-serif',
            margin: '0 0 16px',
            fontWeight: 500,
          }}>
            This team didn't wait for permission.{' '}
            <span style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 400 }}>
              When AI arrived, MarCom didn't watch from the sidelines — they adopted, adapted, and ran. Daily usage surged from{' '}
            </span>
            <span style={{ color: '#7DE69B', fontWeight: 700 }}>{s1Daily}%</span>
            <span style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 400 }}>{' '}to{' '}</span>
            <span style={{ color: '#7DE69B', fontWeight: 700 }}>{s3Daily}%</span>
            <span style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 400 }}>
              {' '}in fourteen months. Positive sentiment climbed from{' '}
            </span>
            <span style={{ color: '#7DE69B', fontWeight: 700 }}>{s1Pos}%</span>
            <span style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 400 }}>{' '}to{' '}</span>
            <span style={{ color: '#7DE69B', fontWeight: 700 }}>{s3Pos}%</span>
            <span style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 400 }}>
              . Confidence is at an all-time high. In fourteen months, this team went from curious to capable — and capable to essential.
            </span>
          </p>

          {/* Paragraph 2 — The conviction signal */}
          <p style={{
            fontSize: 15,
            lineHeight: 1.85,
            color: 'rgba(255,255,255,0.65)',
            fontFamily: 'Inter, sans-serif',
            margin: '0 0 16px',
          }}>
            But the single most revealing number isn't about daily usage. It's this:{' '}
            <span style={{ color: '#E5554F', fontWeight: 700 }}>{ownPocketPct}% of the team</span>
            {' '}is currently paying for AI tools out of their own pocket — not because they were asked to, but because they believe in what it does for their work.
            {' '}That is organizational conviction, and it is a direct signal that demand has outpaced the tools we've officially provided.
          </p>

          {/* Paragraph 3 — New S3 depth + forward look */}
          <p style={{
            fontSize: 15,
            lineHeight: 1.85,
            color: 'rgba(255,255,255,0.65)',
            fontFamily: 'Inter, sans-serif',
            margin: 0,
          }}>
            {topBenefit && (
              <>
                Survey 3 surfaced new depth: role and function data for the first time, and benefits data showing that{' '}
                <span style={{ color: '#7DE69B', fontWeight: 600 }}>{topBenefitPct}%</span>
                {' '}of respondents cite{' '}
                <span style={{ color: '#7DE69B', fontWeight: 600 }}>"{topBenefit.toLowerCase()}"</span>
                {' '}as a top outcome.{' '}
              </>
            )}
            While adoption is near-universal, the depth of use and the support needed varies meaningfully across roles and functions.
            {' '}The opportunity ahead isn't getting people started — it's giving them better tools, clearer guidance, and the infrastructure to go deeper.
            {' '}<span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>The team is ready. The data proves it.</span>
          </p>
        </motion.div>
      </div>

      {/* Scroll hint — outer div centers, inner motion.div only animates */}
      <div style={{
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
      }}>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <div style={{
            fontSize: 11,
            color: 'rgba(125,230,155,0.55)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontFamily: 'Inter, sans-serif',
          }}>
            Scroll to explore
          </div>
          <svg width="16" height="10" viewBox="0 0 16 10" fill="none" style={{ opacity: 0.65 }}>
            <path
              d="M1 1L8 8L15 1"
              stroke="#7DE69B"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}
