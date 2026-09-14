import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, FileText } from './Icons';
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip,
} from 'recharts';
import { useTheme } from '../hooks/useTheme';

// ─── Brand palette — green first, mint, teal, yellow, red ────────────────────
const C = {
  green:  '#2EA84A',
  mint:   '#7DE69B',
  teal:   '#59BEC9',
  yellow: '#FFCD00',
  red:    '#E5554F',
  gray:   '#797D80',
};

// Ramp: index 0 = best/highest (green) → index 4 = worst/lowest (red)
const RAMP = [C.green, C.mint, C.teal, C.yellow, C.red];

function rampColor(index, total) {
  const i = Math.round((index / Math.max(total - 1, 1)) * (RAMP.length - 1));
  return RAMP[i];
}

// ─── Survey instrument metadata — sourced from actual Google Form PDFs ───────
const SURVEY_META = {
  s1: {
    label: 'Survey 1', period: 'January – February 2025',
    questions: [
      {
        id: 'sentiment',
        text: 'How would you describe your current feelings about Artificial Intelligence (AI)?',
        options: ['Positive', 'Negative', 'I have both positive and negative feelings about AI', "I'm not sure how I feel about it"],
      },
      {
        id: 'familiarity',
        text: 'How would you best describe your familiarity with AI tools and their applications in marketing & communications?',
        options: ["I'm unfamiliar with AI and its applications in this space", "I've heard of them but don't know much", "I know a bit about them but haven't used them", 'I understand AI tools well and have experimented with them', 'I am highly knowledgeable and use AI regularly'],
      },
      {
        id: 'frequency',
        text: 'How often do you currently use AI tools (e.g., ChatGPT, Grammarly, Microsoft Copilot) in your work? Choose the option that most closely reflects your usage.',
        options: ['Daily', 'At least once per week', 'At least once per month', 'Rarely (Less than once per month)', 'Never'],
      },
      {
        id: 'barriers',
        text: 'What do you think are the biggest barriers to using AI effectively in your role? (Select up to 2 options)',
        options: ['select all that apply'],
      },
      {
        id: 'importance',
        text: 'How important is AI to the success of your individual or team work over the next 12 months?',
        options: ['1 – Not important at all', '2', '3', '4', '5 – Critically important'],
      },
      {
        id: 'confidence',
        text: 'How confident are you today in your ability to use AI tools effectively in your role?',
        options: ['Not confident at all', 'Somewhat confident', 'Confident', 'Very Confident'],
      },
      {
        id: 'openEnded',
        text: 'How do you see AI tools changing the way you work in the future? If you already use AI, what specific tasks or processes do you currently use it for?',
        options: ['open text'],
      },
    ],
  },
  s2: {
    label: 'Survey 2', period: 'August – September 2025',
    questions: [
      {
        id: 'sentiment',
        text: 'How would you describe your current feelings about Artificial Intelligence (AI)?',
        options: ['Positive', 'Negative', 'I have both positive and negative feelings about AI', "I'm not sure how I feel about it"],
      },
      {
        id: 'stage',
        text: 'Which stage best describes your current progress on the AI journey?',
        options: ['Currently – exploring AI, haven\'t developed much literacy yet', 'Understanding – learning the fundamentals, seeing relevance to my work', 'Experimentation – actively trying AI tools to improve efficiency or creativity', 'Integration – embedding AI into my workflows and processes', 'Transformation – reimagining how I work, AI as a core thought partner'],
      },
      {
        id: 'familiarity',
        text: 'How would you best describe your familiarity with AI tools and their applications in marketing & communications?',
        options: ["I'm unfamiliar with AI and its applications in this space", "I've heard of them but don't know much", "I know a bit about them but haven't used them", 'I understand AI tools well and have experimented with them', 'I am highly knowledgeable and use AI regularly'],
      },
      {
        id: 'frequency',
        text: 'How often do you currently use AI tools (e.g., ChatGPT, Grammarly, Microsoft Copilot) in your work? Choose the option that most closely reflects your usage.',
        options: ['Daily', 'At least once per week', 'At least once per month', 'Rarely (Less than once per month)', 'Never'],
      },
      {
        id: 'tools',
        text: 'Which AI tools do you currently use in your work? (Select all that apply)',
        options: ['Adobe Firefly', 'ChatGPT (OpenAI)', 'Claude (Anthropic)', 'Copilot (Microsoft)', 'Descript', 'Gamma', 'Gemini (Google)', 'Grammarly', 'Grok (xAI)', 'Jasper', 'Perplexity AI', 'Other'],
      },
      {
        id: 'barriers',
        text: 'What do you think are the biggest barriers to using AI effectively in your role? (Select up to 2 options)',
        options: ['select all that apply'],
      },
      {
        id: 'importance',
        text: 'How important is AI to the success of your individual or team work over the next 12 months?',
        options: ['1 – Not important at all', '2', '3', '4', '5 – Critically important'],
      },
      {
        id: 'confidence',
        text: 'How confident are you today in your ability to use AI tools effectively in your role?',
        options: ['Not confident at all', 'Somewhat confident', 'Confident', 'Very Confident'],
      },
      {
        id: 'openEnded',
        text: 'How do you see AI tools changing the way you work in the future? If you already use AI, what specific tasks or processes do you currently use it for?',
        options: ['open text'],
      },
    ],
  },
  s3: {
    label: 'Survey 3', period: 'March 2026',
    questions: [
      {
        id: 'sentiment',
        text: 'How would you describe your current feelings about Artificial Intelligence (AI)?',
        options: ['Positive', 'Negative', 'I have both positive and negative feelings about AI', "I'm not sure how I feel about it"],
      },
      {
        id: 'stage',
        text: 'Which stage best describes your current progress on the AI journey?',
        options: ['Currently – exploring AI, haven\'t developed much literacy yet', 'Understanding – learning the fundamentals, seeing relevance to my work', 'Experimentation – actively trying AI tools to improve efficiency or creativity', 'Integration – embedding AI into my workflows and processes', 'Transformation – reimagining how I work, AI as a core thought partner'],
      },
      {
        id: 'momentum',
        text: 'Which statement best describes the current momentum of AI adoption within Marketing & Communications?',
        options: ['Not started – we have not begun adopting AI', 'Stalled – started but progress has slowed or stopped', 'Steady – others adopt at similar rates, no cohesive department direction', 'Steady – making moderate, clear progress on specific projects', 'Accelerating – expanding to new use cases and workflows'],
      },
      {
        id: 'familiarity',
        text: 'How would you best describe your familiarity with AI tools and their applications in communications?',
        options: ["I'm unfamiliar with AI and its applications in this space", "I've heard of them but don't know much", "I know a bit about them but haven't used them", 'I understand AI tools well and have experimented with them', 'I am highly knowledgeable and use AI regularly'],
      },
      {
        id: 'frequency',
        text: 'How often do you currently use AI tools in your work? Choose the option that most closely reflects your usage.',
        options: ['Never (less than once per month)', 'At least once per month', 'At least once or twice per week', 'Daily', 'Other'],
      },
      {
        id: 'benefits',
        text: 'When you use AI at work, which benefits are you experiencing? (Select your top 3)',
        options: ['select all that apply'],
      },
      {
        id: 'tools',
        text: 'Besides the AI tools the company officially endorses with a paid subscription (ChatGPT, Copilot, Adobe Firefly, etc.), what other AI tools do you most often use for work?',
        options: ['Gemini (Google)', 'Claude (Anthropic)', 'Eleven Labs', 'Grok (xAI)', 'Midjourney', 'Perplexity AI', 'NotebookLM', 'Gamma', 'YouClip', 'Wispr', 'VSPR Flow', 'Other'],
      },
      {
        id: 'ownPocket',
        text: 'Are you currently paying out of your own pocket for any AI tools you use for work?',
        options: ['Yes', 'No'],
      },
      {
        id: 'barriers',
        text: 'What do you think are the biggest barriers to using AI effectively in your role? (Select 1–3 options)',
        options: ['select all that apply'],
      },
      {
        id: 'importance',
        text: 'How important is AI to the success of your individual or team work over the next 12 months?',
        options: ['1 – Not important at all', '2', '3', '4', '5 – Critically important'],
      },
      {
        id: 'confidence',
        text: 'How confident are you today in your ability to use AI tools effectively in your role?',
        options: ['Not confident at all', 'Somewhat confident', 'Confident', 'Very Confident', 'Extremely Confident'],
      },
      {
        id: 'openStruggle',
        text: "What's your biggest struggle with AI right now, if at all?",
        options: ['open text'],
      },
      {
        id: 'openExcited',
        text: 'What are you most excited about when it comes to AI?',
        options: ['open text'],
      },
      {
        id: 'role',
        text: 'What is your role?',
        options: ['Specialist', 'Manager', 'Director', 'AVP', 'VP', 'Other'],
      },
      {
        id: 'function',
        text: 'What is your function?',
        options: ['Patient Services', 'Strategy & Research', 'Strategic Communications', 'Internal Communication', 'Medical Staff Communications', 'Content Marketing', 'Social Media & Reputation Management', 'Creative Services', 'Event Management', 'Claims Partnerships', 'Event Marketing', 'Paid Media & Precision Marketing', 'Web & Technology', 'Marketing Operations', 'Other'],
      },
    ],
  },
};

