# AI Pulse Survey Dashboard — Claude Code Session File

> This file auto-loads at the start of every Claude Code session when opened from this folder.
> Full master plan lives at: /Users/michaelmora/Desktop/Claude/AI Pulse Survey Data/Handoff/AI Pulse Survey Dashboard Plan.md
> Keep BOTH files updated at the end of every work session.

---

## Project Summary
Dashboard showing 14 months of AI adoption data across 3 pulse surveys for the Baptist Health Marketing & Communications department. Built in React + Vite, deployed via GitHub → Replit.

- **User:** Michael Mora — not a coder; plain English only
- **GitHub:** https://github.com/Mikeymo87/ai-pulse-dashboard
- **Project folder:** `/Users/michaelmora/Desktop/Claude/ai-pulse-dashboard/`
- **Survey data:** S1 local CSV (97), S2+S3 live Google Sheets (auto-update on page load)
- **Dev server:** `npm run dev` → http://localhost:5000 (or 5001 if port taken)

## Tech Stack
React + Vite · Tailwind CSS · Recharts · Framer Motion · Papa Parse · Claude API (claude-sonnet-4-6)

## Brand Colors (enforced everywhere — do not change)
- `#7DE69B` mint — highlights, labels, positive
- `#2EA84A` bh-green — growing metrics
- `#E5554F` coral — ONLY negative/warning/dropping
- `#FFCD00` yellow — ONLY stable/flat
- `#59BEC9` turquoise — neutral data series
- `#797D80` gray-mid — supporting text
- Background: `#1a1d1e` · Surfaces: `rgba(29,77,82,0.35)` · Border: mint at 15%

---

## Component Map (current as of April 2, 2026)

| File | What it does |
|------|-------------|
| `src/App.jsx` | Root — Nav, Hero, GrowthStory, ConvictionMoment, TrendCharts, DeepDive, OpportunitySpotlight, ChatPanel, PresentationMode |
| `src/components/Nav.jsx` | Sticky nav — "Ask AI" pill opens ChatPanel, "Present" button triggers PresentationMode |
| `src/components/Hero.jsx` | Full-height hero — ThenNowDiptych quote carousel, 3 stat cards, 3-paragraph exec summary |
| `src/components/GrowthStory.jsx` | Cinematic 3-wave scroll — stat pills with delta badges, Wave 3 extra pills |
| `src/components/ConvictionMoment.jsx` | Full-width 43% panel — coral glow, count-up, rotating quotes from confirmed own-pocket respondents only |
| `src/components/TrendCharts.jsx` | 5 trend charts grid + AdoptionCurve (full-width) + StruggleMap (full-width) |
| `src/components/AdoptionCurve.jsx` | Gaussian bell curve SVG — peak shifts left S1→S2→S3 via animated path + fill areas; wave buttons + slider + auto-play |
| `src/components/StruggleMap.jsx` | 2-panel heatmap — struggles (left) + excitement (right); S3 only; hover tooltip with quotes |
| `src/components/DeepDive.jsx` | Scatter plot + role/function breakdown + tool bubble chart |
| `src/components/OpportunitySpotlight.jsx` | 5 Claude API insight cards (ENABLEMENT/ADOPTION/RISK/MOMENTUM/READINESS) |
| `src/components/ChatPanel.jsx` | Floating Claude chat — prompt chips, multi-turn, markdown render |
| `src/components/PresentationMode.jsx` | P-key fullscreen slides — 7 slides, Audience Lens pre-flight (AI Council/Exec/Dept) |
| `src/components/Archetypes.jsx` | Centerpiece tarot card experience — 5 archetype cards in arc fan spread, 3D tilt parallax, sequential reveal ritual, oracle readings inside card, full-screen portrait modal |
| `src/components/StageFlow.jsx` | Unused — replaced by AdoptionCurve; leave in place |
| `src/data/parseCSVs.js` | Papa Parse loader + normalization for all 3 surveys |
| `src/data/transforms.js` | All aggregate stats — sentiment, confidence, frequency, familiarity, importance, stage, barriers, themes, tools, benefits, momentum, own-pocket, by role, by function; `s3OwnPocketQuotes` for ConvictionMoment |
| `src/data/themes.js` | Keyword-based theme extraction — 16 use-case themes, 11 struggle themes, 8 excitement themes |
| `src/hooks/useSurveyData.js` | React hook → `{ surveys, transforms, loading, error }` |

---

## What's Been Built (complete history)

### ✅ Phases 0–8 (built March 30 – April 1, 2026)
- Phase 0: Setup — GitHub, Vite, deps, CSVs, Replit
- Phase 1: Data layer — parseCSVs, transforms, themes, useSurveyData hook
- Phase 2: Hero + GrowthStory + Nav
- Phase 3: 5 trend line charts (Sentiment, Familiarity, Frequency, Importance, Confidence) + Top Barriers horizontal bar
- Phase 4: OpportunitySpotlight — 5 Claude API cards
- Phase 5: DeepDive — scatter plot + role/function breakdown
- Phase 6: Tool Ecosystem bubble chart (inside DeepDive)
- Phase 7: ChatPanel — floating Claude chat
- Phase 8: PresentationMode — P key, 7 slides, arrow keys, ESC, Framer Motion transitions

