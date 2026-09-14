// Wave 4 open question (Q14): "What is one thing helping, or one thing getting in the way of,
// your use of AI at work?"
//
// Deterministic, credit-free classifier. Every submitted answer lands in exactly one of:
//   helping | hindering | mixed | none
// "none" is a typed non-answer (N/A, none, nothing). There is no "unclear" bucket: an answer
// with no polarity cue is decided by its shape (effort-led phrasing such as "Finding time to…"
// reads as friction; a bare noun phrase names the thing that helps).
//
// How it reads an answer
//   1. Split into segments at sentence ends and at contrast words ("but", "yet"). A leading
//      "while / although / though" clause and anything before a "but" is a concession and
//      counts half; a sentence that opens with "however / that said" halves the one before it.
//   2. Score each segment with two weighted cue lists (HELP, HINDER).
//   3. Negation flips: "nothing is in the way" / "not really a struggle" / "no barriers" turn a
//      segment helping; "not seeing how it can help" / "does not help me" turn it hindering.
//      A wish or precondition ("would love to…", "before we can…", "once they connect…") is
//      not a benefit in hand, so its help cues are dropped.
//   4. Add the segments up. Both sides clearly present with neither dominant = mixed.
//
// Regression net (labeled data = Wave 3's separate struggle / excitement questions plus
// hand-labeled Wave 4 answers): node scripts/check-classifier.mjs [--s4-url=<csv>] [--verbose]

const normalize = s => (s || '')
  .replace(/[‘’ʼ]/g, "'").replace(/[“”]/g, '"')
  .replace(/[—–]/g, ' - ').replace(/\s+/g, ' ').trim();

const NON_ANSWER = /^(n\/?a|na|none|nothing( much| really)?|not much|no|nope|no e|nan|null|tbd|idk|-+|\.+|\?+|x+)[.!]?$/i;

