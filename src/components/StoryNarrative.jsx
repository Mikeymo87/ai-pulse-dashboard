import { motion } from 'framer-motion';
import { useIsMobile } from '../hooks/useIsMobile';

const BEATS = [
  {
    number: '01',
    accent: '#2EA84A',
    labelColor: '#2EA84A',
    accentBg: 'rgba(46,168,74,0.10)',
    accentBorder: 'rgba(46,168,74,0.28)',
    label: 'Where We Started',
    heading: 'A team curious but cautious.',
    body: `In January 2025, 42% of MarCom used AI daily — twice the national average, but unevenly distributed. Sentiment was cautiously optimistic. The biggest barriers were time to learn and unclear guidelines about what was even allowed. The tools existed. The conviction hadn't formed yet.`,
  },
  {
    number: '02',
    accent: '#FFCD00',
    labelColor: '#8a6500',
    accentBg: 'rgba(255,205,0,0.10)',
    accentBorder: 'rgba(255,205,0,0.32)',
    label: 'What Changed',
    heading: 'Intentional leadership made the difference.',
    body: `Eight months of structured training, enterprise tool access, and visible leadership participation moved daily usage from 42% to 85%. The cohort with no confidence was eliminated entirely. This wasn't organic adoption — it was the result of a deliberate strategy executed consistently over time.`,
  },
  {
    number: '03',
    accent: '#59BEC9',
    labelColor: '#1a7585',
    accentBg: 'rgba(89,190,201,0.10)',
    accentBorder: 'rgba(89,190,201,0.30)',
    label: 'Where We Are Today',
    heading: 'Most advanced in the region. Just getting started.',
    body: `By March 2026, daily usage reached 92% — more than ten times the national benchmark. That likely makes this the most AI-advanced healthcare marketing department in the state, and among the most advanced in the region. The conviction is real. The momentum is set. And we're nowhere close to done.`,
  },
];

export default function StoryNarrative() {
  const isMobile = useIsMobile();

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: isMobile ? '0 16px 40px' : '0 32px 64px',
      }}
    >
      {/* Section eyebrow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        <div style={{ height: 1, flex: 1, background: 'var(--border)' }} />
        <span style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 'var(--text-xs)',
          color: 'var(--accent-mint)',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>
          The Story So Far
        </span>
        <div style={{ height: 1, flex: 1, background: 'var(--border)' }} />
      </div>

      {/* Three-beat editorial card */}
      <div style={{
        background: 'var(--surface-green)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
      }}>
        {BEATS.map((beat, i) => (
          <motion.div
            key={beat.number}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: isMobile ? 0 : i * 0.12 }}
            style={{
              padding: isMobile ? '24px 20px' : '32px 28px',
              borderRight: !isMobile && i < 2 ? '1px solid var(--border)' : 'none',
              borderBottom: isMobile && i < 2 ? '1px solid var(--border)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            {/* Beat number + label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 'var(--text-2xl)',
                fontWeight: 900,
                color: beat.accent,
                opacity: 0.22,
                lineHeight: 1,
                letterSpacing: '-0.04em',
              }}>
                {beat.number}
              </span>
              <span style={{
                background: beat.accentBg,
                border: `1px solid ${beat.accentBorder}`,
                borderRadius: 20,
                padding: '3px 10px',
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: 'var(--text-xs)',
                color: beat.labelColor ?? beat.accent,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}>
                {beat.label}
              </span>
            </div>

            {/* Heading — minHeight on desktop locks all three to 2-line height */}
            <h3 style={{
              margin: 0,
              fontSize: 'var(--text-lg)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              lineHeight: 1.3,
              letterSpacing: '-0.01em',
              minHeight: isMobile ? 'unset' : '2.6em',
              display: 'flex',
              alignItems: 'flex-start',
            }}>
              {beat.heading}
            </h3>

            {/* Body */}
            <p style={{
              margin: 0,
              fontSize: 'var(--text-base)',
              color: 'var(--text-muted)',
              fontFamily: 'DM Sans, sans-serif',
              lineHeight: 1.75,
            }}>
              {beat.body}
            </p>

            {/* Accent line at bottom */}
            <div style={{
              marginTop: 'auto',
              paddingTop: 16,
              height: 3,
              background: `linear-gradient(90deg, ${beat.accent} 0%, transparent 100%)`,
              borderRadius: 2,
              opacity: 0.45,
            }} />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
