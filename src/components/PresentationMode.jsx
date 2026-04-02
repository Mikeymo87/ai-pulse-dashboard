import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SlideOverview  from './slides/SlideOverview';
import SlideWave      from './slides/SlideWave';
import SlideTrends    from './slides/SlideTrends';
import SlideTeam      from './slides/SlideTeam';
import SlideSpotlight from './slides/SlideSpotlight';

// ── All available slides ───────────────────────────────────────────────────────
const SLIDES_ALL = [
  { id: 'overview',  label: 'Overview' },
  { id: 'wave-0',    label: 'Wave 01 — The Baseline' },
  { id: 'wave-1',    label: 'Wave 02 — The Momentum' },
  { id: 'wave-2',    label: 'Wave 03 — The New Normal' },
  { id: 'trends-a',  label: 'Trends — Adoption' },
  { id: 'trends-b',  label: 'Trends — Readiness' },
  { id: 'trends-c',  label: 'Trends — Landscape' },
  { id: 'team',      label: 'Team Readiness' },
  { id: 'spotlight', label: 'Opportunity Spotlight' },
];

// ── Lens-specific sequences (IDs reference SLIDES_ALL) ────────────────────────
const SLIDE_SETS = {
  // 'team' slide excluded from all lenses — scatter/role data lives in Leadership Vault only
  council: SLIDES_ALL.filter(s => s.id !== 'team').map(s => s.id),
  exec: [
    'overview',    // The full picture in 30 seconds
    'wave-1',      // Momentum — where the shift happened
    'wave-2',      // New Normal — where we are today
    'trends-a',    // Adoption proof — the numbers that land
    'spotlight',   // Recommendations — The Ask
  ],
  dept: [
    'overview',    // Your team, your story
    'wave-0',      // Where you started
    'wave-1',      // The momentum you built
    'wave-2',      // Where you are now
    'trends-b',    // How you feel about it — confidence, readiness
    'spotlight',   // What comes next
  ],
};

// ── Lens metadata ─────────────────────────────────────────────────────────────
const LENSES = [
  {
    key: 'council',
    title: 'AI Council',
    subtitle: 'Full deep dive',
    duration: '~25 min',
    slides: SLIDE_SETS.council.length,
    description: 'Every chart, every data point. Strategy, readiness, and the full adoption arc.',
    accent: '#59BEC9',
    icon: '◈',
  },
  {
    key: 'exec',
    title: 'Executive Leadership',
    subtitle: 'The headline story',
    duration: '~8 min',
    slides: SLIDE_SETS.exec.length,
    description: 'Momentum, conviction signal, and a clear recommendation. Built for decision-makers.',
    accent: '#7DE69B',
    icon: '◆',
  },
  {
    key: 'dept',
    title: 'Full Department',
    subtitle: 'Your team, your story',
    duration: '~12 min',
    slides: SLIDE_SETS.dept.length,
    description: 'The arc from where you started to where you are — told in your own words.',
    accent: '#FFCD00',
    icon: '◉',
  },
];