### ✅ Idea #1 — Emotional Content Layer (built April 1, 2026)
1. **ThenNowDiptych** in Hero.jsx — S1 hoping quotes vs S3 conviction quotes, auto-cycles 6s
2. **ConvictionMoment.jsx** — 43% own-pocket panel between GrowthStory and TrendCharts
3. **Audience Lens** in PresentationMode — pre-flight screen, 3 slide sequences (AI Council / Exec / Dept)
4. **StruggleMap.jsx** — full-width heatmap below AdoptionCurve in TrendCharts; hover quotes
5. **AdoptionCurve.jsx** — real Gaussian bell curve shifting left S1→S2→S3; replaces StageFlow

### ✅ Idea #3 — Adoption Bell Curve (built April 1, 2026)
- `AdoptionCurve.jsx`: actual SVG Gaussian curve, 3 color segments, wave buttons + slider, auto-plays on scroll-in
- Wave data: S1=16/59/25%, S2=27/68/5%, S3=38/61/1% (S3 computed live from familiarityTrend)

### ✅ Polish Pass — Idea #1 refinements (April 1, 2026)
1. **AdoptionCurve peak shift** — Bell curve peak animates left S1→S2→S3 via `waveMu()` weighted centroid (Innovators→100px, Pragmatists→300px, Laggards→500px); fill areas also animate; `motion.path` morphs curve shape
2. **AdoptionCurve labels** — Gradient fills, colored category names, sublabels from beating_the_curve.md, ↑↓ % delta badges per segment
3. **ConvictionMoment quotes** — Now pulls only from `s3OwnPocketQuotes`: struggle text from `ownPocket === true` respondents AND filtered to payment keywords only; falls back to curated set if <3 matches
4. **StruggleMap S3-only** — Removed S1/S2 toggle tabs (those surveys had no dedicated struggle/excitement questions); S3 data only shown

---

## Idea #2 — In Progress (April 2, 2026)

Full detail in: `/Users/michaelmora/.claude/plans/twinkly-bouncing-pnueli.md`

| # | What | Description | Priority | Status |
|---|------|-------------|----------|--------|
| 1 | **Tab Navigation** | 4 "museum rooms": Story / Numbers / Team / What's Next — kills the infinite scroll | ⭐ First | ✅ DONE |
| 2 | **Adoption Scorecard** | 4 expandable metric tiles (Sentiment, Familiarity, Confidence, Importance) — "View full chart" expand; Frequency stays always-visible | High | ✅ DONE |
| 3 | **Archetypes** | 5 personas from S3 row-level data (16 dimensions per person) | High | ✅ DONE |
| 4 | **Open Text Intelligence** | Aspiration-action gap, tool-to-mindset links from open text | Medium | Next |
| 5 | **Participation Story** | 117-dot grid replacing scatter plot for public view | Medium | |

**Tab structure (live):**
| Tab | Contents |
|-----|---------|
| The Story | Hero + ThenNowDiptych + GrowthStory + ConvictionMoment |
| The Numbers | AdoptionScorecard (4 tiles) + Frequency chart (always-visible) + AdoptionCurve + StruggleMap |
| The Team | DeepDive (scatter + roles + tools) + Archetypes (tarot cards) |
| What's Next | OpportunitySpotlight + Claude Chat (floating) |

**Component map additions:**
| File | What it does |
|------|-------------|
| `src/components/AdoptionScorecard.jsx` | 4 metric tiles — Sentiment/Familiarity/Confidence/Importance — each with sparkline + expand-to-full-chart |
| `src/components/Archetypes.jsx` | 5 archetype cards — arc fan spread, 3D tilt (back face), flip reveal, oracle text inside card, full-screen portrait modal; rainbow accent colors I→V (violet/blue/teal/mint/gold) |

**Archetypes card details (live):**
- CARD_W=260, CARD_H=520; arc config: rotate ±10/±5/0deg, dip 40/15/0px
- Accent colors: confident-bystander=#A78BFA, thoughtful-skeptic=#60A5FA, blocked-believer=#59BEC9, experimenter=#7DE69B, multiplier=#FFCD00
- Dual color overlay on portraits: mix-blend-mode:color at 45% + screen at 12%
- Oracle text: 13px italic #e8f0f5, line-height 1.35, fades in at 0.65s delay after flip
- Affinity scoring: 16 dimensions per respondent, 5 scorer functions 0–100, highest wins; near-ties → more advanced stage
- Pills only in full-screen modal, not on card face

---

## Key Engineering Rules (don't violate)
- Coral (`#E5554F`) is ONLY for negative/dropping metrics — never use for decoration
- S1 open text = future-tense hoping; S3 = present-tense conviction (the gap is the story)
- Claude API: `anthropic-dangerous-direct-browser-access: true` header required; strip markdown fences before JSON.parse()
- S3 struggle column uses curly apostrophe `\u2019` — hardcoded in parseCSVs.js
- fetchedRef guard on all Claude API calls to prevent React StrictMode double-invoke
- Barriers: 3-pass fuzzy matching (exact → prefix → keyword/substring)
- Confidence normalized to "% scoring ≥ 3" across all surveys (scales differ per survey)
- Total MarCom team = 117; participation rates are behavioral proof, not self-reported

---

## To Continue in a New Session
Open Claude Code from this folder → CLAUDE.md auto-loads → say **"continue the build"**
