import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '../hooks/useIsMobile';
import {
  Users, Heart, Compass, Shield,
  GraduationCap, UserCheck, FileText,
  Network, Zap, TrendingUp,
  ChevronDown, AlertTriangle,
} from './Icons';

// ── Helper (copied from GrowthStory.jsx) ──────────────────────────────────────
function hexToRgb(hex) {
  const c = hex.replace('#', '');
  return [parseInt(c.slice(0,2),16), parseInt(c.slice(2,4),16), parseInt(c.slice(4,6),16)].join(',');
}

// ── Phase config ──────────────────────────────────────────────────────────────
const PHASES = [
  {
    eyebrow: 'PHASE 01 — FOUNDATION',
    title: 'Start here. Get these four right before anything else.',
    description: 'The Foundation phase sets the conditions that make everything else possible. Teams that skip these don\'t fail at AI — they fail to launch.',
  },
  {
    eyebrow: 'PHASE 02 — SYSTEM',
    title: 'Build the infrastructure that makes learning stick.',
    description: 'The System phase turns one-time training into ongoing capability. Without this, early momentum fades within 90 days.',
  },
  {
    eyebrow: 'PHASE 03 — SCALE',
    title: 'Spread it. Measure it. Write it into how you operate.',
    description: 'The Scale phase is where individual adoption becomes institutional capability. This is how you make the gains permanent.',
  },
];

