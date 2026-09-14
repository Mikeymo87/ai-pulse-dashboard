// Have Claude read the live Wave 4 open-text answers and print its verdict next to each one,
// side by side with the keyword fallback, plus the resulting split. Spends a few cents (one
// call per 50 new answers; verdicts are cached in scripts/.q14-cache.json so reruns are free).
// Usage: node scripts/classify-live.mjs --s4-url=<csv url> [--no-cache]
// Key: VITE_ANTHROPIC_API_KEY from .env (same key the app uses).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { MAPPERS, parseCsvText } from '../src/data/parseCSVs.js';
import { classifyHelpHinder, splitHelpHinder } from '../src/data/helpHinder.js';
import { classifyWithClaude, OPEN_TEXT_MODEL } from '../src/data/classifyOpenText.js';

const s4Url = process.argv.find(a => a.startsWith('--s4-url='))?.slice(9);
if (!s4Url) { console.error('usage: node scripts/classify-live.mjs --s4-url=<csv url>'); process.exit(2); }
const useCache = !process.argv.includes('--no-cache');
const CACHE_FILE = new URL('./.q14-cache.json', import.meta.url);

const env = existsSync('.env') ? Object.fromEntries(readFileSync('.env', 'utf8').split('\n').filter(l => l.includes('=') && !l.startsWith('#')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })) : {};
const apiKey = process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || env.VITE_ANTHROPIC_API_KEY;
if (!apiKey) { console.error('no VITE_ANTHROPIC_API_KEY in .env or the environment'); process.exit(2); }

const load = async url => /^https?:/i.test(url) ? (await fetch(url)).text() : readFileSync(url, 'utf8');
const survey4 = MAPPERS[4](parseCsvText(await load(s4Url)));
const texts = survey4.map(r => r.openEnded).filter(t => t && t.trim());
console.log(`\n${survey4.length} responses, ${texts.length} open-text answers, model ${OPEN_TEXT_MODEL}`);

const cache = useCache && existsSync(CACHE_FILE) ? JSON.parse(readFileSync(CACHE_FILE, 'utf8')) : {};
const { verdictOf, asked } = await classifyWithClaude(texts, { apiKey, cache });
if (useCache) writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
console.log(`Claude read ${asked} new answer(s); ${texts.length - asked} came from the cache\n`);

const label = v => ({ helping: 'HELPING   ', hindering: 'IN THE WAY', mixed: 'BOTH      ', none: 'NO ANSWER ' })[v] ?? v;
let disagree = 0;
for (const t of texts) {
  const c = verdictOf(t), r = classifyHelpHinder(t);
  if (c !== r) disagree++;
  console.log(`  ${label(c)}  ${c === r ? '   ' : '(kw: ' + label(r).trim() + ')'}  "${t.replace(/\s+/g, ' ').slice(0, 150)}${t.length > 150 ? '…' : ''}"`);
}
const split = splitHelpHinder(texts, verdictOf, 'claude');
console.log(`\nClaude split: ${split.helpingN} helping / ${split.hinderingN} in the way / ${split.mixedN} both / ${split.noneN} no answer (of ${split.n}); keyword fallback disagrees on ${disagree}\n`);
