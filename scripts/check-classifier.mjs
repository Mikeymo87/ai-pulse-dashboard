// Credit-free regression net for the Wave 4 open-text classifier (helping vs in the way).
// Labeled data: Wave 3 asked two separate questions, so every "biggest struggle" answer is
// "in the way" and every "most excited about" answer is "helping". Plus hand-labeled Wave 4 answers.
// Usage: node scripts/check-classifier.mjs [--s4-url=<csv url>] [--verbose]
// Exits non-zero if any hand-labeled case is wrong, the Wave 4 split does not add up, or
// Wave 3 accuracy drops below the floor.
import { readFileSync } from 'node:fs';
import { MAPPERS, parseCsvText } from '../src/data/parseCSVs.js';
import { classifyHelpHinder, splitHelpHinder } from '../src/data/transforms.js';

const S3 = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQUECRMQEP6QtXVcxHz7JyQ00KBIkzk6O0fkEZYcS4JiLfx4WpITntvj8yu4j1FbOulU_sbKyftd3E1/pub?gid=220500472&single=true&output=csv';
const s4Url = process.argv.find(a => a.startsWith('--s4-url='))?.slice(9);
const verbose = process.argv.includes('--verbose');
const FLOOR = 0.90;

async function load(url) {
  if (!/^https?:/i.test(url)) return readFileSync(url, 'utf8');
  const r = await fetch(url); if (!r.ok) throw new Error(`${url} → ${r.status}`); return r.text();
}
let failures = 0;
function check(cond, msg) { if (cond) console.log('  ok   ' + msg); else { failures++; console.log('  FAIL ' + msg); } }

// Hand-labeled by Mike (2026-09-14) from the live Wave 4 sheet, plus obvious shapes.
const HAND = [
  ['Time. With my workload, it is impossible to dedicate sufficient time to AI. Some people in the department have a MUCH lighter work load, so they have the time to dedicate to it. I do not. Workloads are not equal.', 'hindering'],
  ['Incredible ability to synthesize data, develop strategic insights and get all leaders to pay attention and I can encourage change.', 'helping'],
  ["AI is helpful for our team when it comes to putting together all the data points and understanding it as a whole in laymen's terms. I wouldn't say there's anything that is getting in the way for what I do with my team.", 'helping'],
  ['IT blocking Connectors', 'hindering'],
  ['Lack of connections to other work systems and data.', 'hindering'],
  ["Unable to connect the Agents to the Adobe tools due to lack of access. I need access to Claude (which I am paying out of pocket for testing, but can't scale to other teams & workflows).", 'hindering'],
  ['Helping: having access to endorsed AI tools', 'helping'],
  ['One thing that is helping is AI creating our monthly report snapshots.', 'helping'],
  ["What's helping most is being able to apply AI to real, recurring workflows and seeing how much time it saves me and my team", 'helping'],
  ["Dan's (and Mike's) Marcom Genius posts are always helpful", 'helping'],
  ['Time.', 'hindering'],
  ['Time', 'hindering'],
  ['Nothing is getting in the way.', 'helping'],
  ['No barriers, the tools are great.', 'helping'],
  ['Copilot is great but IT blocks everything else.', 'hindering'], // "X but Y": Y is the point
  ['Helping: Copilot. In the way: IT blocks every connector.', 'mixed'],
  ['N/A', 'none'],
  ['n/a', 'none'],
  ['None', 'none'],
];

console.log('\n[hand-labeled]');
for (const [text, want] of HAND) {
  const got = classifyHelpHinder(text);
  check(got === want, `${want.padEnd(9)} ← "${text.slice(0, 70)}${text.length > 70 ? '…' : ''}"${got === want ? '' : `  (got ${got})`}`);
}

const raw3 = parseCsvText(await load(S3));
const survey3 = MAPPERS[3](raw3);
const isNone = t => classifyHelpHinder(t) === 'none';
function score(texts, want, label) {
  const answered = texts.filter(t => t && t.trim() && !isNone(t));
  const misses = [];
  let hit = 0;
  for (const t of answered) { const g = classifyHelpHinder(t); if (g === want) hit++; else misses.push([g, t]); }
  const acc = answered.length ? hit / answered.length : 1;
  const mixed = misses.filter(([g]) => g === 'mixed').length;
  check(acc >= FLOOR, `${label}: ${hit}/${answered.length} = ${(acc * 100).toFixed(1)}% classified "${want}" (floor ${FLOOR * 100}%); misses: ${misses.length} (${mixed} as both)`);
  if (verbose) for (const [g, t] of misses) console.log(`       ${g.padEnd(9)} "${t.replace(/\s+/g, ' ').slice(0, 150)}"`);
  return misses;
}
console.log('\n[wave 3 labeled answers]');
score(survey3.map(r => r.struggle), 'hindering', 'S3 "biggest struggle" → in the way');
score(survey3.map(r => r.excitement), 'helping', 'S3 "most excited about" → helping');

if (s4Url) {
  const survey4 = MAPPERS[4](parseCsvText(await load(s4Url)));
  const sp = splitHelpHinder(survey4.map(r => r.openEnded));
  console.log(`\n[wave 4 live] ${sp.n} answers = ${sp.helpingN} helping + ${sp.hinderingN} in the way + ${sp.mixedN} both + ${sp.noneN} no answer`);
  check(sp.n === sp.helpingN + sp.hinderingN + sp.mixedN + sp.noneN, 'every Wave 4 answer is in exactly one bucket');
  if (verbose) for (const k of ['helping', 'hindering', 'mixed', 'none']) for (const t of sp[k]) console.log(`       ${k.padEnd(9)} "${t.replace(/\s+/g, ' ').slice(0, 150)}"`);
}

console.log(failures ? `\n${failures} CHECK(S) FAILED` : '\nALL CHECKS PASSED');
process.exit(failures ? 1 : 0);
