import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { useIsMobile } from '../hooks/useIsMobile';

// ─── Card dimensions ──────────────────────────────────────────────────────────
const CARD_W = 260;
const CARD_H = 520;

// ─── Arc layout: outer cards tilt outward and dip lower, center stands upright ─
const ARC_CONFIG = [
  { rotate: -10, dip: 40 },
  { rotate: -5,  dip: 15 },
  { rotate:  0,  dip:  0 },
  { rotate:  5,  dip: 15 },
  { rotate: 10,  dip: 40 },
];

// ─── Oracle readings (live count + pct injected) ──────────────────────────────
const ORACLE_LINES = {
  'confident-bystander': (n, pct) =>
    `${n} teammates — ${pct}% of your team — have the confidence but haven't yet had a moment that made it real. No barriers in their way. No friction to remove. All they need is the right first experience to turn potential into momentum.`,
  'thoughtful-skeptic': (n, pct) =>
    `${n} teammates (${pct}%) ask the hardest questions in the room — and they deserve real answers, not enthusiasm. Earn their trust with transparency and rigor, and the rest of the department will follow their lead.`,
  'blocked-believer': (n, pct) =>
    `${n} teammates (${pct}%) want to go further than the system allows. The will is there. The barrier is institutional — access, policy, tooling. One well-placed decision unlocks this entire group at once.`,
  'experimenter': (n, pct) =>
    `${n} teammates (${pct}%) are already in motion — trying tools, building habits, figuring out what works. They are the highest-ROI training investment in the department. The right support converts them into Multipliers.`,
  'multiplier': (n, pct) =>
    `${n} teammates — ${pct}% of your team — are already building with AI, not just using it. They pay out of pocket, work at the frontier, and pull the rest of the department forward. Protect their time and amplify their reach.`,
};

// ─── Archetype static definitions — AI Competency Rubric order I→V ───────────
// Order: Skeptic (Red) → Bystander (Orange) → Experimenter (Yellow) →
//        Blocked Believer (Green) → Multiplier (Blue)
const ARCHETYPE_DEFS = [
  {
    key: 'thoughtful-skeptic',
    _adoptionScore: 1,
    roman: 'I',
    image: '/Images/archetypes/archetype-5-thoughtful-skeptic.png',
    name: 'The Thoughtful Skeptic',
    tagline: 'Not resistant because they don\'t understand — because they do.',
    description:
      'Mixed or cautious sentiment paired with real use. They have earned concerns: accuracy, human oversight, workflow disruption. Their open-text responses are the most detailed in the dataset. They are not against AI. They have good questions worth taking seriously.',
    accentColor: '#E5554F',
    tension: 'Earned skepticism — not fear',
  },
  {
    key: 'confident-bystander',
    _adoptionScore: 2,
    roman: 'II',
    image: '/Images/archetypes/archetype-4-confident-bystander.png',
    name: 'The Confident Bystander',
    tagline: 'Nothing stopping them. Nothing moving them.',
    description:
      'High self-reported confidence, no listed barriers, but monthly or less frequency and no own-pocket investment. The behavior doesn\'t match the self-assessment — not because they\'re misleading, but because they haven\'t yet done the work that would make it true.',
    accentColor: '#F97316',
    tension: 'Untapped potential',
  },
  {
    key: 'experimenter',
    _adoptionScore: 3,
    roman: 'III',
    image: '/Images/archetypes/archetype-3-experimenter.png',
    name: 'The Experimenter',
    tagline: 'Curious, multi-tool, moveable — highest training ROI.',
    description:
      'Still in the Experimentation stage, trying 2–3 tools, learning what works. The barrier is the learning curve, not the will. The right training or tool access could convert them into the most advanced users faster than anyone else in the department.',
    accentColor: '#FFCD00',
    tension: 'Motion without traction — for now',
  },
  {
    key: 'blocked-believer',
    _adoptionScore: 4,
    roman: 'IV',
    image: '/Images/archetypes/archetype-2-blocked-believer.png',
    name: 'The Blocked Believer',
    tagline: 'Enthusiastic people slowed by organizational friction.',
    description:
      'Positive sentiment, high importance ratings, active weekly use — but something in the system is in the way. IT access, unclear guidelines, or tool costs are the friction. This is not a motivation problem. It is an infrastructure problem.',
    accentColor: '#2EA84A',
    tension: 'Enthusiastic people failed by the system',
  },
  {
    key: 'multiplier',
    _adoptionScore: 5,
    roman: 'V',
    image: '/Images/archetypes/archetype-1-multiplier.png',
    name: 'The Multiplier',
    tagline: 'Pulling the department forward — with or without a mandate.',
    description:
      'Daily users building with AI, not just using it. They design workflows, build agents, create custom tools, and think about AI as infrastructure. They pay out of pocket, rate importance at 5/5, and operate at Integration or Transformation stage. These are your internal champions.',
    accentColor: '#59BEC9',
    tension: 'Voluntary commitment, not compliance',
  },
];

