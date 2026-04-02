import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Archetype static definitions ────────────────────────────────────────────

const ARCHETYPE_DEFS = [
  {
    key: 'multiplier',
    name: 'The Multiplier',
    tagline: 'Pulling the department forward — with or without a mandate.',
    description:
      'Daily users who have embedded AI as a core collaborator. They pay out of their own pocket, rate importance at 5/5, and are already operating at Integration or Transformation stage. These are your internal champions.',
    accentColor: '#7DE69B',
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <circle cx="28" cy="28" r="27" stroke="#7DE69B" strokeWidth="1.5" strokeOpacity="0.3" />
        <path d="M28 14 L34 24 H44 L36 31 L39 42 L28 35 L17 42 L20 31 L12 24 H22 Z"
          fill="none" stroke="#7DE69B" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
    pills: [
      { label: 'Daily use', type: 'green' },
      { label: 'Integration / Transformation stage', type: 'green' },
      { label: 'Paying own pocket', type: 'green' },
      { label: 'Voluntary commitment', type: 'yellow' },
    ],
    tension: 'Voluntary commitment, not compliance',
  },
  {
    key: 'blocked-believer',
    name: 'The Blocked Believer',
    tagline: 'Enthusiastic people slowed by organizational friction.',
    description:
      'Positive sentiment, high importance ratings, active weekly use — but something in the system is in the way. IT access, unclear guidelines, or tool costs are the friction. This is not a motivation problem. It is an infrastructure problem.',
    accentColor: '#59BEC9',
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <circle cx="28" cy="28" r="27" stroke="#59BEC9" strokeWidth="1.5" strokeOpacity="0.3" />
        <circle cx="28" cy="28" r="12" stroke="#59BEC9" strokeWidth="1.8" />
        <path d="M19 19 L37 37" stroke="#E5554F" strokeWidth="2" strokeLinecap="round" />
        <circle cx="28" cy="21" r="2.5" fill="#59BEC9" />
        <path d="M28 25 L28 32" stroke="#59BEC9" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    pills: [
      { label: 'Positive sentiment', type: 'green' },
      { label: 'High importance (4–5)', type: 'green' },
      { label: 'Primary barrier: IT / access', type: 'coral' },
      { label: 'Weekly, not daily', type: 'yellow' },
    ],
    tension: 'Enthusiastic people failed by the system',
  },
  {
    key: 'experimenter',
    name: 'The Experimenter',
    tagline: 'Curious, multi-tool, moveable — highest training ROI.',
    description:
      'Still in the Experimentation stage, trying 2–3 tools, learning what works. The barrier is the learning curve, not the will. The right training or tool access could convert them into Multipliers faster than anyone else in the department.',
    accentColor: '#FFCD00',
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <circle cx="28" cy="28" r="27" stroke="#FFCD00" strokeWidth="1.5" strokeOpacity="0.3" />
        <path d="M22 16 L22 28 L16 38 H40 L34 28 L34 16 Z"
          fill="none" stroke="#FFCD00" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M22 16 H34" stroke="#FFCD00" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="24" cy="33" r="2" fill="#FFCD00" fillOpacity="0.6" />
        <circle cx="30" cy="35" r="1.5" fill="#FFCD00" fillOpacity="0.4" />
        <circle cx="35" cy="32" r="1.5" fill="#FFCD00" fillOpacity="0.5" />
      </svg>
    ),
    pills: [
      { label: '2+ tools tried', type: 'green' },
      { label: 'Stage: Experimentation', type: 'yellow' },
      { label: 'Barrier: learning curve', type: 'coral' },
      { label: 'High training ROI potential', type: 'green' },
    ],
    tension: 'Motion without traction — for now',
  },
  {
    key: 'thoughtful-skeptic',
    name: 'The Thoughtful Skeptic',
    tagline: 'Not resistant because they don\'t understand — because they do.',
    description:
      'Mixed or cautious sentiment paired with real use. They have earned concerns: accuracy, human oversight, workflow disruption. Their open-text responses are the most detailed in the dataset. They are not against AI. They have good questions worth taking seriously.',
    accentColor: '#E5554F',
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <circle cx="28" cy="28" r="27" stroke="#E5554F" strokeWidth="1.5" strokeOpacity="0.3" />
        <circle cx="28" cy="24" r="8" stroke="#E5554F" strokeWidth="1.8" />
        <path d="M24 36 Q28 40 32 36" stroke="#E5554F" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <circle cx="25" cy="23" r="1.5" fill="#E5554F" />
        <circle cx="31" cy="23" r="1.5" fill="#E5554F" />
      </svg>
    ),
    pills: [
      { label: 'Mixed / cautious sentiment', type: 'coral' },
      { label: 'Accuracy + oversight concerns', type: 'coral' },
      { label: 'Weekly to monthly use', type: 'yellow' },
      { label: 'Most detailed open-text', type: 'green' },
    ],
    tension: 'Earned skepticism — not fear',
  },
  {
    key: 'confident-bystander',
    name: 'The Confident Bystander',
    tagline: 'Nothing stopping them. Nothing moving them.',
    description:
      'High self-reported confidence, no listed barriers, but monthly or less frequency and no own-pocket investment. The behavior doesn\'t match the self-assessment — not because they\'re misleading, but because they haven\'t yet done the work that would make it true.',
    accentColor: '#797D80',
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <circle cx="28" cy="28" r="27" stroke="#797D80" strokeWidth="1.5" strokeOpacity="0.3" />
        <circle cx="28" cy="22" r="7" stroke="#797D80" strokeWidth="1.8" />
        <path d="M16 42 C16 35 40 35 40 42" stroke="#797D80" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M20 28 L36 28" stroke="#797D80" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="2 2" />
      </svg>
    ),
    pills: [
      { label: 'Monthly or less', type: 'coral' },
      { label: 'No barriers listed', type: 'yellow' },
      { label: 'High self-reported confidence', type: 'yellow' },
      { label: 'No own-pocket investment', type: 'coral' },
    ],
    tension: 'Untapped potential',
  },
];

