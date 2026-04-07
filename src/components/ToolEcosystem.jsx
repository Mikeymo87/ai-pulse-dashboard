import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';

// ─── Tool category detection ──────────────────────────────────────────────────
// Categories are functional types — not company names
// color = bright (dark mode)  |  lightColor = rich/dark (light mode, WCAG-AA readable)
const TOOL_CATEGORIES = {
  'AI Assistant':  { color: '#7DE69B', lightColor: '#1a7a3c', keywords: ['gemini', 'google', 'notebooklm', 'bard', 'ai studio', 'claude', 'anthropic', 'grok', 'xai', 'llama', 'meta ai', 'mistral', 'copilot', 'chatgpt', 'openai'] },
  'Voice / Audio': { color: '#ffab40', lightColor: '#a04e00', keywords: ['wispr', 'otter', 'elevenlabs', 'eleven labs', 'genny', 'lovo', 'murf', 'speechify'] },
  'Research AI':   { color: '#59BEC9', lightColor: '#0e677a', keywords: ['perplexity', 'answerthepublic', 'you.com', 'consensus', 'elicit'] },
  'Image / Video': { color: '#f48fb1', lightColor: '#8a1a4c', keywords: ['midjourney', 'opusclip', 'heygen', 'runway', 'stable diffusion', 'ideogram', 'synthesia', 'invideo', 'luma', 'gamma', 'adobe', 'firefly', 'dall-e', 'dall·e', 'sora'] },
  'Productivity':  { color: '#FFCD00', lightColor: '#7a5800', keywords: ['grammarly', 'jasper', 'copy.ai', 'writesonic', 'rytr', 'wordtune', 'sprout'] },
  'Dev Tools':     { color: '#80deea', lightColor: '#0a5f6e', keywords: ['cursor', 'replit', 'codex', 'n8n', 'zapier', 'github'] },
};

function getToolCategory(name) {
  const n = name.toLowerCase();
  for (const [cat, { keywords }] of Object.entries(TOOL_CATEGORIES)) {
    if (keywords.some(k => n.includes(k))) return cat;
  }
  return 'Other';
}
function getCategoryColors(name, isDark) {
  const cat = getToolCategory(name);
  const entry = TOOL_CATEGORIES[cat];
  if (!entry) return { base: '#797D80', display: isDark ? '#797D80' : '#3a4045' };
  return { base: entry.color, display: isDark ? entry.color : entry.lightColor };
}

