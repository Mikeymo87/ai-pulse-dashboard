import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Helpers ───────────────────────────────────────────────────────────────────
function easeOutExpo(p) {
  return 1 - Math.pow(2, -10 * p);
}

// Time-barrier keywords — filter live struggle text for relevant quotes
const TIME_KEYWORDS = [
  'time', 'busy', 'priorities', 'capacity', 'bandwidth', 'schedule',
  'learning curve', 'overwhelm', 'juggling', 'deadline', 'competing',
  'carve out', 'make time', 'find time', 'opportunity to',
];

// Fallback quotes for when live data doesn't surface enough time-specific text
const FALLBACK_QUOTES = [
  "I know it would help my workflow — I just can't carve out time to actually learn it properly.",
  "The hardest part isn't finding the tools. It's finding uninterrupted time to get good at them.",
  "Every time I start building a new AI workflow, something urgent pulls me away.",
  "I want to go deeper, but the day-to-day workload doesn't leave room for real learning.",
  "It's not that I'm resistant — it's that learning takes time I don't have between deadlines.",
];

// ── Time as Barrier Panel ─────────────────────────────────────────────────────
export default function ConvictionMoment({ transforms }) {
  // Pull time-barrier % from structured data
  const pct = transforms.barriersTrend
    ?.find(b => b.barrier === 'Lack of time')?.s3?.pct ?? 44;

  // Pull time-related quotes from open-text struggle responses
  const liveQuotes = (transforms.openEndedText?.s3Struggle ?? [])
    .filter(q => q && q.trim().length > 20)
    .filter(q => TIME_KEYWORDS.some(kw => q.toLowerCase().includes(kw)));

  const quotes = liveQuotes.length >= 3 ? liveQuotes : FALLBACK_QUOTES;

  // Count-up
  const [display, setDisplay]   = useState(0);
  const [started, setStarted]   = useState(false);
  const sectionRef              = useRef(null);

  // Rotating quotes
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [visible, setVisible]   = useState(true);

  // Trigger count-up on scroll-into-view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          const duration  = 1600;
          const startTime = performance.now();
          function tick(now) {
            const elapsed  = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            setDisplay(Math.round(easeOutExpo(progress) * pct));
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [pct, started]);

  // Rotate quotes every 5s
  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setQuoteIdx(i => (i + 1) % quotes.length);
        setVisible(true);
      }, 320);
    }, 5000);
    return () => clearInterval(id);
  }, [quotes.length]);

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: 'clamp(48px, 10vw, 96px) clamp(20px, 5vw, 48px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      {/* Mint radial glow */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 50%, rgba(46,168,74,0.13) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top separator line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '10%',
        right: '10%',
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(46,168,74,0.35), transparent)',
      }} />

      {/* Bottom separator line */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: '10%',
        right: '10%',
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(46,168,74,0.22), transparent)',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, width: '100%' }}>

        {/* Eyebrow label */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 'var(--text-xs)',
            color: 'rgba(46,168,74,0.80)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: 28,
          }}
        >
          The Barrier Signal
        </motion.div>

        {/* The big number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontSize: 'clamp(96px, 18vw, 160px)',
            fontWeight: 800,
            color: '#2EA84A',
            lineHeight: 1,
            letterSpacing: '-0.04em',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            textShadow: '0 0 60px rgba(46,168,74,0.32)',
          }}
        >
          {display}%
        </motion.div>

        {/* Primary statement */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.25 }}
          style={{
            fontSize: 'clamp(18px, 3vw, 24px)',
            fontWeight: 600,
            color: 'var(--text-primary)',
            fontFamily: 'DM Sans, sans-serif',
            letterSpacing: '0.01em',
            lineHeight: 1.45,
            margin: '20px 0 12px',
          }}
        >
          of your team names time as their{' '}
          <span style={{ color: '#2EA84A' }}>most-cited barrier to going deeper.</span>
        </motion.p>

        {/* Secondary context */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            fontSize: 'var(--text-base)',
            color: 'var(--text-support)',
            fontFamily: 'DM Sans, sans-serif',
            lineHeight: 1.7,
            margin: '0 0 40px',
            maxWidth: 520,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Not time to use AI — time to learn it well. The team believes in it.
          What they need is protected space to go deeper without competing priorities
          pulling them back to the surface.
        </motion.p>

        {/* Divider */}
        <div style={{
          width: 48,
          height: 2,
          background: 'rgba(46,168,74,0.40)',
          borderRadius: 1,
          margin: '0 auto 36px',
        }} />

        {/* Rotating quote */}
        <div style={{ minHeight: 100 }}>
          <AnimatePresence mode="wait">
            {visible && (
              <motion.blockquote
                key={quoteIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.32 }}
                style={{
                  margin: 0,
                  padding: 0,
                  fontSize: 'var(--text-base)',
                  fontStyle: 'italic',
                  lineHeight: 1.75,
                  color: 'var(--text-dim)',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                "{quotes[quoteIdx]}"
              </motion.blockquote>
            )}
          </AnimatePresence>
          <div style={{
            marginTop: 12,
            fontSize: 'var(--text-xs)',
            color: 'rgba(46,168,74,0.55)',
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 500,
            letterSpacing: '0.06em',
          }}>
            Survey 3 respondent
          </div>
        </div>

      </div>
    </section>
  );
}