// ─── Pill component ───────────────────────────────────────────────────────────
function Pill({ label, type }) {
  const colors = {
    green:  { bg: 'var(--accent-mint-bg)',   border: 'rgba(125,230,155,0.35)', text: 'var(--accent-mint)' },
    yellow: { bg: 'var(--accent-yellow-bg)', border: 'rgba(255,205,0,0.35)',   text: 'var(--accent-yellow)' },
  };
  const c = colors[type] || colors.yellow;
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: '0.03em',
      background: c.bg,
      border: `1px solid ${c.border}`,
      color: c.text,
      whiteSpace: 'nowrap',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      {label}
    </span>
  );
}

// ─── Card Back — ornate tarot back with accent-colored mandala ────────────────
function CardBack({ accentColor }) {
  const ac = accentColor;
  const radials = [0, 30, 60, 90, 120, 150].map(deg => {
    const rad = (Math.PI * deg) / 180;
    return {
      x1: 60 + 55 * Math.cos(rad), y1: 60 + 55 * Math.sin(rad),
      x2: 60 - 55 * Math.cos(rad), y2: 60 - 55 * Math.sin(rad),
    };
  });

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(160deg, #0b1316 0%, #141e22 40%, #0e1a1e 70%, #0b1316 100%)',
      borderRadius: 16,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 0 60px ${ac}22, inset 0 0 80px rgba(0,0,0,0.4)`,
    }}>
      {/* Outer ornate border */}
      <div style={{
        position: 'absolute', inset: 8,
        border: `1px solid ${ac}55`,
        borderRadius: 10,
        boxShadow: `inset 0 0 40px ${ac}0c`,
      }} />
      {/* Inner border */}
      <div style={{
        position: 'absolute', inset: 14,
        border: `1px solid ${ac}28`,
        borderRadius: 7,
      }} />

      {/* Corner diamonds */}
      {[
        { top: 5, left: 5 },
        { top: 5, right: 5 },
        { bottom: 5, left: 5 },
        { bottom: 5, right: 5 },
      ].map((pos, i) => (
        <div key={i} style={{
          position: 'absolute', ...pos,
          width: 14, height: 14,
          background: ac,
          transform: 'rotate(45deg)',
          opacity: 0.7,
        }} />
      ))}

      {/* Mid-side tick marks */}
      {[
        { top: '50%', left: 8, transform: 'translateY(-50%)' },
        { top: '50%', right: 8, transform: 'translateY(-50%)' },
      ].map((s, i) => (
        <div key={i} style={{
          position: 'absolute', ...s,
          width: 4, height: 22,
          background: ac,
          opacity: 0.4,
          borderRadius: 2,
        }} />
      ))}
      {[
        { left: '50%', top: 8, transform: 'translateX(-50%)' },
        { left: '50%', bottom: 8, transform: 'translateX(-50%)' },
      ].map((s, i) => (
        <div key={i} style={{
          position: 'absolute', ...s,
          width: 22, height: 4,
          background: ac,
          opacity: 0.4,
          borderRadius: 2,
        }} />
      ))}

      {/* Glow orb behind mandala */}
      <div style={{
        position: 'absolute',
        width: 220, height: 220,
        borderRadius: '50%',
        background: `radial-gradient(ellipse, ${ac}1e 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Central mandala SVG */}
      <svg width="190" height="190" viewBox="0 0 120 120" style={{ opacity: 0.28 }}>
        <circle cx="60" cy="60" r="55" stroke={ac} strokeWidth="0.8" fill="none" />
        <circle cx="60" cy="60" r="44" stroke={ac} strokeWidth="0.6" fill="none" />
        <circle cx="60" cy="60" r="32" stroke={ac} strokeWidth="0.8" fill="none" />
        {radials.map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke={ac} strokeWidth="0.4" />
        ))}
        {/* BH pineapple wireframe — paths inlined so fill matches accent color */}
        <svg x="36" y="36" width="48" height="48" viewBox="0 0 24 24">
          <path fill={ac} d="M12,7.93c-.83-1.78-2.63-3.01-4.71-3.01-.74,0-1.44.15-2.08.43.12,0,.25-.01.37-.01,1.83,0,3.41,1.05,4.18,2.59h2.24s0,0,0,0h0Z"/>
          <path fill={ac} d="M18.42,5.34c.13,0,.25,0,.37.01-.64-.28-1.34-.43-2.08-.43-2.09,0-3.89,1.23-4.71,3.01h0s2.24,0,2.24,0c0,0,0,0,0,0,.76-1.53,2.35-2.59,4.18-2.59h0Z"/>
          <path fill={ac} d="M15.74,3.73c-.16-.05-.32-.08-.49-.11-.08-.01-.16-.02-.24-.03-.1,0-.2-.01-.3-.01-.14,0-.27,0-.41.02-.91.1-1.71.53-2.3,1.16h0c-.59-.64-1.39-1.07-2.3-1.16-.13-.01-.27-.02-.41-.02-.1,0-.2,0-.3.01-.08,0-.16.02-.24.03-.17.02-.33.06-.49.11-.16.05-.31.1-.46.17.06,0,.12.01.18.02,1.8.23,3.27,1.35,4.01,2.87h0c.74-1.52,2.21-2.64,4.01-2.87.06,0,.12-.01.18-.02-.15-.07-.3-.12-.46-.17h0Z"/>
          <path fill={ac} d="M12,3.91h0c.58-.63,1.37-1.06,2.26-1.16.13-.01.26-.02.4-.02.06,0,.12,0,.18,0-.25-.11-.52-.18-.79-.22-.14-.02-.28-.03-.42-.03-.1,0-.21,0-.31.02-.08,0-.17.02-.25.04-.17.03-.34.08-.5.14-.42.15-.81.4-1.16.71.21.15.41.33.59.52h0Z"/>
          <polygon fill={ac} points="12.7 16.32 11.03 14.97 12.38 13.3 14.05 14.65 12.7 16.32 12.7 16.32"/>
          <polygon fill={ac} points="11.49 19.22 12.84 17.55 14.5 18.9 13.16 20.57 11.49 19.22 11.49 19.22"/>
          <polygon fill={ac} points="13.59 10.4 12.25 12.06 10.58 10.72 11.92 9.05 13.59 10.4 13.59 10.4"/>
          <polygon fill={ac} points="16.4 16.54 15.06 18.21 13.39 16.87 14.73 15.2 16.4 16.54 16.4 16.54"/>
          <path fill={ac} d="M7.99,12.52l-.99-.79c.26-.71.62-1.36,1.04-1.91l1.29,1.04-1.34,1.67h0Z"/>
          <polygon fill={ac} points="11.69 12.75 10.35 14.42 8.68 13.07 10.02 11.41 11.69 12.75 11.69 12.75"/>
          <polygon fill={ac} points="6.78 15.43 8.13 13.76 9.8 15.1 8.45 16.77 6.78 15.43 6.78 15.43"/>
          <path fill={ac} d="M10.94,19.91l1.64,1.32c-.18.01-.35.02-.54.02-.73,0-1.38-.09-1.96-.28l.86-1.06h0Z"/>
          <path fill={ac} d="M6.73,12.63l.71.57-.95,1.18c.02-.61.11-1.2.24-1.76h0Z"/>
          <polygon fill={ac} points="12.15 17 10.8 18.67 9.14 17.33 10.48 15.66 12.15 17 12.15 17"/>
          <path fill={ac} d="M15.74,18.77l1.34-1.67.21.17c-.2.77-.51,1.44-.92,2.01l-.64-.52h0Z"/>
          <path fill={ac} d="M17.52,13.56c.05.39.08.78.08,1.19,0,.11,0,.21,0,.32l-.64.79-1.67-1.34,1.34-1.67.89.72h0Z"/>
          <path fill={ac} d="M15.19,19.45l.61.49c-.5.47-1.12.82-1.85,1.04l1.24-1.53h0Z"/>
          <path fill={ac} d="M7.63,19.19l.95-1.18,1.67,1.34-1.02,1.27c-.65-.35-1.18-.83-1.6-1.43h0Z"/>
          <path fill={ac} d="M16.5,11.61l-1.67-1.34.77-.96c.49.53.91,1.16,1.24,1.87l-.35.43h0Z"/>
          <path fill={ac} d="M7.9,17.46l-.73.91c-.27-.58-.45-1.24-.56-1.96l1.3,1.05h0Z"/>
          <polygon fill={ac} points="14.6 13.96 12.93 12.62 14.28 10.95 15.94 12.29 14.6 13.96 14.6 13.96"/>
          <path fill={ac} d="M8.63,9.15c.18-.18.36-.34.56-.49h1.92l-1.21,1.51-1.26-1.02h0Z"/>
          <path fill={ac} d="M14.95,8.71l-.81,1-1.3-1.05h2.05s.04.03.06.05h0Z"/>
        </svg>
      </svg>

      {/* Bottom label */}
      <div style={{
        position: 'absolute', bottom: 24,
        fontSize: 9, fontWeight: 700, letterSpacing: '0.24em',
        color: ac, opacity: 0.6, textTransform: 'uppercase',
        fontFamily: 'DM Sans, sans-serif',
      }}>
        ✦ AI Pulse ✦
      </div>
    </div>
  );
}