// ─── Pill component ───────────────────────────────────────────────────────────

function Pill({ label, type }) {
  const colors = {
    green:  { bg: 'rgba(125,230,155,0.12)', border: 'rgba(125,230,155,0.35)', text: '#7DE69B' },
    coral:  { bg: 'rgba(229,85,79,0.12)',   border: 'rgba(229,85,79,0.35)',   text: '#E5554F' },
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

// ─── Single archetype card ────────────────────────────────────────────────────

function ArchetypeCard({ def, data, index }) {
  const [expanded, setExpanded] = useState(false);

  if (!data) return null;

  const quote = data.quotes[0];
  const dynamicPills = buildDynamicPills(def.key, data);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      style={{
        background: 'rgba(29,77,82,0.30)',
        border: '1px solid rgba(125,230,155,0.12)',
        borderTop: `2px solid ${def.accentColor}`,
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      whileHover={{
        boxShadow: `0 0 24px ${def.accentColor}22`,
        borderColor: `${def.accentColor}40`,
      }}
      onClick={() => setExpanded(v => !v)}
    >
      {/* Card header */}
      <div style={{ padding: '20px 20px 16px' }}>
        {/* Icon + count row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ opacity: 0.9 }}>{def.icon}</div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: def.accentColor, lineHeight: 1 }}>
              {data.count}
            </div>
            <div style={{ fontSize: 11, color: '#797D80', marginTop: 2 }}>
              {data.pct}% of team
            </div>
          </div>
        </div>

        {/* Name */}
        <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em', marginBottom: 4 }}>
          {def.name}
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 12, fontStyle: 'italic', color: '#797D80', lineHeight: 1.5, marginBottom: 14 }}>
          {def.tagline}
        </div>

        {/* Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {dynamicPills.map((p, i) => (
            <Pill key={i} label={p.label} type={p.type} />
          ))}
        </div>
      </div>

      {/* Expand toggle */}
      <div style={{
        padding: '10px 20px',
        borderTop: '1px solid rgba(125,230,155,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(0,0,0,0.15)',
      }}>
        <span style={{ fontSize: 11, color: '#797D80' }}>
          {expanded ? 'Close' : 'Read portrait'}
        </span>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ color: def.accentColor, fontSize: 12 }}
        >
          ▾
        </motion.span>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '16px 20px 20px' }}>
              {/* Description */}
              <p style={{ fontSize: 13, color: '#b0b8c0', lineHeight: 1.7, margin: '0 0 14px' }}>
                {def.description}
              </p>

              {/* Tension callout */}
              <div style={{
                padding: '8px 12px',
                borderLeft: `3px solid ${def.accentColor}`,
                background: `${def.accentColor}0d`,
                borderRadius: '0 6px 6px 0',
                marginBottom: 14,
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: def.accentColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  The tension:
                </span>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: '#dde4e8', fontStyle: 'italic' }}>
                  {def.tension}
                </p>
              </div>

              {/* Representative quote */}
              {quote && (
                <div style={{
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 8,
                  borderLeft: `2px solid rgba(125,230,155,0.25)`,
                }}>
                  <span style={{ fontSize: 11, color: '#797D80', display: 'block', marginBottom: 4 }}>
                    From the data —
                  </span>
                  <p style={{ margin: 0, fontSize: 13, color: '#c8d4db', lineHeight: 1.6, fontStyle: 'italic' }}>
                    "{quote}"
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Dynamic pills builder ────────────────────────────────────────────────────

function buildDynamicPills(key, data) {
  const { stats, count } = data;
  switch (key) {
    case 'multiplier':
      return [
        { label: `${stats.dailyPct}% daily use`, type: 'green' },
        { label: `${stats.ownPocketPct}% paying own pocket`, type: 'green' },
        { label: 'Integration / Transformation', type: 'green' },
        { label: 'Voluntary commitment', type: 'yellow' },
      ];
    case 'blocked-believer':
      return [
        { label: `${stats.positivePct}% positive sentiment`, type: 'green' },
        { label: 'High importance (4–5)', type: 'green' },
        { label: stats.topBarrier ? `Barrier: ${stats.topBarrier}` : 'Org friction', type: 'coral' },
        { label: 'Weekly, not daily', type: 'yellow' },
      ];
    case 'experimenter':
      return [
        { label: `Avg ${stats.toolCount} tools tried`, type: 'green' },
        { label: 'Exploration stage', type: 'yellow' },
        { label: stats.topBarrier ? `Barrier: ${stats.topBarrier}` : 'Learning curve', type: 'coral' },
        { label: 'Highest training ROI', type: 'green' },
      ];
    case 'thoughtful-skeptic':
      return [
        { label: 'Mixed / cautious sentiment', type: 'coral' },
        { label: stats.topBarrier ? stats.topBarrier : 'Accuracy concerns', type: 'coral' },
        { label: 'Weekly to monthly use', type: 'yellow' },
        { label: 'Most detailed open-text', type: 'green' },
      ];
    case 'confident-bystander':
      return [
        { label: 'Monthly or less', type: 'coral' },
        { label: 'No barriers listed', type: 'yellow' },
        { label: `${stats.ownPocketPct}% own-pocket invest`, type: 'coral' },
        { label: 'Untapped potential', type: 'yellow' },
      ];
    default:
      return [];
  }
}

// ─── Main Archetypes section ──────────────────────────────────────────────────

export default function Archetypes({ transforms }) {
  const { archetypes } = transforms || {};
  if (!archetypes) return null;

  const total = Object.values(archetypes).reduce((s, a) => s + a.count, 0);

  return (
    <section style={{ padding: '64px 24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Section header */}
      <div style={{ marginBottom: 40 }}>
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
        <p style={{
          margin: 0,
          fontSize: 15,
          color: '#797D80',
          maxWidth: 580,
          lineHeight: 1.7,
        }}>
          Built from 16 dimensions per person — frequency, stage, sentiment, barriers, tools,
          own-pocket investment, and open-text voice. Click any card to read the full portrait.
        </p>
      </div>

      {/* Cards grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: 16,
        alignItems: 'start',
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
        marginTop: 32,
        fontSize: 12,
        color: '#4a5158',
        lineHeight: 1.6,
        maxWidth: 680,
      }}>
        Classification uses a priority waterfall — each respondent is assigned to exactly one archetype
        based on the most diagnostic behavioral signals in their row. No self-reported confidence scores
        appear in the counts or pills above.
      </p>
    </section>
  );
}