SURVEY_META.s4 = {
  label: 'Survey 4', period: 'September 2026',
  questions: [
    { id: 'sentiment',   text: 'How would you describe your current feelings about Artificial Intelligence (AI)?', options: ['Positive', 'Negative', 'I have both positive and negative feelings about AI', "I'm not sure how I feel about it"] },
    { id: 'stage',       text: 'Which stage best describes your current progress on the AI journey?', options: ['Curiosity', 'Understanding', 'Experimentation', 'Integration', 'Transformation'] },
    { id: 'familiarity', text: 'How would you best describe your familiarity with AI tools and their applications in marketing & communications?', options: ["I'm unfamiliar with AI and its applications in this space", "I've heard of them but don't know much", "I know a bit about them but haven't used them", 'I understand AI tools well and have experimented with them', 'I am highly knowledgeable and use AI regularly'] },
    { id: 'frequency',   text: 'How often do you currently use AI tools in your work? Choose the option that most closely reflects your usage.', options: ['Never', 'Rarely (Less than once per month)', 'At least once per month', 'At least once per week', 'Daily'] },
    { id: 'builder',     text: 'What is the most advanced thing you currently do with AI?', options: ['I mainly use AI chat tools for simple, one-off tasks like asking questions, writing assistance, research, brainstorming or analysis', 'I use AI in more structured ways like ChatGPT Projects, saved prompts or creating Custom GPTs', 'I build AI agents that can complete multi-step tasks or take actions on their own', 'I build AI solutions that other people use, such as custom websites, connected workflows or multiple agents working together', "I'm not sure / none of these"] },
    { id: 'teamUse',     text: 'How is AI being used on your team today?', options: ['AI is rarely or not used by our team', 'People mostly use AI on their own for individual tasks', 'We use AI for some common team tasks', 'AI is part of some of our regular team workflows', 'AI is integrally built into how our team works across several important workflows', "I'm not sure"] },
    { id: 'humanContrib', text: 'As AI takes on more tasks, what do you believe will be your most important human contributions at work? (Select up to three)', options: ['Judgment and decision-making', 'Strategic thinking', 'Creativity and original point of view', 'Critical thinking', 'Empathy and relationship-building', 'Taste and quality judgment', 'Experience and subject-matter expertise', 'Communication and storytelling', 'Ethics and accountability', 'Curiosity and adaptability', 'Orchestration', 'Other'] },
    { id: 'benefits',    text: 'Which benefits have you personally experienced from using AI at work? (Select up to three)', options: ['select all that apply'] },
    { id: 'tools',       text: 'In addition to the AI tools officially provided or endorsed by Baptist Health (ChatGPT, Copilot, Firefly, Gamma), are you using any other AI tools for work?', options: ['Google Gemini', 'Anthropic Claude', 'xAI Grok', 'Meta Llama', 'Perplexity', 'Gemini Notebook (formerly NotebookLM)', 'OpusClip', 'Otter.ai', 'Wispr Flow', 'Replit', 'Lovable or Base44', 'Cursor or Codex', 'n8n or Zapier', 'Google AI Studio', 'None', 'Other'] },
    { id: 'ownPocket',   text: 'Are you currently paying out of your own pocket for any AI tools you use for work?', options: ['Yes', 'No'] },
    { id: 'barriers',    text: 'What are the biggest barriers, if any, preventing you from getting more value from AI at work? (Select up to three)', options: ['select all that apply'] },
    { id: 'importance',  text: 'How important is AI to the success of your individual or team work over the next 12 months?', options: ['1 – Not important at all', '2', '3', '4', '5 – Critically important'] },
    { id: 'confidence',  text: 'How confident are you today in your ability to use AI tools effectively in your role?', options: ['Not confident at all', 'Somewhat confident', 'Confident', 'Very Confident', 'Extremely Confident'] },
    { id: 'openEnded',   text: 'What is one thing helping, or one thing getting in the way of, your use of AI at work?', options: ['open text'] },
    { id: 'role',        text: 'What is your current role level?', options: ['Specialist', 'Manager', 'Director', 'Assistant Vice President', 'Vice President', 'Other'] },
    { id: 'function',    text: 'Which Marketing and Communications function are you primarily part of?', options: ['Account Services', 'Strategy & Research', 'Strategic Communications', 'Internal Communications', 'Medical Staff Communications', 'Content Marketing', 'Social Media & Reputation', 'Creative Services', 'Brand Management', 'Sports Partnerships', 'Event Marketing', 'Paid Media & Precision Marketing', 'Web & Technology', 'Marketing Operations', 'Other'] },
  ],
};

