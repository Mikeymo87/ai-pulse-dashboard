// Wave 4 open question, read by Claude.
//
// The question: "What is one thing helping, or one thing getting in the way of, your use of AI
// at work?" Each answer is sent to Claude once, with the question and a rubric, and the verdict
// (helping / hindering / mixed / none) is cached by answer text, so a 5-minute poll only sends the
// answers that are new. The keyword sorter in helpHinder.js is the offline fallback only.
//
// Used by the browser (src/hooks/useSurveyData.js, key = VITE_ANTHROPIC_API_KEY) and by the
// terminal check (scripts/classify-live.mjs, same key from .env).

export const OPEN_TEXT_MODEL = 'claude-sonnet-4-6';
export const VERDICTS = ['helping', 'hindering', 'mixed', 'none'];
const BATCH = 50;
const CACHE_KEY = 'aipulse.q14.claude.v1';

export const OPEN_TEXT_QUESTION = 'What is one thing helping, or one thing getting in the way of, your use of AI at work?';

export const OPEN_TEXT_SYSTEM = `You sort survey answers for the Baptist Health Marketing and Communications department. The survey ran in September 2026. The question was:

"${OPEN_TEXT_QUESTION}"

Read each answer as a whole and decide what the person is telling us. Judge meaning, not vocabulary.

- "helping": they name something that helps their use of AI, or they say nothing is in their way.
- "hindering": they name something getting in the way: a barrier, friction, a cost, missing access, not enough time, workload pressure, a worry, a habit they cannot break, or a wish that is not yet met. An answer about time or workload being squeezed is hindering even if it mentions efficiency.
- "mixed": they clearly give one of each, something helping AND something in the way, both stated as real. A concession is not mixed: "X is great but Y blocks it" is hindering.
- "none": a non-answer such as N/A, none, nothing, or a dash.

Return only JSON, no prose: {"verdicts": [...]} with exactly one verdict per answer, in the same order as the answers.`;

export function buildUserMessage(texts) {
  return `Answers (${texts.length}), as a JSON array in order:\n${JSON.stringify(texts, null, 0)}`;
}

function parseVerdicts(raw, expected) {
  const clean = String(raw).replace(/```(?:json)?/g, '').trim();
  const start = clean.indexOf('{'), end = clean.lastIndexOf('}');
  const obj = JSON.parse(clean.slice(start, end + 1));
  const v = obj?.verdicts;
  if (!Array.isArray(v) || v.length !== expected) throw new Error(`expected ${expected} verdicts, got ${Array.isArray(v) ? v.length : typeof v}`);
  return v.map(x => {
    const s = String(x).toLowerCase().trim();
    if (s === 'in the way') return 'hindering';
    if (s === 'both') return 'mixed';
    if (s === 'no answer' || s === 'n/a') return 'none';
    if (!VERDICTS.includes(s)) throw new Error(`unknown verdict "${x}"`);
    return s;
  });
}

async function askClaude(texts, { apiKey, fetchImpl = fetch, model = OPEN_TEXT_MODEL }) {
  const res = await fetchImpl('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1200,
      temperature: 0,
      system: OPEN_TEXT_SYSTEM,
      messages: [{ role: 'user', content: buildUserMessage(texts) }],
    }),
  });
  if (!res.ok) throw new Error(`Claude API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const raw = (data.content || []).map(c => c.text || '').join('');
  return parseVerdicts(raw, texts.length);
}

// ── cache: answer text → verdict (localStorage in the browser, plain object elsewhere) ──
export function readCache() {
  try { const s = globalThis.localStorage?.getItem(CACHE_KEY); return s ? JSON.parse(s) : {}; } catch { return {}; }
}
export function writeCache(map) {
  try { globalThis.localStorage?.setItem(CACHE_KEY, JSON.stringify(map)); } catch { /* private mode or quota: verdicts just get re-read next load */ }
}
const keyOf = t => t.replace(/\s+/g, ' ').trim();

/**
 * Classify answers with Claude. Returns { verdictOf: (text) => verdict | undefined, asked: n }.
 * Only answers missing from the cache are sent. Throws if the API call fails, so the caller
 * can fall back to the keyword sorter and say so.
 */
export async function classifyWithClaude(texts, opts) {
  const cache = opts.cache ?? readCache();
  const unique = [...new Set((texts || []).map(keyOf).filter(Boolean))];
  const missing = unique.filter(t => !VERDICTS.includes(cache[t]));
  for (let i = 0; i < missing.length; i += BATCH) {
    const chunk = missing.slice(i, i + BATCH);
    const verdicts = await askClaude(chunk, opts);
    chunk.forEach((t, j) => { cache[t] = verdicts[j]; });
  }
  if (missing.length && opts.cache == null) writeCache(cache);
  return { verdictOf: t => cache[keyOf(t || '')], asked: missing.length, cache };
}
