---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. Scaffold + Zone Engine + Basic Zone Display**
  Becomes usable: A running Vite + React + TS app showing a hardcoded budget, a list of hardcoded transactions, the calculated zone (Safe/Cautious/Danger), and a simple visual indicator. The kernel works end to end.
  Why now: Bootstrapping lives inside slice one. The zone engine is the kernel — proving it early means every later slice has a working foundation. Risk first: GSAP install + React wiring is the unfamiliar part.
  PRD ref: `prd.md > Zone Engine & Health Bar`, `prd.md > The Core Journey` (Step 3 core)
  Spec ref: `spec.md > Stack`, `spec.md > Zone Engine (Utility)`, `spec.md > File Structure`
  Build: `npm create vite@latest` with React + TypeScript template. Install `gsap`. Create `types.ts`, `zoneEngine.ts` (pure calculation), `notes.ts` (human note arrays). Build `App.tsx` with hardcoded budget (₹25,000) and 5-6 hardcoded transactions. Render zone label + remaining pct + human note + a simple colored bar indicator. Basic App.css with palette variables.
  Verify (mechanical): `npm run dev` starts with no errors. Console shows zone calculation output. Browser renders zone label matching the hardcoded data.
  Learner check: Open http://localhost:5173 — you should see the budget, transactions, and a zone label. Change one hardcoded transaction amount and confirm the zone updates.
  Commit: `Scaffold Vite + React + TS with zone engine and basic display`

- [x] **2. Intro + Budget Setup + localStorage Persistence**
  Becomes usable: First visit shows intro animation and premise, then budget setup. Budget saves to localStorage. Returning visits skip straight to the zone view.
  Why now: The first-visit flow is the entry point for the demo. Persistence is where the data model can be wrong — finding that out now is cheap.
  PRD ref: `prd.md > The Core Journey` (Steps 1-2), `prd.md > States and Boundaries` (First use / Returning user)
  Spec ref: `spec.md > Components` (Intro, Budget Setup), `spec.md > Data Model` (Budget)
  Build: Create `Intro.tsx` (bunny SVG + "Hello, this is Buno" + premise copy + CTA). Create `BudgetSetup.tsx` (numeric input, validation, save to `localStorage.buno_budget`). Create `storage.ts` helpers. App.tsx checks localStorage on mount → routes to Intro or Zone view. GSAP entrance animation (bunny draw-in + text fade).
  Verify (mechanical): Clear localStorage, reload → intro appears. Set budget → reload → intro skipped, zone view shows. `localStorage.getItem('buno_budget')` returns the set value in console.
  Learner check: Open the app fresh (clear localStorage in devtools). Watch the intro, set a budget, confirm you land on the zone view. Refresh — intro should not reappear.
  Commit: `Add intro, budget setup, and localStorage persistence`

- [x] **3. Activity Tab + Pseudo-Bank Sandbox + Transaction Feed**
  Becomes usable: Two-tab layout. Activity tab shows a transaction feed from sandbox data with category icons, dates, and source badges. Empty state human note works.
  Why now: The feed is the data surface the cash entry will land on. Building it first means slice 4 only adds the form.
  PRD ref: `prd.md > Activity Tab`, `prd.md > Transaction Feed`, `prd.md > Pseudo Bank Sandbox`
  Spec ref: `spec.md > Components` (Activity Tab, Transaction Feed, Pseudo-Bank Sandbox, Category Icons), `spec.md > Data Model` (Pseudo-Bank Transactions)
  Build: Create `sandboxData.ts` (~30 hardcoded transactions across categories/dates). Create `TransactionRow.tsx` (description, category icon, date/time, Bank/Cash badge). Create 6 inline SVG category icons (Food, Transport, Shopping, Bills, Entertainment, Other). Create `ActivityTab.tsx` (feed sorted newest-first, empty state). Tab navigation in App.tsx (Zone ↔ Activity). Merge sandbox + cash entries for zone calculation.
  Verify (mechanical): `npm run dev` starts. Activity tab shows ~15-20 transactions with correct icons. Empty state shows when all transactions removed (temporarily clear sandbox). Tab switching works.
  Learner check: Switch to Activity tab — you should see transactions with icons and dates. Switch back to Zone tab — health bar should reflect all transactions.
  Commit: `Add activity tab with sandbox transaction feed and category icons`

