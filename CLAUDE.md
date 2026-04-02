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
| `src/App.jsx` | Root — Nav, Hero, GrowthStory, ConvictionMoment, TrendCharts, ParticipationStory, Archetypes, DeepDive, OpenTextIntelligence, OpportunitySpotlight, ChatPanel, PresentationMode; Leadership Vault password gate |
| `src/components/Nav.jsx` | Sticky nav — tab switcher (Story/Numbers/Team/What's Next), "Ask AI" pill, "Present" button |
| `src/components/Hero.jsx` | Full-height hero — ThenNowDiptych quote carousel, 3 stat cards, 3-paragraph exec summary |
| `src/components/GrowthStory.jsx` | Cinematic 3-wave scroll — stat pills with delta badges, Wave 3 extra pills |
| `src/components/ConvictionMoment.jsx` | Full-width own-pocket panel — coral glow, count-up, rotating quotes from confirmed respondents |
| `src/components/TrendCharts.jsx` | AdoptionScorecard (4 tiles) + Frequency chart + AdoptionCurve + StruggleMap |
| `src/components/AdoptionCurve.jsx` | Gaussian bell curve SVG — peak shifts left S1→S2→S3; wave buttons + slider + auto-play. Takes `{ familiarityTrend }` |
| `src/components/StruggleMap.jsx` | 2-panel heatmap — struggles (left) + excitement (right); S3 only; hover tooltip. Takes `{ transforms }` |
| `src/components/ParticipationStory.jsx` | 117-dot grid in Team tab — 3 survey waves, auto-plays on scroll-in, live counts from transforms.responseCounts |
| `src/components/Archetypes.jsx` | Tarot card fan spread — 5 archetypes, 3D tilt, flip reveal, oracle text, full-screen portrait modal |
| `src/components/DeepDive.jsx` | Scatter plot + role/function breakdown + tool bubble chart — GATED behind Leadership Vault |
| `src/components/OpenTextIntelligence.jsx` | 4 Claude API insight cards in What's Next — Aspiration Gap/Tool Mindset/Leadership Voices/Blocked Investors |
| `src/components/OpportunitySpotlight.jsx` | 5 Claude API insight cards (ENABLEMENT/ADOPTION/RISK/MOMENTUM/READINESS) — synthesizes ALL data layers |
| `src/components/ChatPanel.jsx` | Floating Claude chat — prompt chips, multi-turn, vault-aware (`vaultUnlocked` prop) |
| `src/components/PresentationMode.jsx` | P-key fullscreen — 3 lenses (Council/Exec/Dept), 12/8/10 slides, audience pre-flight screen |
| `src/components/StageFlow.jsx` | Unused — replaced by AdoptionCurve; leave in place |
| `src/data/parseCSVs.js` | Papa Parse loader + normalization for all 3 surveys |
| `src/data/transforms.js` | All aggregate stats + archetypes (16-dim affinity scoring) + openTextInsights cross-cuts from S3 |
| `src/data/themes.js` | Keyword-based theme extraction — 16 use-case, 11 struggle, 8 excitement themes |
| `src/hooks/useSurveyData.js` | React hook → `{ surveys, transforms, loading, error }` |

### Presentation Slides

| File | What it does |
|------|-------------|
| `src/components/slides/SlideCover.jsx` | Cinematic opening — ambient glows, giant title, stat triptych, opening quote |
| `src/components/slides/SlideOverview.jsx` | Participation story (3 response pods) + "14 months changed everything" transformation cards |
| `src/components/slides/SlideWave.jsx` | Per-wave chapter slide — 3-band layout: badge/hero number/narrative+stats; thesis copy at bottom |
| `src/components/slides/SlideBellCurve.jsx` | Adoption arc shift — embeds AdoptionCurve with narrative header |
| `src/components/slides/SlideArchetypes.jsx` | 5 persona cards with distribution bar and narrative copy |
| `src/components/slides/SlideStruggle.jsx` | Friction & excitement — embeds StruggleMap with narrative header |
| `src/components/slides/SlideTrends.jsx` | Chart pairs (sentiment+frequency / familiarity+confidence / journey+barriers) |
| `src/components/slides/SlideSpotlight.jsx` | Claude API opportunity cards in presentation context |
| `src/components/slides/SlideTeam.jsx` | Team readiness (unused in current lenses — gated) |

---

## Tab Structure (live)

| Tab | Contents |
|-----|---------|
| The Story | Hero + ThenNowDiptych + GrowthStory + ConvictionMoment |
| The Numbers | AdoptionScorecard (4 tiles) + Frequency chart + AdoptionCurve + StruggleMap |
| The Team | ParticipationStory + Archetypes + Leadership Vault (password: `TGSD26` / `VITE_VAULT_PASSWORD`) |
| What's Next | OpenTextIntelligence + OpportunitySpotlight |

**Leadership Vault:** Password `TGSD26` (override via `VITE_VAULT_PASSWORD` env var on Replit). Unlocks `DeepDive` (scatter + roles + tools). Vault data injected into ChatPanel system prompt when unlocked. Nothing from the vault appears in any presentation lens.

---

## Presentation Lens Sequences (current)

| Lens | Slides | Duration |
|------|--------|----------|
| AI Council | cover → overview → wave-0 → wave-1 → wave-2 → bell-curve → archetypes → struggle → trends-a → trends-b → trends-c → spotlight (12) | ~30 min |
| Executive | cover → overview → wave-1 → wave-2 → bell-curve → archetypes → struggle → spotlight (8) | ~12 min |
| Full Department | cover → overview → wave-0 → wave-1 → wave-2 → bell-curve → archetypes → struggle → trends-b → spotlight (10) | ~18 min |

---

## What's Been Built (complete history)

### ✅ Phases 0–8 (March 30 – April 1, 2026)
- Phase 0: Setup — GitHub, Vite, deps, CSVs, Replit
- Phase 1: Data layer — parseCSVs, transforms, themes, useSurveyData hook
- Phase 2: Hero + GrowthStory + Nav
- Phase 3: 5 trend line charts + Top Barriers horizontal bar
- Phase 4: OpportunitySpotlight — 5 Claude API cards
- Phase 5: DeepDive — scatter plot + role/function breakdown
- Phase 6: Tool Ecosystem bubble chart (inside DeepDive)
- Phase 7: ChatPanel — floating Claude chat
- Phase 8: PresentationMode — P key, slides, arrow keys, ESC, Framer Motion transitions

### ✅ Idea #1 — Emotional Content Layer (April 1, 2026)
1. ThenNowDiptych in Hero — S1 hoping vs S3 conviction quotes, auto-cycles
2. ConvictionMoment — own-pocket panel with count-up + rotating quotes
3. Audience Lens in PresentationMode — pre-flight, 3 slide sequences
4. StruggleMap — full-width heatmap in Numbers tab; hover quotes
5. AdoptionCurve — real Gaussian bell curve shifting left S1→S2→S3

### ✅ Idea #2 — Tab Navigation + Team Intelligence (April 2, 2026)
1. 4-tab navigation (Story / Numbers / Team / What's Next)
2. AdoptionScorecard — 4 expandable metric tiles
3. Archetypes — 5 tarot card personas, 16-dim behavioral scoring
4. OpenTextIntelligence — 4 Claude API cross-cut insight cards
5. ParticipationStory — 117-dot grid, live from Google Sheets
6. Leadership Vault — password-gated DeepDive; vault-aware ChatPanel
7. ChatPanel vault awareness — full archetype + role data injected when unlocked

### ✅ Presentation Mode Redesign (April 2, 2026)
1. SlideCover — cinematic opening slide
2. SlideOverview — participation story leads + transformation cards
3. SlideWave — 3-band layout: hero number + narrative + thesis copy (no "Say This")
4. SlideBellCurve — NEW: adoption arc shift embedded
5. SlideArchetypes — NEW: 5 persona summary cards with distribution bar
6. SlideStruggle — NEW: friction & excitement heatmap embedded
7. All 3 lenses include: bell curve, archetypes, struggle map
8. Narrative copy built into every slide (not presenter notes)

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
- AdoptionCurve takes `{ familiarityTrend }` directly — NOT `{ transforms }`
- Leadership Vault password: `TGSD26` (env: `VITE_VAULT_PASSWORD`) — never show in presentation lenses

---

## To Continue in a New Session
Open Claude Code from this folder → CLAUDE.md auto-loads → say **"continue the build"**
