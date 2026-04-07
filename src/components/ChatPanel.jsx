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

const FOLLOW_UP_CHIPS = [
  "Give me a deeper analysis on that",
  "What should leadership do with this?",
  "Break that down by role or function",
];

// ─── Build system prompt from live transforms ────────────────────────────────
function buildSystemPrompt(transforms, vaultUnlocked = false) {
  const {
    sentimentTrend, confidenceTrend, familiarityTrend,
    importanceTrend, frequencyTrend, stageTrend,
    barriersTrend, byRole, byFunction,
    toolsS2, toolsS3, benefitsS3, momentumS3, ownPocketS3,
    archetypes, openTextInsights,
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
- Survey 3: Mar 2026 (101 responses, includes role + function data)

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

OFFICIAL ENDORSED TOOLS (available to everyone — NOT in Survey 3 data because the question excluded them):
OpenAI ChatGPT Enterprise, Microsoft Copilot, Adobe Firefly, Jasper

TOOLS USED — Survey 2 (structured list, all tools including endorsed):
${topToolsS2 || 'No data'}

TOOLS USED — Survey 3 (SUPPLEMENTAL tools only — used ON TOP OF the official stack):
IMPORTANT: The S3 question asked "Besides ChatGPT, Copilot, Firefly, Jasper — what other tools do you use?" So these are personal/supplemental tools added on top of the official endorsed tools. ChatGPT not appearing here does NOT mean the team doesn't use it — it's the primary official tool. 77% of S3 respondents use at least one supplemental tool beyond the official stack.
${topToolsS3 || 'No data'}

TEAM READINESS BY ROLE (S3 only — confidence avg / importance avg):
${vaultUnlocked ? (topRoles || 'No role data') : '[Role-level data available in Leadership Vault]'}

TEAM READINESS BY FUNCTION (S3 only):
${vaultUnlocked ? (topFunctions || 'No function data') : '[Function-level data available in Leadership Vault]'}
${vaultUnlocked && archetypes ? `
--- LEADERSHIP VAULT DATA ---

BEHAVIORAL ARCHETYPES (S3 row-level classification — 5 personas):
${['multiplier','blocked-believer','experimenter','thoughtful-skeptic','confident-bystander'].map(k => {
  const a = archetypes[k];
  return `${k}: ${a?.count ?? 0} people (${a?.pct ?? 0}%) — daily:${a?.stats?.dailyPct ?? 0}%, own-pocket:${a?.stats?.ownPocketPct ?? 0}%, positive:${a?.stats?.positivePct ?? 0}%, top barrier:${a?.stats?.topBarrier ?? 'none'}`;
}).join('\n')}

OPEN TEXT CROSS-REFERENCE FINDINGS:
Aspiration-Action Gap: ${openTextInsights?.aspirationGap?.count ?? 0} people (${openTextInsights?.aspirationGap?.pct ?? 0}%) wrote rich excitement text but use AI less than weekly
Leadership Voices in Struggle: ${openTextInsights?.leadershipVoices?.count ?? 0} people (${openTextInsights?.leadershipVoices?.pct ?? 0}%) are managing team adoption, not just personal skill gaps
Blocked Investors: ${openTextInsights?.blockedInvestors?.count ?? 0} people (${openTextInsights?.blockedInvestors?.pct ?? 0}%) pay out of pocket while facing org-level access barriers
Tool Mindset: Claude users (${openTextInsights?.toolMindset?.claude?.count ?? 0}) describe AI as thought partner; ChatGPT users (${openTextInsights?.toolMindset?.chatgpt?.count ?? 0}) describe speed/efficiency

FULL ROLE BREAKDOWN:
${topRoles || 'No role data'}

FULL FUNCTION BREAKDOWN:
${topFunctions || 'No function data'}
--- END VAULT DATA ---` : ''}
--- END DATA ---

BRIEF MODE — When the user asks for a brief, report, summary doc, or anything to download/export, respond ONLY with a JSON object wrapped in <BRIEF> tags. No other text outside the tags. Use exactly this structure:

<BRIEF>
{"title":"[Short title]","subtitle":"[Descriptor]","date":"March 2026","org":"Baptist Health Marketing & Communications","type":"Leadership Brief","sections":[{"heading":"SECTION HEADING","eyebrow":"CATEGORY LABEL","narrative":"Optional 1-2 sentence framing paragraph.","table":{"headers":["Column 1","Column 2"],"rows":[["Row value","Row value"]]},"bullets":["Key insight or stat sentence.","Another insight."]}],"bottomLine":"One or two executive sentences summarizing the so-what.","footnote":"Based on 101 responses | Survey 3, March 2026 | Baptist Health M&C AI Pulse Series"}
</BRIEF>

BRIEF RULES:
- Only include numbers from the data above — never fabricate
- 2–4 sections max; each section may have a table, bullets, or both
- narrative is optional but useful for framing; keep to 1–2 sentences
- eyebrow is a short ALL-CAPS category label (e.g. "BARRIERS", "MOMENTUM", "TOOLS")
- bottomLine is the executive takeaway — plain language, no jargon
- If a section has no table, omit the table key entirely
- If a section has no bullets, omit the bullets key entirely`;
}

// ─── Brief helpers ────────────────────────────────────────────────────────────
function parseBrief(content) {
  const match = content.match(/<BRIEF>([\s\S]*?)<\/BRIEF>/);
  if (!match) return null;
  try { return JSON.parse(match[1].trim()); } catch { return null; }
}

function generateBriefHTML(brief) {
  const sections = (brief.sections ?? []).map(s => {
    const tableHTML = s.table ? `
      <table>
        <thead><tr>${s.table.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${s.table.rows.map((row, i) => `
          <tr class="${i % 2 === 0 ? 'even' : 'odd'}">${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>` : '';
    const bulletsHTML = (s.bullets ?? []).length ? `
      <ul>${s.bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : '';
    const narrativeHTML = s.narrative ? `<p class="narrative">${s.narrative}</p>` : '';
    return `
      <div class="section">
        ${s.eyebrow ? `<div class="eyebrow">${s.eyebrow}</div>` : ''}
        <h2>${s.heading}</h2>
        ${narrativeHTML}
        ${tableHTML}
        ${bulletsHTML}
      </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${brief.title} — ${brief.subtitle}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', Arial, sans-serif; background: #f5f6f7; color: #1a1d1e; }
  .page { max-width: 820px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 24px rgba(0,0,0,0.10); }
  .header { background: #1a1d1e; padding: 36px 48px 32px; }
  .header-top { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
  .bh-mark { background: #2EA84A; color: #fff; font-weight: 800; font-size: 13px; letter-spacing: 0.06em; padding: 5px 10px; border-radius: 6px; }
  .org-name { color: #7DE69B; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
  .brief-type { color: rgba(255,255,255,0.35); font-size: 11px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; margin-left: auto; }
  .header h1 { color: #fff; font-size: 28px; font-weight: 800; line-height: 1.2; margin-bottom: 6px; }
  .header .subtitle { color: #7DE69B; font-size: 15px; font-weight: 500; margin-bottom: 4px; }
  .header .meta { color: rgba(255,255,255,0.45); font-size: 12px; }
  .divider { height: 3px; background: linear-gradient(90deg, #2EA84A 0%, #7DE69B 50%, transparent 100%); }
  .body { padding: 40px 48px 48px; }
  .section { margin-bottom: 40px; padding-bottom: 36px; border-bottom: 1px solid #e8eaec; }
  .section:last-of-type { border-bottom: none; }
  .eyebrow { font-size: 10px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: #2EA84A; margin-bottom: 6px; }
  .section h2 { font-size: 18px; font-weight: 800; color: #1a1d1e; margin-bottom: 14px; line-height: 1.3; }
  .narrative { font-size: 14px; color: #444; line-height: 1.7; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }
  thead tr { background: #1a1d1e; }
  thead th { color: #7DE69B; font-weight: 700; font-size: 11px; letter-spacing: 0.07em; text-transform: uppercase; padding: 10px 14px; text-align: left; }
  tbody tr.even { background: #f9fafb; }
  tbody tr.odd { background: #fff; }
  tbody td { padding: 10px 14px; color: #25282A; border-bottom: 1px solid #eef0f2; }
  tbody td:last-child { font-weight: 700; color: #2EA84A; }
  ul { list-style: none; display: flex; flex-direction: column; gap: 8px; margin-bottom: 0; }
  ul li { font-size: 13px; color: #444; line-height: 1.6; padding-left: 18px; position: relative; }
  ul li::before { content: "›"; position: absolute; left: 0; color: #2EA84A; font-weight: 700; font-size: 15px; line-height: 1.4; }
  .bottom-line { background: #f0faf3; border: 1.5px solid #2EA84A; border-radius: 10px; padding: 20px 24px; margin-top: 8px; margin-bottom: 32px; }
  .bottom-line .bl-label { font-size: 10px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: #2EA84A; margin-bottom: 6px; }
  .bottom-line p { font-size: 14px; font-weight: 600; color: #1a1d1e; line-height: 1.65; }
  footer { text-align: center; font-size: 11px; color: #aab0b7; padding: 0 48px 32px; }
  @media print {
    body { background: #fff; }
    .page { box-shadow: none; border-radius: 0; margin: 0; max-width: 100%; }
  }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-top">
      <span class="bh-mark">BH</span>
      <span class="org-name">${brief.org ?? 'Baptist Health M&C'}</span>
      <span class="brief-type">${brief.type ?? 'Leadership Brief'}</span>
    </div>
    <h1>${brief.title}</h1>
    <p class="subtitle">${brief.subtitle ?? ''}</p>
    <p class="meta">${brief.date ?? ''}</p>
  </div>
  <div class="divider"></div>
  <div class="body">
    ${sections}
    <div class="bottom-line">
      <div class="bl-label">Bottom Line</div>
      <p>${brief.bottomLine ?? ''}</p>
    </div>
  </div>
  <footer>${brief.footnote ?? ''}</footer>
</div>
</body>
</html>`;
}

function downloadBrief(brief) {
  const html = generateBriefHTML(brief);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const slug = (brief.title ?? 'brief').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  a.href = url;
  a.download = `BH-AI-Pulse-${slug}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Brief card (rendered in chat when Claude returns a <BRIEF>) ──────────────
function BriefCard({ brief }) {
  return (
    <div style={{
      background: 'var(--card-bg)',
      border: '1px solid rgba(46,168,74,0.3)',
      borderRadius: 14,
      overflow: 'hidden',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      {/* Mini header */}
      <div style={{ background: '#1a1d1e', padding: '14px 18px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ background: '#2EA84A', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 4, letterSpacing: '0.06em' }}>BH</span>
          <span style={{ color: '#7DE69B', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Baptist Health M&C</span>
        </div>
        <p style={{ margin: '0 0 2px', fontSize: 15, fontWeight: 800, color: '#fff', lineHeight: 1.25 }}>{brief.title}</p>
        {brief.subtitle && <p style={{ margin: 0, fontSize: 12, color: '#7DE69B' }}>{brief.subtitle}</p>}
      </div>

      {/* Sections preview */}
      <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {(brief.sections ?? []).map((s, i) => (
          <div key={i} style={{ borderLeft: '2px solid rgba(46,168,74,0.4)', paddingLeft: 12 }}>
            {s.eyebrow && <p style={{ margin: '0 0 2px', fontSize: 9, fontWeight: 800, color: '#2EA84A', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{s.eyebrow}</p>}
            <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{s.heading}</p>
            {s.table && (
              <div style={{ marginBottom: 6 }}>
                {s.table.rows.slice(0, 3).map((row, j) => (
                  <div key={j} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', padding: '3px 0', borderBottom: j < 2 ? '1px solid var(--border)' : 'none' }}>
                    <span>{row[0]}</span>
                    <span style={{ fontWeight: 700, color: '#2EA84A' }}>{row[1]}</span>
                  </div>
                ))}
                {s.table.rows.length > 3 && <p style={{ margin: '4px 0 0', fontSize: 10, color: 'var(--text-support)' }}>+{s.table.rows.length - 3} more rows in download</p>}
              </div>
            )}
            {(s.bullets ?? []).slice(0, 2).map((b, j) => (
              <p key={j} style={{ margin: '3px 0', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>› {b}</p>
            ))}
          </div>
        ))}
        {brief.bottomLine && (
          <div style={{ background: 'rgba(46,168,74,0.08)', border: '1px solid rgba(46,168,74,0.2)', borderRadius: 8, padding: '10px 12px' }}>
            <p style={{ margin: '0 0 3px', fontSize: 9, fontWeight: 800, color: '#2EA84A', letterSpacing: '0.10em', textTransform: 'uppercase' }}>Bottom Line</p>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.55 }}>{brief.bottomLine}</p>
          </div>
        )}
      </div>

      {/* Download button */}
      <div style={{ padding: '0 18px 16px', display: 'flex', gap: 8 }}>
        <button
          onClick={() => downloadBrief(brief)}
          style={{
            flex: 1,
            background: 'rgba(46,168,74,0.9)',
            border: 'none',
            borderRadius: 9,
            padding: '9px 14px',
            cursor: 'pointer',
            color: '#fff',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
          }}
        >
          ↓ Download Brief
        </button>
        <button
          onClick={() => { const w = window.open('', '_blank'); w.document.write(generateBriefHTML(brief)); w.document.close(); }}
          style={{
            background: 'rgba(125,230,155,0.1)',
            border: '1px solid rgba(125,230,155,0.25)',
            borderRadius: 9,
            padding: '9px 14px',
            cursor: 'pointer',
            color: 'var(--accent-mint)',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Preview
        </button>
      </div>
    </div>
  );
}

// ─── Markdown renderer ────────────────────────────────────────────────────────
function inlineFormat(text, key) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/);
  return (
    <span key={key}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**'))
          return <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
        if (part.startsWith('*') && part.endsWith('*'))
          return <em key={i} style={{ color: '#c8e0d0' }}>{part.slice(1, -1)}</em>;
        if (part.startsWith('`') && part.endsWith('`'))
          return <code key={i} style={{ background: 'rgba(125,230,155,0.1)', borderRadius: 4, padding: '1px 5px', fontSize: 11, color: 'var(--accent-mint)', fontFamily: 'monospace' }}>{part.slice(1, -1)}</code>;
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
        <p key={i} style={{ margin: '10px 0 4px', fontWeight: 800, fontSize: 13, color: 'var(--text-primary)', letterSpacing: '0.01em' }}>
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
            <li key={j} style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55, listStyleType: 'none', display: 'flex', gap: 8 }}>
              <span style={{ color: 'var(--accent-mint)', flexShrink: 0, marginTop: 1 }}>›</span>
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
            <li key={j} style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55, display: 'flex', gap: 8 }}>
              <span style={{ color: 'var(--accent-mint)', fontWeight: 700, flexShrink: 0, minWidth: 16 }}>{j + 1}.</span>
              <span>{inlineFormat(item, j)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} style={{ margin: '0 0 6px', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
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
          style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-mint)' }}
        />
      ))}
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function Message({ msg }) {
  const isUser = msg.role === 'user';

  // Brief detection — if assistant message contains <BRIEF> JSON, render BriefCard
  if (!isUser) {
    const brief = parseBrief(msg.content);
    if (brief) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          style={{ marginBottom: 10 }}
        >
          <BriefCard brief={brief} />
        </motion.div>
      );
    }
  }

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
        background: isUser ? 'rgba(125,230,155,0.18)' : 'var(--card-bg)',
        border: isUser ? '1px solid rgba(125,230,155,0.3)' : '1px solid var(--border)',
        fontFamily: 'DM Sans, sans-serif',
      }}>
        {isUser
          ? <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: 'var(--text-primary)' }}>{msg.content}</p>
          : renderMarkdown(msg.content)
        }
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ChatPanel({ transforms, open, setOpen, vaultUnlocked = false }) {
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
          max_tokens: 2048,
          system: buildSystemPrompt(transforms, vaultUnlocked),
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
              background: 'var(--tooltip-bg)',
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
                background: 'var(--accent-mint)',
                boxShadow: '0 0 8px rgba(125,230,155,0.7)',
              }} />
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
                  Ask the Data
                </p>
                <p style={{ margin: 0, fontSize: 10, color: 'var(--text-support)', fontFamily: 'DM Sans, sans-serif' }}>
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
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 12,
                    color: 'var(--text-support)',
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
                          fontFamily: 'DM Sans, sans-serif',
                          fontSize: 12,
                          color: 'var(--text-bridge)',
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

              {messages.map((msg, i) => (
                <div key={i}>
                  <Message msg={msg} />
                  {/* Follow-up chips after last assistant message when not thinking */}
                  {msg.role === 'assistant' && i === messages.length - 1 && !thinking && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10, paddingLeft: 4 }}
                    >
                      <span style={{ fontSize: 10, color: 'var(--text-support)', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.06em' }}>
                        Want to go deeper?
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {FOLLOW_UP_CHIPS.map(chip => (
                          <button
                            key={chip}
                            onClick={() => sendMessage(chip)}
                            style={{
                              background: 'rgba(125,230,155,0.06)',
                              border: '1px solid rgba(125,230,155,0.18)',
                              borderRadius: 20,
                              padding: '4px 11px',
                              cursor: 'pointer',
                              fontFamily: 'DM Sans, sans-serif',
                              fontSize: 11,
                              color: 'var(--accent-mint)',
                              whiteSpace: 'nowrap',
                              transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(125,230,155,0.14)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(125,230,155,0.06)'}
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
              {thinking && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  marginBottom: 10,
                }}>
                  <div style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border)',
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
                  background: 'var(--card-bg-dark)',
                  border: '1px solid rgba(125,230,155,0.2)',
                  borderRadius: 10,
                  padding: '8px 12px',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: 13,
                  color: 'var(--text-medium)',
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