// ─── Shared question block wrapper ───────────────────────────────────────────
function QB({ label, question, children, fullWidth = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.36, ease: 'easeOut' }}
      style={{
        gridColumn: fullWidth ? '1 / -1' : undefined,
        background: 'var(--surface-green)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div>
        <span style={{ display: 'inline-block', fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 800, color: 'var(--accent-mint)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 4 }}>
          {label}
        </span>
        <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontStyle: 'italic', color: 'var(--text-support)', lineHeight: 1.6 }}>
          "{question}"
        </p>
      </div>
      {children}
    </motion.div>
  );
}

// ─── Visual 1: Sentiment pill cards ──────────────────────────────────────────
const SENT_STYLE = {
  'Positive': { color: C.green,  bg: 'rgba(46,168,74,0.12)',   border: 'rgba(46,168,74,0.28)' },
  'Mixed':    { color: C.yellow, bg: 'rgba(255,205,0,0.12)',   border: 'rgba(255,205,0,0.28)' },
  'Unsure':   { color: C.teal,   bg: 'rgba(89,190,201,0.12)',  border: 'rgba(89,190,201,0.28)' },
  'Negative': { color: C.red,    bg: 'rgba(229,85,79,0.10)',   border: 'rgba(229,85,79,0.22)' },
};

function SentimentPills({ distribution, label, question }) {
  const items = distribution.filter(d => d.count > 0);
  if (!items.length) return null;
  return (
    <QB label={label} question={question} fullWidth>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {items.map(d => {
          const s = SENT_STYLE[d.label] || SENT_STYLE['Unsure'];
          return (
            <div key={d.label} style={{ flex: '1 1 120px', minWidth: 100, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: '16px 18px' }}>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 34, fontWeight: 900, color: s.color, lineHeight: 1 }}>{d.pct}%</div>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600, color: 'var(--text-medium)', marginTop: 4 }}>{d.label}</div>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: 'var(--text-support)', marginTop: 2 }}>{d.count} respondents</div>
            </div>
          );
        })}
      </div>
    </QB>
  );
}

// ─── Visual 2: Score column tiles (green first → red last) ───────────────────
// For Familiarity and Importance — distribution already sorted high→low
function ScoreTiles({ distribution, label, question }) {
  if (!distribution?.length) return null;
  const maxPct = Math.max(...distribution.map(d => d.pct), 1);
  return (
    <QB label={label} question={question}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        {distribution.map((d, i) => {
          const color = rampColor(i, distribution.length);
          const h = 28 + ((d.pct / maxPct) * 60);
          return (
            <div key={d.label || d.score} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, minWidth: 0 }}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color, lineHeight: 1 }}>{d.pct}%</span>
              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: h }}
                viewport={{ once: true }}
                transition={{ duration: 0.42, delay: i * 0.055, ease: 'easeOut' }}
                style={{ width: '100%', background: color, opacity: 0.82, borderRadius: '5px 5px 0 0', minHeight: 6 }}
              />
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: 'var(--text-support)', textAlign: 'center', lineHeight: 1.3, wordBreak: 'break-word' }}>
                {d.label || `Score ${d.score}`}
              </span>
            </div>
          );
        })}
      </div>
    </QB>
  );
}

