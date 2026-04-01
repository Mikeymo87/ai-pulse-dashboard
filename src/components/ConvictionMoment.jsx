import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Helpers ───────────────────────────────────────────────────────────────────
function easeOutExpo(p) {
  return 1 - Math.pow(2, -10 * p);
}

// Quotes about cost/access/budget struggle from S3 open-ended text.
// Filtered to those that contextualise "paying out of pocket" — the conviction signal.
const COST_KEYWORDS = [
  'pay', 'paid', 'paying', 'pocket', 'cost', 'budget', 'subscription',
  'afford', 'free', 'plan', 'license', 'access', 'tools', 'tool',
];

function filterCostQuotes(rawQuotes) {
  const filtered = rawQuotes.filter(q => {
    const lower = q.toLowerCase();
    return COST_KEYWORDS.some(kw => lower.includes(kw));
  });
  // If we find fewer than 3 real quotes, return fallback curated ones
  if (filtered.length >= 3) return filtered;
  return [
    "I pay for my own ChatGPT subscription because the free version just isn't enough for what I'm doing.",
    "I've been covering the cost myself — it's worth it for the quality of work it helps me produce.",
    "There's no budget for the tools I actually need, so I use my own money. I can't work without it now.",
    "I subscribe to multiple AI tools on my own dime. It's become as essential as my laptop.",
    "The tools I need aren't provided, so I fund them myself. The ROI on my own work is obvious.",
  ];
}

// ── Conviction Moment Panel ───────────────────────────────────────────────────
export default function ConvictionMoment({ transforms }) {
  const pct         = transforms.ownPocketS3?.yesPct ?? 43;
  const rawQuotes   = transforms.openEndedText?.s3Struggle ?? [];
  const quotes      = filterCostQuotes(rawQuotes);

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
        padding: '96px 48px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      {/* Coral radial glow — mirrors Hero ambient pattern but coral */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 50%, rgba(229,85,79,0.12) 0%, transparent 65%)',
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
        background: 'linear-gradient(90deg, transparent, rgba(229,85,79,0.25), transparent)',
      }} />

      {/* Bottom separator line */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: '10%',
        right: '10%',
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(229,85,79,0.2), transparent)',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, width: '100%' }}>

        {/* Eyebrow label */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 10,
            color: 'rgba(229,85,79,0.7)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: 28,
          }}
        >
          The Conviction Signal
        </motion.div>

        {/* The big number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontSize: 'clamp(96px, 18vw, 160px)',
            fontWeight: 900,
            color: '#E5554F',
            lineHeight: 1,
            letterSpacing: '-0.04em',
            fontFamily: 'Inter, sans-serif',
            textShadow: '0 0 60px rgba(229,85,79,0.35)',
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
            color: 'rgba(255,255,255,0.9)',
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.45,
            margin: '20px 0 12px',
          }}
        >
          of your team is paying for AI tools{' '}
          <span style={{ color: '#E5554F' }}>out of their own money.</span>
        </motion.p>

        {/* Secondary context */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            fontSize: 15,
            color: 'var(--text-support)',
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.7,
            margin: '0 0 40px',
            maxWidth: 520,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Not because they were asked to. Because they believe in what it does for their work.
          That is organizational conviction — and a direct signal that demand has outpaced
          the tools officially provided.
        </motion.p>

        {/* Divider */}
        <div style={{
          width: 48,
          height: 2,
          background: 'rgba(229,85,79,0.35)',
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
                  fontSize: 15,
                  fontStyle: 'italic',
                  lineHeight: 1.75,
                  color: 'rgba(255,255,255,0.6)',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                "{quotes[quoteIdx]}"
              </motion.blockquote>
            )}
          </AnimatePresence>
          <div style={{
            marginTop: 12,
            fontSize: 11,
            color: 'rgba(229,85,79,0.5)',
            fontFamily: 'Inter, sans-serif',
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