// ── Pre-flight audience selection screen ──────────────────────────────────────
function LensSelect({ onSelect }) {
  const [hovered, setHovered] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#1a1d1e',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'DM Sans, sans-serif',
        padding: '48px 32px',
        boxSizing: 'border-box',
      }}
    >
      {/* Ambient glow */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 40%, rgba(46,168,74,0.09) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 780, width: '100%' }}>

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 10,
            color: 'rgba(125,230,155,0.55)',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}
        >
          AI Pulse — Baptist Health MarCom
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          style={{
            fontSize: 'clamp(28px, 5vw, 42px)',
            fontWeight: 900,
            color: '#fff',
            letterSpacing: '-0.025em',
            margin: '0 0 10px',
            lineHeight: 1.1,
          }}
        >
          Who are you presenting to?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28 }}
          style={{
            fontSize: 14,
            color: 'var(--text-support)',
            marginBottom: 44,
          }}
        >
          Each lens selects the right slides, order, and pacing for your audience.
        </motion.p>

        {/* Lens cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          width: '100%',
        }}>
          {LENSES.map((lens, i) => (
            <motion.button
              key={lens.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 + i * 0.07 }}
              onMouseEnter={() => setHovered(lens.key)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect(lens.key)}
              style={{
                background: hovered === lens.key
                  ? `rgba(${lens.key === 'council' ? '89,190,201' : lens.key === 'exec' ? '125,230,155' : '255,205,0'}, 0.09)`
                  : 'rgba(29,77,82,0.2)',
                border: `1px solid ${hovered === lens.key ? lens.accent + '55' : 'rgba(125,230,155,0.1)'}`,
                borderTop: `2px solid ${hovered === lens.key ? lens.accent : lens.accent + '44'}`,
                borderRadius: 14,
                padding: '28px 24px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                transform: hovered === lens.key ? 'translateY(-3px)' : 'none',
                boxShadow: hovered === lens.key ? `0 8px 32px rgba(0,0,0,0.3)` : 'none',
              }}
            >
              {/* Icon + title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20, color: lens.accent, lineHeight: 1 }}>{lens.icon}</span>
                <div>
                  <div style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: '#fff',
                    letterSpacing: '-0.01em',
                  }}>
                    {lens.title}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: lens.accent,
                    fontWeight: 500,
                    marginTop: 1,
                    opacity: 0.8,
                  }}>
                    {lens.subtitle}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.55)',
                lineHeight: 1.6,
                margin: 0,
                fontWeight: 400,
              }}>
                {lens.description}
              </p>

              {/* Meta */}
              <div style={{
                display: 'flex',
                gap: 12,
                marginTop: 4,
              }}>
                <span style={{
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontSize: 10,
                  color: lens.accent,
                  opacity: 0.7,
                  letterSpacing: '0.08em',
                }}>
                  {lens.slides} slides
                </span>
                <span style={{
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontSize: 10,
                  color: 'rgba(121,125,128,0.5)',
                  letterSpacing: '0.08em',
                }}>
                  {lens.duration}
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Skip hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          style={{
            marginTop: 28,
            fontSize: 12,
            color: 'rgba(121,125,128,0.4)',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            letterSpacing: '0.06em',
          }}
        >
          ESC to cancel
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Slide transitions ──────────────────────────────────────────────────────────
const variants = {
  enter:  (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
};

// ── Main presentation component ───────────────────────────────────────────────
export default function PresentationMode({ transforms, surveys, onClose }) {
  const [lens, setLens]           = useState(null);   // null = pre-flight screen
  const [current, setCurrent]     = useState(0);
  const [direction, setDirection] = useState(1);

  // Derive active slide set from chosen lens
  const slideIds = lens ? SLIDE_SETS[lens] : [];
  const slides   = slideIds.map(id => SLIDES_ALL.find(s => s.id === id)).filter(Boolean);

  const goTo = useCallback((next) => {
    if (next < 0 || next >= slides.length) return;
    setDirection(next > current ? 1 : -1);
    setCurrent(next);
  }, [current, slides.length]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        if (lens) { setLens(null); setCurrent(0); }
        else      { onClose(); }
        return;
      }
      if (!lens) return; // arrow keys only work inside a lens
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(current + 1);
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goTo(current - 1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, goTo, onClose, lens]);

  function renderSlide(id) {
    if (id === 'overview')  return <SlideOverview  transforms={transforms} />;
    if (id === 'wave-0')    return <SlideWave       transforms={transforms} wave={0} />;
    if (id === 'wave-1')    return <SlideWave       transforms={transforms} wave={1} />;
    if (id === 'wave-2')    return <SlideWave       transforms={transforms} wave={2} />;
    if (id === 'trends-a')  return <SlideTrends     transforms={transforms} charts={['sentiment','frequency']} />;
    if (id === 'trends-b')  return <SlideTrends     transforms={transforms} charts={['familiarity','confidence']} />;
    if (id === 'trends-c')  return <SlideTrends     transforms={transforms} charts={['journey','barriers']} />;
    if (id === 'team')      return <SlideTeam        transforms={transforms} surveys={surveys} />;
    if (id === 'spotlight') return <SlideSpotlight  transforms={transforms} />;
  }

  // ── Pre-flight screen ──────────────────────────────────────────────────────
  if (!lens) {
    return (
      <AnimatePresence>
        <LensSelect
          onSelect={(key) => { setLens(key); setCurrent(0); setDirection(1); }}
          onClose={onClose}
        />
      </AnimatePresence>
    );
  }

  // ── Slide view ─────────────────────────────────────────────────────────────
  const slide   = slides[current];
  const lensObj = LENSES.find(l => l.key === lens);
  const atStart = current === 0;
  const atEnd   = current === slides.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#1a1d1e',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div style={{
        height: 52,
        display: 'flex',
        alignItems: 'center',
        padding: '0 32px',
        borderBottom: '1px solid rgba(125,230,155,0.08)',
        flexShrink: 0,
        gap: 14,
        boxSizing: 'border-box',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 7, height: 7, borderRadius: '50%', background: '#2EA84A', boxShadow: '0 0 8px rgba(46,168,74,0.8)', flexShrink: 0 }}
          />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginLeft: 9 }}>Baptist Health</span>
          <span style={{ color: 'rgba(125,230,155,0.2)', fontSize: 18, margin: '0 10px', fontWeight: 300 }}>|</span>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#7DE69B' }}>AI Pulse</span>
        </div>

        <div style={{ width: 1, height: 20, background: 'rgba(125,230,155,0.1)' }} />

        {/* Lens badge */}
        <button
          onClick={() => { setLens(null); setCurrent(0); }}
          title="Switch audience"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${lensObj.accent}33`,
            borderRadius: 6,
            padding: '3px 8px',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
        >
          <span style={{ fontSize: 10, color: lensObj.accent }}>{lensObj.icon}</span>
          <span style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 9,
            color: lensObj.accent,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            opacity: 0.8,
          }}>
            {lensObj.title}
          </span>
        </button>

        {/* Slide label */}
        <span style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 10,
          color: '#797D80',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}>
          {slide?.label}
        </span>

        {/* Right side */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>

          {/* Dot indicators */}
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                title={slides[i]?.label}
                style={{
                  width: i === current ? 18 : 5,
                  height: 5,
                  borderRadius: 3,
                  background: i === current ? lensObj.accent : 'rgba(125,230,155,0.18)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.3s ease',
                  flexShrink: 0,
                }}
              />
            ))}
          </div>

          {/* Counter */}
          <span style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 11,
            color: '#797D80',
          }}>
            {current + 1} / {slides.length}
          </span>

          <span style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 10,
            color: 'rgba(121,125,128,0.4)',
            letterSpacing: '0.04em',
          }}>
            ESC to change audience
          </span>

          {/* Close × */}
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28,
              borderRadius: '50%',
              border: '1px solid rgba(125,230,155,0.2)',
              background: 'rgba(125,230,155,0.06)',
              color: '#7DE69B',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, lineHeight: 1, flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* ── Slide content ────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={slide?.id + '-' + current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
          >
            {slide && renderSlide(slide.id)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Bottom nav ───────────────────────────────────────────────────────── */}
      <div style={{
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        borderTop: '1px solid rgba(125,230,155,0.06)',
        flexShrink: 0,
      }}>
        <button
          onClick={() => goTo(current - 1)}
          disabled={atStart}
          style={{
            width: 40, height: 40, borderRadius: '50%',
            border: `1px solid ${atStart ? 'rgba(125,230,155,0.08)' : 'rgba(125,230,155,0.22)'}`,
            background: atStart ? 'transparent' : 'rgba(125,230,155,0.07)',
            color: atStart ? 'rgba(125,230,155,0.2)' : '#7DE69B',
            cursor: atStart ? 'default' : 'pointer',
            fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
        >←</button>

        <span style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 10,
          color: 'rgba(121,125,128,0.35)',
          letterSpacing: '0.08em',
          userSelect: 'none',
        }}>
          ← → arrow keys
        </span>

        <button
          onClick={() => goTo(current + 1)}
          disabled={atEnd}
          style={{
            width: 40, height: 40, borderRadius: '50%',
            border: `1px solid ${atEnd ? 'rgba(125,230,155,0.08)' : 'rgba(125,230,155,0.22)'}`,
            background: atEnd ? 'transparent' : 'rgba(125,230,155,0.07)',
            color: atEnd ? 'rgba(125,230,155,0.2)' : '#7DE69B',
            cursor: atEnd ? 'default' : 'pointer',
            fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
        >→</button>
      </div>
    </motion.div>
  );
}