// ─── Card Front — portrait + color overlay + oracle in panel (no pills) ──────
function CardFront({ def, data, revealed, onPortraitClick }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      borderRadius: 16,
      overflow: 'hidden',
      position: 'relative',
      background: '#0b1316',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: `0 12px 50px ${def.accentColor}28`,
    }}>
      {/* Top accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: def.accentColor,
        zIndex: 3,
      }} />

      {/* Portrait image — top 60%, clickable to open full-screen */}
      <div
        style={{ position: 'relative', height: '60%', overflow: 'hidden', flexShrink: 0, cursor: 'zoom-in' }}
        onClick={e => { e.stopPropagation(); onPortraitClick(); }}
        title="Click to view full portrait"
      >
        <img
          src={def.image}
          alt={def.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
        />
        {/* Layer 1: hue shift */}
        <div style={{
          position: 'absolute', inset: 0,
          background: def.accentColor, opacity: 0.45,
          mixBlendMode: 'color', pointerEvents: 'none',
        }} />
        {/* Layer 2: luminosity boost — makes color pop on dark images */}
        <div style={{
          position: 'absolute', inset: 0,
          background: def.accentColor, opacity: 0.12,
          mixBlendMode: 'screen', pointerEvents: 'none',
        }} />
        {/* Gradient fade into info panel */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 70,
          background: 'linear-gradient(to bottom, transparent, #0b1316)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Info panel — bottom 40% */}
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column',
        padding: '8px 14px 12px',
        gap: 6,
        minHeight: 0,
      }}>
        {/* Roman numeral */}
        <span style={{
          fontSize: 10, fontWeight: 700, color: def.accentColor,
          letterSpacing: '0.2em', fontFamily: 'DM Sans, sans-serif',
        }}>
          {def.roman}
        </span>

        {/* Thin accent divider */}
        <div style={{ height: 1, background: `${def.accentColor}40`, flexShrink: 0 }} />

        {/* Count + % — the visual anchor */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{
            fontSize: 48, fontWeight: 900, color: def.accentColor,
            lineHeight: 1, fontFamily: 'DM Sans, sans-serif',
          }}>
            {data.count}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-support)', fontFamily: 'DM Sans, sans-serif' }}>
            · {data.pct}% of team
          </span>
        </div>

        {/* Archetype name */}
        <div style={{
          fontSize: 13, fontWeight: 800, color: '#fff',
          letterSpacing: '0.07em', textTransform: 'uppercase', lineHeight: 1.2,
          fontFamily: 'DM Sans, sans-serif',
        }}>
          {def.name.replace('The ', '')}
        </div>

        {/* Oracle reading — fades in after flip */}
        <AnimatePresence>
          {revealed && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, delay: 0.65 }}
              style={{
                margin: 0, fontSize: 13, fontStyle: 'italic',
                color: '#e8f0f5', lineHeight: 1.35,
                fontFamily: 'DM Sans, sans-serif',
                textShadow: '0 1px 6px rgba(0,0,0,0.9)',
                display: '-webkit-box', WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}
            >
              {ORACLE_LINES[def.key]?.(data.count, data.pct)}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* SVG ornate border frame */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}
        viewBox="0 0 260 520"
        preserveAspectRatio="none"
      >
        <rect x="5" y="5" width="250" height="510" rx="13"
          fill="none" stroke={def.accentColor} strokeWidth="1" strokeOpacity="0.5" />
        <rect x="9" y="9" width="242" height="502" rx="10"
          fill="none" stroke={def.accentColor} strokeWidth="0.5" strokeOpacity="0.22" />
        {/* Corner diamonds */}
        <rect x="1.5" y="1.5" width="9" height="9" fill={def.accentColor} opacity="0.8"
          transform="rotate(45 6 6)" />
        <rect x="249.5" y="1.5" width="9" height="9" fill={def.accentColor} opacity="0.8"
          transform="rotate(45 254 6)" />
        <rect x="1.5" y="509.5" width="9" height="9" fill={def.accentColor} opacity="0.8"
          transform="rotate(45 6 514)" />
        <rect x="249.5" y="509.5" width="9" height="9" fill={def.accentColor} opacity="0.8"
          transform="rotate(45 254 514)" />
        {/* Mid-side marks */}
        <line x1="5" y1="260" x2="15" y2="260"
          stroke={def.accentColor} strokeWidth="1.2" strokeOpacity="0.45" />
        <line x1="245" y1="260" x2="255" y2="260"
          stroke={def.accentColor} strokeWidth="1.2" strokeOpacity="0.45" />
      </svg>
    </div>
  );
}

