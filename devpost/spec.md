---
doc: spec
status: approved
---

# Buno — Technical Spec

## How This Works, In Plain Language

Buno is a single-page web app that runs entirely in your browser. There's no server, no database, no login. Everything happens on your device.

**The pieces:**

- **React** is the framework that builds the interface — the screens, buttons, and text you see. Think of it as the artist that draws the picture and redraws it whenever something changes.
- **TypeScript** is a stricter version of JavaScript that catches mistakes before you run the code. It's like a spell-checker for your programming.
- **Vite** is the development tool that starts the app on your computer and refreshes the browser instantly when you save a file. It also packages everything for the final build.
- **GSAP** is the animation library that makes the health bar draw itself, the bunny entrance, the cash-entry bounce, and the DANGER shake. It's free.
- **SVG** is the format used for the sketch-style health bar. It's vector graphics — lines and shapes defined by math, not pixels — so it stays crisp at any size. The "hand-drawn" look comes from an SVG filter called `feTurbulence`, which wobbles the lines just enough to feel like pencil on paper.
- **localStorage** is the browser's built-in sticky note for one website. Buno saves your budget and manual cash entries there. They survive page refreshes and browser restarts, but they live only on your device.
- **Pseudo-bank sandbox** is a hardcoded list of fake transactions bundled with the app. It simulates what a real bank feed would look like, without any real bank connection.

**Why this shape rather than something more elaborate:** The PRD proves one idea — qualitative zones beat exact numbers. Every piece above serves that idea directly. A backend, database, or auth system would add accounts, keys, failure modes, and deployment complexity without making the zone concept any clearer. The browser does everything we need.

## The Core Journey Through the System

PRD ref: `prd.md > The Core Journey`

**First visit:**
1. User opens `http://localhost:5173` (or the deployed URL)
2. React checks `localStorage` for `buno_budget`
3. Nothing found → Intro component mounts → GSAP animates bunny logo reveal + "Hello, this is Buno"
4. Premise screen explains the concept → "Set your monthly budget" CTA
5. Budget Setup component: user types amount → React validates (numeric, >0) → saves to `localStorage.buno_budget` → navigates to Zone tab

**Returning visit:**
1. React finds `buno_budget` in localStorage → skips intro → mounts Zone tab directly
2. Pseudo-bank sandbox data (hardcoded JSON) loads into component state
3. Manual cash entries load from `localStorage.buno_cash_entries`
4. Zone Engine computes: `remaining = budget - sum(bank + cash transactions)` → `pct = remaining / budget × 100`
5. Zone determined: Safe (>60%), Cautious (20–60%), Danger (<20%), Depleted (≤0%)
6. SVG health bar renders with zone-appropriate line density → GSAP animates the stroke fill
7. Human note displays (random pick from 3 variants per zone)

**Core loop — log a cash expense:**
1. User switches to Activity tab
2. Fills cash entry form: amount, description, date
3. React validates: numeric, >0, description non-empty
4. On submit: entry added to `localStorage.buno_cash_entries` → React state updates
5. Feed re-renders: new row appears at top with GSAP bounce-in animation
6. Zone Engine recalculates → health bar animates to new zone state
7. If zone shifts to Danger → human note updates. If budget hits ≤0% → DANGER modal triggers

**Danger exceeded:**
1. Zone Engine detects pct ≤ 0%
2. React state sets `showDangerModal = true`
3. DANGER modal mounts → GSAP shake animation + "Budget is empty now"
4. User dismisses modal → app remains usable, health bar shows depleted state

## Stack

| Tool | Version | Why | Doc |
|------|---------|-----|-----|
| Vite | ^5.x | Fast dev server, instant HMR, simple build. No server config needed. | https://vitejs.dev |
| React | ^18.x | UI framework the learner has used before (previous Buno). | https://react.dev |
| TypeScript | ^5.x | Catches errors at save-time, not run-time. Better AI-agent debugging. | https://www.typescriptlang.org |
| GSAP (core) | ^3.12 | Free animation library. Handles all motion: entrance, health bar, bounce, DANGER shake. | https://gsap.com/docs/v3/ |
| React Router | ^6.x | Simple tab navigation (Zone ↔ Activity). Could use state instead, but router is standard and keeps URLs shareable. | https://reactrouter.com |

**Learner-selected choices:**
- Vite + React + TS — accepted recommendation. Familiar React knowledge, no backend overhead. Tradeoff: no server-side rendering (not needed).
- SVG + GSAP stroke animation (not DrawSVG) — DrawSVG is paid; free `stroke-dasharray`/`stroke-dashoffset` achieves the same effect. Tradeoff: slightly more manual setup, zero cost.
- All free utilities throughout — learner preference. No paid plugins, no Club GreenSock.

