import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

// ─── Accent color per insight ID (fixed — not generated) ─────────────────────
const ACCENT = {
  'aspiration-gap':    '#FFCD00',
  'tool-mindset':      '#59BEC9',
  'leadership-voices': '#7DE69B',
  'blocked-investors': '#E5554F',
};

const LABEL = {
  'aspiration-gap':    'ASPIRATION GAP',
  'tool-mindset':      'TOOL → MINDSET LINK',
  'leadership-voices': 'LEADERSHIP VOICES',
  'blocked-investors': 'BLOCKED INVESTORS',
};

const ORDER = ['aspiration-gap', 'tool-mindset', 'leadership-voices', 'blocked-investors'];

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard({ delay = 0, id }) {
  const accent = ACCENT[id] || '#7DE69B';
  return (
    <motion.div
      animate={{ opacity: [0.4, 0.75, 0.4] }}
      transition={{ repeat: Infinity, duration: 1.6, delay }}
      style={{
        background: 'rgba(29,77,82,0.35)',
        border: '1px solid rgba(125,230,155,0.15)',
        borderTop: `2px solid ${accent}`,
        borderRadius: 16,
        padding: '28px 28px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        minHeight: 260,
      }}
    >
      <div style={{ width: 120, height: 20, background: 'rgba(255,255,255,0.08)', borderRadius: 20 }} />
      <div style={{ width: '75%', height: 22, background: 'rgba(255,255,255,0.07)', borderRadius: 6 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ width: '100%', height: 13, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }} />
        <div style={{ width: '88%',  height: 13, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }} />
        <div style={{ width: '65%',  height: 13, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }} />
      </div>
      <div style={{ width: '50%', height: 16, marginTop: 'auto', background: 'rgba(255,255,255,0.06)', borderRadius: 4 }} />
    </motion.div>
  );
}

