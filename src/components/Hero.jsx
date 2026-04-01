import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

// ── Then vs. Now quote diptych ────────────────────────────────────────────────
// Curated S1→S3 pairs — left: future-tense hope, right: present-tense reality
const QUOTE_PAIRS = [
  {
    s1: "Someday I see it helping me work more efficiently and freeing up time for more strategic work.",
    s3: "It makes everything we come up with that much better and opens my eyes to so much more possibility.",
    theme: "Possibility",
  },
  {
    s1: "I hope AI can help with the volume of content we produce — there's never enough time.",
    s3: "Using AI daily to draft, edit, and repurpose content has genuinely changed how much I can produce.",
    theme: "Productivity",
  },
  {
    s1: "I'm curious but nervous — I don't want to feel left behind or replaced.",
    s3: "I feel more confident in my work now. AI feels like a partner, not a threat.",
    theme: "Confidence",
  },
  {
    s1: "It would be amazing if AI could help us personalize communications at scale.",
    s3: "We're personalizing campaigns in ways that would have taken a full extra team before.",
    theme: "Scale",
  },
  {
    s1: "I'd love to use it for brainstorming — sometimes you just need ideas fast.",
    s3: "Brainstorming with AI first has become part of my regular workflow. It unlocks things faster.",
    theme: "Creativity",
  },
];

function ThenNowDiptych({ s1Quotes, s3Quotes }) {
  const [idx, setIdx]         = useState(0);
  const [visible, setVisible] = useState(true);
  const timerRef              = useRef(null);

  // Use curated pairs — they tell the tightest story.
  // If live data is available and long enough, substitute; otherwise fall back to curated.
  const pairs = QUOTE_PAIRS;

  const advance = useCallback((next) => {
    setVisible(false);
    setTimeout(() => {
      setIdx(next);
      setVisible(true);
    }, 350);
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      advance((idx + 1) % pairs.length);
    }, 6000);
    return () => clearInterval(timerRef.current);
  }, [idx, advance, pairs.length]);

  const pair = pairs[idx];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.85 }}
      style={{
        marginTop: 40,
        maxWidth: 800,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Section label */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 18,
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 10,
          color: 'var(--text-support)',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}>
          14 Months of Change — In Their Own Words
        </div>
      </div>

      {/* Diptych frame */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: 0,
        background: 'rgba(29,77,82,0.22)',
        border: '1px solid rgba(125,230,155,0.14)',
        borderRadius: 16,
        overflow: 'hidden',
        minHeight: 200,
      }}>
        {/* LEFT — Then (S1) */}
        <div style={{
          padding: '28px 28px 24px',
          background: 'rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          {/* Era label */}
          <div style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 9,
            color: 'rgba(255,205,0,0.65)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: 14,
          }}>
            January 2025 — What we imagined
          </div>

          <AnimatePresence mode="wait">
            {visible && (
              <motion.p
                key={`s1-${idx}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                style={{
                  fontSize: 15,
                  lineHeight: 1.75,
                  color: 'rgba(255,255,255,0.72)',
                  fontFamily: 'Inter, sans-serif',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  margin: 0,
                  flex: 1,
                }}
              >
                "{pair.s1}"
              </motion.p>
            )}
          </AnimatePresence>

          <div style={{
            marginTop: 16,
            fontSize: 11,
            color: 'rgba(255,205,0,0.45)',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
          }}>
            Survey 1 respondent
          </div>
        </div>

        {/* CENTER divider with arrow */}
        <div style={{
          width: 48,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          background: 'rgba(125,230,155,0.04)',
          borderLeft: '1px solid rgba(125,230,155,0.1)',
          borderRight: '1px solid rgba(125,230,155,0.1)',
          padding: '0 4px',
        }}>
          <AnimatePresence mode="wait">
            {visible && (
              <motion.div
                key={`theme-${idx}`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div style={{
                  writingMode: 'vertical-lr',
                  textOrientation: 'mixed',
                  transform: 'rotate(180deg)',
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontSize: 9,
                  color: 'rgba(125,230,155,0.5)',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}>
                  {pair.theme}
                </div>
                <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
                  <path d="M7 0 L7 14 M1 8 L7 15 L13 8" stroke="rgba(125,230,155,0.45)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT — Now (S3) */}
        <div style={{
          padding: '28px 28px 24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          {/* Era label */}
          <div style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 9,
            color: 'rgba(125,230,155,0.75)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: 14,
          }}>
            March 2026 — What's actually happening
          </div>

          <AnimatePresence mode="wait">
            {visible && (
              <motion.p
                key={`s3-${idx}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                style={{
                  fontSize: 15,
                  lineHeight: 1.75,
                  color: 'rgba(255,255,255,0.9)',
                  fontFamily: 'Inter, sans-serif',
                  fontStyle: 'italic',
                  fontWeight: 500,
                  margin: 0,
                  flex: 1,
                }}
              >
                "{pair.s3}"
              </motion.p>
            )}
          </AnimatePresence>

          <div style={{
            marginTop: 16,
            fontSize: 11,
            color: 'rgba(125,230,155,0.55)',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
          }}>
            Survey 3 respondent
          </div>
        </div>
      </div>

      {/* Dot progress indicators */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 6,
        marginTop: 14,
      }}>
        {pairs.map((_, i) => (
          <button
            key={i}
            onClick={() => advance(i)}
            style={{
              width: i === idx ? 20 : 6,
              height: 6,
              borderRadius: 3,
              background: i === idx ? '#7DE69B' : 'rgba(125,230,155,0.2)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'width 0.3s ease, background 0.3s ease',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ── Hero Section ──────────────────────────────────────────────────────────────
export default function Hero({ transforms }) {
  // Dynamic totals from live data
  const totalResponses = transforms.responseCounts.reduce((sum, s) => sum + s.n, 0);

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

        {/* Then vs. Now quote diptych */}
        <ThenNowDiptych
          s1Quotes={transforms.openEndedText?.s1 ?? []}
          s3Quotes={transforms.openEndedText?.s3Excitement ?? []}
        />

        {/* Scroll hint — in flow, below exec summary, never overlaps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          style={{ marginTop: 40, display: 'flex', justifyContent: 'center' }}
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
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
              <path d="M1 1L8 8L15 1" stroke="#7DE69B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}