- [x] **4. Manual Cash Entry + Zone Recalculation + Bounce Animation**
  Becomes usable: User can log a cash expense. It validates, saves to localStorage, appears at the top of the feed with a GSAP bounce, and the zone recalculates immediately.
  Why now: This completes the core loop (check zone → log cash → see shift). The kernel is now fully interactive.
  PRD ref: `prd.md > Manual Cash Entry`, `prd.md > The Core Journey` (Step 4 core loop)
  Spec ref: `spec.md > Components` (Manual Cash Entry Form), `spec.md > Data Model` (Manual Cash Entries)
  Build: Create `CashEntryForm.tsx` (amount numeric min 1, description required, date/time default now, inline validation errors). Save to `localStorage.buno_cash_entries`. Prepend to feed with GSAP bounce-in. Trigger zone recalculation on submit. Wire into ActivityTab.
  Verify (mechanical): Submit valid entry → appears in feed, zone updates. Submit empty amount → inline error "Enter a valid amount". Submit negative → error. Submit without description → error. Reload → entry persists.
  Learner check: Log a cash expense on the Activity tab. Watch the new row bounce in and the zone shift. Refresh — entry should still be there.
  Commit: `Add manual cash entry with validation, persistence, and bounce animation`

- [x] **5. Sanctuary Budget Runway Bar + GSAP Animations + Spending Insights**
  Becomes usable: Pacing Sanctuary dashboard is active with 3 navigable views: Budget Range, Spending Insights, and Transactions. Implements animated RunwayBar powered by GSAP with safe/cautious/critical thresholds, month-over-month cumulative spending trajectory charts, and category breakdown panels with GSAP staggered entrance animations.
  PRD ref: prd.md > Look and Feel, prd.md > Zone Engine & Health Bar
  Spec ref: spec.md > Components, spec.md > Look and Feel
  Status: Built in Next.js + Tailwind v4 + GSAP (runway-bar.tsx, month-comparison-panel.tsx, category-spending-panel.tsx, sanctuary.tsx). Horizontal snap-scrolling transaction cards implemented.

- [ ] **6. DANGER Modal + Human Notes + Refresh + Polish**
  Becomes usable: Budget ≤0% triggers a full-screen DANGER modal with GSAP shake. Human notes rotate on each visit/zone change. Refresh button regenerates sandbox data. Final visual polish.
  Why now: The danger moment is the demo's emotional peak. Notes rotation and refresh complete the PRD behaviors. Polish ties it together.
  PRD ref: `prd.md > The Core Journey` (Step 6), `prd.md > States and Boundaries` (Budget depleted), `prd.md > Pseudo Bank Sandbox` (Refresh)
  Spec ref: `spec.md > Components` (DANGER Modal), `spec.md > Important Failure Modes`
  Build: Create `DangerModal.tsx` (full-screen overlay, "DANGER" text, "Budget is empty now", GSAP shake animation, dismiss button). Wire to zone engine (pct ≤ 0% triggers). Human note rotation (random pick on mount and zone change). Refresh button on Activity tab (shuffles sandbox pool, re-renders, recalculates zone). Visual polish: spacing, typography, transitions, bunny in header.
  Verify (mechanical): Set budget very low + add large expense → DANGER modal appears with shake. Dismiss → app usable. Refresh button → new transactions appear. Human note changes on reload.
  Learner check: Trigger the danger state by logging a large expense. See the DANGER modal shake. Dismiss it. Click refresh on Activity tab — new transactions should appear.
  Commit: `Add danger modal, human note rotation, refresh button, and polish`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — after slice 4 (core loop complete)
- [ ] Final kick-the-tires exploration and feedback completed — after slice 6

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: [to be filled]
Route and stops: [to be filled]
Edit outcome: [to be filled]
Reflection: [to be filled]
Activity mode: [to be filled]

## Revisions
