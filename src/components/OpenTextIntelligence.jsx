import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

// ─── Shared style tokens ──────────────────────────────────────────────────────
const SURFACE = 'rgba(29,77,82,0.35)';
const BORDER   = 'rgba(125,230,155,0.15)';
const FONT     = 'DM Sans, sans-serif';

// ─── Insight card definitions (static copy) ──────────────────────────────────
// Each card receives live `data` at render time from transforms.openTextInsights.
const CARDS = [
  {
    id: 'aspiration-gap',
    number: '01',
    label: 'ASPIRATION GAP',
    accentColor: '#FFCD00',
    headline: 'They write about transformation. They use it less than weekly.',
    subhead: "Some of the most inspired responses in the dataset belong to people who aren't yet acting on what they believe. The distance between what someone imagines AI can do and how often they actually open it — that gap is the activation opportunity.",
    statLabel: "people wrote detailed excitement about AI's potential",
    statSuffix: 'but use it less than weekly',
    actionLabel: 'For leadership',
    action: "These are your highest-ROI activation targets. They already believe. The barrier isn't motivation — it's a first experience that makes the belief feel real. Remove one friction point and they convert.",
  },
  {
    id: 'tool-mindset',
    number: '02',
    label: 'TOOL → MINDSET LINK',
    accentColor: '#59BEC9',
    headline: 'The tool someone chooses reveals how they think AI works.',
    subhead: "Claude users tend to describe AI as a \"thought partner\" or \"collaborator\" — something that augments judgment. ChatGPT users tend to describe efficiency and output speed — something that accelerates production. These aren't just tool preferences. They're mental models.",
    statLabel: null, // rendered custom
    statSuffix: null,
    actionLabel: 'For leadership',
    action: 'Tool access shapes culture. If you want a department that thinks strategically about AI — not just uses it faster — consider which tools you make easy to reach for first.',
  },
  {
    id: 'leadership-voices',
    number: '03',
    label: 'LEADERSHIP VOICES',
    accentColor: '#7DE69B',
    headline: "Some people's struggles aren't personal — they're managerial.",
    subhead: "A subset of the struggle responses are about pulling colleagues forward, not about personal skill gaps. These are the informal adoption leaders — managers and senior contributors already doing the culture work whether leadership asks them to or not.",
    statLabel: "people described team-level struggles — not personal friction",
    statSuffix: "they're already doing the adoption leadership work",
    actionLabel: 'For leadership',
    action: 'These individuals need structured resources, not personal licenses. Give them a framework, a community, a role. They\'re already leading — recognize it.',
  },
  {
    id: 'blocked-investors',
    number: '04',
    label: 'BLOCKED INVESTORS',
    accentColor: '#E5554F',
    headline: "They're paying out of their own wallet. The organization is slowing them down.",
    subhead: "The people most committed to AI — committed enough to pay for it themselves — are the same people most likely to face organizational barriers: tool blocks, IT restrictions, unclear guidelines. These aren't the hesitant people. These are your champions.",
    statLabel: 'people are paying out of pocket while facing org-level access barriers',
    statSuffix: '',
    actionLabel: 'For leadership',
    action: 'One policy decision — approved tools, cleared access, a team budget — unlocks this group entirely. The will is there. The barrier is institutional.',
  },
];