// ─── Quote block ──────────────────────────────────────────────────────────────
function Quotes({ quotes, accent, showFreq }) {
  if (!quotes?.length) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {quotes.slice(0, 2).map((q, i) => {
        const text = typeof q === 'string' ? q : q.text;
        const freq = typeof q === 'object' ? q.freq : null;
        return (
          <div key={i} style={{ borderLeft: `2px solid ${accent}`, paddingLeft: 12 }}>
            <p style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 12.5,
              lineHeight: 1.55,
              color: '#c8d0d8',
              fontStyle: 'italic',
              margin: 0,
            }}>
              "{text}"
            </p>
            {showFreq && freq && (
              <span style={{ display: 'inline-block', marginTop: 3, fontSize: 10, color: '#797D80', fontFamily: 'DM Sans, sans-serif' }}>
                — uses AI {freq}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Tool mindset side-by-side stat ──────────────────────────────────────────
function ToolStat({ data }) {
  if (!data) return null;
  const { claude, chatgpt } = data;
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {[
        { label: 'Claude users', count: claude.count, accent: '#59BEC9', quotes: claude.quotes, tag: 'Claude user' },
        { label: 'ChatGPT users', count: chatgpt.count, accent: '#7DE69B', quotes: chatgpt.quotes, tag: 'ChatGPT user' },
      ].map(({ label, count, accent, quotes, tag }) => (
        <div key={label} style={{ flex: 1 }}>
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 22, fontWeight: 800, color: accent, lineHeight: 1 }}>{count}</div>
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10.5, fontWeight: 700, color: accent, marginBottom: 8 }}>{label}</div>
          {quotes?.slice(0, 1).map((q, i) => (
            <div key={i} style={{ borderLeft: `2px solid ${accent}`, paddingLeft: 10 }}>
              <span style={{ display: 'block', fontSize: 9.5, fontFamily: 'DM Sans, sans-serif', color: accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{tag}</span>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, lineHeight: 1.5, color: '#c8d0d8', fontStyle: 'italic', margin: 0 }}>"{q}"</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Single insight card (AI copy + live data) ────────────────────────────────
function InsightCard({ id, copy, data, index }) {
  const accent = ACCENT[id];
  const label  = LABEL[id];
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: 'rgba(29,77,82,0.35)',
        border: '1px solid rgba(125,230,155,0.15)',
        borderTop: `2px solid ${accent}`,
        borderRadius: 16,
        padding: '28px 28px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* Label badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 10,
          fontWeight: 800,
          color: accent,
          background: `${accent}18`,
          borderRadius: 20,
          padding: '3px 10px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          {label}
        </span>
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10.5, fontWeight: 700, color: '#797D80' }}>
          {String(index + 1).padStart(2, '0')} / 04
        </span>
      </div>

      {/* AI-generated headline */}
      <p style={{
        margin: 0,
        fontFamily: 'DM Sans, sans-serif',
        fontSize: 17,
        fontWeight: 800,
        color: '#f0f4f8',
        lineHeight: 1.35,
        letterSpacing: '0.01em',
      }}>
        {copy.headline}
      </p>

      {/* AI-generated body */}
      <p style={{
        margin: 0,
        fontFamily: 'DM Sans, sans-serif',
        fontSize: 14,
        lineHeight: 1.7,
        color: '#b0b8c0',
        flex: 1,
      }}>
        {copy.body}
      </p>

      {/* Live data block */}
      {id === 'tool-mindset' ? (
        <ToolStat data={data} />
      ) : (
        <>
          {data?.count != null && (
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 8,
              background: 'rgba(0,0,0,0.2)',
              borderRadius: 10,
              padding: '10px 14px',
            }}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 32, fontWeight: 900, color: accent, lineHeight: 1 }}>
                {data.count}
              </span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#9ca8b4' }}>
                {copy.stat}
              </span>
            </div>
          )}
          <Quotes
            quotes={data?.quotes}
            accent={accent}
            showFreq={id === 'aspiration-gap'}
          />
        </>
      )}

      {/* AI-generated leadership action */}
      <div style={{
        background: `${accent}10`,
        border: `1px solid ${accent}28`,
        borderRadius: 10,
        padding: '12px 14px',
        marginTop: 'auto',
      }}>
        <span style={{
          display: 'inline-block',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 9.5,
          fontWeight: 800,
          color: accent,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: 5,
        }}>
          For leadership
        </span>
        <p style={{
          margin: 0,
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 13,
          lineHeight: 1.65,
          color: '#b0bcc8',
        }}>
          {copy.action}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function OpenTextIntelligence({ transforms }) {
  const [cards, setCards]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(false);
  const fetchedRef = useRef(false);

  const fetchInsights = useCallback(async () => {
    const insights = transforms?.openTextInsights;
    if (!insights) return;

    const { aspirationGap, toolMindset, leadershipVoices, blockedInvestors } = insights;

    // ── Build prompt context from live computed data ───────────────────────
    const ctx = {
      dataset: {
        survey: 'Baptist Health Marketing & Communications dept',
        totalS3Respondents: 89,
        surveyPeriod: 'Mar 2026',
      },
      aspirationGap: {
        description: 'Respondents who wrote detailed excitement about AI (>80 chars) but use it less than weekly',
        count: aspirationGap.count,
        pctOfTeam: aspirationGap.pct,
        byFrequency: aspirationGap.byFreq,
        sampleQuotes: aspirationGap.quotes.slice(0, 3).map(q => `[${q.freq}] "${q.text}"`),
      },
      toolMindset: {
        description: 'Cross-referencing which AI tools respondents use with how they describe AI in their excitement text',
        claudeUserCount: toolMindset.claude.count,
        chatgptUserCount: toolMindset.chatgpt.count,
        useBothCount: toolMindset.bothCount,
        claudeSampleExcitement: toolMindset.claude.quotes.slice(0, 2),
        chatgptSampleExcitement: toolMindset.chatgpt.quotes.slice(0, 2),
      },
      leadershipVoices: {
        description: 'Respondents whose struggle text describes team-level challenges (pulling others forward, getting team buy-in, adoption concerns) rather than personal skill gaps',
        count: leadershipVoices.count,
        pctOfTeam: leadershipVoices.pct,
        sampleQuotes: leadershipVoices.quotes.slice(0, 3),
      },
      blockedInvestors: {
        description: 'Respondents who are paying out of pocket for AI tools AND reporting org-level barriers (IT access, compliance, unclear guidelines)',
        count: blockedInvestors.count,
        pctOfTeam: blockedInvestors.pct,
        sampleQuotes: blockedInvestors.quotes.slice(0, 3),
      },
    };

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
          max_tokens: 1600,
          system: `You are a strategic communications advisor for Baptist Health. You will receive structured findings from an open-text analysis of an internal AI adoption survey. Each finding includes computed counts, percentages, and real verbatim quotes from employees.

Return ONLY a valid JSON array of exactly 4 insight objects — one per finding, in this exact order: aspiration-gap, tool-mindset, leadership-voices, blocked-investors.

Each object: { "id": string, "headline": string, "body": string, "stat": string, "action": string }

Rules:
- id must match the input finding key exactly
- headline: 8–13 words, punchy, present-tense, grounded in the actual data — do not invent narrative, let the numbers speak
- body: 2 sentences that interpret what the pattern means — what is actually happening and why it matters to the department; cite the actual numbers provided
- stat: a short (5–10 word) phrase describing what the count represents — will appear next to the live number in the UI, e.g. "people with high inspiration but low frequency"
- action: 2 sentences — a specific, concrete leadership recommendation based on this finding; no platitudes
Do not add markdown. Do not wrap in code fences. Return raw JSON only.`,
          messages: [{
            role: 'user',
            content: `Analyze these four open-text cross-reference findings and generate the 4 insight cards:\n\n${JSON.stringify(ctx, null, 2)}`,
          }],
        }),
      });

      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      const raw = data.content?.[0]?.text ?? '';
      const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed) || parsed.length < 4) throw new Error('Unexpected shape');
      setCards(parsed);
    } catch (err) {
      console.error('OpenTextIntelligence error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [transforms]);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchInsights();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const insights = transforms?.openTextInsights;

  const dataMap = {
    'aspiration-gap':    insights?.aspirationGap,
    'tool-mindset':      insights?.toolMindset,
    'leadership-voices': insights?.leadershipVoices,
    'blocked-investors': insights?.blockedInvestors,
  };

  return (
    <section style={{
      padding: '96px 32px 80px',
      maxWidth: 1360,
      margin: '0 auto',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: 56, textAlign: 'center' }}
      >
        <span style={{
          display: 'inline-block',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.13em',
          color: '#7DE69B',
          textTransform: 'uppercase',
          marginBottom: 12,
        }}>
          Open Text Intelligence
        </span>
        <h2 style={{
          margin: '0 0 16px',
          fontSize: 'clamp(28px, 4vw, 42px)',
          fontWeight: 800,
          color: '#f0f2f4',
          lineHeight: 1.1,
          letterSpacing: '-0.025em',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          What They're Actually Saying
        </h2>
        <p style={{
          margin: 0,
          fontSize: 15,
          color: '#797D80',
          maxWidth: 560,
          marginInline: 'auto',
          lineHeight: 1.7,
        }}>
          Patterns only visible when you cross-reference what people write with what they actually do.
          Claude analyzed the open-text responses against every respondent's behavioral data.
        </p>
      </motion.div>

      {/* Loading state */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 24 }}>
          {ORDER.map((id, i) => <SkeletonCard key={id} id={id} delay={i * 0.15} />)}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{
          background: 'rgba(29,77,82,0.25)',
          border: '1px solid rgba(125,230,155,0.1)',
          borderRadius: 16,
          padding: '36px 28px',
          textAlign: 'center',
        }}>
          <p style={{ margin: 0, color: '#797D80', fontSize: 14 }}>
            Insights couldn't load — check API key or try reloading.
          </p>
        </div>
      )}

      {/* Card grid */}
      {!loading && !error && cards && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 24 }}>
          {ORDER.map((id, i) => {
            const copy = cards.find(c => c.id === id);
            if (!copy) return null;
            return (
              <InsightCard
                key={id}
                id={id}
                copy={copy}
                data={dataMap[id]}
                index={i}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
