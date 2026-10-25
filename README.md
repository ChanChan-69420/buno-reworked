# Buno — Qualitative Budget Pacing Sanctuary

> A research-backed budgeting app that replaces exact remaining balances with qualitative spending zones and behavioral nudges to prevent end-of-month overspending.

---

## 💡 Overview & Core Philosophy

Traditional budgeting apps show exact numbers like *"₹2,000 left for the month"*, inadvertently creating a psychological **"permission to spend"** trap. When people see that a little money is left, they feel comfortable spending it all, frequently exhausting their entire buffer prematurely.

**Buno** solves this by providing:
- **Qualitative Pacing Zones**: Replacing granular numbers with behavioral zones:
  - **Safe** (>60% budget remaining): Gentle, steady outflow aligned with peace of mind.
  - **Cautious** (20%–60% remaining): Mindful & measured pacing as headroom narrows.
  - **Danger / Critical** (<20% remaining): Fast & heavy outflow signaling that spending needs an immediate pause.
- **Runway Health Bar**: Visualizes spending progress without encouraging exact number micromanagement.
- **Spending Insights**: Month-over-month trajectory comparison (monotone curve) and categorized spending distribution.
- **Pacing Sanctuary Interface**: A serene, coffee-and-forest-themed experience with glassmorphism and smooth GSAP entrance animations.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 16.4.2 (App Router)
- **Library**: React 19.2.0 & TypeScript 5.7.0
- **Styling**: Tailwind CSS 4.1.0 with customized coffee & cream design tokens
- **Animations**: GSAP 3.12.5 (Runway meters, panel switches, card staggered reveals)
- **Iconography**: Lucide React 0.468.0
- **Fonts**: Playfair Display (Serif) & DM Sans (Sans)

---

## 📂 Project Structure

```
buno-reworked/
├── app/
│   ├── globals.css                # Design system tokens, warm coffee palette & theme styles
│   ├── layout.tsx                 # Root layout with fonts & metadata
│   └── page.tsx                   # Main page with forest sanctuary backdrop
├── components/
│   ├── sanctuary.tsx              # Sanctuary container orchestrating tab views & GSAP transitions
│   ├── site-header.tsx            # Floating glassmorphic header with view switcher tabs
│   ├── budget-range-panel.tsx     # Current zone indicator, RunwayBar, and qualitative zone status
│   ├── runway-bar.tsx             # GSAP-animated runway bar with threshold markers
│   ├── category-spending-panel.tsx# Outflow breakdown across spending categories
│   ├── month-comparison-panel.tsx # SVG cumulative spending trajectory vs. previous month
│   ├── transactions-panel.tsx     # Horizontal snap-scrolling transaction cards
│   └── category-icon.tsx          # Lucide category icons
├── lib/
│   ├── types.ts                   # Core TypeScript types (Transactions, Zones, Categories)
│   ├── zone-engine.ts             # Deterministic zone calculation logic
│   ├── zone-copy.ts               # Qualitative tone descriptors and messaging
│   ├── spending-insights.ts       # Monthly cumulative series & category grouping utilities
│   └── sandbox-data.ts            # Realistic default monthly budget & sandbox transactions
├── devpost/                       # Project specs, PRD, learner profile, and build checklists
└── package.json
```

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
pnpm install
# or: npm install
```

### 2. Run the development server
```bash
pnpm dev
# or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore the Sanctuary.

---

## 🎯 Current Status

- [x] **Budget Range View**: Interactive qualitative zone indicator & animated `RunwayBar`.
- [x] **Spending Insights View**: Month-to-date spending curves with monotone cubic smoothing and category outflow breakdown.
- [x] **Transactions View**: Horizontal snap-scrolling card feed with category icons and source badges.
- [x] **GSAP Micro-Interactions**: Animated tab switching, staggered card entrance, and meter transitions.
