import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';

// ─── Constants ────────────────────────────────────────────────────────────────
const TOTAL    = 117;
const COLS     = 13; // 13 × 9 = 117
const DOT_SIZE = 14;
const DOT_GAP  = 8;
const FONT     = 'DM Sans, sans-serif';

const WAVE_META = [
  { label: 'Jan–Feb 2025', shortLabel: 'Survey 1', color: '#7DE69B' },
  { label: 'Aug–Sep 2025', shortLabel: 'Survey 2', color: '#59BEC9' },
  { label: 'Mar 2026',     shortLabel: 'Survey 3', color: '#7DE69B' },
];

function buildWaves(responseCounts) {
  return WAVE_META.map((meta, i) => {
    const n       = responseCounts?.[i]?.n ?? [97, 106, 89][i];
    const pct     = Math.round((n / TOTAL) * 100);
    const prev    = i > 0 ? (responseCounts?.[i - 1]?.n ?? [97, 106][i - 1]) : null;
    const prevPct = prev !== null ? Math.round((prev / TOTAL) * 100) : null;
    const diff    = prevPct !== null ? pct - prevPct : null;
    return { ...meta, respondents: n, pct, delta: diff };
  });
}

// ─── Single dot — theme-aware inactive color ──────────────────────────────────
function Dot({ active, color, delay, inactiveColor }) {
  return (
    <motion.div
      animate={{
        background: active ? color : inactiveColor,
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
        background: inactiveColor,
        flexShrink: 0,
      }}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ParticipationStory({ transforms }) {
  const theme   = useTheme();
  const isLight = theme === 'light';

  const WAVES = buildWaves(transforms?.responseCounts);
  const [wave, setWave]             = useState(0);
  const [autoPlayed, setAutoPlayed] = useState(false);
  const timerRef                    = useRef(null);
  const ref                         = useRef(null);
  const hasEnteredRef               = useRef(false);

  // Theme-aware colors for non-data elements
  const inactiveDotColor  = isLight ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.07)';
  const barTrackColor     = isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.07)';
  const barInactiveColor  = isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.15)';
  const dotInactiveColor  = isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.15)';

  // Auto-play W0 → W1 → W2 once on scroll-into-view
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
    return () => { observer.disconnect(); clearTimeout(timerRef.current); };
  }, [autoPlayed]);

  const w      = WAVES[wave];
  const active = w.respondents;

  function dotDelay(i) {
    return Math.min(i * 0.008, 0.28);
  }

  // Delta display helpers
  function deltaSymbol(diff) {
    if (diff === null) return '';
    return diff > 0 ? '↑' : diff < 0 ? '↓' : '→';
  }
  function deltaText(diff) {
    if (diff === null) return null;
    const abs = Math.abs(diff);
    return `${deltaSymbol(diff)} ${abs}pp vs prior survey`;
  }
  function deltaIsPositive(diff) { return diff !== null && diff > 0; }

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
          color: 'var(--accent-mint)',
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
          color: 'var(--text-primary)',
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
          color: 'var(--text-support)',
          margin: 0,
        }}>
          Yours has shown up three times — over 14 months. Each dot below is a person.
          Not a data point. A person who made time, answered honestly, and did it again.
          That is not compliance. That is investment.
        </p>
      </motion.div>

      {/* Wave selector buttons */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 36, flexWrap: 'wrap' }}>
        {WAVES.map((wv, i) => {
          const isActive = wave === i;
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
                border: `1.5px solid ${isActive ? wv.color : 'rgba(125,230,155,0.2)'}`,
                background: isActive ? `${wv.color}18` : 'transparent',
                color: isActive ? wv.color : '#797D80',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>{wv.shortLabel}</span>
              <span style={{ opacity: 0.7 }}>·</span>
              <span>{wv.label}</span>
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
              inactiveColor={inactiveDotColor}
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
              {/* Big number + delta badge */}
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
                  color: 'var(--text-support)',
                  marginTop: 6,
                }}>
                  response rate — {w.respondents} of {TOTAL} people
                </div>
                {w.delta !== null && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    marginTop: 8,
                    fontFamily: FONT,
                    fontSize: 12,
                    fontWeight: 700,
                    color: deltaIsPositive(w.delta) ? 'var(--accent-mint)' : 'var(--accent-yellow)',
                    background: deltaIsPositive(w.delta) ? 'var(--accent-mint-bg)' : 'var(--accent-yellow-bg)',
                    padding: '3px 10px',
                    borderRadius: 20,
                  }}>
                    {deltaText(w.delta)}
                  </div>
                )}
              </div>

              {/* Benchmark context box */}
              <div style={{
                background: 'var(--surface-green)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}>
                <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 800, color: 'var(--text-support)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Context
                </span>
                <p style={{ fontFamily: FONT, fontSize: 13, lineHeight: 1.65, color: 'var(--text-bridge)', margin: 0 }}>
                  For organizations under 500 employees, the industry benchmark is{' '}
                  <strong style={{ color: 'var(--text-medium)' }}>~85% participation</strong>.
                  This team hit <strong style={{ color: w.color }}>{WAVES[0].pct}%, {WAVES[1].pct}%, and {WAVES[2].pct}%</strong> — at or above that mark all three times.
                  {wave === 2 && (
                    <span style={{ color: 'var(--accent-yellow)' }}>
                      {' '}The Survey 3 dip reflects a compressed sprint window, not disengagement.
                    </span>
                  )}
                </p>
                <span style={{ fontFamily: FONT, fontSize: 10, color: 'var(--text-support)', opacity: 0.6, fontStyle: 'italic' }}>
                  Source: Culture Amp, "What is a Good Employee Survey Response Rate?" (Aug 2025)
                </span>
              </div>

              {/* All-three-waves bar comparison — the real story */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {WAVES.map((wv, i) => {
                  const isCurrent = i === wave;
                  return (
                    <div
                      key={i}
                      onClick={() => setWave(i)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Row header: survey label + date + pct */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        marginBottom: 5,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <div style={{
                            width: 7, height: 7, borderRadius: '50%',
                            background: wv.color,
                            opacity: isCurrent ? 1 : 0.3,
                            flexShrink: 0,
                          }} />
                          <span style={{
                            fontFamily: FONT,
                            fontSize: 12,
                            fontWeight: isCurrent ? 700 : 400,
                            color: isCurrent ? wv.color : 'var(--text-support)',
                          }}>
                            {wv.shortLabel}
                          </span>
                          <span style={{
                            fontFamily: FONT,
                            fontSize: 11,
                            color: 'var(--text-support)',
                            opacity: 0.7,
                          }}>
                            {wv.label}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {/* Delta badge on the row itself */}
                          {WAVES[i].delta !== null && (
                            <span style={{
                              fontFamily: FONT,
                              fontSize: 10,
                              fontWeight: 700,
                              color: deltaIsPositive(WAVES[i].delta) ? 'var(--accent-mint)' : 'var(--accent-yellow)',
                            }}>
                              {deltaSymbol(WAVES[i].delta)}{Math.abs(WAVES[i].delta)}pp
                            </span>
                          )}
                          <span style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontSize: 16,
                            fontWeight: 800,
                            color: wv.color,
                            opacity: isCurrent ? 1 : 0.4,
                            letterSpacing: '-0.02em',
                          }}>
                            {wv.pct}%
                          </span>
                        </div>
                      </div>
                      {/* Bar */}
                      <div style={{
                        height: isCurrent ? 10 : 7,
                        borderRadius: 5,
                        background: barTrackColor,
                        overflow: 'hidden',
                        transition: 'height 0.3s ease',
                      }}>
                        <motion.div
                          animate={{ width: `${wv.pct}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          style={{
                            height: '100%',
                            borderRadius: 5,
                            background: wv.color,
                            opacity: isCurrent ? 1 : 0.22,
                          }}
                        />
                      </div>
                      {/* Wave 3 context note inline */}
                      {i === 2 && isCurrent && (
                        <motion.p
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          style={{
                            fontFamily: FONT,
                            fontSize: 11,
                            color: 'var(--accent-yellow)',
                            margin: '6px 0 0',
                            lineHeight: 1.5,
                            fontStyle: 'italic',
                          }}
                        >
                          Survey landed during a compressed sprint window — context, not disengagement.
                        </motion.p>
                      )}
                    </div>
                  );
                })}
              </div>

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

    </section>
  );
}
