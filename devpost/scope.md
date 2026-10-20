---
doc: scope
status: approved
---

# Buno

One line: A budgeting app that replaces exact remaining balances with qualitative spending zones to prevent end-of-month overspending.

## The Unique Kernel
Qualitative zone system (safe / middle / danger) with human-readable notes instead of exact numbers — deliberate ambiguity as a behavioral nudge. The "health bar" visualizes budget health vaguely, not precisely.

## Who It's For
A working professional or student who gets paid monthly, sets a budget, and consistently blows through the last 20% because seeing "₹2,000 left" feels like permission. They've tried YNAB/Mint/Excel and found the precision exhausting or counterproductive.

## The Core Loop
Open app → **Zone tab**: see current zone + health bar + human note → **Activity tab**: auto-imported feed + manual cash entry → log cash → see zone shift with GSAP animation → feel the nudge → repeat daily/weekly.

## Inspiration & Identity
- **Aesthetic**: Minimalistic color palette + typography, coffee brown theme
- **Logo**: Bunny (play on "Buno")
- **Feel**: High-quality, calm, not shiny or showy
- **Interactions**: GSAP for health bar zone transitions + entrance animation (bunny logo reveal)
- **References**: None provided

## Why This Matters to the Learner
Rebuilding a previous hackathon project (Buno) with better UI and pitch. Wants to understand the architecture/mechanics deeply — not just have AI generate code — so they can work on it themselves. Learning goal: "personalized human's touch" + technical ownership.

## What "Working" Looks Like
Demo video opens with a skit: person sees ₹200 left, thinks "fuck it, I'll spend it" → cut to Buno showing "You're in the danger zone. I'd look at your spending right now" with health bar in red. Live demo: load pseudo bank sandbox → see zone + health bar → add cash expense → watch zone shift with GSAP animation.

## The POC Boundary
**In:**
- Zone calculation engine (deterministic: Safe >60%, Middle 20-60%, Danger <20%)
- Health bar visualization (GSAP-animated, vague segments, zone-color coded)
- Two-tab layout: **Zone** (health bar + human-readable note rotating 3-4 variants) + **Activity** (pseudo-bank feed + manual cash entry form)
- Pseudo bank sandbox (fake transactions, auto-import simulation on load)
- Coffee brown theme, bunny logo, minimal typography
- GSAP entrance animation (bunny reveal → app) + zone transition animations
- Single monthly budget set on first visit (localStorage)

**Later:**
- Real bank API integration
- Multiple budgets/accounts
- Historical trends / analytics
- User authentication
- Export / sharing
- Mobile app / PWA
- Custom zone thresholds

## Explicitly Cut
- Exact remaining balance display (violates kernel)
- Budget Planner / Goals / Accounts pages (kernel is qualitative zone, not planning)
- Detailed categorization / tagging (adds friction, not core loop)
- Multi-user / household budgets (scope creep)
- Notifications / alerts (demo video doesn't need it)
- Deployment (optional per hackathon rules)