# AI Pulse Survey Dashboard — Master Plan & Handoff

> Master reference document. Lives in Desktop/Claude.
> A matching CLAUDE.md inside the project folder auto-loads this context into every new Claude Code session.
> Update BOTH files at the end of each phase.

---

## What This Project Is

A visually stunning, interactive dashboard for the Marketing & Communications department at Baptist Health showing 14 months of AI adoption data across 3 pulse surveys (290 total responses). It includes trend charts, a Claude-powered AI chat panel, and a Presentation Mode for live stakeholder presentations.

**Audiences (in order):** AI Council → Executive Leadership → Full Department

---

## Key Accounts & Locations
- **User:** Michael Mora — not a coder; all instructions must be in plain English
- **GitHub:** Mikeymo87 — authenticated via CLI, no manual GitHub.com steps needed
- **Repo:** https://github.com/Mikeymo87/ai-pulse-dashboard
- **Replit:** Imported from GitHub (user's account) — used for hosting/sharing only
- **Project folder:** `/Users/michaelmora/Desktop/Claude/ai-pulse-dashboard/`
- **Survey data folder:** `/Users/michaelmora/Desktop/Claude/AI Pulse Survey Data/`
- **Builder:** Claude Code handles all coding; Replit only for small fixes if needed

---

## Tech Stack
| Tool | Purpose |
|---|---|
| React + Vite | Frontend framework |
| Tailwind CSS | Styling |
| Recharts | Charts (trend lines, bar, donut, scatter) |
| Framer Motion | Animations and scroll effects |
| Papa Parse | Reads CSV files in the browser |
| Claude API (claude-sonnet-4-6) | Powers chat panel + insight cards |
| GitHub → Replit | Push to GitHub, Replit reflects changes |

---

## The 3 Survey CSV Files
Located at `public/data/` inside the project:

| File | Responses | Dates | Columns | Notes |
|---|---|---|---|---|
| survey1.csv | 97 | Jan 30 – Feb 10, 2025 | 9 | Anonymous |
| survey2.csv | 106 | Aug 27 – Sept 12, 2025 | 10 | Anonymous |
| survey3.csv | 89 | Mar 18 – Mar 30, 2026 | 16 | Has Role + Function |

**⚠️ Survey 3 is still ongoing. When the final CSV is ready, replace `public/data/survey3.csv` and refresh — no code changes needed.**

### Questions comparable across all 3 surveys (for trend lines):
| Metric | S1 | S2 | S3 |
|---|---|---|---|
| Sentiment (Positive / Mixed / Negative) | ✓ | ✓ | ✓ |
| Familiarity with AI tools | ✓ | ✓ | ✓ |
| Frequency of AI use | ✓ | ✓ | ✓ |
| Importance to role (1–5 scale) | ✓ | ✓ | ✓ |
| Confidence level | ✓ | ✓ | ✓ |
| Top barriers | ✓ | ✓ | ✓ |
| AI journey stage | — | ✓ | ✓ |

### Normalization rules (apply consistently across all phases):
- **Confidence:** S1 = Very Confident/Confident/Somewhat confident/Not confident at all → 5/4/3/2. S2+S3 add "Extremely Confident" → 5 (Very Confident becomes 4)
- **Frequency:** Normalize all to: Daily / Weekly / Monthly / Rarely / Never
- **Barriers:** Fuzzy-match reworded options to shared category labels
- **Multi-select fields:** Comma-separated strings → split into arrays before counting

---

## App Sections & Build Order
| # | Section | Priority | Status |
|---|---|---|---|
| 1 | Hero — tagline, animated counters | — | ✅ |
| 2 | Growth Story — cinematic 3-wave scroll | ⭐ #1 | ✅ |
| 3 | Trend Lines — 4 charts across surveys | — | 🔲 |
| 4 | Opportunity Spotlight — Claude insight cards | ⭐ #3 | 🔲 |
| 5 | Confidence vs. Importance Scatter | ⭐ #2 | 🔲 |
| 6 | Tool Ecosystem Bubble Chart | ⭐ #5 | 🔲 |
| 7 | Survey 3 Deep Dive — role/function filters | — | 🔲 |
| 8 | Claude Chat Panel — floating, persistent | ⭐ core | 🔲 |
| 9 | Presentation Mode — P key, slide-by-slide | ⭐ #4 | 🔲 |

---

## Phase Build Log

### ✅ Phase 0 — Setup (COMPLETE)
**Completed:** March 30, 2026

What was done:
- GitHub repo created: `github.com/Mikeymo87/ai-pulse-dashboard`
- React + Vite app scaffolded at `/Users/michaelmora/Desktop/Claude/ai-pulse-dashboard/`
- All dependencies installed: Recharts, Framer Motion, Papa Parse, Tailwind CSS
- All 3 CSVs copied to `public/data/`
- Full folder structure created: `src/data/`, `src/components/charts/`, `src/hooks/`, `src/lib/`
- `.env` protection in place — API key never goes to GitHub
- App builds clean with zero errors ✓
- Pushed to GitHub. Replit imported from GitHub. ✓

---

### ✅ Phase 1 — Data Layer (COMPLETE)
**Completed:** March 30, 2026

Files created:
- `src/data/parseCSVs.js` — Papa Parse loader + full normalization for all fields across S1/S2/S3
- `src/data/transforms.js` — All aggregate stats: sentiment, confidence, frequency, familiarity, importance, stage, barriers, themes, tools, benefits, momentum, own pocket, by role, by function
- `src/data/themes.js` — Keyword-based theme extraction from all open-ended text (16 use-case themes, 11 struggle themes, 8 excitement themes)
- `src/hooks/useSurveyData.js` — React hook exposing clean surveys + transforms to all components

Key engineering decisions:
- All blank/null responses filtered out per-field before computing averages or percentages — no skew
- Percentage denominators = respondents who answered that specific question (not total headcount)
- Barriers use 3-pass fuzzy matching: exact → prefix → keyword/substring → maps equivalent S1/S2/S3 options to shared labels
- S3 struggle column uses curly apostrophe `\u2019` (Google Forms export quirk) — hardcoded correctly
- Open-ended text fully preserved on every row for Claude API phases (4 + 7)
- Confidence scales differ per survey: S1 tops at 5="Very Confident", S2+S3 at 5="Extremely Confident"

Verified counts: S1=97 · S2=106 · S3=89 · Total=292

---

### ✅ Phase 2 — Hero + Growth Story (COMPLETE)
**Completed:** March 30, 2026

Files created:
- `src/components/Hero.jsx` — Full-height hero with pulsing BH-green ambient glow, staggered headline animation, 4 animated count-up stat cards (292 / 3 / 14 / 117), scroll hint
- `src/components/GrowthStory.jsx` — Cinematic 3-wave scroll section; each wave chapter animates in via `whileInView`; stat pills pull live from transforms (responses, positive sentiment %, confidence avg, daily usage %); BH brand color progression: turquoise → green → mint
- `src/index.css` updated — BH brand CSS variables added under `:root`; background changed to `#1a1d1e`

Color system applied: all indigo/violet generics replaced with BH brand palette. Coral reserved for warnings, yellow for stable, green/mint for positive, turquoise for neutral.

### 🔲 Phase 3 — Trend Line Charts (NEXT UP)
### 🔲 Phase 4 — Opportunity Spotlight Cards (Claude API)
### 🔲 Phase 5 — Scatter Plot + Deep Dive Filters
### 🔲 Phase 6 — Tool Ecosystem Bubble Chart
### 🔲 Phase 7 — Claude Chat Panel (Claude API)
### 🔲 Phase 8 — Presentation Mode + Polish + Replit Deploy

---

## How to Continue in a New Chat Session

1. Open Claude Code from the project folder:
   `/Users/michaelmora/Desktop/Claude/ai-pulse-dashboard/`
2. Claude Code auto-reads `CLAUDE.md` inside that folder — full context loads instantly
3. Say: **"Continue the build — pick up where we left off"**
4. Claude will know exactly what phase is next

**OR** paste the contents of this file into a new Claude Code session if starting fresh.

---

## Important Design Decisions (don't change without discussion)
- Font: Inter throughout (fontWeight 800–900 headlines, 500–600 labels)
- Surveys 1 & 2 are anonymous — role/function filters only apply to Survey 3 sections
- Claude chat panel is data-grounded — only answers from pre-computed stats, never invents numbers
- CSVs load in-browser via Papa Parse — no backend or server needed
- API key stored as `VITE_ANTHROPIC_API_KEY` in `.env` (never committed to GitHub)

### Baptist Health Brand Color System (enforced in all phases)
CSS variables defined in `src/index.css` under `:root`:

| Variable | Hex | When to use |
|---|---|---|
| `--bh-green` | `#2EA84A` | Positive / growing metrics |
| `--bh-mint` | `#7DE69B` | Highlights, labels, section tags |
| `--bh-coral` | `#E5554F` | ONLY for negative / dropping / warning |
| `--bh-yellow` | `#FFCD00` | ONLY for stable / flat / unchanged |
| `--bh-turquoise` | `#59BEC9` | Neutral data series |
| `--bh-dark-blue` | `#005776` | Neutral data categories (e.g. role labels) |
| `--bh-deep-green` | `#1D4D52` | Card surfaces (30–50% opacity) |
| `--bh-deep-blue` | `#1D4A5E` | Card surfaces (30–50% opacity) |
| `--bh-gray-mid` | `#797D80` | Supporting text |

**Site palette variables:** `--bg: #1a1d1e` · `--surface-green` · `--surface-blue` · `--border` (mint 15%) · `--text-primary` · `--text-support` · `--highlight`

---

## Phase 2 Features — Saved for Later (Do Not Build Yet)
1. Animated Journey Stage Flow / Sankey diagram
2. Sentiment radial gauge / speedometer
3. Heat calendar of response timing
4. Barriers decline before/after animation
5. Live response counter ticker on Hero
6. Animated word cloud for open-text responses
7. Pre-loaded Claude prompt chips in chat
8. "Insight of the Day" auto-generated exec summary
9. Voice input for Claude chat panel
