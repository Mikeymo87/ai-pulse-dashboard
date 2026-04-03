import { motion } from 'framer-motion';
import {
  Users, Wrench, GraduationCap, CalendarCheck, TrendingUp,
} from 'lucide-react';

// ─── The five principles ──────────────────────────────────────────────────────
function buildPrinciples(transforms) {
  // Pull live numbers where available
  const frequencyTrend = transforms?.frequencyTrend ?? [];
  const s1Daily = frequencyTrend[0]?.distribution?.find(d => d.label === 'Daily')?.pct ?? 42;
  const s3Daily = frequencyTrend[2]?.distribution?.find(d => d.label === 'Daily')?.pct ?? 92;

  const confidenceTrend = transforms?.confidenceTrend ?? [];
  const s1ConfHighPct = confidenceTrend[0]?.distribution
    ?.filter(d => !d.label?.toLowerCase().includes('somewhat') && !d.label?.toLowerCase().startsWith('not'))
    .reduce((s, d) => s + d.pct, 0) ?? 51;
  const s3ConfHighPct = confidenceTrend[2]?.distribution
    ?.filter(d => !d.label?.toLowerCase().includes('somewhat') && !d.label?.toLowerCase().startsWith('not'))
    .reduce((s, d) => s + d.pct, 0) ?? 94;

  const benefitsS3 = transforms?.benefitsS3 ?? [];
  const topBenefit = benefitsS3[0]?.label ?? 'efficiency and time savings';
  const topBenefitPct = benefitsS3[0]?.pct ?? 85;

  const barriersTrend = transforms?.barriersTrend ?? [];
  const timePct = barriersTrend.find(b => /time/i.test(b.barrier))?.s3?.pct ?? 48;

  return [
    {
      number: '01',
      icon: Users,
      accentColor: '#2EA84A',
      accentBg: 'rgba(46,168,74,0.10)',
      accentBorder: 'rgba(46,168,74,0.22)',
      title: 'Visible Leadership Participation',
      body: `AI adoption doesn't spread on its own — it follows a signal. When department leadership visibly used AI tools, attended training sessions, and talked openly about what they were learning, staff read it as permission. Adoption didn't feel like a mandate. It felt like a direction the whole team was heading in together.`,
      stat: `${s3Daily}%`,
      statLabel: 'daily AI usage by Survey 3',
      statSub: `up from ${s1Daily}% in Survey 1`,
    },
    {
      number: '02',
      icon: Wrench,
      accentColor: '#7DE69B',
      accentBg: 'rgba(125,230,155,0.08)',
      accentBorder: 'rgba(125,230,155,0.20)',
      title: 'Enterprise Tool Access',
      body: `One of the clearest barriers to AI adoption is asking people to pay for it themselves — or to work around IT restrictions. The team's decision to provide enterprise-grade tool access removed the friction that was holding back even motivated adopters. When the tools are available and approved, the experimentation starts.`,
      stat: '35%',
      statLabel: 'paid out of pocket in Survey 3',
      statSub: 'frontline adopters funding their own progress',
    },
    {
      number: '03',
      icon: GraduationCap,
      accentColor: '#59BEC9',
      accentBg: 'rgba(89,190,201,0.10)',
      accentBorder: 'rgba(89,190,201,0.22)',
      title: 'Structured, Recurring Training',
      body: `Webinars and one-off demos don't build fluency. What moved the needle was consistent, structured learning — lunch sessions, tool walkthroughs, and dedicated practice time built into the workflow. The team didn't just hear about AI. They practiced it in a low-stakes environment where it was safe to experiment and fail.`,
      stat: `${s3ConfHighPct}%`,
      statLabel: 'rate themselves Confident or higher',
      statSub: `up from ${s1ConfHighPct}% in Survey 1`,
    },
    {
      number: '04',
      icon: CalendarCheck,
      accentColor: '#FFCD00',
      accentBg: 'rgba(255,205,0,0.10)',
      accentBorder: 'rgba(255,205,0,0.22)',
      title: 'Regular Touchpoints & Pulse Checks',
      body: `Three surveys over 14 months weren't just measurement — they were communication. Each pulse check told the team that leadership was paying attention, that their experience mattered, and that the strategy was evolving based on real feedback. The act of asking is itself a form of leadership. It keeps adoption on the agenda.`,
      stat: '3',
      statLabel: 'surveys across 14 months',
      statSub: '290 total responses — behavioral proof, not self-report',
    },
    {
      number: '05',
      icon: TrendingUp,
      accentColor: '#2EA84A',
      accentBg: 'rgba(46,168,74,0.10)',
      accentBorder: 'rgba(46,168,74,0.22)',
      title: 'Reinforcement Over Time',
      body: `The gains between Survey 2 and Survey 3 didn't happen by accident. They happened because the team didn't stop. Training continued. Conversations continued. Tools kept improving. What looks like a steep adoption curve is actually the compounding effect of small, consistent investments — made month after month, without declaring victory too early.`,
      stat: `${topBenefitPct}%`,
      statLabel: `cite ${topBenefit}`,
      statSub: 'top benefit reported in Survey 3',
    },
  ];
}