// ── Principle data ────────────────────────────────────────────────────────────
function buildPrinciples(transforms) {
  // Live stat derivations — mirror GrowthStory.jsx CONFIDENCE_THRESHOLD logic
  const frequencyTrend = transforms?.frequencyTrend ?? [];
  const s1Daily = frequencyTrend[0]?.distribution?.find(d => d.label === 'Daily')?.pct ?? 42;
  const s3Daily = frequencyTrend[2]?.distribution?.find(d => d.label === 'Daily')?.pct ?? 90;

  const confidenceTrend = transforms?.confidenceTrend ?? [];
  const s1ConfHighPct = (confidenceTrend[0]?.distribution ?? [])
    .filter(d => d.score >= 4).reduce((s, d) => s + d.pct, 0) || 51;
  const s3ConfHighPct = (confidenceTrend[2]?.distribution ?? [])
    .filter(d => d.score >= 3).reduce((s, d) => s + d.pct, 0) || 94;

  const ownPocketPct = transforms?.ownPocketS3?.yesPct ?? 32;

  const benefitsS3 = transforms?.benefitsS3 ?? [];
  const topBenefitLabel = benefitsS3[0]?.label ?? 'time savings and efficiency';
  const topBenefitPct   = benefitsS3[0]?.pct   ?? 85;

  return [
    // ─── PHASE 0: FOUNDATION ────────────────────────────────────────────────
    {
      number: '01', phase: 0, icon: Users,
      accentColor: '#2EA84A',
      accentBg: 'rgba(46,168,74,0.10)',
      accentBorder: 'rgba(46,168,74,0.22)',
      title: 'Leaders Must Go First, and They Must Show Up',
      oneLiner: 'Adoption follows a signal. Make sure the signal is visible.',
      narrative: 'Department leadership visibly used AI tools in meetings, attended the same training as staff, and shared real examples — including things that didn\'t work. This wasn\'t performative. It removed permission anxiety from the equation. When the boss shows up to the learning session, the message is clear: this is where we\'re all going.',
      stat: `${s3Daily}%`,
      statLabel: 'daily AI usage by Survey 3',
      statSub: `up from ${s1Daily}% in Survey 1`,
      quote: 'I\'m most excited about how AI is becoming a partner in my role. It is helping me streamline workflows, automate tasks, and work more efficiently.',
      actions: [
        'Name one executive sponsor who will personally champion the effort — and ask them to attend at least some of the same AI training as their teams.',
        'Ask leaders to share one real AI use case, one lesson, or one before-and-after example each month in meetings or a shared channel.',
        'Upskill the leadership team early so they can model use with credibility — not just approve the budget.',
      ],
      mistake: 'Delegating AI to one person and calling it "covered." The message staff receive when leadership doesn\'t participate is that AI is optional — a side project for people who have time.',
    },
    {
      number: '02', phase: 0, icon: Heart,
      accentColor: '#59BEC9',
      accentBg: 'rgba(89,190,201,0.10)',
      accentBorder: 'rgba(89,190,201,0.22)',
      title: 'Treat AI Enablement as a People Change Effort, Not a Tech Rollout',
      oneLiner: 'Install the tools last. Install the mindset first.',
      narrative: 'The team didn\'t launch a new software platform — they launched a change initiative that happened to involve software. That meant measuring human indicators (confidence, sentiment, barriers) not just license utilization. It meant talking about fears openly. Every training session was a chance to ask "what worries you?" not just "here\'s how to use it."',
      stat: '63% → 20%',
      statLabel: 'facing training, access & clarity barriers',
      statSub: 'the barriers the program directly addressed — dropped dramatically S1 → S3',
      quote: 'The biggest challenge right now is scaling it in a way that\'s structured and sustainable across teams.',
      actions: [
        'Open the initiative with a clear statement: this is a people-centered operating change, not a tool rollout. Brief managers on what behavior change is being asked of the team.',
        'Measure human indicators from day one: usage, confidence, barriers, and perceived relevance. Not just license activations.',
        'Keep communication focused on how work will improve — not just what technology was purchased.',
      ],
      mistake: 'Announcing a tool rollout via email. No context, no conversation, no acknowledgment of what it means for people\'s jobs. The tool gets ignored because the people were ignored first.',
    },
    {
      number: '03', phase: 0, icon: Compass,
      accentColor: '#7DE69B',
      accentBg: 'rgba(125,230,155,0.08)',
      accentBorder: 'rgba(125,230,155,0.20)',
      title: 'Lead With a Human-First, AI-Forward Philosophy',
      oneLiner: 'A clear philosophy reduces fear faster than any FAQ.',
      narrative: '"Human-first, AI-forward" became a repeatable phrase the team could use to explain the approach in one breath. It told people what they were not losing — human judgment, creative ownership, professional identity — while naming where the department was going. The philosophy made it possible for anyone on the team to explain the strategy, not just the leader.',
      stat: '69%',
      statLabel: 'positive AI sentiment by Survey 3',
      statSub: 'held strong after 14 months of active change',
      quote: 'Continuing to move fast in high-pressure moments without lowering the bar. And I enjoy that, as good as it is, it still needs my judgment.',
      actions: [
        'Write your department\'s AI philosophy in plain language before your first training. It should say what you believe about people and AI — not which tools you\'re using.',
        'Give every manager talking points they can use in one-on-ones. The goal: anyone on your team can explain the philosophy in their own words.',
        'Return to the philosophy whenever you make a tool, policy, or training decision. It\'s the North Star for every gray-area call.',
      ],
      mistake: 'Letting the rollout speak for itself. A new tool with no philosophy attached is a mandate with no meaning. People fill the silence with fear.',
    },
    {
      number: '04', phase: 0, icon: Shield,
      accentColor: '#FFCD00',
      accentBg: 'rgba(255,205,0,0.10)',
      accentBorder: 'rgba(255,205,0,0.30)',
      title: 'Give People Secure, High-Quality Tools They Can Actually Use',
      oneLiner: 'If they\'re paying out of pocket, you haven\'t solved the access problem yet.',
      narrative: 'Enterprise subscriptions for ChatGPT, Jasper, Gemini, Copilot, and Adobe Firefly were provisioned before training began — not after. One primary platform was designated so people weren\'t paralyzed by choice. When the tools are available, approved, and actually good, the barrier disappears.',
      stat: `${ownPocketPct}%`,
      statLabel: 'paying out of pocket for AI tools',
      statSub: 'the shadow AI problem — demand outrunning the sanctioned stack',
      quote: 'Inconsistent access. We have software that has missing AI components. It makes it much more difficult to do our jobs. It\'s like asking us to build a bridge without heavy equipment.',
      actions: [
        'Audit your current situation: what is IT-approved, what are people actually using, and what are they paying for themselves? The gap between approved and actual is your shadow AI problem.',
        'Designate one primary platform — not five. Staff should know exactly where to go for 80% of AI tasks. Additional tools can exist, but a single primary reduces friction.',
        'Partner with IT before you launch, not after. Bring concrete use cases and compliance requirements — not abstract requests.',
      ],
      mistake: 'Giving people access to a tool they don\'t have time to learn, with no guidance on what it\'s good for, and calling it "enablement." Access alone is not enough.',
    },

    // ─── PHASE 1: SYSTEM ────────────────────────────────────────────────────
    {
      number: '05', phase: 1, icon: GraduationCap,
      accentColor: '#2EA84A',
      accentBg: 'rgba(46,168,74,0.10)',
      accentBorder: 'rgba(46,168,74,0.22)',
      title: 'Build a Real Learning System, and Protect Time For It',
      oneLiner: 'A webinar is not a learning system. A year-long path is.',
      narrative: 'Training was designed as a staged, year-long path — not a single launch event. Monthly sessions gave people recurring exposure without requiring dedicated days. Practice time was explicitly protected on calendars. People didn\'t just hear about AI; they tried it in a low-stakes environment where iteration was the point. The compounding effect of monthly investment over 14 months is visible in the data.',
      stat: `${s3ConfHighPct}%`,
      statLabel: 'rate themselves Confident or higher by Survey 3',
      statSub: `up from ${s1ConfHighPct}% in Survey 1`,
      quote: 'One of my biggest challenges is carving out time to really experiment with AI, especially for developing and testing new projects, GPTs, or workflows.',
      actions: [
        'Map out a 12-month learning arc before you begin: foundations (months 1–3), applied practice (months 4–6), advanced and self-directed (months 7–12). Build the skeleton first.',
        'Book recurring monthly learning time now — before you have the content. A calendar hold that exists is harder to cancel than one you intend to create later.',
        'Measure whether training is translating into actual use and rising confidence — not just completion rates.',
      ],
      mistake: 'Hosting one great training event and then going quiet for three months. People will revert to baseline. Learning systems require maintenance, not launches.',
    },
    {
      number: '06', phase: 1, icon: UserCheck,
      accentColor: '#59BEC9',
      accentBg: 'rgba(89,190,201,0.10)',
      accentBorder: 'rgba(89,190,201,0.22)',
      title: 'Put Clear Ownership and Hands-On Support In Place',
      oneLiner: 'Someone\'s job has to include making sure this works.',
      narrative: 'MarCom created an AI Sherpa role — a designated person whose job included holding office hours, providing workflow-specific coaching, and being the go-to resource. This wasn\'t a full-time role, but it was explicitly part of someone\'s responsibilities. The Sherpa model means staff don\'t have to figure out if they can ask for help — they know exactly who to ask and when.',
      stat: '3×/week',
      statLabel: 'office hours available to the team',
      statSub: 'a dedicated support cadence, not an open-door policy',
      quote: null,
      actions: [
        'Assign an AI lead for your department — not a committee, a person. It can be a partial responsibility. What matters is that someone owns it and everyone knows who that is.',
        'Set up office hours within the first 30 days: a recurring block where anyone can bring a question, a workflow problem, or an experiment that isn\'t working.',
        'Create a dedicated channel (Slack, Teams) for AI questions — not a general tech channel. The act of naming it signals that questions are welcome and expected.',
      ],
      mistake: 'Assuming the most enthusiastic person will naturally take this on. Enthusiasm is not ownership. Without a clear role, support falls through the gaps when that person gets busy or leaves.',
    },
    {
      number: '07', phase: 1, icon: FileText,
      accentColor: '#FFCD00',
      accentBg: 'rgba(255,205,0,0.10)',
      accentBorder: 'rgba(255,205,0,0.30)',
      title: 'Put Light, Clear Governance In Place So People Can Move Faster',
      oneLiner: 'Rules of the road let people drive. The absence of rules makes everyone stop.',
      narrative: 'The team created a plain-language governance document — not a policy manual, but a one-page "rules of the road" that answered the questions staff actually had: What can I use AI for? What requires review? What should I never put in? The framing was explicitly enabling, not restrictive. Governance was positioned as the thing that let people move faster, not the thing that slowed them down.',
      stat: '1 page',
      statLabel: 'governance doc — plain language, actionable',
      statSub: 'not a policy manual. A starting point people actually use.',
      quote: null,
      actions: [
        'Write a one-page "rules of the road" document that answers 5 questions: What tools are approved? What data is safe? What outputs need human review? What is never allowed? Who do I ask if I\'m unsure?',
        'Timebox the compliance review to two weeks. Perfect governance that arrives in six months serves no one.',
        'Publish it, link to it in your AI channel, and reference it in every training. Governance that no one can find is the same as governance that doesn\'t exist.',
      ],
      mistake: 'Waiting for IT or Legal to hand you a policy before you start. They won\'t have one. Write your own department-level guidance, position it as provisional, and update it as you learn.',
    },

    // ─── PHASE 2: SCALE ─────────────────────────────────────────────────────
    {
      number: '08', phase: 2, icon: Network,
      accentColor: '#7DE69B',
      accentBg: 'rgba(125,230,155,0.08)',
      accentBorder: 'rgba(125,230,155,0.20)',
      title: 'Create a Cross-Functional AI Council and Champion Network',
      oneLiner: 'Senior leaders alone cannot carry culture change. You need nodes in every corner.',
      narrative: 'MarCom built a 22-member AI Council that deliberately included frontline staff and individual contributors — not just managers. Council members weren\'t administrators; they were active participants who surfaced use cases, flagged friction, and served as visible proof that AI wasn\'t just a leadership initiative. The champion network extended the signal beyond the people who could mandate it.',
      stat: '22',
      statLabel: 'AI Council members — not just senior leaders',
      statSub: 'ICs and frontline staff included by design',
      quote: null,
      actions: [
        'Identify 3–5 early adopters in your department who are already doing interesting AI work. Ask them to be champions — not formally, just by name. Give them visibility in meetings.',
        'Create a lightweight council cadence: a monthly 30-minute meeting where champions share what they\'ve tried, what worked, and what to steal.',
        'Make the network visible — a shared doc where champions post experiments, a monthly "what we tried" summary, a rotating highlight in your team channel.',
      ],
      mistake: 'Building a champion network of enthusiasts with no structural support, no protected time, and no visibility. They burn out, the network dissolves, and the knowledge leaves with them.',
    },
    {
      number: '09', phase: 2, icon: Zap,
      accentColor: '#2EA84A',
      accentBg: 'rgba(46,168,74,0.10)',
      accentBorder: 'rgba(46,168,74,0.22)',
      title: 'Start With Low-Risk, High-Value Use Cases, and Make Experimentation Normal',
      oneLiner: 'Don\'t start with the hardest problem. Start with the one where failure has no consequences.',
      narrative: 'The team identified starter use cases that were time-consuming, repetitive, and low-stakes: drafting first-pass copy, summarizing long documents, generating options for review. These weren\'t the most transformative use cases — but they were the ones that let people have an early win. Early wins build the confidence that leads to harder problems.',
      stat: `${topBenefitPct}%`,
      statLabel: `cite ${topBenefitLabel}`,
      statSub: 'top benefit in Survey 3 — built on low-stakes starting points',
      quote: 'It makes everything we come up with that much better and opens my eyes to so much more possibility and new ways of thinking.',
      actions: [
        'Before assigning a use case, ask: what is the cost of a bad output? If someone always reviews it before it ships, that\'s your starting point.',
        'Pick three starter use cases your entire team can try in week one. Write them down. Post them. Make the first experiment feel assigned, not optional.',
        'Run recurring practice sessions where teams bring real tasks and test AI against them. "What I tried this week" becomes the normalized behavior before it becomes the expected one.',
      ],
      mistake: 'Starting with the most impressive use case you can imagine, demonstrating it to the team, and wondering why no one replicates it. Impressive demos don\'t translate to daily habits. Easy wins do.',
    },
    {
      number: '10', phase: 2, icon: TrendingUp,
      accentColor: '#59BEC9',
      accentBg: 'rgba(89,190,201,0.10)',
      accentBorder: 'rgba(89,190,201,0.22)',
      title: 'Build a Daily Drumbeat, Measure Progress, and Write the Change Into How You Operate',
      oneLiner: 'The gains that last are the ones you institutionalize.',
      narrative: 'MarCom ran an active Slack channel with daily AI experiments, shared examples, and low-pressure questions. Three surveys over 14 months measured not just usage but sentiment, confidence, and barriers. AI use was written into job descriptions and performance expectations — not as surveillance, but as signal. The daily drumbeat prevented the pattern of initial enthusiasm followed by gradual reversion.',
      stat: '3',
      statLabel: 'pulse surveys over 14 months',
      statSub: '290 total responses — behavioral proof, not self-report',
      quote: 'I\'m especially interested in building workflows and tools that make it easier for teams to focus on more strategic, high-value work.',
      actions: [
        'Create a dedicated AI channel in your team communication platform today. Call it "#ai-experiments" or "#ai-corner" — the word "experiments" signals that trying and failing is the point.',
        'Run a quarterly pulse survey — one question is enough: "How often are you using AI in your work this week?" Track the number and share it with the team.',
        'Update at least one job description to mention AI capability. Start with your own. The goal is not a requirement — it\'s a signal that this is part of how the department operates.',
      ],
      mistake: 'Assuming the drumbeat will sustain itself once momentum is established. It will not. The active channel needs active seeding. The surveys need someone to own them. The job descriptions need someone to update them.',
    },
  ];
}