// ─── Full-screen portrait modal ───────────────────────────────────────────────
function FullScreenPortrait({ def, data, dynamicPills, onClose }) {
  useEffect(() => {
    const fn = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  const quote = data.quotes?.[0];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.9)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.88, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          display: 'flex',
          maxWidth: 880, width: '90vw', maxHeight: '90vh',
          background: 'rgba(11,19,22,0.98)',
          border: `1px solid ${def.accentColor}30`,
          borderRadius: 20, overflow: 'hidden',
          cursor: 'default',
        }}
      >
        {/* Left: portrait */}
        <div style={{ flex: '0 0 320px', position: 'relative' }}>
          <img
            src={def.image}
            alt={def.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: def.accentColor, opacity: 0.25, mixBlendMode: 'color' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: def.accentColor }} />
          {/* Right-edge bleed into content panel */}
          <div style={{
            position: 'absolute', top: 0, right: 0, bottom: 0, width: 80,
            background: 'linear-gradient(to right, transparent, rgba(11,19,22,0.98))',
            pointerEvents: 'none',
          }} />
        </div>

        {/* Right: full profile */}
        <div style={{
          flex: 1, padding: '36px 36px 36px 24px',
          display: 'flex', flexDirection: 'column', gap: 16,
          overflowY: 'auto', minWidth: 0,
        }}>
          {/* Header */}
          <div>
            <div style={{
              fontSize: 11, color: def.accentColor, fontWeight: 700,
              letterSpacing: '0.18em', marginBottom: 4,
              fontFamily: 'DM Sans, sans-serif',
            }}>
              {def.roman}
            </div>
            <h2 style={{
              margin: 0, fontSize: 26, fontWeight: 900, color: '#fff',
              letterSpacing: '-0.02em', fontFamily: 'DM Sans, sans-serif',
            }}>
              {def.name}
            </h2>
            <div style={{
              marginTop: 6, fontSize: 13, color: 'var(--text-support)',
              fontStyle: 'italic', fontFamily: 'DM Sans, sans-serif',
            }}>
              {def.tagline}
            </div>
          </div>

          {/* Count callout with oracle */}
          <div style={{
            background: `${def.accentColor}12`,
            border: `1px solid ${def.accentColor}35`,
            borderRadius: 12, padding: '14px 18px',
          }}>
            <span style={{
              fontSize: 30, fontWeight: 900, color: def.accentColor,
              lineHeight: 1, fontFamily: 'DM Sans, sans-serif',
            }}>
              {data.count}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-support)', marginLeft: 10, fontFamily: 'DM Sans, sans-serif' }}>
              teammates · {data.pct}% of the team
            </span>
            <p style={{
              margin: '8px 0 0', fontSize: 12, fontStyle: 'italic',
              color: '#b0b8c0', lineHeight: 1.6, fontFamily: 'DM Sans, sans-serif',
            }}>
              {ORACLE_LINES[def.key]?.(data.count, data.pct)}
            </p>
          </div>

          {/* Description */}
          <p style={{ margin: 0, fontSize: 13, color: '#b0b8c0', lineHeight: 1.75, fontFamily: 'DM Sans, sans-serif' }}>
            {def.description}
          </p>

          {/* Tension callout */}
          <div style={{
            borderLeft: `3px solid ${def.accentColor}`,
            padding: '10px 14px',
            background: `${def.accentColor}0a`,
            borderRadius: '0 8px 8px 0',
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: def.accentColor,
              textTransform: 'uppercase', letterSpacing: '0.06em',
              fontFamily: 'DM Sans, sans-serif',
            }}>
              The tension
            </div>
            <p style={{ margin: '3px 0 0', fontSize: 13, color: '#dde4e8', fontStyle: 'italic', fontFamily: 'DM Sans, sans-serif' }}>
              {def.tension}
            </p>
          </div>

          {/* Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {dynamicPills.map((p, i) => <Pill key={i} label={p.label} type={p.type} />)}
          </div>

          {/* Representative quote */}
          {quote && (
            <div style={{ borderLeft: '2px solid rgba(125,230,155,0.25)', paddingLeft: 14 }}>
              <p style={{
                margin: 0, fontSize: 13, color: '#c8d4db',
                fontStyle: 'italic', lineHeight: 1.65, fontFamily: 'DM Sans, sans-serif',
              }}>
                "{quote}"
              </p>
              <span style={{
                fontSize: 10, color: '#4a5158', marginTop: 4,
                display: 'block', fontFamily: 'DM Sans, sans-serif',
              }}>
                — from the survey data
              </span>
            </div>
          )}

          {/* Close hint */}
          <div style={{ fontSize: 11, color: '#4a5158', marginTop: 'auto', fontFamily: 'DM Sans, sans-serif' }}>
            Press ESC or click outside to close
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Dynamic pills builder ────────────────────────────────────────────────────
function buildDynamicPills(key, data) {
  const { stats } = data;
  switch (key) {
    case 'multiplier':
      return [
        { label: `${stats.dailyPct}% daily use`,             type: 'green'  },
        { label: `${stats.ownPocketPct}% paying own pocket`, type: 'green'  },
        { label: 'Integration / Transformation',             type: 'green'  },
        { label: 'Voluntary commitment',                     type: 'yellow' },
      ];
    case 'blocked-believer':
      return [
        { label: `${stats.positivePct}% positive sentiment`, type: 'green'  },
        { label: 'High importance (4–5)',                    type: 'green'  },
        { label: 'System friction ahead',                    type: 'yellow' },
        { label: 'Weekly, not daily',                        type: 'yellow' },
      ];
    case 'experimenter':
      return [
        { label: `Avg ${stats.toolCount} tools tried`,       type: 'green'  },
        { label: 'Exploration stage',                        type: 'yellow' },
        { label: 'Learning fast',                            type: 'yellow' },
        { label: 'Highest training ROI',                     type: 'green'  },
      ];
    case 'thoughtful-skeptic':
      return [
        { label: 'Thoughtful evaluator',                     type: 'yellow' },
        { label: 'Calibrated expectations',                  type: 'yellow' },
        { label: 'Weekly to monthly use',                    type: 'yellow' },
        { label: 'Most detailed open-text',                  type: 'green'  },
      ];
    case 'confident-bystander':
      return [
        { label: 'Measured pace',                            type: 'yellow' },
        { label: 'No barriers listed',                       type: 'yellow' },
        { label: 'Clear runway ahead',                       type: 'yellow' },
        { label: 'Untapped potential',                       type: 'yellow' },
      ];
    default:
      return [];
  }
}