// ─── Visual 3: Donut chart (Confidence) ──────────────────────────────────────
// Shows confident vs not-confident split — few slices, color-coded
function DonutChart({ distribution, label, question }) {
  const theme = useTheme();
  if (!distribution?.length) return null;
  // Assign colors: best label first = green, worst = red
  const data = distribution.map((d, i) => ({
    name: d.label,
    value: d.pct,
    count: d.count,
    color: rampColor(i, distribution.length),
  }));
  const topItem = data[0];

  return (
    <QB label={label} question={question}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        {/* Donut */}
        <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
          <PieChart width={140} height={140}>
            <Pie
              data={data}
              cx={65}
              cy={65}
              innerRadius={42}
              outerRadius={62}
              paddingAngle={2}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} opacity={0.85} />
              ))}
            </Pie>
            <ReTooltip
              wrapperStyle={{ zIndex: 20 }}
              formatter={(v, name, props) => [`${v}% · ${props.payload.count} respondents`, name]}
              contentStyle={{
                background: 'var(--surface-green)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 12,
              }}
            />
          </PieChart>
          {/* Center label */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 900, color: topItem.color, lineHeight: 1 }}>{topItem.value}%</span>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 9, color: 'var(--text-support)', marginTop: 2, textAlign: 'center', maxWidth: 52, lineHeight: 1.3 }}>{topItem.name}</span>
          </div>
        </div>
        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          {data.map(d => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--text-medium)', fontWeight: 500 }}>{d.name}</span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, color: d.color }}>{d.value}%</span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: 'var(--text-support)', marginLeft: 2 }}>({d.count})</span>
            </div>
          ))}
        </div>
      </div>
    </QB>
  );
}