**Unverified:** GSAP version compatibility with React 18 concurrent features — flag to check early in build. Fallback: GSAP works fine with React 18; the concern is only around `useEffect` timing.

## Where It Runs and How Someone Tries It

**Runtime:** Browser only. No server process, no API keys, no environment variables.

**Development:**
```bash
npm install
npm run dev
# Opens http://localhost:5173
```

**Production build:**
```bash
npm run build
# Outputs to dist/ — static files, can be opened directly or served
```

**Demo recording:** Open `http://localhost:5173` in browser, record screen. The app works fully offline after initial load.

**Submission:** Public GitHub repository + short demo video. Deployment is optional — a local recording is sufficient. If deployed later, Vercel or Netlify (free tier, one-click from GitHub) would work.

## Look and Feel

Carried forward from `prd.md > Look and Feel` and `scope.md > Inspiration & Identity`.

**Palette (exact hex values from design reference):**
```css
--vanilla:   #D7BDA6;  /* Background canvas, card highlights */
--almond:    #B7957F;  /* Borders, dividers, tertiary */
--mocca:     #84593D;  /* Inactive tabs, subheadings, secondary icons */
--caramel:   #AB7743;  /* Buttons, active indicators, interactive cues */
--coffee:    #6D3914;  /* Secondary headings, card outlines, badge borders */
--espresso:  #4C2B08;  /* Primary headings, body text, heavy sketch strokes */
```

**Typography:**
- Display/Brand: Elegant serif with personality (Adios-style). Recommendation: **Playfair Display** (Google Font, free).
- Labels/Navigation/Metadata: Clean tracked uppercase sans-serif (Forum-style). Recommendation: **Inter** or **DM Sans** (Google Font, free).
- All fonts loaded via Google Fonts CDN — free.

**Health bar aesthetic:**
- SVG rectangle outline (sketch stroke) + diagonal hatch fill lines
- `feTurbulence` SVG filter for hand-drawn wobble on all strokes
- Line density varies by zone: Safe (dense, rhythmic) → Cautious (sparser) → Danger (fragmented, erratic)
- GSAP animates `stroke-dashoffset` for draw-in effect on zone transitions

**Icons:** Single-stroke line icons, coffee palette. Categories: Food, Transport, Shopping, Bills, Entertainment, Other. Implementation: inline SVG components (no icon library dependency).

**Bunny logo:** Inline SVG, sketch-line style, used in entrance animation and header.

**GSAP animations:**
- Entrance: bunny logo draw-in → fade to app
- Health bar: stroke draw on load, density morph on zone change
- Cash entry: bounce-in on new feed row
- DANGER: full-screen modal with shake animation

**Tone:** Calm, human, intentional, analog craft. Not gamified, not corporate fintech.

## Components

### App (Root)
Manages top-level state: budget, transactions, current zone, active tab, danger modal visibility. Checks localStorage on mount, routes to Intro or Zone tab accordingly.
PRD ref: `prd.md > States and Boundaries` (First use / Returning user)

### Intro / Premise
Full-screen entrance. GSAP animates bunny logo SVG draw-in, then "Hello, this is Buno" text fade. Premise copy explains qualitative zones concept. "Set your monthly budget" CTA button.
PRD ref: `prd.md > The Core Journey` (Step 1)

### Budget Setup
Single numeric input: "Monthly budget (₹)". Validates: numeric, >0. On submit: saves to `localStorage.buno_budget`, navigates to Zone tab.
PRD ref: `prd.md > The Core Journey` (Step 2)

### Zone Tab (default)
Main view. Contains:
- **Sketch Health Bar** (largest element): SVG with feTurbulence filter, diagonal hatch fill, GSAP stroke animation. Line density reflects zone.
- **Zone Label**: "Safe" / "Cautious" / "Danger" / "Depleted" — typography-only distinction (no color coding).
- **Human Note**: Rotating text (3 variants per zone). Random pick on mount and on zone change.
- **Monthly Budget Display**: Static reference text (e.g., "Monthly budget: ₹25,000").
- **Tab Navigation**: Switches to Activity tab.
PRD ref: `prd.md > The Core Journey` (Step 3), `prd.md > Zone Engine & Health Bar`

### Activity Tab
Transaction log + manual entry. Contains:
- **Transaction Feed**: List rows, newest first. Each row: description, category icon (inline SVG), date/time, source badge (Bank/Cash). Empty state human note.
- **Manual Cash Entry Form**: Fields — amount (number, required, min 1), description (text, required), date/time (datetime-local, default now). Inline validation errors. Submit → GSAP bounce-in on new row, triggers zone recalc.
- **Refresh Button**: Regenerates pseudo-bank sandbox data (shuffles from larger pool), re-renders feed, recalculates zone.
PRD ref: `prd.md > Activity Tab`, `prd.md > Transaction Feed`, `prd.md > Manual Cash Entry`