// Case-insensitive unless marked. [pattern, weight]
const HELP = [
  [/\b(what'?s|what is|one thing( that'?s| that is)?) helping\b/i, 4], [/^helping\b/i, 4],
  [/\b(most )?excit(ed|ing)\b/i, 3], [/\bhelpful\b/i, 3], [/\bhelp(s|ed)\b/i, 3], [/\bhelp(ing)? (me|us|my|our)\b/i, 3],
  [/\blove\b/i, 3], [/\bincredibl/i, 3], [/\btremendous/i, 3], [/\bgame[- ]chang/i, 3], [/\bamazing\b/i, 2],
  [/\bsav(e|es|ed|ing)\b[^.,;]{0,20}\btime\b/i, 3], [/\btime\b[^.,;]{0,15}\bsav(e|es|ed|ing)\b/i, 3], [/\btime[- ]sav/i, 3],
  [/\b(cut(s|ting)?|reduc\w*|less|free(s|ing|d)? up|find(ing)? more|giv(e|es|ing) (me|us) more|have more)\b[^.,;]{0,15}\btime\b/i, 2],
  [/\bfree(s|ing|d)? up\b/i, 2], [/\boffload/i, 2], [/\b(open(s|ing)?|more|increas\w*)\b[^.,;]{0,12}\bbandwidth\b/i, 2],
  [/\befficien/i, 2], [/\bfaster\b/i, 2], [/\bquick(er|ly)?\b/i, 2], [/\bspeed/i, 2], [/\bfast\b/i, 1],
  [/\bstreamlin/i, 2], [/\bsimplif/i, 2], [/\bautomat/i, 1],
  [/\bimprov/i, 2], [/\benhanc/i, 2], [/\belevat/i, 2], [/\bempower/i, 2], [/\bproductiv/i, 2], [/\bbenefi/i, 2],
  [/\bvaluable\b/i, 2], [/\buseful\b/i, 2], [/\bgreat\b/i, 1], [/\bgood\b/i, 1], [/\bbetter\b/i, 1],
  [/\beas(y|ier|e)\b/i, 2], [/\bconfiden/i, 2], [/\bclarity\b/i, 2], [/\binsight/i, 2], [/\bsynthesi/i, 2],
  [/\bpartner/i, 2], [/\bcollaborat/i, 2], [/\bopportunit/i, 2], [/\bpossibilit/i, 2], [/\bpotential\b/i, 2],
  [/\bcapabilit/i, 1], [/\babilit(y|ies)\b/i, 1], [/\ballow(s|ed|ing)? (me|us|for)\b/i, 2], [/\blets? (me|us)\b/i, 2], [/\benabl/i, 2],
  [/\bdo more with less\b/i, 3], [/\bnext level\b/i, 2], [/\binnovat/i, 2], [/\bcreativ/i, 2], [/\bideas?\b/i, 1],
  [/\bquality\b/i, 2], [/\bsharper\b/i, 2], [/\bsmoother\b/i, 2], [/\bmeaningful\b/i, 2], [/\benjoy/i, 2], [/\bunlock/i, 2], [/\bleverage\b/i, 2],
  [/\bhopeful\b/i, 2], [/\bfuture\b/i, 1], [/\bwhat(?:'s| is)? (comes )?next\b/i, 1], [/\bnew (tools?|abilit|capabilit|features?)\b/i, 1],
  [/\btransform/i, 2], [/\bgrow(th|ing)?\b/i, 2], [/\bcontinu(e|ing) to\b/i, 1], [/\bkeep (learning|using|building)\b/i, 1],
  [/\bhaving access to\b/i, 2], [/\baccess to (endorsed|the tools|tools|claude|chatgpt|copilot|gemini|notebooklm)/i, 2], [/\binstant access\b/i, 2],
  [/\bendorsed\b/i, 1], [/\boffice hours\b/i, 2], [/\blunch (and|&) learn/i, 2], [/\bmarcom genius\b/i, 2], [/\b(dan|mike)'?s?\b/i, 1], [/\bposts?\b/i, 1], [/\bslack\b/i, 1],
  [/\bbeing able to\b/i, 2], [/\bable to\b/i, 1], [/\b(couldn'?t|could not|wasn'?t able to)\b[^.,;]{0,30}\bbefore\b/i, 2],
  [/\bi can use (ai|it)\b/i, 2], [/\bimpact\b/i, 1], [/\bresults?\b/i, 1], [/\bstrategic\b/i, 1], [/\bteach/i, 1], [/\bsupport(s|ed|ing)?\b/i, 1],
];

const HINDER = [
  [/\b(in the way|in my way|getting in the way)\b/i, 4], [/\bbarrier/i, 4], [/\bblocker/i, 4], [/\bst(r)?ug+l/i, 4], [/\bchalleng/i, 4],
  [/\bissues?\b/i, 3], [/\bproblem/i, 3], [/\bfrustrat/i, 4], [/\bimpossible\b/i, 4], [/\bfighting with\b/i, 3],
  [/\bblock(s|ed|ing)?\b/i, 4], [/\bprohibit/i, 3], [/\brestrict/i, 3], [/\bnot allowed\b/i, 3], [/\bno access\b/i, 3],
  [/\b(gain(ing)?|need(s|ing)?|get(ting)?|complete|full|inconsistent|lack of|not having|without|limited|no) access\b/i, 3],
  [/\black(s|ing)?\b/i, 3], [/\black of\b/i, 3], [/^access[.!]?$/i, 2],
  [/\bunable\b/i, 3], [/\bcan'?t\b(?! (actually )?do (it )?on my own)/i, 2], [/\bcannot\b/i, 2], [/\bcouldn'?t\b/i, 1],
  [/\bnot enough\b/i, 3], [/\bno time\b/i, 3], [/\bhours in (a|the) day\b/i, 3], [/^time[.!]?$/i, 2], [/\btight\b/i, 2],
  [/\b(find(ing)?|carv(e|ing) out|mak(e|ing)|dedicat(e|ing)|spend(ing)?|hav(e|ing)|need(s|ing)?|enough|more|additional|the|sufficient) (the |more |additional |dedicated |enough |sufficient |extra )?time\b/i, 2],
  [/\btime to (learn|train|play|explore|experiment|dive|focus|create|build|dedicate|really|truly|practice|deepen|set|do)\b/i, 2],
  [/\btakes? (a lot of |so much |more |too much )?(time|longer|effort)\b/i, 2], [/\btime[- ]consuming\b/i, 2],
  [/\bworkload/i, 2], [/\bwork ?volume\b/i, 2], [/\bbusy\b/i, 1], [/\bslammed\b/i, 2], [/\bbandwidth\b/i, 2],
  [/\btime is (getting |being )?(crushed|tight|scarce|short|limited|squeezed|eaten|gone)\b/i, 3], [/\bcrush/i, 2], [/\bdemand(s|ing|ed)?\b/i, 2], [/\bescalat/i, 1],
  [/\bstretched\b/i, 2], [/\bswamped\b/i, 2], [/\bdrowning\b/i, 2], [/\boverload/i, 2], [/\bburn(ed|t)? ?out\b/i, 2], [/\bcapacity\b/i, 1], [/\bmore (work|pressure|of my time|of our time)\b/i, 2],
  [/\boverwhelm/i, 2], [/\btoo (much|many)\b/i, 2], [/\bso many\b/i, 1], [/\bkeep(ing)? up\b/i, 2], [/\bconstant(ly)?\b/i, 1],
  [/\bhard(er)?\b/i, 2], [/\bdifficult/i, 2], [/\btough\b/i, 2], [/\bslow(s|er|ly)?\b/i, 2], [/\bdelay/i, 2], [/\bstall/i, 2], [/\brework\b/i, 2],
  [/\bgap\b/i, 2], [/\bdisconnect/i, 2], [/\binconsisten/i, 2], [/\blimit(s|ed|ation|ations|ing)?\b/i, 2], [/\bmissing\b/i, 2],
  [/\bnot (yet )?(connected|integrated)\b/i, 2], [/\bintegrat\w* (with|into|to)\b/i, 2], [/\bconnect(ions?|ing)? (to|with)\b/i, 1],
  [/\bIT\b/, 2], [/\bT ?& ?D\b/, 3], [/\bnetwork\b/i, 2], [/\bcomplian/i, 2], [/\bpolic(y|ies)\b/i, 2], [/\bsecurity\b/i, 2], [/\blegal\b/i, 2], [/\bapproval/i, 2],
  [/\bcost/i, 2], [/\bbudget/i, 2], [/\bfund/i, 2], [/\bexpens/i, 2], [/\bfinancial/i, 2], [/\b(out of|from) (my )?(own )?pocket\b/i, 2], [/\bpay(ing)? for\b/i, 1],
  [/\bconcern/i, 2], [/\bworr(y|ied|ies)\b/i, 2], [/\bfear/i, 2], [/\brisk/i, 1], [/\brel(y|ying|iant|iance)\b/i, 1],
  [/\bnot (100% |always |fully |entirely )?accurate\b/i, 3], [/\baccura/i, 1], [/\bhallucinat/i, 3], [/\bwrong\b/i, 2], [/\berrors?\b/i, 1], [/\bmistakes?\b/i, 1],
  [/\bedits?\b/i, 1], [/\bback and forth\b/i, 2], [/\bcircles\b/i, 2], [/\brobotic\b/i, 2], [/\bgeneric\b/i, 2], [/\bnuance\b/i, 1],
  [/\bstill\b/i, 0.5], [/\bnot sure\b/i, 2], [/\bunsure\b/i, 2], [/\bunclear\b/i, 2], [/\bdon'?t know\b/i, 2], [/\bunknown\b/i, 1],
  [/\bwhich tool/i, 2], [/\bwhat to (use|try)\b/i, 2], [/\bdecid(e|ing) which\b/i, 2], [/\bfind(ing)? the (best|right) tool/i, 2], [/\bconfus/i, 2],
  [/\bfigur(e|ing) out\b/i, 2], [/\bneed(s|ed)? to\b/i, 1], [/\bhave to\b/i, 1], [/\btrying to\b/i, 1], [/\bhow to\b/i, 1],
  [/\bold habits?\b/i, 2], [/\bhabits?\b/i, 1], [/\bpatien(t|ce)\b/i, 1], [/\badapt/i, 1], [/\blearning curve\b/i, 3],
  [/^(still )?learning\b/i, 2], [/\b(still|time to|need to|how to|spending time to|learn(ing)? how)\b[^.,;]{0,12}\blearn/i, 2],
  [/\btraining\b/i, 1], [/\beducation\b/i, 2], [/\bfamiliar/i, 1], [/\bpractic(e|ing)\b/i, 1], [/\bexplor(e|ing)\b/i, 0.5],
  [/\bconsensus\b/i, 2], [/\balignment\b/i, 2], [/\bmixed messag/i, 3], [/\bperformative\b/i, 2], [/\bsubjective\b/i, 2], [/\bpressure\b/i, 1],
  [/\benvironment(al)?\b/i, 1], [/\bwater\b/i, 1], [/\bethic/i, 2], [/\bjob security\b/i, 3], [/\breplac(e|ing) (me|us|jobs|people)\b/i, 2],
  [/\bencouraged to use different\b/i, 1], [/\bmaking sure\b/i, 1], [/\bdon'?t have\b(?! to)/i, 2], [/\bdoesn'?t (work|have)\b/i, 2],
  [/\bcrazy\b/i, 1], [/\bnot a priority\b/i, 3], [/\binstead of\b/i, 1], [/\btoo reliant\b/i, 2], [/\bscal(e|ing)\b/i, 1], [/\bvalidat/i, 1], [/\bguardrail/i, 1],
];

// "no barriers", "nothing in the way", "not really a struggle", "wouldn't say there's anything in the way"
const NEG_HINDER = /\b(no|not|nothing|nothing'?s|never|without|zero|haven'?t (had|experienced|found|hit|seen)|wouldn'?t say|don'?t (have|see|feel|think)|isn'?t|aren'?t|not having|no longer)\b[^.,;]{0,40}?\b(barriers?|struggles?|st?ug+les?|issues?|problems?|challenges?|blockers?|in (the|my) way|friction|complaints?|concerns?|limitations?|obstacles?)\b/i;
// "not seeing how it can help", "does not help me", "not accurate" is left to HINDER
const NEG_HELP = /\b(not|n'?t|never|no|without|hardly|barely)\b[^.,;]{0,20}?\b(help(s|ing|ful|ed)?|useful|working|works?|reliable|efficien\w*|see(ing)? how|able to|benefi\w*)\b/i;
// A wish or a precondition is not a benefit in hand
const ASPIRATION = /\b(would love to|before (we|i|you) can|once (we|they|it|the \w+) (begin|start|get|have|are|is|can)|the day (we|i) get|wish (we|i|it|there))\b/i;
// "how it can help" / "ways it can help" is discovery, not a benefit in hand
const DISCOVERY = /\b(ways|how)\b[^.,;]{0,20}\bit can\b[^.,;]{0,10}\bhelp/i;
const ENTHUSIASM = /!|:\)|:-\)|🙂|😊|🚀/;
// "Helping: …" / "In the way: …" written as two labeled parts is an explicit two-sided answer
const LEAD_HELP = /^(what'?s helping|what is helping|one thing helping|helping|helpful)\b\s*[:\-]/i;
const LEAD_HINDER = /^(what'?s in the way|what is in the way|in the way|getting in the way|in my way|hindering|blocker|barrier|struggle|challenge|obstacle)\b\s*[:\-]/i;

function scoreSegment(seg) {
  let help = 0, hinder = 0;
  // "X instead of Y": Y is the wish, not the state of things
  const scored = seg.replace(/\binstead of\b[^.,;]*/i, m => m.replace(/\S/g, '_'));
  for (const [re, w] of HELP) if (re.test(scored)) help += w;
  for (const [re, w] of HINDER) if (re.test(seg)) hinder += w;
  if (DISCOVERY.test(seg)) help = Math.max(0, help - 2);
  if (ASPIRATION.test(seg)) { help = 0; hinder += 1; }
  if (NEG_HINDER.test(seg)) { hinder = 0; help += 2; }
  if (NEG_HELP.test(seg)) { help = 0; hinder += 2; }
  if (hinder === 0 && ENTHUSIASM.test(seg)) help += 1;
  return { help, hinder, leadHelp: LEAD_HELP.test(seg), leadHinder: LEAD_HINDER.test(seg) };
}

// Sentences, then contrast splits. Returns [{ text, weight }]; concessions weigh half.
// No regex lookbehind here (older Safari): sentences keep their end mark, "not yet" is not a contrast.
function splitContrast(sentence) {
  const words = sentence.split(/\s+/);
  const parts = []; let cur = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i].replace(/^[,;]+|[,;]+$/g, '').toLowerCase();
    const prev = i > 0 ? words[i - 1].replace(/[,;]+$/g, '').toLowerCase() : '';
    const contrast = (w === 'but' || w === 'yet') && i > 0 && i < words.length - 1 && !(w === 'yet' && prev === 'not');
    if (contrast) { parts.push(cur.join(' ')); cur = []; continue; }
    cur.push(words[i]);
  }
  parts.push(cur.join(' '));
  return parts.map(p => p.replace(/^[,;\s]+|[,;\s]+$/g, '')).filter(Boolean);
}
function segments(text) {
  const sentences = (text.match(/[^.!?;]+(?:[.!?;]+|$)/g) || [text]).map(s => s.trim()).filter(Boolean);
  const out = [];
  sentences.forEach((sentence, i) => {
    const followedByContrast = i + 1 < sentences.length && /^(however|that said|with that said|on the other hand|but)\b/i.test(sentences[i + 1]);
    const parts = splitContrast(sentence);
    parts.forEach((part, j) => {
      const isLast = j === parts.length - 1;
      let weight = isLast ? 1 : 0.5;
      if (isLast && followedByContrast) weight = 0.5;
      const lead = part.match(/^(while|although|though|even though)\b\s*(.*?),\s*(.+)$/i);
      if (lead) {
        out.push({ text: lead[2], weight: weight * 0.5 });
        out.push({ text: lead[3], weight });
      } else {
        out.push({ text: part, weight });
      }
    });
  });
  return out.length ? out : [{ text, weight: 1 }];
}

// No polarity cue at all: decide by shape.
function fallback(text) {
  const t = text.toLowerCase();
  if (/^(finding|figuring|learning|keeping|adapting|developing|creating|building|getting|making|using|dedicating|spending|practicing|breaking|moving|familiarizing|deciding|explaining|scaling|training|carving|trying|understanding|knowing|remembering|integrating|convincing|setting|managing|balancing|prioritizing|juggling|navigating|finalizing|transitioning|switching)\b/.test(t)) return 'hindering';
  if (/^(the |my |our )?(time|workload|bandwidth|cost|budget|access|training|integration|adoption|consistency|governance|approval|resources|capacity|permissions?)\b/.test(t)) return 'hindering';
  return 'helping';
}

// Scored segments plus the verdict; exported so a wrong bucket can be explained from the terminal:
//   node -e "import('./src/data/helpHinder.js').then(m => console.log(m.explainHelpHinder('…')))"
export function explainHelpHinder(text) {
  const s = normalize(text);
  if (!s) return { verdict: 'none', segments: [] };
  if (NON_ANSWER.test(s)) return { verdict: 'none', segments: [] };
  const segs = segments(s).map(seg => ({ ...seg, ...scoreSegment(seg.text) }));
  const help = segs.reduce((a, g) => a + g.help * g.weight, 0);
  const hinder = segs.reduce((a, g) => a + g.hinder * g.weight, 0);
  const base = { help, hinder, segments: segs };
  if (segs.some(g => g.leadHelp) && segs.some(g => g.leadHinder)) return { ...base, verdict: 'mixed', why: 'explicit two-part answer' };
  if (help === 0 && hinder === 0) return { ...base, verdict: fallback(s), why: 'no cue, decided by shape' };
  if (hinder === 0) return { ...base, verdict: 'helping' };
  if (help === 0) return { ...base, verdict: 'hindering' };
  // "Both" needs two full-weight sentences that each argue one side; inside one sentence the
  // dominant side wins (a tie reads as friction, the thing named is what the person is missing).
  const helpOnly = segs.some(g => g.weight === 1 && g.help >= 2 && g.hinder === 0);
  const hinderOnly = segs.some(g => g.weight === 1 && g.hinder >= 2 && g.help === 0);
  const lo = Math.min(help, hinder), hi = Math.max(help, hinder);
  if (helpOnly && hinderOnly && hi < 3 * lo) return { ...base, verdict: 'mixed', why: 'one-sided sentences on both sides' };
  return { ...base, verdict: help > hinder ? 'helping' : 'hindering' };
}

export function classifyHelpHinder(text) {
  return explainHelpHinder(text).verdict;
}

export function splitHelpHinder(texts) {
  const out = { helping: [], hindering: [], mixed: [], none: [] };
  for (const raw of texts || []) {
    const q = (raw || '').trim();
    if (!q) continue;
    out[classifyHelpHinder(q)].push(q); // every submitted answer is counted, N/A-style ones under "none"
  }
  const n = out.helping.length + out.hindering.length + out.mixed.length + out.none.length;
  return { ...out, n, helpingN: out.helping.length, hinderingN: out.hindering.length, mixedN: out.mixed.length, noneN: out.none.length };
}
