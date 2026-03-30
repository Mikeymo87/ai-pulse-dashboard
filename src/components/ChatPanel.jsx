import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Prompt chips ─────────────────────────────────────────────────────────────
const CHIPS = [
  "What's changed most since Survey 1?",
  "Which team needs the most support?",
  "What's the biggest barrier to adoption?",
  "Who's paying out of pocket and why does it matter?",
  "How has confidence trended across surveys?",
  "What tools is the team actually using?",
];

// ─── Build system prompt from live transforms ────────────────────────────────
function buildSystemPrompt(transforms) {
  const {
    sentimentTrend, confidenceTrend, familiarityTrend,
    importanceTrend, frequencyTrend, stageTrend,
    barriersTrend, byRole, byFunction,
    toolsS2, toolsS3, benefitsS3, momentumS3, ownPocketS3,
  } = transforms;

  const posS1 = sentimentTrend.find(e => e.sentiment === 'Positive')?.s1.pct ?? 0;
  const posS2 = sentimentTrend.find(e => e.sentiment === 'Positive')?.s2.pct ?? 0;
  const posS3 = sentimentTrend.find(e => e.sentiment === 'Positive')?.s3.pct ?? 0;
  const negS1 = sentimentTrend.find(e => e.sentiment === 'Negative')?.s1.pct ?? 0;
  const negS3 = sentimentTrend.find(e => e.sentiment === 'Negative')?.s3.pct ?? 0;

  const confPct = (idx) =>
    (confidenceTrend[idx]?.distribution ?? [])
      .filter(d => d.score >= 3).reduce((s, d) => s + d.pct, 0);

  const freqPct = (idx, label) =>
    frequencyTrend[idx]?.distribution.find(d => d.label === label)?.pct ?? 0;

  const ADVANCED = ['Experimentation', 'Integration', 'Transformation'];
  const s2Adv = stageTrend.filter(e => ADVANCED.includes(e.stage)).reduce((s, e) => s + e.s2.pct, 0);
  const s3Adv = stageTrend.filter(e => ADVANCED.includes(e.stage)).reduce((s, e) => s + e.s3.pct, 0);

  const top5Barriers = [...barriersTrend]
    .filter(b => b.barrier !== 'No barriers')
    .sort((a, b) => b.s3.pct - a.s3.pct)
    .slice(0, 5)
    .map(b => `${b.barrier} (S1:${b.s1.pct}% S2:${b.s2.pct}% S3:${b.s3.pct}%)`)
    .join(', ');

  const topRoles = (byRole ?? []).slice(0, 6).map(r =>
    `${r.role} (n=${r.count}, conf avg=${r.confidenceAvg?.toFixed(1)}, imp avg=${r.importanceAvg?.toFixed(1)})`
  ).join('; ');

  const topFunctions = (byFunction ?? []).slice(0, 6).map(f =>
    `${f.function} (n=${f.count}, conf avg=${f.confidenceAvg?.toFixed(1)}, imp avg=${f.importanceAvg?.toFixed(1)})`
  ).join('; ');

  const topToolsS2 = (toolsS2 ?? []).slice(0, 8).map(t => `${t.label} (${t.pct}%)`).join(', ');
  const topToolsS3 = (toolsS3 ?? []).filter(t => t.count >= 2).slice(0, 10).map(t => `${t.label} (${t.pct}%)`).join(', ');
  const topBenefits = (benefitsS3 ?? []).slice(0, 5).map(b => `${b.label} (${b.pct}%)`).join(', ');
  const topMomentum = (momentumS3 ?? []).slice(0, 3).map(m => `"${m.label}" (${m.pct}%)`).join(', ');

  return `You are an AI data assistant for the Baptist Health Marketing & Communications department.
You have access to results from 3 AI adoption pulse surveys conducted over 14 months:
- Survey 1: Jan–Feb 2025 (97 responses, anonymous)
- Survey 2: Aug–Sep 2025 (106 responses, anonymous)
- Survey 3: Mar 2026 (89 responses, includes role + function data)

STRICT RULES:
1. Only cite numbers from the data below — never invent or estimate figures not provided
2. If a question can't be answered from the data, say so honestly
3. Keep answers concise — 2–4 sentences unless a list is clearly needed
4. Tone: confident, executive-ready, plain English (no jargon)
5. You are talking to department leadership, not researchers

--- SURVEY DATA ---

SENTIMENT (% Positive / % Negative):
S1: ${posS1}% positive, ${negS1}% negative
S2: ${posS2}% positive
S3: ${posS3}% positive, ${negS3}% negative

FAMILIARITY avg (1=Unfamiliar, 5=Expert):
S1: ${familiarityTrend[0]?.avg ?? '—'} | S2: ${familiarityTrend[1]?.avg ?? '—'} | S3: ${familiarityTrend[2]?.avg ?? '—'}

IMPORTANCE avg (1–5 scale):
S1: ${importanceTrend[0]?.avg ?? '—'} | S2: ${importanceTrend[1]?.avg ?? '—'} | S3: ${importanceTrend[2]?.avg ?? '—'}

CONFIDENCE (% Confident or higher, normalized):
S1: ${confPct(0)}% | S2: ${confPct(1)}% | S3: ${confPct(2)}%

FREQUENCY — Daily use %:
S1: ${freqPct(0, 'Daily')}% | S2: ${freqPct(1, 'Daily')}% | S3: ${freqPct(2, 'Daily')}%
Never use %: S1: ${freqPct(0, 'Never')}% | S3: ${freqPct(2, 'Never')}%

AI JOURNEY STAGE (% at Experimentation or higher):
S2: ${s2Adv}% | S3: ${s3Adv}%

TOP 5 BARRIERS (sorted by S3):
${top5Barriers}

OWN POCKET SPENDING (S3 only):
${ownPocketS3.yesPct}% are paying out of their own pocket for AI tools

DEPARTMENTAL MOMENTUM (S3 only):
${topMomentum}

TOP BENEFITS EXPERIENCED (S3 only):
${topBenefits}

TOOLS USED — Survey 2 (all tools):
${topToolsS2 || 'No data'}

TOOLS USED — Survey 3 (personal/non-endorsed tools):
${topToolsS3 || 'No data'}

TEAM READINESS BY ROLE (S3 only — confidence avg / importance avg):
${topRoles || 'No role data'}

TEAM READINESS BY FUNCTION (S3 only):
${topFunctions || 'No function data'}
--- END DATA ---`;
}