// ─── Single archetype card — arc position + 3D tilt + flip ───────────────────
function ArchetypeCard({ def, data, index, revealed, onReveal, onFocus, isMobile }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);
  const arc = isMobile ? { rotate: 0, dip: 0 } : (ARC_CONFIG[index] ?? { rotate: 0, dip: 0 });

  if (!data) return null;

  function handleMouseMove(e) {
    if (revealed) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setTilt({
      x: ((e.clientX - cx) / (rect.width / 2)) * 12,
      y: -((e.clientY - cy) / (rect.height / 2)) * 10,
    });
  }

  function handleMouseLeave() { setTilt({ x: 0, y: 0 }); }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
      {/* Arc wrapper — positions card in fan spread */}
      <div style={{
        transform: `rotate(${arc.rotate}deg) translateY(${arc.dip}px)`,
        transformOrigin: 'bottom center',
        transition: 'transform 0.3s ease',
      }}>
        {/* Perspective + mouse tracking container */}
        <div
          ref={cardRef}
          style={{ width: CARD_W, height: CARD_H, perspective: 900, cursor: 'pointer' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Tilt layer — tracks mouse in 3D (spring physics) */}
          <motion.div
            animate={revealed ? { rotateX: 0, rotateY: 0 } : { rotateX: tilt.y, rotateY: tilt.x }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{ width: '100%', height: '100%', transformStyle: 'preserve-3d' }}
          >
            {/* Flip layer — card flip on click */}
            <motion.div
              animate={{ rotateY: revealed ? 180 : 0 }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
              onClick={() => onReveal(def.key)}
              whileHover={{ scale: revealed ? 1 : 1.03 }}
              style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d' }}
            >
              {/* Back face */}
              <div style={{
                position: 'absolute', inset: 0,
                backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
              }}>
                <CardBack accentColor={def.accentColor} />
              </div>
              {/* Front face */}
              <div style={{
                position: 'absolute', inset: 0,
                backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}>
                <CardFront
                  def={def}
                  data={data}
                  revealed={revealed}
                  onPortraitClick={() => onFocus(def.key)}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Archetypes section ──────────────────────────────────────────────────
export default function Archetypes({ transforms }) {
  const { archetypes } = transforms || {};
  const [revealedCards, setRevealedCards] = useState(new Set());
  const [revealing, setRevealing]         = useState(false);
  const [focusedKey, setFocusedKey]       = useState(null);
  const isMobile = useIsMobile();

  if (!archetypes) return null;

  const total      = Object.values(archetypes).reduce((s, a) => s + a.count, 0);
  const allRevealed = revealedCards.size === ARCHETYPE_DEFS.length;

  function handleReveal(key) {
    setRevealedCards(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  function revealAll() {
    if (revealing) return;
    setRevealing(true);
    ARCHETYPE_DEFS.forEach((def, i) => {
      setTimeout(() => {
        setRevealedCards(prev => new Set([...prev, def.key]));
        if (i === ARCHETYPE_DEFS.length - 1) setRevealing(false);
      }, i * 480);
    });
  }

  const focusedDef  = ARCHETYPE_DEFS.find(d => d.key === focusedKey);
  const focusedData = focusedKey ? archetypes[focusedKey] : null;

  return (
    <section style={{ padding: isMobile ? '48px 0 60px' : '80px 0 100px', width: '100%', boxSizing: 'border-box' }}>

      {/* ── Section header — constrained to match DeepDive alignment ── */}
      <div style={{ maxWidth: 1360, margin: '0 auto', padding: isMobile ? '0 16px' : '0 32px', marginBottom: 48 }}>
        <div style={{
          display: 'inline-block',
          padding: '4px 12px',
          borderRadius: 20,
          background: 'var(--accent-mint-bg)',
          border: '1px solid rgba(125,230,155,0.25)',
          color: 'var(--accent-mint)',
          fontSize: 11, fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          marginBottom: 16,
          fontFamily: 'DM Sans, sans-serif',
        }}>
          Team Archetypes
        </div>

        <h2 style={{
          margin: '0 0 12px',
          fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: 900, color: 'var(--text-primary)',
          letterSpacing: '-0.02em', lineHeight: 1.15,
          fontFamily: 'DM Sans, sans-serif',
        }}>
          A reading of {total} voices.
        </h2>

        <p style={{
          margin: '0 0 28px', fontSize: 15, color: 'var(--text-support)',
          maxWidth: 520, lineHeight: 1.7,
          fontFamily: 'DM Sans, sans-serif',
        }}>
          Five archetypes built from 16 dimensions per person.
          Click any card to reveal who lives there — or deal the full spread at once.
        </p>

        {/* Reveal button — hidden once all are revealed */}
        {!allRevealed && (
          <motion.button
            onClick={revealAll}
            disabled={revealing}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: '12px 28px',
              background: 'linear-gradient(135deg, rgba(125,230,155,0.15), rgba(89,190,201,0.12))',
              border: '1px solid rgba(125,230,155,0.4)',
              borderRadius: 24,
              color: 'var(--accent-mint)',
              fontSize: 13, fontWeight: 700,
              cursor: revealing ? 'not-allowed' : 'pointer',
              letterSpacing: '0.04em',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            {revealing ? 'Dealing...' : '✦ Reveal the Team'}
          </motion.button>
        )}
      </div>

      {/* ── Arc spread — scrollable on mobile, full-width fan on desktop ── */}
      <div style={{
        overflowX: isMobile ? 'auto' : 'hidden',
        overflowY: 'visible',
        padding: isMobile ? '0 0 40px' : '0 0 110px',
        width: '100%',
        WebkitOverflowScrolling: 'touch',
      }}>
        <motion.div style={{
          display: 'flex', gap: isMobile ? 12 : 8,
          justifyContent: isMobile ? 'flex-start' : 'center',
          alignItems: isMobile ? 'center' : 'flex-end',
          width: isMobile ? 'max-content' : '100%',
          paddingBottom: 24,
          paddingLeft: isMobile ? 16 : 16,
          paddingRight: isMobile ? 16 : 16,
          boxSizing: 'border-box',
        }}>
          {ARCHETYPE_DEFS.map((def, i) => (
            <motion.div
              key={def.key}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <ArchetypeCard
                def={def}
                data={archetypes[def.key]}
                index={i}
                revealed={revealedCards.has(def.key)}
                onReveal={handleReveal}
                onFocus={setFocusedKey}
                isMobile={isMobile}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── Footer note ── */}
      <p style={{
        textAlign: 'center', fontSize: 12, color: '#3a4048',
        maxWidth: 1360, margin: '0 auto', padding: '0 32px', lineHeight: 1.6,
        fontFamily: 'DM Sans, sans-serif',
      }}>
        Each respondent scores 0–100 across all five archetypes via 16-dimension affinity scoring.
        Highest score wins. Near-ties promote to the more advanced adoption stage.
      </p>

      {/* ── Full-screen portrait modal ── */}
      <AnimatePresence>
        {focusedKey && focusedDef && focusedData && (
          <FullScreenPortrait
            def={focusedDef}
            data={focusedData}
            dynamicPills={buildDynamicPills(focusedKey, focusedData)}
            onClose={() => setFocusedKey(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