### DANGER Modal
Full-screen overlay when budget ≤0%. Large "DANGER" text with GSAP shake animation, "Budget is empty now" message, dismiss button. App remains usable after dismissal.
PRD ref: `prd.md > The Core Journey` (Step 6), `prd.md > States and Boundaries` (Budget depleted)

### Sketch Health Bar (SVG)
The centerpiece visual. SVG structure:
- Outer rectangle: sketch-style border (feTurbulence filter applied)
- Fill: diagonal hatch lines (SVG `<line>` elements in a `<pattern>`)
- Hatch density controlled by zone: number of lines and spacing vary
- GSAP animates `stroke-dasharray`/`stroke-dashoffset` for draw-in effect
- `feTurbulence` + `feDisplacementMap` filter for hand-drawn wobble

### Category Icon Set
Six inline SVG icons: Food (burger outline), Transport (car outline), Shopping (bag outline), Bills (lightning/document), Entertainment (play triangle), Other (box). Single-stroke, coffee palette, no fill.
PRD ref: `prd.md > Look and Feel` (Icons)

### Zone Engine (Utility)
Pure calculation function. Input: budget, transactions array. Output: `{ remaining, pct, zone, note }`. No side effects — easy to test and understand.
PRD ref: `prd.md > Zone Engine & Health Bar`

```typescript
function calculateZone(
  budget: number,
  transactions: Transaction[]
): { remaining: number; pct: number; zone: 'safe' | 'cautious' | 'danger' | 'depleted'; note: string }
```

### Pseudo-Bank Sandbox (Data)
Hardcoded JSON array of ~15-20 fake transactions. Each: `{ id, description, category, amount, date, source: 'bank' }`. Categories map to icon set. Dates spread across the current month. Refresh button shuffles/picks from a larger pool (~30 total) to simulate new transactions.
PRD ref: `prd.md > Pseudo Bank Sandbox`

## Data Model

### Budget
- **Where:** `localStorage.buno_budget`
- **Shape:** `number` (e.g., `25000`)
- **Updated:** Once, on first visit via Budget Setup
- **On return:** Read from localStorage, passed to Zone Engine

### Manual Cash Entries
- **Where:** `localStorage.buno_cash_entries`
- **Shape:** `Array<{ id: string, description: string, amount: number, date: string, source: 'cash' }>`
- **Updated:** On each cash entry submit (prepend to array, save)
- **On return:** Read from localStorage, merged with bank transactions for zone calculation

### Pseudo-Bank Transactions
- **Where:** In-memory (JavaScript module), NOT persisted
- **Shape:** `Array<{ id: string, description: string, category: Category, amount: number, date: string, source: 'bank' }>`
- **Updated:** Loaded on app mount. Refresh button regenerates (shuffles from larger pool)
- **On return:** Regenerated fresh each load — no persistence

### Current Zone (Derived)
- **Where:** React state (computed, not stored)
- **Shape:** `{ remaining: number, pct: number, zone: string, note: string }`
- **Updated:** Whenever budget or transactions change → Zone Engine recalculates

## File Structure