// ─── Visual 4: Importance — horizontal color-coded bars ───────────────────────
// One bar per score level, color-coded green→red, label on left
function ImportanceBars({ distribution, label, question }) {
  const [hovered, setHovered] = useState(null);
  if (!distribution?.length) return null;
  const maxPct = Math.max(...distribution.map(d => d.pct), 1);
  return (
    <QB label={label} question={question}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {distribution.map((d, i) => {
          const color = rampColor(i, distribution.length);
          const rowLabel = d.label || `Score ${d.score}`;
          const isHov = hovered === rowLabel;
          return (
            <div
              key={rowLabel}
              style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}
              onMouseEnter={() => setHovered(rowLabel)}
              onMouseLeave={() => setHovered(null)}
            >
              <span style={{ width: 76, flexShrink: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 600, color: 'var(--text-support)', textAlign: 'right' }}>
                {rowLabel}
              </span>
              <div style={{ flex: 1, height: 22, background: 'rgba(125,230,155,0.06)', borderRadius: 5, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(d.pct / maxPct) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.44, delay: i * 0.05, ease: 'easeOut' }}
                  style={{ height: '100%', background: color, opacity: 0.82, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 7 }}
                >
                  {(d.pct / maxPct) > 0.2 && (
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 800, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.35)' }}>
                      {d.pct}%
                    </span>
                  )}
                </motion.div>
              </div>
              {(d.pct / maxPct) <= 0.2 && (
                <span style={{ width: 28, flexShrink: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color }}>{d.pct}%</span>
              )}
              {isHov && d.count != null && (
                <div style={{
                  position: 'absolute', left: 88, bottom: '100%', marginBottom: 4,
                  background: 'var(--tooltip-bg)', border: `1px solid ${color}50`,
                  borderRadius: 6, padding: '5px 10px', zIndex: 10, whiteSpace: 'nowrap',
                  fontFamily: 'DM Sans, sans-serif', fontSize: 12, pointerEvents: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}>
                  <span style={{ fontWeight: 700, color }}>{d.pct}%</span>
                  <span style={{ color: 'var(--text-medium)', marginLeft: 6 }}>{d.count} respondents</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </QB>
  );
}

// ─── Visual 5: Frequency — horizontal color-coded bars ───────────────────────
// Daily → Weekly → Monthly → Rarely → Never, green → red
function FrequencyBars({ distribution, label, question }) {
  const [hovered, setHovered] = useState(null);
  if (!distribution?.length) return null;
  const maxPct = Math.max(...distribution.map(d => d.pct), 1);
  return (
    <QB label={label} question={question}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {distribution.map((d, i) => {
          const color = rampColor(i, distribution.length);
          const isHov = hovered === d.label;
          return (
            <div
              key={d.label}
              style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}
              onMouseEnter={() => setHovered(d.label)}
              onMouseLeave={() => setHovered(null)}
            >
              <span style={{ width: 72, flexShrink: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 600, color: 'var(--text-support)', textAlign: 'right' }}>
                {d.label}
              </span>
              <div style={{ flex: 1, height: 22, background: 'rgba(125,230,155,0.06)', borderRadius: 5, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(d.pct / maxPct) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.44, delay: i * 0.06, ease: 'easeOut' }}
                  style={{ height: '100%', background: color, opacity: 0.85, borderRadius: 5,
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 7 }}
                >
                  {(d.pct / maxPct) > 0.2 && (
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 800, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.35)' }}>
                      {d.pct}%
                    </span>
                  )}
                </motion.div>
              </div>
              {(d.pct / maxPct) <= 0.2 && (
                <span style={{ width: 30, flexShrink: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color }}>{d.pct}%</span>
              )}
              {isHov && (
                <div style={{
                  position: 'absolute', left: 84, bottom: '100%', marginBottom: 4,
                  background: 'var(--tooltip-bg)', border: `1px solid ${color}50`,
                  borderRadius: 6, padding: '5px 10px', zIndex: 10, whiteSpace: 'nowrap',
                  fontFamily: 'DM Sans, sans-serif', fontSize: 12, pointerEvents: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}>
                  <span style={{ fontWeight: 700, color }}>{d.pct}%</span>
                  <span style={{ color: 'var(--text-medium)', marginLeft: 6 }}>{d.count} respondents</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </QB>
  );
}

// ─── Visual 6: Stage step display (Curiosity→Transformation, red→green) ──────
const STAGE_ORDER  = ['Curiosity', 'Understanding', 'Experimentation', 'Integration', 'Transformation'];
// Red = earliest/least advanced, Green = most advanced
const STAGE_COLORS = [C.red, C.yellow, C.teal, C.mint, C.green];

function StageSteps({ distribution, label, question }) {
  if (!distribution?.length) return null;
  const ordered = STAGE_ORDER.map((stage, i) => ({
    label: stage,
    color: STAGE_COLORS[i],
    ...(distribution.find(d => d.label === stage) || { pct: 0, count: 0 }),
  })).filter(d => d.count > 0);
  const maxPct = Math.max(...ordered.map(d => d.pct), 1);

  return (
    <QB label={label} question={question}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
        {ordered.map((d, i) => {
          const h = d.pct > 0 ? 26 + ((d.pct / maxPct) * 66) : 8;
          return (
            <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: d.pct > 0 ? d.color : 'var(--text-dim)' }}>
                {d.pct > 0 ? `${d.pct}%` : '—'}
              </span>
              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: h }}
                viewport={{ once: true }}
                transition={{ duration: 0.44, delay: i * 0.07, ease: 'easeOut' }}
                style={{ width: '100%', background: d.pct > 0 ? d.color : 'rgba(125,230,155,0.08)', opacity: d.pct > 0 ? 0.82 : 0.4, borderRadius: '5px 5px 0 0', minHeight: 6 }}
              />
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 9, fontWeight: 500, color: d.pct > 0 ? 'var(--text-medium)' : 'var(--text-dim)', textAlign: 'center', lineHeight: 1.3 }}>
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </QB>
  );
}

// ─── Visual 7: Ranked horizontal bar (barriers, tools, benefits, momentum) ────
function RankedBar({ distribution, label, question, color = C.teal, maxItems = 12, fullWidth = false }) {
  const items = (distribution || []).slice(0, maxItems);
  const maxPct = items[0]?.pct || 1;
  if (!items.length) return null;
  return (
    <QB label={label} question={question} fullWidth={fullWidth}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {items.map((d, i) => {
          const itemLabel = d.label || d.barrier || d.stage;
          return (
            <div key={itemLabel || i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 180, flexShrink: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 500, color: 'var(--text-medium)', textAlign: 'right', lineHeight: 1.35 }}>
                {itemLabel}
              </span>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 18, background: 'rgba(125,230,155,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(d.pct / maxPct) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.44, delay: i * 0.03, ease: 'easeOut' }}
                    style={{ height: '100%', background: color, opacity: 0.78, borderRadius: 4 }}
                  />
                </div>
                <span style={{ width: 32, flexShrink: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color }}>{d.pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </QB>
  );
}

// ─── Visual 7b: Ladder (Wave 4 builder / team use) ───────────────────────────
// Levels shown low→high (builder has 4 rungs, team 5); green = most advanced. "I'm not sure" excluded from %.
function LadderCard({ ladder, label, question, color = C.green }) {
  if (!ladder || !ladder.n) return null;
  const levels = [...ladder.distribution].sort((a, b) => a.score - b.score);
  const maxPct = Math.max(...levels.map(d => d.pct), 1);
  return (
    <QB label={label} question={question}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {levels.map((d, i) => {
          const c = STAGE_COLORS[levels.length === STAGE_COLORS.length ? i : Math.round(i * (STAGE_COLORS.length - 1) / Math.max(levels.length - 1, 1))];
          return (
            <div key={d.score} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 18, flexShrink: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 800, color: c }}>{d.score}</span>
              <span style={{ width: 150, flexShrink: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 500, color: 'var(--text-medium)', lineHeight: 1.3 }}>{d.label}</span>
              <div style={{ flex: 1, height: 18, background: 'rgba(125,230,155,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} whileInView={{ width: `${(d.pct / maxPct) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.44, delay: i * 0.05, ease: 'easeOut' }}
                  style={{ height: '100%', background: c, opacity: 0.8, borderRadius: 4 }} />
              </div>
              <span style={{ width: 34, flexShrink: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: c }}>{d.pct}%</span>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: 'var(--text-support)' }}>
        <span>Levels {(ladder.maxScore ?? 5) - 1}–{ladder.maxScore ?? 5}: <strong style={{ color }}>{ladder.topTwoPct}%</strong> · avg {ladder.avg}</span>
        <span>{ladder.n} answered{ladder.notSure ? ` · ${ladder.notSure} not sure` : ''}</span>
      </div>
    </QB>
  );
}

// ─── Visual 7d: Human contributions (Wave 4 Q7, up to three picks, new this wave) ──
function HumanContribCard({ human, label, question, color = C.teal }) {
  if (!human || !human.n) return null;
  const items = human.distribution;
  const maxPct = items[0]?.pct || 1;
  const other = (human.other || []).filter(Boolean).slice(0, 6);
  return (
    <div style={{ gridColumn: '1 / -1' }}>
      <QB label={label} question={question} fullWidth>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {items.map((d, i) => (
            <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 220, flexShrink: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 500, color: d.pct > 0 ? 'var(--text-medium)' : 'var(--text-dim)', textAlign: 'right', lineHeight: 1.35 }}>{d.label}</span>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 18, background: 'rgba(125,230,155,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} whileInView={{ width: `${(d.pct / maxPct) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.44, delay: i * 0.03, ease: 'easeOut' }}
                    style={{ height: '100%', background: color, opacity: 0.78, borderRadius: 4 }} />
                </div>
                <span style={{ width: 32, flexShrink: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: d.pct > 0 ? color : 'var(--text-dim)' }}>{d.pct}%</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: 'var(--text-support)' }}>
          <span>New in Survey 4, so this is the baseline. Percent of all respondents; each person picked up to three.</span>
          <span>{human.n} answered{other.length ? ` · write-ins: ${other.join(' / ')}` : ''}</span>
        </div>
      </QB>
    </div>
  );
}

// ─── Visual 7c: Open text list (Wave 4's single open question) ───────────────
function OpenTextCard({ quotes, label, question, themes, split }) {
  if (!quotes?.length) return null;
  const HELP = '#2EA84A', HINDER = '#E5554F';
  const groups = split ? [
    { key: 'helping',   title: 'Helping',        n: split.helpingN,   color: HELP,   items: split.helping },
    { key: 'hindering', title: 'In the way',     n: split.hinderingN, color: HINDER, items: split.hindering },
    { key: 'mixed',     title: 'Both',           n: split.mixedN,     color: '#59BEC9', items: split.mixed },
    { key: 'none',      title: 'No answer',      n: split.noneN,      color: 'var(--text-dim)', items: split.none },
  ].filter(g => g.n > 0) : null;
  const shown = quotes.filter(q => q && q.trim().length > 3).slice(0, 12);
  const Quote = ({ q, color }) => (
    <blockquote style={{ margin: 0, padding: '10px 14px', borderLeft: `3px solid ${color}`, background: 'rgba(125,230,155,0.04)', borderRadius: '0 8px 8px 0', fontFamily: 'DM Sans, sans-serif', fontSize: 12.5, fontStyle: 'italic', lineHeight: 1.6, color: 'var(--text-medium)' }}>
      "{q.trim()}"
    </blockquote>
  );
  return (
    <QB label={label} question={question} fullWidth>
      {groups && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {groups.map(g => (
            <div key={g.key} style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '8px 14px', borderRadius: 10, background: 'rgba(125,230,155,0.05)', border: `1px solid ${g.color}33` }}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 22, fontWeight: 800, color: g.color, lineHeight: 1 }}>{g.n}</span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-support)' }}>{g.title}</span>
              {split.n > 0 && <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: 'var(--text-dim)' }}>{Math.round((g.n / split.n) * 100)}%</span>}
            </div>
          ))}
          <span style={{ alignSelf: 'center', fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: 'var(--text-support)' }}>of {split.n} responses, {split.source === 'claude' ? 'each answer read and sorted by Claude' : 'sorted by keyword (Claude has not read these yet)'}</span>
        </div>
      )}
      {themes?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {themes.slice(0, 8).map(t => (
            <span key={t.key} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 600, color: 'var(--accent-mint)', background: 'rgba(125,230,155,0.08)', border: '1px solid rgba(125,230,155,0.18)', borderRadius: 20, padding: '3px 10px' }}>
              {t.label} · {t.count}
            </span>
          ))}
        </div>
      )}
      {groups ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
          {groups.filter(g => g.key === 'helping' || g.key === 'hindering').map(g => (
            <div key={g.key} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: g.color }}>{g.title} · {g.n}</span>
              {g.items.slice(0, 8).map((q, i) => <Quote key={i} q={q} color={g.color} />)}
            </div>
          ))}
          {groups.filter(g => g.key === 'mixed' || g.key === 'none').map(g => (
            <div key={g.key} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: g.color }}>{g.title} · {g.n}</span>
              {g.items.slice(0, 4).map((q, i) => <Quote key={i} q={q} color={g.color} />)}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
          {shown.map((q, i) => <Quote key={i} q={q} color="rgba(125,230,155,0.4)" />)}
        </div>
      )}
      {!groups && quotes.length > shown.length && (
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: 'var(--text-support)' }}>Showing {shown.length} of {quotes.length} responses</span>
      )}
    </QB>
  );
}

