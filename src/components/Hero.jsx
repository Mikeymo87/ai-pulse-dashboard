import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';

// ── Helpers ───────────────────────────────────────────────────────────────────
function easeOutExpo(progress) {
  return 1 - Math.pow(2, -10 * progress);
}

// ── Animated count-up number (no box) ────────────────────────────────────────
function CountUp({ value, color }) {
  const [display, setDisplay] = useState(0);
  const ref      = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const duration  = 1200;
          const startTime = performance.now();
          function tick(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            setDisplay(Math.round(easeOutExpo(progress) * value));
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

  return <span ref={ref} style={{ color }}>{display}</span>;
}

// ── Mesh gradient orb configs ─────────────────────────────────────────────────
const ORBS = [
  { x: '18%', y: '18%', color: '#7DE69B', darkOp: 0.22, lightOp: 0.08, dur: 5.0 },
  { x: '82%', y: '12%', color: '#59BEC9', darkOp: 0.14, lightOp: 0.06, dur: 6.5 },
  { x: '50%', y: '44%', color: '#2EA84A', darkOp: 0.20, lightOp: 0.07, dur: 8.0 },
  { x: '12%', y: '80%', color: '#FFCD00', darkOp: 0.10, lightOp: 0.04, dur: 7.0 },
  { x: '88%', y: '78%', color: '#7DE69B', darkOp: 0.13, lightOp: 0.05, dur: 5.5 },
];

// ── Stat row configs ──────────────────────────────────────────────────────────
const STAT_CONFIGS = [
  { label: 'Surveys',   colorDark: '#59BEC9', colorLight: '#1a7585' },
  { label: 'Responses', colorDark: '#7DE69B', colorLight: '#1d8040' },
  { label: 'Months',    colorDark: '#FFCD00', colorLight: '#8a6500' },
];

// ── Then vs. Now quote diptych ────────────────────────────────────────────────
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

  const pairs = QUOTE_PAIRS;

  const advance = useCallback((next) => {
    setVisible(false);
    setTimeout(() => { setIdx(next); setVisible(true); }, 350);
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
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      style={{ maxWidth: 1000, width: '100%', margin: '0 auto', padding: '0 32px', boxSizing: 'border-box' }}
    >
      {/* Section label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 18 }}>
        <div style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 10,
          color: 'var(--accent-mint)',
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
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        overflow: 'hidden',
        minHeight: 200,
      }}>
        {/* LEFT — Then (S1) */}
        <div style={{ padding: '28px 28px 24px', background: 'var(--card-bg-dark)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 11, color: 'var(--accent-yellow)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14 }}>
            January 2025 — What we imagined
          </div>
          <AnimatePresence mode="wait">
            {visible && (
              <motion.p key={`s1-${idx}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}
                style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', fontStyle: 'italic', fontWeight: 400, margin: 0, flex: 1 }}>
                "{pair.s1}"
              </motion.p>
            )}
          </AnimatePresence>
          <div style={{ marginTop: 16, fontSize: 13, color: 'var(--accent-yellow)', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>Survey 1 respondent</div>
        </div>

        {/* CENTER divider */}
        <div style={{ width: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(125,230,155,0.04)', borderLeft: '1px solid rgba(125,230,155,0.1)', borderRight: '1px solid rgba(125,230,155,0.1)', padding: '0 4px' }}>
          <AnimatePresence mode="wait">
            {visible && (
              <motion.div key={`theme-${idx}`} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.3 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div style={{ writingMode: 'vertical-lr', textOrientation: 'mixed', transform: 'rotate(180deg)', fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 9, color: 'rgba(125,230,155,0.5)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
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
        <div style={{ padding: '28px 28px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 11, color: 'var(--accent-mint)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14 }}>
            March 2026 — What's actually happening
          </div>
          <AnimatePresence mode="wait">
            {visible && (
              <motion.p key={`s3-${idx}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, delay: 0.05 }}
                style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif', fontStyle: 'italic', fontWeight: 500, margin: 0, flex: 1 }}>
                "{pair.s3}"
              </motion.p>
            )}
          </AnimatePresence>
          <div style={{ marginTop: 16, fontSize: 13, color: 'var(--accent-mint)', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>Survey 3 respondent</div>
        </div>
      </div>

      {/* Dot progress indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 14 }}>
        {pairs.map((_, i) => (
          <button key={i} onClick={() => advance(i)} style={{
            width: i === idx ? 20 : 6, height: 6, borderRadius: 3,
            background: i === idx ? 'var(--accent-mint)' : 'rgba(125,230,155,0.2)',
            border: 'none', cursor: 'pointer', padding: 0,
            transition: 'width 0.3s ease, background 0.3s ease',
          }} />
        ))}
      </div>
    </motion.div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
export default function Hero({ transforms }) {
  const theme          = useTheme();
  const isLight        = theme === 'light';
  const totalResponses = transforms.responseCounts.reduce((sum, s) => sum + s.n, 0);
  const statValues     = [3, totalResponses, 14];

  // Scroll-driven hero collapse
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const contentOpacity = useTransform(scrollYProgress, [0, 0.42], [1, 0]);
  const contentY       = useTransform(scrollYProgress, [0, 0.42], [0, -52]);
  const contentScale   = useTransform(scrollYProgress, [0, 0.42], [1, 0.94]);
  const hintOpacity    = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const orbsY          = useTransform(scrollYProgress, [0, 1],    [0, 80]);

  return (
    <div>

      {/* ── ABOVE FOLD — cinematic full viewport ───────────────────────────── */}
      <div ref={heroRef} style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: isLight ? 'var(--bg)' : '#0a0c0e',
        padding: '72px 48px 60px',
        boxSizing: 'border-box',
      }}>

        {/* Mesh gradient orbs — parallax layer */}
        <motion.div style={{ y: orbsY, position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {ORBS.map((orb, i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.08 + i * 0.015, 1],
                opacity: [
                  isLight ? orb.lightOp : orb.darkOp,
                  isLight ? orb.lightOp * 1.6 : orb.darkOp * 1.45,
                  isLight ? orb.lightOp : orb.darkOp,
                ],
              }}
              transition={{ duration: orb.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
              style={{
                position: 'absolute',
                left: orb.x,
                top: orb.y,
                transform: 'translate(-50%, -50%)',
                width: '65vw',
                height: '65vw',
                borderRadius: '50%',
                background: `radial-gradient(ellipse, ${orb.color} 0%, transparent 68%)`,
                filter: 'blur(52px)',
              }}
            />
          ))}
        </motion.div>

        {/* Content — scroll-collapse layer */}
        <motion.div style={{
          opacity: contentOpacity,
          y: contentY,
          scale: contentScale,
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: 900,
          textAlign: 'center',
        }}>

          {/* Eyebrow pill */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 9,
              border: '1px solid var(--border)',
              borderRadius: 100,
              padding: '6px 16px',
              marginBottom: 40,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: 11,
              color: 'var(--text-support)',
              letterSpacing: '0.13em',
              textTransform: 'uppercase',
            }}
          >
            <motion.span
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: 6, height: 6, borderRadius: '50%', background: '#2EA84A', display: 'inline-block', boxShadow: '0 0 8px rgba(46,168,74,0.9)', flexShrink: 0 }}
            />
            Baptist Health · Marketing &amp; Communications
          </motion.div>

          {/* Giant headline */}
          <div style={{ marginBottom: 44 }}>
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'clamp(52px, 9vw, 100px)',
                fontWeight: 900,
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
                lineHeight: 1.0,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                textTransform: 'uppercase',
                wordSpacing: '0.12em',
              }}
            >
              AI Adoption
            </motion.div>
            <motion.div
              key={theme}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{
                fontSize: 'clamp(52px, 9vw, 100px)',
                fontWeight: 900,
                letterSpacing: '-0.01em',
                lineHeight: 1.0,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                textTransform: 'uppercase',
                wordSpacing: '0.12em',
                background: isLight
                  ? 'linear-gradient(135deg, #1d8040 0%, #2EA84A 55%, #1a7585 100%)'
                  : 'linear-gradient(135deg, #7DE69B 0%, #2EA84A 55%, #59BEC9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              In Motion
            </motion.div>
          </div>

          {/* Stat trio — no boxes, editorial row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.52 }}
            style={{ display: 'flex', alignItems: 'center', marginBottom: 48 }}
          >
            {STAT_CONFIGS.map((cfg, i) => {
              const color = isLight ? cfg.colorLight : cfg.colorDark;
              return (
                <div key={cfg.label} style={{ display: 'flex', alignItems: 'center' }}>
                  {i > 0 && (
                    <div style={{ width: 1, height: 44, background: 'var(--border)', margin: '0 40px' }} />
                  )}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: 'clamp(38px, 5.5vw, 60px)',
                      fontWeight: 800,
                      color,
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}>
                      <CountUp value={statValues[i]} color={color} />
                    </div>
                    <div style={{
                      fontSize: 11,
                      color: 'var(--text-support)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.11em',
                      fontFamily: 'DM Sans, sans-serif',
                      marginTop: 7,
                    }}>
                      {cfg.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Decorative divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.68 }}
            style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', maxWidth: 560, marginBottom: 36 }}
          >
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ color: 'var(--accent-mint)', fontSize: 10, lineHeight: 1 }}>◆</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </motion.div>

          {/* Tagline — emotional centerpiece */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.82 }}
            style={{
              fontSize: 'clamp(18px, 2.2vw, 24px)',
              fontStyle: 'italic',
              color: 'var(--text-muted)',
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 400,
              lineHeight: 1.68,
              maxWidth: 680,
              margin: '0 auto 52px',
              textAlign: 'center',
            }}
          >
            This is not a story about technology. It's a story about trust, intention, and what
            becomes possible when leaders model the change they want to see.
          </motion.p>

          {/* Scroll hint — fades first on scroll */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            style={{ opacity: hintOpacity }}
          >
            <motion.div
              animate={{ y: [0, 7, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}
            >
              <div style={{
                fontSize: 11,
                color: 'var(--accent-mint)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontFamily: 'DM Sans, sans-serif',
                opacity: 0.75,
              }}>
                Scroll to explore
              </div>
              <svg width="18" height="11" viewBox="0 0 18 11" fill="none" style={{ opacity: 0.75 }}>
                <path d="M1 1L9 9L17 1" stroke="var(--accent-mint)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
          </motion.div>

        </motion.div>
      </div>

      {/* ── BELOW FOLD — first scroll destination: their own words ─────────── */}
      <div style={{
        background: isLight ? 'var(--bg)' : '#0a0c0e',
        padding: '72px 0 80px',
      }}>
        <ThenNowDiptych
          s1Quotes={transforms.openEndedText?.s1 ?? []}
          s3Quotes={transforms.openEndedText?.s3Excitement ?? []}
        />
      </div>

    </div>
  );
}
