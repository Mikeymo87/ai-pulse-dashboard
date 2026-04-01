import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SlideOverview  from './slides/SlideOverview';
import SlideWave      from './slides/SlideWave';
import SlideTrends    from './slides/SlideTrends';
import SlideTeam      from './slides/SlideTeam';
import SlideSpotlight from './slides/SlideSpotlight';

const SLIDES = [
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

const variants = {
  enter:  (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
};

export default function PresentationMode({ transforms, surveys, onClose }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = useCallback((next) => {
    if (next < 0 || next >= SLIDES.length) return;
    setDirection(next > current ? 1 : -1);
    setCurrent(next);
  }, [current]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape')                               { onClose(); return; }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown')  goTo(current + 1);
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')    goTo(current - 1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, goTo, onClose]);

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

  const slide  = SLIDES[current];
  const atStart = current === 0;
  const atEnd   = current === SLIDES.length - 1;

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
        fontFamily: 'Inter, sans-serif',
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

        {/* Slide label */}
        <span style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 10,
          color: '#797D80',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}>
          {slide.label}
        </span>

        {/* Right side */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>

          {/* Dot indicators */}
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                title={SLIDES[i].label}
                style={{
                  width: i === current ? 18 : 5,
                  height: 5,
                  borderRadius: 3,
                  background: i === current ? '#7DE69B' : 'rgba(125,230,155,0.18)',
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
            {current + 1} / {SLIDES.length}
          </span>

          <span style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 10,
            color: 'rgba(121,125,128,0.4)',
            letterSpacing: '0.04em',
          }}>
            ESC to exit
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

      {/* ── Slide content — hard-clipped, no scrollbar ever ──────────────────── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={slide.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',   // hard clip — slides must fit, no scrollbar
            }}
          >
            {renderSlide(slide.id)}
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