// ─── Single principle card ────────────────────────────────────────────────────
function PrincipleCard({ card, index }) {
  const Icon = card.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: 'easeOut' }}
      style={{
        background: 'var(--surface-green)',
        border: `1px solid var(--border)`,
        borderLeft: `4px solid ${card.accentColor}`,
        borderRadius: 16,
        padding: '28px 30px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        {/* Icon badge */}
        <div style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: card.accentBg,
          border: `1px solid ${card.accentBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={16} strokeWidth={1.75} style={{ color: card.accentColor }} />
        </div>

        <div style={{ flex: 1 }}>
          {/* Number */}
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '0.12em', display: 'block', marginBottom: 3 }}>
            {card.number}
          </span>
          {/* Title */}
          <h3 style={{ margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3 }}>
            {card.title}
          </h3>
        </div>
      </div>

      {/* Body copy */}
      <p style={{
        margin: 0,
        fontFamily: 'DM Sans, sans-serif',
        fontSize: 14,
        color: 'var(--text-medium)',
        lineHeight: 1.75,
      }}>
        {card.body}
      </p>

      {/* Supporting stat */}
      <div style={{
        background: card.accentBg,
        border: `1px solid ${card.accentBorder}`,
        borderRadius: 10,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'baseline',
        gap: 10,
        flexWrap: 'wrap',
      }}>
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 28, fontWeight: 900, color: card.accentColor, lineHeight: 1 }}>
          {card.stat}
        </span>
        <div>
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, color: 'var(--text-medium)' }}>
            {card.statLabel}
          </div>
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: 'var(--text-support)' }}>
            {card.statSub}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function HowWeDidIt({ transforms }) {
  const principles = buildPrinciples(transforms);

  return (
    <div className="pad-section" style={{ padding: '0 32px 80px', maxWidth: 1360, margin: '0 auto' }}>

      {/* Opening section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ marginBottom: 52, paddingTop: 8 }}
      >
        {/* Eyebrow */}
        <span style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 11,
          fontWeight: 800,
          color: 'var(--accent-mint)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          display: 'block',
          marginBottom: 12,
        }}>
          The Playbook
        </span>

        <h1 style={{
          margin: '0 0 20px',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 'clamp(28px, 3vw, 42px)',
          fontWeight: 900,
          color: 'var(--text-primary)',
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
          maxWidth: 680,
        }}>
          This didn't happen by accident.
        </h1>

        <p style={{
          margin: '0 0 16px',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 16,
          color: 'var(--text-medium)',
          lineHeight: 1.8,
          maxWidth: 720,
        }}>
          MarCom's AI adoption results are among the strongest we've seen in any department at Baptist Health — or frankly, anywhere. Daily AI usage went from 42% to 92% in 14 months. Confidence followed. So did quality of work. These numbers don't happen by chance, and they don't happen because you handed people a tool and wished them luck.
        </p>

        <p style={{
          margin: 0,
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 16,
          color: 'var(--text-medium)',
          lineHeight: 1.8,
          maxWidth: 720,
        }}>
          What drove this was a deliberate strategy, executed consistently over time. Five moves. Each one reinforced the others. Here's what actually happened — and what it takes to replicate it.
        </p>
      </motion.div>

      {/* Principles grid — 2 columns desktop, 1 column mobile */}
      <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 52 }}>
        {principles.map((card, i) => (
          <PrincipleCard key={card.number} card={card} index={i} />
        ))}
      </div>

      {/* Closing CTA */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        style={{
          background: 'rgba(46,168,74,0.08)',
          border: '1px solid rgba(46,168,74,0.20)',
          borderRadius: 16,
          padding: '32px 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ maxWidth: 560 }}>
          <h3 style={{ margin: '0 0 8px', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
            Interested in bringing this model to your team?
          </h3>
          <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text-support)', lineHeight: 1.65 }}>
            The MarCom AI team has run the workshops, built the tracking, and learned what works. If your department is ready to move from curious to capable, we can help you get there.
          </p>
        </div>
        <a
          href="mailto:ai@baptisthealth.net"
          style={{
            display: 'inline-block',
            background: '#2EA84A',
            color: '#fff',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 13,
            fontWeight: 700,
            borderRadius: 10,
            padding: '12px 24px',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            letterSpacing: '0.02em',
          }}
        >
          Connect with the MarCom AI team
        </a>
      </motion.div>

    </div>
  );
}