```
buno/
├── src/
│   ├── components/
│   │   ├── App.tsx              # Root: state, routing, localStorage checks
│   │   ├── Intro.tsx            # Entrance animation + premise
│   │   ├── BudgetSetup.tsx      # First-visit budget input
│   │   ├── ZoneTab.tsx          # Health bar, zone label, human note
│   │   ├── ActivityTab.tsx      # Feed, cash entry form, refresh
│   │   ├── DangerModal.tsx      # Full-screen DANGER overlay
│   │   ├── HealthBar.tsx        # SVG sketch bar (the centerpiece)
│   │   ├── TransactionRow.tsx   # Single feed row (icon, desc, date, badge)
│   │   ├── CashEntryForm.tsx    # Manual entry form with validation
│   │   └── icons/
│   │       ├── BunnyLogo.tsx    # SVG bunny
│   │       ├── FoodIcon.tsx
│   │       ├── TransportIcon.tsx
│   │       ├── ShoppingIcon.tsx
│   │       ├── BillsIcon.tsx
│   │       ├── EntertainmentIcon.tsx
│   │       └── OtherIcon.tsx
│   ├── lib/
│   │   ├── zoneEngine.ts        # Pure calculation: budget + txns → zone
│   │   ├── storage.ts           # localStorage read/write helpers
│   │   ├── notes.ts             # Human note arrays per zone
│   │   └── sandboxData.ts       # Pseudo-bank transaction pool (~30)
│   ├── types.ts                 # Transaction, Zone, etc.
│   ├── App.css                  # Global styles, CSS variables (palette)
│   └── main.tsx                 # Entry point
├── devpost/                     # Devpost learning workspace
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## External Services and Dependencies

**No external services.** No APIs, no databases, no auth providers, no hosting required.

**npm dependencies (all free):**
| Package | Purpose | Doc |
|---------|---------|-----|
| `react`, `react-dom` | UI framework | https://react.dev |
| `gsap` | Animations (core only — no paid plugins) | https://gsap.com/docs/v3/ |
| `react-router-dom` | Tab navigation | https://reactrouter.com |
| `typescript` | Type safety | https://typescriptlang.org |
| `vite`, `@vitejs/plugin-react` | Build tool | https://vitejs.dev |

**Google Fonts (CDN, free):** Playfair Display, Inter (or DM Sans).

## Important Failure Modes

- **localStorage unavailable** (private browsing, disabled) → App falls back to in-memory state for the session. Budget won't persist, but app works. Log a console warning.
- **Invalid cash entry input** → Inline validation blocks submit. User sees "Enter a valid amount" / "Description required" beneath the field. Form stays open.
- **Empty transaction feed** (no bank data, no cash entries) → Human note: "There are no transactions here. Feel free to spend a little on yourself." Not an error — a valid state.
- **Budget exceeds all transactions (pct > 100%)** → Zone stays "Safe", health bar shows full. Not a failure — just more budget than spent.

## What Was Simplified and Why

- **localStorage instead of database** — single-user POC. A database adds server setup, accounts, and failure modes. localStorage survives refreshes on one device, which is enough for a demo. Full version would need cloud storage for multi-device sync.
- **Hardcoded sandbox instead of real bank API** — real bank integration requires backend credentials, OAuth flows, compliance (India's Account Aggregator framework), and API keys. The sandbox proves the zone concept without any of that.
- **No auth (Google or otherwise)** — auth adds login screens, session management, token refresh. For a single-user POC, it's pure overhead. The PRD explicitly cuts this.
- **Free GSAP core instead of DrawSVG plugin** — DrawSVG is a paid Club GreenSock feature. The free `stroke-dasharray`/`stroke-dashoffset` technique achieves the identical draw effect. Zero cost, same result.
- **Inline SVG icons instead of icon library** — avoids a dependency, keeps icons in the exact coffee palette, matches the hand-drawn aesthetic. Six icons is small enough to hand-code.

## Decisions and Open Issues

**Decisions made:**

| Decision | Choice | Why | Tradeoff |
|----------|--------|-----|----------|
| Stack | Vite + React + TypeScript | Familiar (previous Buno), no backend needed, fast dev | No SSR (not needed for POC) |
| Health bar rendering | SVG + GSAP stroke animation | Free, crisp at any size, natural sketch aesthetic | More manual setup than DrawSVG (which is paid anyway) |
| DrawSVG plugin | Free GSAP core + stroke-dasharray | All free utilities (learner preference) | Slightly more code, zero cost |
| Danger overlay | Full-screen modal | Maximum demo impact, visceral "oh shit" moment | More jarring than inline (dismissable, app still usable) |
| Category icons | Food, Transport, Shopping, Bills, Entertainment, Other | Standard set, covers POC needs | Can add more later |
| GSAP usage | Entrance, health bar, cash bounce, DANGER shake | PRD-specified micro-interactions | Learning curve: GSAP timeline vs React re-render |

**Learner uncertainty identified:**

*How does a React state change trigger a GSAP animation?* React re-renders the DOM declaratively ("show this now"), but GSAP animates imperatively ("move from here to here over 0.5s"). These two models coexist but require careful wiring — typically via `useEffect` + GSAP's `gsap.to()` on a ref. This is the core technical learning moment of the build. Will be explored during `5-build` with a small concrete example (animating the health bar on first render).

**Open questions carried from `prd.md > Open Questions`:**

1. ~~Category icon set~~ → Resolved: Food, Transport, Shopping, Bills, Entertainment, Other.
2. ~~Health bar sketch algorithm~~ → Resolved: SVG + feTurbulence filter + stroke-dasharray animation. Density varies by zone (line count and spacing).
3. ~~Danger overlay~~ → Resolved: Full-screen modal.
4. ~~Pseudo-bank data structure~~ → Resolved: Hardcoded JSON pool (~30 transactions), refresh shuffles and picks ~15-20.
5. ~~Review format for PRD~~ → Resolved: HTML (already generated).

**Unresolved:**
- Exact GSAP timeline structure for entrance animation (bunny draw → text fade → app reveal) — implementation detail for `5-build`.
- Whether React Router is worth the dependency vs. simple state-based tab switching — decide during build if router feels like overhead.
