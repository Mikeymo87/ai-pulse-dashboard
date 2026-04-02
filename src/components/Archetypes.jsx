import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Card dimensions ──────────────────────────────────────────────────────────
const CARD_W = 200;
const CARD_H = 320;

// ─── Archetype static definitions ────────────────────────────────────────────
// Internal _adoptionScore: 1–5 — for classification only, never rendered.
const ARCHETYPE_DEFS = [
  {
    key: 'confident-bystander',
    _adoptionScore: 1,
    roman: 'I',
    image: '/Images/archetypes/archetype-4-confident-bystander.png',
    name: 'The Confident Bystander',
    tagline: 'Nothing stopping them. Nothing moving them.',
    description:
      'High self-reported confidence, no listed barriers, but monthly or less frequency and no own-pocket investment. The behavior doesn\'t match the self-assessment — not because they\'re misleading, but because they haven\'t yet done the work that would make it true.',
    accentColor: '#797D80',
    pills: [
      { label: 'Measured pace', type: 'yellow' },
      { label: 'No barriers listed', type: 'yellow' },
      { label: 'Building confidence', type: 'yellow' },
      { label: 'Clear runway ahead', type: 'yellow' },
    ],
    tension: 'Untapped potential',
  },
  {
    key: 'thoughtful-skeptic',
    _adoptionScore: 2,
    roman: 'II',
    image: '/Images/archetypes/archetype-5-thoughtful-skeptic.png',
    name: 'The Thoughtful Skeptic',
    tagline: 'Not resistant because they don\'t understand — because they do.',
    description:
      'Mixed or cautious sentiment paired with real use. They have earned concerns: accuracy, human oversight, workflow disruption. Their open-text responses are the most detailed in the dataset. They are not against AI. They have good questions worth taking seriously.',
    accentColor: '#59BEC9',
    pills: [
      { label: 'Thoughtful evaluator', type: 'yellow' },
      { label: 'Calibrated expectations', type: 'yellow' },
      { label: 'Weekly to monthly use', type: 'yellow' },
      { label: 'Most detailed open-text', type: 'green' },
    ],
    tension: 'Earned skepticism — not fear',
  },
  {
    key: 'blocked-believer',
    _adoptionScore: 3,
    roman: 'III',
    image: '/Images/archetypes/archetype-2-blocked-believer.png',
    name: 'The Blocked Believer',
    tagline: 'Enthusiastic people slowed by organizational friction.',
    description:
      'Positive sentiment, high importance ratings, active weekly use — but something in the system is in the way. IT access, unclear guidelines, or tool costs are the friction. This is not a motivation problem. It is an infrastructure problem.',
    accentColor: '#59BEC9',
    pills: [
      { label: 'Positive sentiment', type: 'green' },
      { label: 'High importance (4–5)', type: 'green' },
      { label: 'System friction ahead', type: 'yellow' },
      { label: 'Weekly, not daily', type: 'yellow' },
    ],
    tension: 'Enthusiastic people failed by the system',
  },
  {
    key: 'experimenter',
    _adoptionScore: 4,
    roman: 'IV',
    image: '/Images/archetypes/archetype-3-experimenter.png',
    name: 'The Experimenter',
    tagline: 'Curious, multi-tool, moveable — highest training ROI.',
    description:
      'Still in the Experimentation stage, trying 2–3 tools, learning what works. The barrier is the learning curve, not the will. The right training or tool access could convert them into the most advanced users faster than anyone else in the department.',
    accentColor: '#FFCD00',
    pills: [
      { label: '2+ tools tried', type: 'green' },
      { label: 'Stage: Experimentation', type: 'yellow' },
      { label: 'Learning fast', type: 'yellow' },
      { label: 'High training ROI potential', type: 'green' },
    ],
    tension: 'Motion without traction — for now',
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
    accentColor: '#7DE69B',
    pills: [
      { label: 'Daily use', type: 'green' },
      { label: 'Building agents + workflows', type: 'green' },
      { label: 'Paying own pocket', type: 'green' },
      { label: 'Voluntary commitment', type: 'yellow' },
    ],
    tension: 'Voluntary commitment, not compliance',
  },
];

// ─── Pill component ───────────────────────────────────────────────────────────