// ─── Markdown renderer ────────────────────────────────────────────────────────
function inlineFormat(text, key) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/);
  return (
    <span key={key}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**'))
          return <strong key={i} style={{ color: '#e8f5ec', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
        if (part.startsWith('*') && part.endsWith('*'))
          return <em key={i} style={{ color: '#c8e0d0' }}>{part.slice(1, -1)}</em>;
        if (part.startsWith('`') && part.endsWith('`'))
          return <code key={i} style={{ background: 'rgba(125,230,155,0.1)', borderRadius: 4, padding: '1px 5px', fontSize: 11, color: '#7DE69B', fontFamily: 'monospace' }}>{part.slice(1, -1)}</code>;
        return part;
      })}
    </span>
  );
}

function renderMarkdown(text) {
  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip blank lines between blocks
    if (!line.trim()) { i++; continue; }

    // Heading (## or ###)
    if (/^#{2,3}\s/.test(line)) {
      const content = line.replace(/^#{2,3}\s/, '');
      elements.push(
        <p key={i} style={{ margin: '10px 0 4px', fontWeight: 800, fontSize: 13, color: '#e8f5ec', letterSpacing: '0.01em' }}>
          {inlineFormat(content, 0)}
        </p>
      );
      i++; continue;
    }

    // Bullet list — collect consecutive bullet lines
    if (/^[-•*]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-•*]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[-•*]\s/, ''));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ margin: '6px 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {items.map((item, j) => (
            <li key={j} style={{ fontSize: 13, color: '#c8d8d0', lineHeight: 1.55, listStyleType: 'none', display: 'flex', gap: 8 }}>
              <span style={{ color: '#7DE69B', flexShrink: 0, marginTop: 1 }}>›</span>
              <span>{inlineFormat(item, j)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list — collect consecutive numbered lines
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      let num = 1;
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} style={{ margin: '6px 0', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: 4, listStyle: 'none' }}>
          {items.map((item, j) => (
            <li key={j} style={{ fontSize: 13, color: '#c8d8d0', lineHeight: 1.55, display: 'flex', gap: 8 }}>
              <span style={{ color: '#7DE69B', fontWeight: 700, flexShrink: 0, minWidth: 16 }}>{j + 1}.</span>
              <span>{inlineFormat(item, j)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} style={{ margin: '0 0 6px', fontSize: 13, color: '#c8d8d0', lineHeight: 1.6 }}>
        {inlineFormat(line, 0)}
      </p>
    );
    i++;
  }

  return <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{elements}</div>;
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '10px 14px', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
          style={{ width: 6, height: 6, borderRadius: '50%', background: '#7DE69B' }}
        />
      ))}
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 10,
      }}
    >
      <div style={{
        maxWidth: '86%',
        padding: '10px 14px',
        borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        background: isUser ? 'rgba(125,230,155,0.18)' : 'rgba(29,77,82,0.55)',
        border: isUser ? '1px solid rgba(125,230,155,0.3)' : '1px solid rgba(125,230,155,0.1)',
        fontFamily: 'Inter, sans-serif',
      }}>
        {isUser
          ? <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: '#e0f5e8' }}>{msg.content}</p>
          : renderMarkdown(msg.content)
        }
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ChatPanel({ transforms, open, setOpen }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  async function sendMessage(text) {
    const userText = text.trim();
    if (!userText || thinking) return;

    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setInput('');
    setThinking(true);

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 512,
          system: buildSystemPrompt(transforms),
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      const reply = data.content?.[0]?.text ?? 'Sorry, I couldn\'t generate a response.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('ChatPanel error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Something went wrong — please try again.',
      }]);
    } finally {
      setThinking(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const showChips = messages.length === 0;

  return (
    <>
      {/* ── Floating button ─────────────────────────────────────────────── */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: open ? 'rgba(229,85,79,0.2)' : 'rgba(46,168,74,0.9)',
          border: open ? '2px solid rgba(229,85,79,0.5)' : '2px solid rgba(125,230,155,0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: open
            ? '0 0 20px rgba(229,85,79,0.3)'
            : '0 0 24px rgba(46,168,74,0.5)',
          zIndex: 1000,
          transition: 'background 0.25s, border-color 0.25s, box-shadow 0.25s',
          fontSize: 20,
        }}
        aria-label={open ? 'Close chat' : 'Ask the data'}
      >
        {open ? '✕' : '💬'}
      </motion.button>

      {/* ── Chat panel ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              bottom: 92,
              right: 28,
              width: 380,
              maxWidth: 'calc(100vw - 40px)',
              height: 520,
              background: '#16191a',
              border: '1px solid rgba(125,230,155,0.2)',
              borderRadius: 18,
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 999,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '14px 18px 12px',
              borderBottom: '1px solid rgba(125,230,155,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexShrink: 0,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#7DE69B',
                boxShadow: '0 0 8px rgba(125,230,155,0.7)',
              }} />
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#f0f2f4', fontFamily: 'Inter, sans-serif' }}>
                  Ask the Data
                </p>
                <p style={{ margin: 0, fontSize: 10, color: '#797D80', fontFamily: 'Inter, sans-serif' }}>
                  Answers grounded in survey data only
                </p>
              </div>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '14px 14px 4px',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(125,230,155,0.2) transparent',
            }}>
              {showChips && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 12,
                    color: '#797D80',
                    marginBottom: 10,
                    textAlign: 'center',
                  }}>
                    Try asking…
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {CHIPS.map(chip => (
                      <button
                        key={chip}
                        onClick={() => sendMessage(chip)}
                        style={{
                          background: 'rgba(125,230,155,0.07)',
                          border: '1px solid rgba(125,230,155,0.18)',
                          borderRadius: 10,
                          padding: '7px 12px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: 12,
                          color: '#b0c8b8',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(125,230,155,0.13)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(125,230,155,0.07)'}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => <Message key={i} msg={msg} />)}
              {thinking && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  marginBottom: 10,
                }}>
                  <div style={{
                    background: 'rgba(29,77,82,0.6)',
                    border: '1px solid rgba(125,230,155,0.1)',
                    borderRadius: '14px 14px 14px 4px',
                  }}>
                    <TypingIndicator />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{
              padding: '10px 12px',
              borderTop: '1px solid rgba(125,230,155,0.1)',
              display: 'flex',
              gap: 8,
              flexShrink: 0,
            }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about the survey data…"
                rows={1}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(125,230,155,0.2)',
                  borderRadius: 10,
                  padding: '8px 12px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 13,
                  color: '#e0e0e0',
                  resize: 'none',
                  outline: 'none',
                  lineHeight: 1.4,
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || thinking}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: 'none',
                  background: input.trim() && !thinking
                    ? 'rgba(46,168,74,0.85)'
                    : 'rgba(255,255,255,0.06)',
                  cursor: input.trim() && !thinking ? 'pointer' : 'default',
                  color: input.trim() && !thinking ? '#fff' : '#555',
                  fontSize: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  alignSelf: 'flex-end',
                  transition: 'background 0.2s',
                }}
              >
                ↑
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