// ─── Bubble chart ─────────────────────────────────────────────────────────────
function ToolBubbles({ tools, totalN, isDark }) {
  const [hovered, setHovered] = useState(null);
  const max = tools[0]?.count || 1;
  const MIN_SIZE = 52;
  const MAX_SIZE = 128;

  return (
    <div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 0 16px',
        minHeight: 180,
      }}>
        {tools.map((tool, i) => {
          const size = Math.round(MIN_SIZE + ((tool.count / max) * (MAX_SIZE - MIN_SIZE)));
          const { base, display } = getCategoryColors(tool.label, isDark);
          const isHovered = hovered === tool.label;
          const pct = totalN ? Math.round((tool.count / totalN) * 100) : tool.pct;
          const showLabel = size >= 72;

          // Light mode: solid-ish fill so bubbles are clearly visible
          // Dark mode: subtle tint as before
          const bgNormal  = isDark ? `${base}22` : `${base}28`;
          const bgHovered = isDark ? `${base}40` : `${base}50`;
          const borderNormal  = isDark ? `${base}55` : `${base}cc`;
          const borderHovered = isDark ? `${base}cc` : `${base}ff`;

          return (
            <motion.div
              key={tool.label}
              initial={{ opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              onMouseEnter={() => setHovered(tool.label)}
              onMouseLeave={() => setHovered(null)}
              style={{
                position: 'relative',
                width: size,
                height: size,
                borderRadius: '50%',
                background: isHovered ? bgHovered : bgNormal,
                border: `2px solid ${isHovered ? borderHovered : borderNormal}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'default',
                transition: 'background 0.2s, border-color 0.2s',
                flexShrink: 0,
              }}
            >
              {showLabel ? (
                <>
                  <span style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: Math.max(9, Math.min(12, size / 9)),
                    fontWeight: 700,
                    color: display,
                    textAlign: 'center',
                    lineHeight: 1.2,
                    padding: '0 6px',
                    wordBreak: 'break-word',
                  }}>
                    {tool.label}
                  </span>
                  <span style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: Math.max(9, Math.min(11, size / 10)),
                    fontWeight: 500,
                    color: 'var(--text-support)',
                    marginTop: 2,
                  }}>
                    {pct}%
                  </span>
                </>
              ) : (
                <span style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: 9,
                  fontWeight: 700,
                  color: display,
                  textAlign: 'center',
                  padding: '0 4px',
                  lineHeight: 1.2,
                  wordBreak: 'break-word',
                }}>
                  {tool.label.split(' ')[0]}
                </span>
              )}

              {isHovered && (
                <div style={{
                  position: 'absolute',
                  bottom: size / 2 + 12,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--tooltip-bg)',
                  border: `1px solid ${base}50`,
                  borderRadius: 8,
                  padding: '8px 12px',
                  whiteSpace: 'nowrap',
                  zIndex: 10,
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: 12,
                  pointerEvents: 'none',
                  boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.35)' : '0 4px 16px rgba(0,0,0,0.12)',
                }}>
                  <div style={{ fontWeight: 700, color: display, marginBottom: 2 }}>{tool.label}</div>
                  <div style={{ color: 'var(--text-medium)' }}>{tool.count} respondents · {pct}%</div>
                  <div style={{ color: 'var(--text-support)', fontSize: 10, marginTop: 2 }}>{getToolCategory(tool.label)}</div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Category legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginTop: 8, justifyContent: 'center' }}>
        {[...new Set(tools.map(t => getToolCategory(t.label)))].map(cat => {
          const entry = TOOL_CATEGORIES[cat];
          const dotColor = isDark ? (entry?.color ?? '#797D80') : (entry?.lightColor ?? '#3a4045');
          return (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: dotColor,
                flexShrink: 0,
              }} />
              <span style={{ fontSize: 10, color: 'var(--text-support)', fontFamily: 'DM Sans, sans-serif' }}>{cat}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function ToolEcosystem({ transforms }) {
  const [toolSurvey, setToolSurvey] = useState('s3');
  const theme = useTheme();
  const isDark = theme === 'dark';

  const { toolsS2, toolsS3 } = transforms ?? {};
  const s2Tools = (toolsS2 ?? []).filter(t => t.count >= 2).slice(0, 20);
  const s3Tools = (toolsS3 ?? []).filter(t => t.count >= 1);
  const activeTools = toolSurvey === 's2' ? s2Tools : s3Tools;
  const activeN = toolSurvey === 's2' ? 106 : 101;

  return (
    <section style={{ padding: '0 32px 64px', maxWidth: 1360, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {/* Section header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: 20,
            background: 'var(--accent-mint-bg)',
            border: '1px solid rgba(125,230,155,0.25)',
            color: 'var(--accent-mint)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 16,
            fontFamily: 'DM Sans, sans-serif',
          }}>
            Tool Ecosystem
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ margin: '0 0 8px', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.15, fontFamily: 'DM Sans, sans-serif' }}>
                What Tools Are They Using?
              </h2>
              <p style={{ margin: 0, fontSize: 15, color: 'var(--text-support)', lineHeight: 1.7, maxWidth: 520 }}>
                {toolSurvey === 's2'
                  ? 'Survey 2 — all AI tools used at work (structured list, 106 respondents)'
                  : 'Survey 3 — tools used beyond ChatGPT, Copilot, Jasper & Firefly (personal + non-endorsed, 101 respondents)'}
              </p>
            </div>
            <div style={{
              display: 'flex',
              background: 'var(--card-bg-dark)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: 3,
              gap: 2,
              flexShrink: 0,
            }}>
              {[{ key: 's2', label: 'Survey 2' }, { key: 's3', label: 'Survey 3' }].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setToolSurvey(opt.key)}
                  style={{
                    padding: '6px 18px',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.03em',
                    transition: 'all 0.2s',
                    background: toolSurvey === opt.key ? 'rgba(125,230,155,0.15)' : 'transparent',
                    color: toolSurvey === opt.key ? 'var(--accent-mint)' : 'var(--text-support)',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '20px 24px 24px',
        }}>
          {activeTools.length > 0
            ? <ToolBubbles tools={activeTools} totalN={activeN} isDark={isDark} />
            : <p style={{ textAlign: 'center', color: 'var(--text-support)', fontFamily: 'DM Sans, sans-serif', fontSize: 15, padding: '32px 0', lineHeight: 1.6 }}>No tool data available.</p>
          }
        </div>
      </motion.div>
    </section>
  );
}