// ── Phase header ──────────────────────────────────────────────────────────────
function PhaseHeader({ phase, phaseIndex }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: phaseIndex * 0.06, ease: 'easeOut' }}
      style={{
        marginBottom: 16,
        paddingBottom: 18,
        borderBottom: '1px solid var(--border)',
        marginTop: phaseIndex === 0 ? 0 : 56,
      }}
    >
      <span style={{
        fontFamily: 'DM Sans, sans-serif',
        fontSize: 11, fontWeight: 800,
        color: 'var(--accent-mint)',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        display: 'block',
        marginBottom: 8,
      }}>
        {phase.eyebrow}
      </span>
      <h2 style={{
        margin: '0 0 6px',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 'clamp(18px, 2vw, 22px)',
        fontWeight: 800,
        color: 'var(--text-primary)',
        lineHeight: 1.25,
      }}>
        {phase.title}
      </h2>
      <p style={{
        margin: 0,
        fontFamily: 'DM Sans, sans-serif',
        fontSize: 14,
        color: 'var(--text-medium)',
        lineHeight: 1.7,
        maxWidth: 640,
      }}>
        {phase.description}
      </p>
    </motion.div>
  );
}

// ── Accordion card ────────────────────────────────────────────────────────────
function PrincipleAccordion({ card, globalIndex, isOpen, onToggle, isMobile }) {
  const [hovered, setHovered] = useState(false);
  const Icon = card.icon;
  const rgb = hexToRgb(card.accentColor);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: globalIndex * 0.05, ease: 'easeOut' }}
      style={{
        background: hovered && !isOpen
          ? `rgba(${rgb}, 0.04)`
          : 'var(--surface-green)',
        border: '1px solid var(--border)',
        borderLeft: `4px solid ${card.accentColor}`,
        borderRadius: 14,
        overflow: 'hidden',
        transition: 'background 0.18s ease',
        marginBottom: 10,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Collapsed row (always visible) ── */}
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '18px 22px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        {/* Icon badge */}
        <div style={{
          width: 34, height: 34, borderRadius: 9, flexShrink: 0,
          background: card.accentBg,
          border: `1px solid ${card.accentBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={15} strokeWidth={1.75} style={{ color: card.accentColor }} />
        </div>

        {/* Number + title + one-liner */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 10, fontWeight: 800,
            color: 'var(--text-dim)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: 2,
          }}>
            {card.number}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <h3 style={{
              margin: 0,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 16, fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1.3,
            }}>
              {card.title}
            </h3>
            {!isOpen && !isMobile && (
              <span style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 13,
                fontStyle: 'italic',
                color: 'var(--text-dim)',
                whiteSpace: 'nowrap',
              }}>
                {card.oneLiner}
              </span>
            )}
          </div>
        </div>

        {/* Chevron */}
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          style={{ color: 'var(--text-dim)', flexShrink: 0, display: 'flex' }}
        >
          <ChevronDown size={16} />
        </motion.span>
      </div>

      {/* ── Expanded body ── */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1, transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1] } }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '0 22px 28px',
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: 28,
            }}>

              {/* Left — How MarCom Did It */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <span style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 10, fontWeight: 700,
                    color: 'var(--accent-mint)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.10em',
                    display: 'block',
                    marginBottom: 10,
                  }}>
                    How MarCom Did It
                  </span>
                  <p style={{
                    margin: 0,
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 14,
                    color: 'var(--text-medium)',
                    lineHeight: 1.8,
                  }}>
                    {card.narrative}
                  </p>
                </div>

                {/* Stat box */}
                <div style={{
                  background: card.accentBg,
                  border: `1px solid ${card.accentBorder}`,
                  borderRadius: 10,
                  padding: '13px 16px',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 12,
                  flexWrap: 'wrap',
                }}>
                  <span style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 26, fontWeight: 900,
                    color: card.accentColor,
                    lineHeight: 1,
                  }}>
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

                {/* Pull quote */}
                {card.quote && (
                  <blockquote style={{
                    margin: 0,
                    borderLeft: `3px solid ${card.accentColor}`,
                    paddingLeft: 14,
                    fontFamily: 'DM Sans, sans-serif',
                    fontStyle: 'italic',
                    fontSize: 13,
                    color: 'var(--text-dim)',
                    lineHeight: 1.7,
                  }}>
                    "{card.quote}"
                  </blockquote>
                )}
              </div>

              {/* Right — What To Do In Your Department */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <span style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 10, fontWeight: 700,
                    color: 'var(--accent-mint)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.10em',
                    display: 'block',
                    marginBottom: 10,
                  }}>
                    What To Do In Your Department
                  </span>
                  <ol style={{
                    margin: 0,
                    padding: '0 0 0 18px',
                    listStyle: 'decimal',
                  }}>
                    {card.actions.map((action, i) => (
                      <li
                        key={i}
                        style={{
                          fontFamily: 'DM Sans, sans-serif',
                          fontSize: 13,
                          color: 'var(--text-medium)',
                          lineHeight: 1.75,
                          marginBottom: i < card.actions.length - 1 ? 10 : 0,
                        }}
                      >
                        {action}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Common mistake — coral callout */}
                <div style={{
                  background: 'rgba(229,85,79,0.08)',
                  border: '1px solid rgba(229,85,79,0.22)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                }}>
                  <AlertTriangle
                    size={14}
                    style={{ color: '#E5554F', flexShrink: 0, marginTop: 2 }}
                  />
                  <div>
                    <span style={{
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: 10, fontWeight: 700,
                      color: '#E5554F',
                      textTransform: 'uppercase',
                      letterSpacing: '0.10em',
                      display: 'block',
                      marginBottom: 4,
                    }}>
                      Common mistake
                    </span>
                    <p style={{
                      margin: 0,
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: 13,
                      color: 'var(--text-medium)',
                      lineHeight: 1.7,
                    }}>
                      {card.mistake}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function HowWeDidIt({ transforms }) {
  const isMobile = useIsMobile();
  const principles = buildPrinciples(transforms);

  // One open card index per phase (-1 = none). Phase 0 pre-opens card 0.
  const [openCards, setOpenCards] = useState({ 0: 0, 1: -1, 2: -1 });

  function handleToggle(phaseIndex, withinPhaseIndex) {
    setOpenCards(prev => ({
      ...prev,
      [phaseIndex]: prev[phaseIndex] === withinPhaseIndex ? -1 : withinPhaseIndex,
    }));
  }

  return (
    <div className="pad-section" style={{ padding: '0 32px 80px', maxWidth: 1360, margin: '0 auto' }}>

      {/* ── Opening section ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ marginBottom: 52, paddingTop: 8 }}
      >
        <span style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 11, fontWeight: 800,
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
          This is how you could do it too.
        </h1>

        <p style={{
          margin: '0 0 16px',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 16,
          color: 'var(--text-medium)',
          lineHeight: 1.8,
          maxWidth: 720,
        }}>
          MarCom's AI adoption results are among the strongest we've seen in any department at Baptist Health — or anywhere. Daily AI usage went from 42% to 90% in 14 months. Confidence followed. So did quality of work. But the numbers are the outcome, not the method.
        </p>

        <p style={{
          margin: 0,
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 16,
          color: 'var(--text-medium)',
          lineHeight: 1.8,
          maxWidth: 720,
        }}>
          This playbook documents the method. Ten principles, organized into three phases: Foundation, System, and Scale. These are not aspirational guidelines. They are the specific moves MarCom made — in the order they were made. Every principle includes what MarCom did, what you can do in your department, and the most common mistake to avoid.
        </p>
      </motion.div>

      {/* ── Three phases ── */}
      {PHASES.map((phase, phaseIndex) => {
        const phaseCards = principles.filter(p => p.phase === phaseIndex);
        return (
          <div key={phaseIndex}>
            <PhaseHeader phase={phase} phaseIndex={phaseIndex} />
            {phaseCards.map((card, withinPhaseIndex) => {
              const globalIndex = principles.indexOf(card);
              return (
                <PrincipleAccordion
                  key={card.number}
                  card={card}
                  globalIndex={globalIndex}
                  isOpen={openCards[phaseIndex] === withinPhaseIndex}
                  onToggle={() => handleToggle(phaseIndex, withinPhaseIndex)}
                  isMobile={isMobile}
                />
              );
            })}
          </div>
        );
      })}

      {/* ── Closing CTA ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        style={{
          marginTop: 52,
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
          <h3 style={{
            margin: '0 0 8px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 20, fontWeight: 800,
            color: 'var(--text-primary)',
          }}>
            Interested in bringing this model to your team?
          </h3>
          <p style={{
            margin: 0,
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 14,
            color: 'var(--text-support)',
            lineHeight: 1.65,
          }}>
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
            fontSize: 13, fontWeight: 700,
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
