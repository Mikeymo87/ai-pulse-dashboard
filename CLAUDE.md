# AI Pulse Survey Dashboard — Claude Code Session File

> This file auto-loads at the start of every Claude Code session when opened from this folder.
> Full master plan lives at: /Users/michaelmora/Desktop/Claude/AI Pulse Survey Data/Handoff/AI Pulse Survey Dashboard Plan.md
> Keep BOTH files updated at the end of every phase.

---

## Project Summary
Dashboard showing 14 months of AI adoption data across 3 pulse surveys for the Baptist Health Marketing & Communications department. Built in React + Vite, deployed via GitHub → Replit.

- **User:** Michael Mora — not a coder; plain English only
- **GitHub:** https://github.com/Mikeymo87/ai-pulse-dashboard
- **Project folder:** `/Users/michaelmora/Desktop/Claude/ai-pulse-dashboard/`
- **Survey data:** S1 local CSV (97), S2+S3 live Google Sheets (auto-update on page load)
- **⚠️ Survey 3 is still in progress** — Google Sheet auto-updates; no code changes needed

## Tech Stack
React + Vite · Tailwind CSS · Recharts · Framer Motion · Papa Parse · Claude API (claude-sonnet-4-6)

---

## Current Phase Status

### ✅ Phase 0 — Setup (COMPLETE)
GitHub repo, React app, all dependencies, CSVs in `public/data/`, pushed to GitHub, imported into Replit.

### ✅ Phase 1 — Data Layer (COMPLETE)
Files: `src/data/parseCSVs.js`, `src/data/transforms.js`, `src/data/themes.js`, `src/hooks/useSurveyData.js`
- S3 struggle column uses curly apostrophe `\u2019` — must keep exact string in mapS3
- Barriers use 3-pass fuzzy matching (exact → prefix → keyword)
- Confidence scale differs: S1 max=5 "Very Confident", S2+S3 max=5 "Extremely Confident"
- `useSurveyData()` returns `{ surveys, transforms, loading, error }`

### ✅ Phase 2 — Hero + Growth Story (COMPLETE)
Files: `src/components/Hero.jsx`, `src/components/GrowthStory.jsx`, `src/components/Nav.jsx`
- Hero: ambient glow, count-up stat cards, 3-paragraph exec summary, scroll hint in content flow (not absolute)
- GrowthStory: cinematic 3-wave scroll, stat pills with delta badges
- Nav: sticky, "Ask AI" pill button right side opens ChatPanel, pulsing dot
- Color rule: coral=negative ONLY, yellow=stable, green/mint=positive, turquoise=neutral

### ✅ Phase 3 — Trend Line Charts (COMPLETE)
File: `src/components/TrendCharts.jsx`
- 7 charts: Sentiment, Familiarity, Frequency, Importance, Confidence, Journey Stage, Top 5 Barriers
- Custom two-line XAxis tick; `interval={0}` forces all 3 labels; `autoDomain()` helper for Y-axis
- All insight callouts data-driven; barrier normalization with curly apostrophe fix

### ✅ Phase 4 — Opportunity Spotlight (Claude API, COMPLETE)
File: `src/components/OpportunitySpotlight.jsx`
- 5 Claude-generated cards: ENABLEMENT, ADOPTION, RISK, MOMENTUM (2×2 grid) + READINESS (full-width)
- Each card: category badge, headline, insight body, → recommendation, supporting stat
- fetchedRef guard prevents React StrictMode double-invoke; max_tokens=1800
- Spinner + "Try again" retry button on error; strips markdown code fences before JSON.parse()

### ✅ Phase 5 — Scatter Plot + Deep Dive (COMPLETE)
File: `src/components/DeepDive.jsx`
- Confidence × Importance scatter (S3), colored by role, deterministic jitter, 4 quadrant labels
- Role & Function toggle breakdown with animated metric bars
- byRole/byFunction also passed to OpportunitySpotlight as `teamReadiness` context

### ✅ Phase 6 — Tool Ecosystem Bubble Chart (COMPLETE)
Integrated into DeepDive as third subsection "What Tools Are They Using?"
- S2/S3 toggle (Survey 3 default); bubbles sized by count, colored by vendor category
- Hover tooltip; filters count < 2; tool category detection via keyword matching

### ✅ Phase 7 — Claude Chat Panel (Claude API, COMPLETE)
File: `src/components/ChatPanel.jsx`
- open/setOpen lifted to App.jsx — Nav "Ask AI" button + floating bottom-right button both control it
- 6 pre-loaded prompt chips on first open; full multi-turn conversation history
- Markdown renderer: bold, italic, bullet lists, numbered lists, inline code, headings
- Follow-up chips after every response: "Give me a deeper analysis", "What should leadership do?", "Break down by role/function"
- System prompt built from live transforms — all key stats; strict no-invention rule
- Model: claude-sonnet-4-6, max_tokens: 1024

---

## ✅ Phase 8 — Presentation Mode + Polish (COMPLETE)

**Goal:** Press `P` anywhere to enter a fullscreen, slide-by-slide presentation mode for live AI Council/leadership presentations.

**What to build:**
- `P` key toggles presentation mode on/off
- Each "slide" = one major section (Hero, Growth Story, Trends, Deep Dive, Spotlight)
- Arrow keys (← →) or on-screen buttons to advance slides
- Slide counter (e.g. "3 / 5") bottom center
- Minimal chrome in presentation mode — hide nav, hide chat button, dark overlay frame
- Smooth slide transition (Framer Motion)
- `ESC` to exit

**Polish pass (same phase):**
- Review all sections for visual consistency
- Ensure Replit deploy is clean and stable
- Test on a large screen (presentation context)

---

## ⚠️ Post-Phase-8 — Tab Restructure (AFTER Phase 8)

Dashboard is too long as a single scroll. After Phase 8, convert to tabbed navigation:

**Proposed tab structure:**
| Tab | Contents |
|---|---|
| Overview | Hero + Growth Story (the big story) |
| Trends | TrendCharts (7 charts across 3 surveys) |
| Team | DeepDive (scatter + breakdown + tools) |
| Insights | OpportunitySpotlight (5 Claude cards) |

- Tabs in Nav bar replace current anchor links
- Each tab is a single viewport — no long scroll
- Chat panel floats on all tabs
- Presentation mode works per-tab

---

## To Continue
Say: **"Continue the build — pick up where we left off"**