// ─── Visual 8: Binary yes/no card ────────────────────────────────────────────
function BinaryCard({ yes, no, total, yesPct, noPct, label, question }) {
  return (
    <QB label={label} question={question}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1, background: 'rgba(229,85,79,0.10)', border: '1px solid rgba(229,85,79,0.22)', borderRadius: 10, padding: '16px 18px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 36, fontWeight: 900, color: C.red, lineHeight: 1 }}>{yesPct}%</div>
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: 'var(--text-support)', marginTop: 5 }}>Yes — {yes} of {total}</div>
        </div>
        <div style={{ flex: 1, background: 'rgba(125,230,155,0.08)', border: '1px solid rgba(125,230,155,0.18)', borderRadius: 10, padding: '16px 18px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 36, fontWeight: 900, color: C.mint, lineHeight: 1 }}>{noPct}%</div>
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: 'var(--text-support)', marginTop: 5 }}>No — {no} of {total}</div>
        </div>
      </div>
    </QB>
  );
}

// ─── Collapsible survey instrument ───────────────────────────────────────────
function SurveyArtifact({ wave, vaultUnlocked = false }) {
  const [open, setOpen] = useState(false);
  const meta = SURVEY_META[wave];
  const VAULT_ONLY = ['role', 'function'];
  const questions = meta.questions.filter(q => vaultUnlocked || !VAULT_ONLY.includes(q.id));
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
      <button onClick={() => setOpen(v => !v)} style={{ width: '100%', background: 'var(--surface-green)', border: 'none', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: 'var(--text-support)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
          <FileText size={12} strokeWidth={1.75} style={{ color: 'var(--accent-mint)', opacity: 0.7 }} />
          View original survey instrument
        </span>
        {open ? <ChevronUp size={13} strokeWidth={2} style={{ color: 'var(--text-support)' }} /> : <ChevronDown size={13} strokeWidth={2} style={{ color: 'var(--text-support)' }} />}
      </button>
      {open && (
        <div style={{ background: 'var(--card-bg-dark)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: 'var(--text-support)' }}>{meta.label} · {meta.period}</p>
          {questions.map((q, i) => (
            <div key={q.id} style={{ display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--accent-mint)', fontFamily: 'DM Sans, sans-serif', minWidth: 18, paddingTop: 2, flexShrink: 0 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <p style={{ margin: '0 0 5px', fontSize: 13, fontWeight: 600, color: 'var(--text-medium)', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5 }}>{q.text}</p>
                {!['open text', 'select all that apply', 'single choice'].includes(q.options[0]) ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 7px' }}>
                    {q.options.map(opt => (
                      <span key={opt} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: 'var(--text-support)', background: 'rgba(125,230,155,0.06)', border: '1px solid rgba(125,230,155,0.12)', borderRadius: 5, padding: '2px 7px' }}>{opt}</span>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: 11, fontStyle: 'italic', color: 'var(--text-dim)', fontFamily: 'DM Sans, sans-serif' }}>
                    {q.options[0] === 'open text' ? 'Open-ended' : q.options[0] === 'single choice' ? 'Single choice' : 'Select all that apply'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function SurveySnapshot({ wave, transforms, vaultUnlocked = false, lastUpdated = null }) {
  const {
    sentimentTrend, familiarityTrend, confidenceTrend, importanceTrend,
    frequencyTrend, barriersTrend, stageTrend,
    toolsS2, toolsS3, benefitsS3, ownPocketS3, momentumS3, responseCounts,
    toolsS4, benefitsS4, ownPocketS4, builderS4, teamUseS4, humanS4,
    openEndedText, openEndedSplitS4, struggleThemesS4, excitementThemesS4, waves, s4,
  } = transforms;

  const wIdx = Math.max(0, (waves ?? []).findIndex(w => w.key === wave) >= 0 ? (waves ?? []).findIndex(w => w.key === wave) : { s1: 0, s2: 1, s3: 2, s4: 3 }[wave]);
  const wKey = wave;
  const meta = SURVEY_META[wave];
  const rc   = responseCounts?.[wIdx];
  const isS4 = wave === 's4';
  const s4Empty = isS4 && (rc?.n ?? 0) === 0;

  const sentimentDist   = (sentimentTrend ?? []).map(e => ({ label: e.sentiment, ...e[wKey] })).filter(d => d.count > 0);
  const familiarityDist = familiarityTrend?.[wIdx]?.distribution ?? [];
  const confidenceDist  = confidenceTrend?.[wIdx]?.distribution ?? [];
  const IMPORTANCE_LABELS = { 5: 'Critical', 4: 'Important', 3: 'Moderate', 2: 'Low', 1: 'Not at all' };
  const importanceDist  = importanceTrend?.[wIdx]?.distribution?.map(d => ({ label: IMPORTANCE_LABELS[d.score] ?? `Score ${d.score}`, ...d })) ?? [];
  const frequencyDist   = frequencyTrend?.[wIdx]?.distribution ?? [];

  const barriersDist = (barriersTrend ?? [])
    .map(b => ({ label: b.barrier, ...b[wKey] }))
    .filter(b => b.count > 0)
    .sort((a, b) => b.count - a.count);

  const stageDist = (stageTrend ?? [])
    .map(e => ({ label: e.stage, ...e[wKey] }))
    .filter(e => e?.count > 0);

  const toolsDist    = wave === 's2' ? (toolsS2 ?? []) : wave === 's3' ? (toolsS3 ?? []) : wave === 's4' ? (toolsS4 ?? []) : [];
  const benefitsDist = wave === 's3' ? benefitsS3 : wave === 's4' ? benefitsS4 : null;
  const ownPocket    = wave === 's3' ? ownPocketS3 : wave === 's4' ? ownPocketS4 : null;

  return (
    <div style={{ padding: '0 32px 80px', maxWidth: 1360, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4, flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{meta.label}</h2>
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--text-support)' }}>{meta.period}</span>
          {rc && (
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: 'var(--accent-mint)', background: 'rgba(125,230,155,0.10)', border: '1px solid rgba(125,230,155,0.20)', borderRadius: 20, padding: '2px 10px', letterSpacing: '0.05em' }}>
              {rc.n} responses{isS4 ? ' so far' : ''}
            </span>
          )}
          {isS4 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 800, color: '#2EA84A', letterSpacing: '0.08em' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2EA84A', boxShadow: '0 0 8px rgba(46,168,74,0.9)' }} />
              LIVE · in the field Sep 14–25
              {lastUpdated && <span style={{ fontWeight: 500, color: 'var(--text-support)', letterSpacing: 0 }}>· refreshed {lastUpdated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>}
            </span>
          )}
        </div>
        <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--text-support)', lineHeight: 1.6 }}>
          {isS4
            ? `Responses land here automatically as people submit the survey (the sheet republishes about every 5 minutes). Percentages firm up as the count grows${s4?.minN ? `; headline numbers across the dashboard switch to Survey 4 at ${s4.minN} responses` : ''}.`
            : 'How people actually answered each question in this wave — a clean snapshot of that moment in time.'}
        </p>
      </div>

      <SurveyArtifact wave={wave} vaultUnlocked={vaultUnlocked} />

      {s4Empty && (
        <div style={{ background: 'var(--surface-green)', border: '1px solid var(--border)', borderRadius: 14, padding: '36px 28px', textAlign: 'center', fontFamily: 'DM Sans, sans-serif' }}>
          <p style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>No responses yet</p>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-support)', lineHeight: 1.6 }}>Survey 4 opens Monday, September 14. The first answers will appear here within minutes of being submitted.</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>

        {/* Sentiment — pill cards, full-width */}
        {sentimentDist.length > 0 && <SentimentPills distribution={sentimentDist} label="Sentiment" question="How do you feel about AI in your work right now?" />}

        {/* Familiarity — column tiles (green=Expert first) */}
        {familiarityDist.length > 0 && <ScoreTiles distribution={familiarityDist} label="AI Familiarity (1–5)" question="How familiar are you with AI tools and capabilities?" />}

        {/* Confidence — donut chart */}
        {confidenceDist.length > 0 && <DonutChart distribution={confidenceDist} label="Confidence" question="How confident are you using AI in your daily work?" />}

        {/* Importance — horizontal color bars */}
        {importanceDist.length > 0 && <ImportanceBars distribution={importanceDist} label="Importance to Role (1–5)" question="How important is AI to your current role?" />}

        {/* Frequency — horizontal color bars */}
        {frequencyDist.length > 0 && (
          <FrequencyBars
            distribution={frequencyDist}
            label="Usage Frequency"
            question={meta.questions.find(q => q.id === 'frequency')?.text ?? 'How often do you currently use AI tools in your work?'}
          />
        )}

        {/* Stage — step display, red→green (S2 onward) */}
        {stageDist.length > 0 && <StageSteps distribution={stageDist} label="AI Journey Stage" question="Where are you on your personal AI adoption journey?" />}

        {/* Wave 4 ladders — building, team use (new this wave, baseline only) */}
        {isS4 && <LadderCard ladder={builderS4} label="Building With AI (New in Survey 4)" question="What is the most advanced thing you currently do with AI?" color={C.teal} />}
        {isS4 && <LadderCard ladder={teamUseS4} label="AI on Your Team (New in Survey 4)"  question="How is AI being used on your team today?" color={C.mint} />}

        {/* Wave 4 Q7 — human contributions (new this wave, baseline only) */}
        {isS4 && <HumanContribCard human={humanS4} label="Human Contributions (New in Survey 4)" question="As AI takes on more tasks, what do you believe will be your most important human contributions at work? (select up to three)" color={C.teal} />}

        {/* Barriers — full-width, yellow (neutral/warning) */}
        {barriersDist.length > 0 && (
          <div style={{ gridColumn: '1 / -1' }}>
            <RankedBar distribution={barriersDist} label="Barriers" question="What are the biggest barriers preventing you from using AI more? (select all that apply)" color={C.yellow} maxItems={12} fullWidth />
          </div>
        )}

        {/* Tools — full-width, mint */}
        {toolsDist.length > 0 && (
          <div style={{ gridColumn: '1 / -1' }}>
            <RankedBar distribution={toolsDist} label="Tools Beyond the Official Stack"
              question={wave === 's4'
                ? 'In addition to the officially provided tools (ChatGPT, Copilot, Firefly, Gamma), what other AI tools are you using? (free or self-paid)'
                : wave === 's3'
                  ? 'Besides ChatGPT, Copilot, Jasper & Firefly — what other AI tools are you using? (S3 personal & non-endorsed tools only)'
                  : 'Which AI tools do you currently use in your work? (select all that apply)'}
              color={C.mint} maxItems={16} fullWidth />
          </div>
        )}

        {/* Benefits — full-width, green (S3 onward) */}
        {benefitsDist?.length > 0 && (
          <div style={{ gridColumn: '1 / -1' }}>
            <RankedBar distribution={benefitsDist} label="Benefits Experienced" question="Which benefits have you personally experienced from using AI at work? (select up to three)" color={C.green} maxItems={13} fullWidth />
          </div>
        )}

        {/* Own Pocket — binary card (S3 onward) */}
        {ownPocket && ownPocket.total > 0 && <BinaryCard {...ownPocket} label="Personal Investment" question="Are you paying out of pocket for AI tools not provided by Baptist Health?" />}

        {/* Wave 4 open text — the one written question */}
        {isS4 && (
          <OpenTextCard
            quotes={openEndedText?.s4 ?? []}
            split={openEndedSplitS4}
            themes={[...(struggleThemesS4 ?? []), ...(excitementThemesS4 ?? [])].sort((a, b) => b.count - a.count)}
            label="In Their Words"
            question="What is one thing helping, or one thing getting in the way of, your use of AI at work?"
          />
        )}

        {/* Momentum — teal bars (S3 only) */}
        {wave === 's3' && momentumS3?.length > 0 && <RankedBar distribution={momentumS3} label="Department Momentum" question="How would you describe AI adoption momentum in MarCom right now?" color={C.teal} />}

      </div>
    </div>
  );
}