function Pill({ label, type }) {
  const colors = {
    green:  { bg: 'rgba(125,230,155,0.12)', border: 'rgba(125,230,155,0.35)', text: '#7DE69B' },
    yellow: { bg: 'rgba(255,205,0,0.12)',   border: 'rgba(255,205,0,0.35)',   text: '#FFCD00' },
  };
  const c = colors[type] || colors.yellow;
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.03em',
      background: c.bg,
      border: `1px solid ${c.border}`,
      color: c.text,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

// ─── Card Back ────────────────────────────────────────────────────────────────

function CardBack({ accentColor }) {
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
      background: 'linear-gradient(135deg, #0b1316 0%, #1a2428 50%, #0b1316 100%)',
      borderRadius: 12,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 0 40px ${accentColor}18`,
    }}>
      {/* Outer ornate border */}
      <div style={{
        position: 'absolute', inset: 8,
        border: `1px solid ${accentColor}55`,
        borderRadius: 8,
        boxShadow: `inset 0 0 24px ${accentColor}0a`,
      }} />
      {/* Inner border */}
      <div style={{
        position: 'absolute', inset: 13,
        border: `1px solid ${accentColor}28`,
        borderRadius: 5,
      }} />

      {/* Corner diamonds — all 4 corners */}
      {[
        { top: 6, left: 6 },
        { top: 6, right: 6 },
        { bottom: 6, left: 6 },
        { bottom: 6, right: 6 },
      ].map((pos, i) => (
        <div key={i} style={{
          position: 'absolute', ...pos,
          width: 10, height: 10,
          background: accentColor,
          transform: 'rotate(45deg)',
          opacity: 0.75,
        }} />
      ))}

      {/* Mid-side tick marks */}
      {[
        { top: '50%', left: 8, transform: 'translateY(-50%)' },
        { top: '50%', right: 8, transform: 'translateY(-50%)' },
      ].map((s, i) => (
        <div key={i} style={{
          position: 'absolute', ...s,
          width: 4, height: 14,
          background: accentColor,
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
          width: 14, height: 4,
          background: accentColor,
          opacity: 0.4,
          borderRadius: 2,
        }} />
      ))}

      {/* Central mandala SVG */}
      <svg width="130" height="130" viewBox="0 0 120 120" style={{ opacity: 0.22 }}>
        <circle cx="60" cy="60" r="55" stroke="#7DE69B" strokeWidth="0.8" fill="none" />
        <circle cx="60" cy="60" r="44" stroke="#7DE69B" strokeWidth="0.6" fill="none" />
        <circle cx="60" cy="60" r="32" stroke="#7DE69B" strokeWidth="0.8" fill="none" />
        <circle cx="60" cy="60" r="20" stroke="#7DE69B" strokeWidth="0.6" fill="none" />
        <circle cx="60" cy="60" r="8"  stroke="#7DE69B" strokeWidth="1"   fill="none" />
        {radials.map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke="#7DE69B" strokeWidth="0.4" />
        ))}
        {/* Outer star */}
        <polygon
          points="60,8 64,22 78,22 67,31 71,45 60,36 49,45 53,31 42,22 56,22"
          stroke="#7DE69B" strokeWidth="0.7" fill="none"
        />
        {/* Inner star */}
        <polygon
          points="60,40 62,47 70,47 64,52 66,59 60,55 54,59 56,52 50,47 58,47"
          stroke="#7DE69B" strokeWidth="0.7" fill="none"
        />
      </svg>

      {/* Bottom label */}
      <div style={{
        position: 'absolute', bottom: 18,
        fontSize: 8, fontWeight: 700, letterSpacing: '0.22em',
        color: accentColor, opacity: 0.65, textTransform: 'uppercase',
        fontFamily: 'DM Sans, sans-serif',
      }}>
        ✦ AI Pulse ✦
      </div>
    </div>
  );
}

// ─── Card Front ───────────────────────────────────────────────────────────────

function CardFront({ def }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      borderRadius: 12,
      overflow: 'hidden',
      position: 'relative',
      background: '#0b1316',
    }}>
      {/* Top accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: def.accentColor,
        zIndex: 3,
      }} />

      {/* Portrait image */}
      <img
        src={def.image}
        alt={def.name}
        style={{
          width: '100%',
          height: '78%',
          objectFit: 'cover',
          objectPosition: 'top center',
          display: 'block',
        }}
      />

      {/* Gradient: image fades into bottom band */}
      <div style={{
        position: 'absolute',
        bottom: '22%', left: 0, right: 0, height: 90,
        background: 'linear-gradient(to bottom, transparent, #0b1316)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Ornate SVG border frame over everything */}
      <svg
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          pointerEvents: 'none',
          zIndex: 2,
        }}
        viewBox="0 0 200 320"
        preserveAspectRatio="none"
      >
        {/* Outer frame */}
        <rect x="5" y="5" width="190" height="310" rx="9"
          fill="none" stroke={def.accentColor} strokeWidth="1" strokeOpacity="0.55" />
        {/* Inner frame */}
        <rect x="9" y="9" width="182" height="302" rx="7"
          fill="none" stroke={def.accentColor} strokeWidth="0.5" strokeOpacity="0.28" />
        {/* Corner diamonds */}
        <rect x="2" y="2" width="8" height="8" fill={def.accentColor} opacity="0.85"
          transform="rotate(45 6 6)" />
        <rect x="190" y="2" width="8" height="8" fill={def.accentColor} opacity="0.85"
          transform="rotate(45 194 6)" />
        <rect x="2" y="310" width="8" height="8" fill={def.accentColor} opacity="0.85"
          transform="rotate(45 6 314)" />
        <rect x="190" y="310" width="8" height="8" fill={def.accentColor} opacity="0.85"
          transform="rotate(45 194 314)" />
        {/* Mid-side marks */}
        <line x1="5" y1="160" x2="13" y2="160"
          stroke={def.accentColor} strokeWidth="1.2" strokeOpacity="0.5" />
        <line x1="187" y1="160" x2="195" y2="160"
          stroke={def.accentColor} strokeWidth="1.2" strokeOpacity="0.5" />
        {/* Divider line above name band */}
        <line x1="16" y1="248" x2="184" y2="248"
          stroke={def.accentColor} strokeWidth="0.5" strokeOpacity="0.3" />
      </svg>

      {/* Bottom name band */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '22%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 14px',
        gap: 5,
        zIndex: 3,
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700,
          color: def.accentColor,
          letterSpacing: '0.2em',
          opacity: 0.85,
          fontFamily: 'DM Sans, sans-serif',
        }}>
          {def.roman}
        </div>
        <div style={{
          fontSize: 10, fontWeight: 800, color: '#ffffff',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          textAlign: 'center', lineHeight: 1.25,
          fontFamily: 'DM Sans, sans-serif',
        }}>
          {def.name.replace('The ', '')}
        </div>
      </div>
    </div>
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

// ─── Single archetype card ────────────────────────────────────────────────────

function ArchetypeCard({ def, data, index }) {
  const [flipped, setFlipped]   = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  if (!data) return null;

  const dynamicPills = buildDynamicPills(def.key, data);
  const quote = data.quotes[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>

      {/* ── 3D flip card ── */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        style={{
          width: CARD_W,
          height: CARD_H,
          perspective: 1000,
          cursor: 'pointer',
          flexShrink: 0,
        }}
        onClick={() => setFlipped(v => !v)}
        title={flipped ? 'Click to flip back' : `Click to reveal ${def.name}`}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Back face (visible by default) */}
          <div style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}>
            <CardBack accentColor={def.accentColor} />
          </div>

          {/* Front face (visible after flip) */}
          <div style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}>
            <CardFront def={def} data={data} />
          </div>
        </motion.div>
      </motion.div>

      {/* ── Expandable info pill below card ── */}
      <div style={{ width: CARD_W }}>
        <button
          onClick={() => setInfoOpen(v => !v)}
          style={{
            width: '100%',
            background: infoOpen ? `${def.accentColor}18` : 'rgba(255,255,255,0.04)',
            border: `1px solid ${infoOpen ? def.accentColor + '55' : 'rgba(125,230,155,0.12)'}`,
            borderRadius: 20,
            padding: '6px 14px',
            color: infoOpen ? def.accentColor : '#797D80',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          <span>{def.name.replace('The ', '')} — {data.count} people</span>
          <motion.span
            animate={{ rotate: infoOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'inline-block' }}
          >
            ▾
          </motion.span>
        </button>

        <AnimatePresence>
          {infoOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                padding: '14px 16px',
                background: 'rgba(29,77,82,0.25)',
                border: `1px solid ${def.accentColor}22`,
                borderRadius: 12,
                marginTop: 8,
              }}>
                {/* Pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
                  {dynamicPills.map((p, i) => <Pill key={i} label={p.label} type={p.type} />)}
                </div>

                {/* Tagline */}
                <p style={{ margin: '0 0 10px', fontSize: 12, fontStyle: 'italic', color: '#797D80', lineHeight: 1.5 }}>
                  {def.tagline}
                </p>

                {/* Description */}
                <p style={{ margin: '0 0 12px', fontSize: 12, color: '#b0b8c0', lineHeight: 1.7 }}>
                  {def.description}
                </p>

                {/* Tension callout */}
                <div style={{
                  padding: '7px 11px',
                  borderLeft: `3px solid ${def.accentColor}`,
                  background: `${def.accentColor}0d`,
                  borderRadius: '0 6px 6px 0',
                  marginBottom: 12,
                }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: def.accentColor,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>
                    The tension:
                  </span>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#dde4e8', fontStyle: 'italic' }}>
                    {def.tension}
                  </p>
                </div>

                {/* Representative quote */}
                {quote && (
                  <div style={{
                    padding: '9px 13px',
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 8,
                    borderLeft: '2px solid rgba(125,230,155,0.25)',
                  }}>
                    <span style={{ fontSize: 10, color: '#797D80', display: 'block', marginBottom: 3 }}>
                      From the data —
                    </span>
                    <p style={{ margin: 0, fontSize: 12, color: '#c8d4db', lineHeight: 1.6, fontStyle: 'italic' }}>
                      "{quote}"
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Main Archetypes section ──────────────────────────────────────────────────

export default function Archetypes({ transforms }) {
  const { archetypes } = transforms || {};
  if (!archetypes) return null;

  const total = Object.values(archetypes).reduce((s, a) => s + a.count, 0);

  return (
    <section style={{ padding: '64px 24px 80px', maxWidth: 1300, margin: '0 auto' }}>

      {/* Section header */}
      <div style={{ marginBottom: 40, maxWidth: 620 }}>
        <div style={{
          display: 'inline-block',
          padding: '4px 12px',
          borderRadius: 20,
          background: 'rgba(125,230,155,0.1)',
          border: '1px solid rgba(125,230,155,0.25)',
          color: '#7DE69B',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 16,
        }}>
          Team Archetypes
        </div>

        <h2 style={{
          margin: '0 0 12px',
          fontSize: 'clamp(24px, 4vw, 34px)',
          fontWeight: 800,
          color: '#fff',
          letterSpacing: '-0.02em',
          lineHeight: 1.15,
        }}>
          Five portraits from {total} people.
        </h2>

        <p style={{ margin: '0 0 10px', fontSize: 15, color: '#797D80', lineHeight: 1.7 }}>
          Built from 16 dimensions per person — frequency, stage, sentiment, barriers, tools,
          own-pocket investment, and open-text voice.
        </p>

        <p style={{ margin: 0, fontSize: 12, color: '#4a5158', lineHeight: 1.6 }}>
          Click any card to reveal the portrait. Click the pill below to read the full cohort profile.
        </p>
      </div>

      {/* Cards — centered flex row, wraps on smaller screens */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 24,
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}>
        {ARCHETYPE_DEFS.map((def, i) => (
          <ArchetypeCard
            key={def.key}
            def={def}
            data={archetypes[def.key]}
            index={i}
          />
        ))}
      </div>

      {/* Footer note */}
      <p style={{
        marginTop: 40,
        fontSize: 12,
        color: '#4a5158',
        lineHeight: 1.6,
        maxWidth: 680,
        textAlign: 'center',
        margin: '40px auto 0',
      }}>
        Each respondent receives an affinity score (0–100) for all five archetypes across 16 dimensions.
        The archetype with the highest score is assigned. Near-ties resolve toward the more advanced
        adoption stage.
      </p>
    </section>
  );
}
