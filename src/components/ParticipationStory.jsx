import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Constants ────────────────────────────────────────────────────────────────
const TOTAL     = 117;
const COLS      = 13; // 13 × 9 = 117
const DOT_SIZE  = 14;
const DOT_GAP   = 8;
const FONT      = 'DM Sans, sans-serif';

const WAVES = [
  {
    label: 'Jan–Feb 2025',
    shortLabel: 'Survey 1',
    respondents: 97,
    pct: 83,
    delta: null,
    color: '#7DE69B',
  },
  {
    label: 'Aug–Sep 2025',
    shortLabel: 'Survey 2',
    respondents: 106,
    pct: 91,
    delta: '+8pp',
    color: '#59BEC9',
  },
  {
    label: 'Mar 2026',
    shortLabel: 'Survey 3',
    respondents: 89,
    pct: 76,
    delta: '−15pp',
    color: '#7DE69B',
  },
];

// ─── Single dot ───────────────────────────────────────────────────────────────
function Dot({ active, color, delay }) {
  return (
    <motion.div
      animate={{
        background: active ? color : 'rgba(255,255,255,0.07)',
        boxShadow: active
          ? `0 0 6px ${color}99, 0 0 14px ${color}44`
          : '0 0 0px transparent',
        scale: active ? 1 : 0.85,
      }}
      transition={{ duration: 0.45, delay, ease: 'easeOut' }}
      style={{
        width: DOT_SIZE,
        height: DOT_SIZE,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ParticipationStory() {
  const [wave, setWave]           = useState(0);
  const [autoPlayed, setAutoPlayed] = useState(false);
  const timerRef                  = useRef(null);
  const ref                       = useRef(null);
  const hasEnteredRef             = useRef(false);

  // Auto-play W0 → W1 → W2 once on scroll-into-view, then hold
  useEffect(() => {
    if (autoPlayed) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasEnteredRef.current) {
          hasEnteredRef.current = true;
          timerRef.current = setTimeout(() => {
            setWave(1);
            timerRef.current = setTimeout(() => {
              setWave(2);
              setAutoPlayed(true);
            }, 1800);
          }, 900);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
      clearTimeout(timerRef.current);
    };
  }, [autoPlayed]);

  const w        = WAVES[wave];
  const active   = w.respondents;

  // Stagger delay per dot (capped so it doesn't drag on)
  function dotDelay(i) {
    return Math.min(i * 0.008, 0.28);
  }

  return (
    <section style={{ padding: '72px 32px 64px', maxWidth: 1360, margin: '0 auto' }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{ maxWidth: 640, marginBottom: 52 }}
      >
        <span style={{
          display: 'inline-block',
          fontFamily: FONT,
          fontSize: 10.5,
          fontWeight: 800,
          color: '#7DE69B',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: 12,
        }}>
          Participation Story
        </span>
        <h2 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 'clamp(26px, 3.5vw, 38px)',
          fontWeight: 800,
          color: '#f0f4f8',
          lineHeight: 1.2,
          margin: '0 0 14px',
          letterSpacing: '-0.02em',
        }}>
          Most organizations can't get half their team to respond to a single survey.
        </h2>
        <p style={{
          fontFamily: FONT,
          fontSize: 15,
          lineHeight: 1.75,
          color: '#797D80',
          margin: 0,
        }}>
          Yours has shown up three times — over 14 months. Each dot below is a person.
          Not a data point. A person who made time, answered honestly, and did it again.
          That is not compliance. That is investment.
        </p>
      </motion.div>

      {/* Wave selector buttons */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 36, flexWrap: 'wrap' }}>
        {WAVES.map((w, i) => {
          const active = wave === i;
          return (
            <button
              key={i}
              onClick={() => setWave(i)}
              style={{
                fontFamily: FONT,
                fontSize: 12,
                fontWeight: 700,
                padding: '7px 16px',
                borderRadius: 20,
                border: `1.5px solid ${active ? w.color : 'rgba(125,230,155,0.2)'}`,
                background: active ? `${w.color}18` : 'transparent',
                color: active ? w.color : '#797D80',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>{w.shortLabel}</span>
              <span style={{ opacity: 0.7 }}>·</span>
              <span>{w.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dot grid + live stat side-by-side */}
      <div ref={ref} style={{ display: 'flex', alignItems: 'flex-start', gap: 48, flexWrap: 'wrap' }}>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, ${DOT_SIZE}px)`,
          gap: DOT_GAP,
          flexShrink: 0,
        }}>
          {Array.from({ length: TOTAL }, (_, i) => (
            <Dot
              key={i}
              active={i < active}
              color={w.color}
              delay={dotDelay(i)}
            />
          ))}
        </div>

        {/* Live stat panel */}
        <div style={{ flex: 1, minWidth: 220, paddingTop: 4 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={wave}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
            >
              {/* Big number */}
              <div>
                <div style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 72,
                  fontWeight: 900,
                  color: w.color,
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                }}>
                  {w.pct}%
                </div>
                <div style={{
                  fontFamily: FONT,
                  fontSize: 14,
                  color: '#797D80',
                  marginTop: 6,
                }}>
                  response rate — {w.respondents} of {TOTAL} people
                </div>
                {w.delta && (
                  <div style={{
                    display: 'inline-block',
                    marginTop: 8,
                    fontFamily: FONT,
                    fontSize: 12,
                    fontWeight: 700,
                    color: w.delta.startsWith('+') ? '#7DE69B' : '#FFCD00',
                    background: w.delta.startsWith('+') ? 'rgba(125,230,155,0.1)' : 'rgba(255,205,0,0.1)',
                    padding: '3px 10px',
                    borderRadius: 20,
                  }}>
                    {w.delta} vs prior survey
                  </div>
                )}
              </div>

              {/* Context bar */}
              <div style={{
                background: 'rgba(29,77,82,0.35)',
                border: '1px solid rgba(125,230,155,0.15)',
                borderRadius: 12,
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}>
                <span style={{
                  fontFamily: FONT,
                  fontSize: 10,
                  fontWeight: 800,
                  color: '#797D80',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}>
                  Context
                </span>
                <p style={{
                  fontFamily: FONT,
                  fontSize: 13,
                  lineHeight: 1.65,
                  color: '#9ca8b4',
                  margin: 0,
                }}>
                  Corporate average for a single survey:{' '}
                  <strong style={{ color: '#e0e4e8' }}>40–60%</strong>
                  <br />
                  This department:{' '}
                  <strong style={{ color: w.color }}>{w.pct}% in {w.shortLabel}</strong>
                  {wave === 2 && (
                    <>
                      <br />
                      <span style={{ color: '#FFCD00' }}>
                        Wave 3 dip reflects the survey landing during a compressed sprint window — not disengagement.
                        The team still outperformed the corporate average by {w.pct - 50}+ points.
                      </span>
                    </>
                  )}
                </p>
              </div>

              {/* Wave mini-comparison */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {WAVES.map((wv, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: i === wave ? wv.color : 'rgba(255,255,255,0.15)',
                      flexShrink: 0,
                    }} />
                    <div style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 4,
                      background: 'rgba(255,255,255,0.07)',
                      overflow: 'hidden',
                    }}>
                      <motion.div
                        animate={{ width: `${wv.pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        style={{
                          height: '100%',
                          background: i === wave ? wv.color : 'rgba(255,255,255,0.15)',
                          borderRadius: 4,
                        }}
                      />
                    </div>
                    <span style={{
                      fontFamily: FONT,
                      fontSize: 11,
                      fontWeight: i === wave ? 700 : 400,
                      color: i === wave ? wv.color : '#797D80',
                      minWidth: 32,
                      textAlign: 'right',
                    }}>
                      {wv.pct}%
                    </span>
                    <span style={{
                      fontFamily: FONT,
                      fontSize: 10,
                      color: '#797D80',
                      minWidth: 56,
                    }}>
                      {wv.shortLabel}
                    </span>
                  </div>
                ))}
              </div>

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

    </section>
  );
}