// ─── Single quote block ──────────────────────────────────────────────────────
function QuoteBlock({ quotes, accentColor, showFreq = false }) {
  if (!quotes || quotes.length === 0) return null;
  const displayed = quotes.slice(0, 2);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {displayed.map((q, i) => {
        const text = typeof q === 'string' ? q : q.text;
        const freq = typeof q === 'object' ? q.freq : null;
        return (
          <div
            key={i}
            style={{
              borderLeft: `2px solid ${accentColor}`,
              paddingLeft: 12,
              paddingTop: 4,
              paddingBottom: 4,
            }}
          >
            <p style={{
              fontFamily: FONT,
              fontSize: 12.5,
              lineHeight: 1.5,
              color: '#c8d0d8',
              fontStyle: 'italic',
              margin: 0,
            }}>
              "{text}"
            </p>
            {showFreq && freq && (
              <span style={{
                display: 'inline-block',
                marginTop: 4,
                fontSize: 10,
                color: '#797D80',
                fontFamily: FONT,
              }}>
                — uses AI {freq}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Tool Mindset custom stat block ──────────────────────────────────────────
function ToolMindsetStat({ data }) {
  if (!data) return null;
  const { claude, chatgpt } = data;
  return (
    <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
      {[
        { label: 'Claude users', count: claude.count, accent: '#59BEC9', descriptor: 'call AI a thought partner or collaborator' },
        { label: 'ChatGPT users', count: chatgpt.count, accent: '#7DE69B', descriptor: 'emphasize speed and efficiency gains' },
      ].map(({ label, count, accent, descriptor }) => (
        <div
          key={label}
          style={{
            flex: 1,
            background: 'rgba(0,0,0,0.25)',
            borderRadius: 10,
            padding: '12px 14px',
            border: `1px solid ${accent}22`,
          }}
        >
          <div style={{ fontFamily: FONT, fontSize: 22, fontWeight: 800, color: accent, lineHeight: 1 }}>
            {count}
          </div>
          <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: accent, marginTop: 2 }}>
            {label}
          </div>
          <div style={{ fontFamily: FONT, fontSize: 11.5, color: '#797D80', marginTop: 4, lineHeight: 1.4 }}>
            {descriptor}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Single insight card ─────────────────────────────────────────────────────
function InsightCard({ card, data, index }) {
  const ref  = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const { accentColor, number, label, headline, subhead,
          statLabel, statSuffix, actionLabel, action, id } = card;

  // Resolve live data
  let statCount = null;
  let quotes    = [];

  if (id === 'aspiration-gap' && data) {
    statCount = data.count;
    quotes    = data.quotes || [];
  } else if (id === 'leadership-voices' && data) {
    statCount = data.count;
    quotes    = data.quotes || [];
  } else if (id === 'blocked-investors' && data) {
    statCount = data.count;
    quotes    = data.quotes || [];
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        borderRadius: 16,
        padding: '28px 28px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: `2px solid ${accentColor}`,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span style={{
          fontFamily: FONT,
          fontSize: 11,
          fontWeight: 800,
          color: accentColor,
          background: `${accentColor}15`,
          borderRadius: 6,
          padding: '3px 8px',
          letterSpacing: '0.08em',
          flexShrink: 0,
          marginTop: 1,
        }}>
          {label}
        </span>
        <span style={{
          fontFamily: FONT,
          fontSize: 11,
          fontWeight: 700,
          color: '#797D80',
          marginLeft: 'auto',
          flexShrink: 0,
        }}>
          {number} / 04
        </span>
      </div>

      {/* Headline */}
      <h3 style={{
        fontFamily: FONT,
        fontSize: 17,
        fontWeight: 800,
        color: '#f0f4f8',
        lineHeight: 1.35,
        margin: 0,
      }}>
        {headline}
      </h3>

      {/* Subhead */}
      <p style={{
        fontFamily: FONT,
        fontSize: 13,
        lineHeight: 1.65,
        color: '#9ca8b4',
        margin: 0,
      }}>
        {subhead}
      </p>

      {/* Stat or custom block */}
      {id === 'tool-mindset' ? (
        <ToolMindsetStat data={data} />
      ) : statCount !== null && (
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 10,
          background: 'rgba(0,0,0,0.2)',
          borderRadius: 10,
          padding: '12px 16px',
        }}>
          <span style={{
            fontFamily: FONT,
            fontSize: 36,
            fontWeight: 900,
            color: accentColor,
            lineHeight: 1,
          }}>
            {statCount}
          </span>
          <div>
            {statLabel && (
              <p style={{ fontFamily: FONT, fontSize: 12.5, color: '#c8d0d8', margin: '0 0 2px', lineHeight: 1.4 }}>
                {statLabel}
              </p>
            )}
            {statSuffix && (
              <p style={{ fontFamily: FONT, fontSize: 11.5, color: '#797D80', margin: 0, fontStyle: 'italic' }}>
                {statSuffix}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Quotes */}
      {id === 'tool-mindset' && data ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.claude.quotes.slice(0, 1).map((q, i) => (
            <div key={`c${i}`} style={{ borderLeft: `2px solid #59BEC9`, paddingLeft: 12 }}>
              <span style={{ fontSize: 9.5, fontFamily: FONT, color: '#59BEC9', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Claude user</span>
              <p style={{ fontFamily: FONT, fontSize: 12.5, lineHeight: 1.5, color: '#c8d0d8', fontStyle: 'italic', margin: '2px 0 0' }}>"{q}"</p>
            </div>
          ))}
          {data.chatgpt.quotes.slice(0, 1).map((q, i) => (
            <div key={`g${i}`} style={{ borderLeft: `2px solid #7DE69B`, paddingLeft: 12 }}>
              <span style={{ fontSize: 9.5, fontFamily: FONT, color: '#7DE69B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>ChatGPT user</span>
              <p style={{ fontFamily: FONT, fontSize: 12.5, lineHeight: 1.5, color: '#c8d0d8', fontStyle: 'italic', margin: '2px 0 0' }}>"{q}"</p>
            </div>
          ))}
        </div>
      ) : (
        <QuoteBlock
          quotes={quotes}
          accentColor={accentColor}
          showFreq={id === 'aspiration-gap'}
        />
      )}

      {/* Leadership action callout */}
      <div style={{
        background: `${accentColor}10`,
        border: `1px solid ${accentColor}30`,
        borderRadius: 10,
        padding: '12px 14px',
        marginTop: 'auto',
      }}>
        <span style={{
          display: 'inline-block',
          fontFamily: FONT,
          fontSize: 10,
          fontWeight: 800,
          color: accentColor,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 5,
        }}>
          {actionLabel}
        </span>
        <p style={{
          fontFamily: FONT,
          fontSize: 12.5,
          lineHeight: 1.6,
          color: '#b0bcc8',
          margin: 0,
        }}>
          {action}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function OpenTextIntelligence({ transforms }) {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' });
  const insights = transforms?.openTextInsights;

  if (!insights) return null;

  // Map card id → live data
  const dataMap = {
    'aspiration-gap':    insights.aspirationGap,
    'tool-mindset':      insights.toolMindset,
    'leadership-voices': insights.leadershipVoices,
    'blocked-investors': insights.blockedInvestors,
  };

  return (
    <section style={{ padding: '72px 24px 80px', maxWidth: 1100, margin: '0 auto' }}>

      {/* Section header */}
      <motion.div
        ref={headerRef}
        initial={{ opacity: 0, y: 20 }}
        animate={headerInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginBottom: 48, maxWidth: 680 }}
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
          Open Text Intelligence
        </span>
        <h2 style={{
          fontFamily: FONT,
          fontSize: 28,
          fontWeight: 900,
          color: '#f0f4f8',
          lineHeight: 1.25,
          margin: '0 0 14px',
        }}>
          What They're Actually Saying
        </h2>
        <p style={{
          fontFamily: FONT,
          fontSize: 14,
          lineHeight: 1.75,
          color: '#797D80',
          margin: 0,
        }}>
          The open-ended responses are the most honest data in the survey. Numbers can be inflated.
          Multiple-choice answers can be strategic. But when someone types what they actually think —
          that's a real thought from a real person. These four patterns are only visible when you
          cross-reference what people write with what they actually do.
        </p>
      </motion.div>

      {/* 2×2 card grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
        gap: 20,
      }}>
        {CARDS.map((card, i) => (
          <InsightCard
            key={card.id}
            card={card}
            data={dataMap[card.id]}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}
