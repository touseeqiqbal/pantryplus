# Future Scope

## Roadmap phases
| Phase | Theme | Highlights |
|---|---|---|
| 1 | MVP (University Demo) | Inventory, expiry, AI assistant, meal planner, shopping list, receipt scanner, offline sync, business costing demo |
| 2 | AI Expansion | Kitchen Autopilot, Waste Coach, Budget Survival Mode, Family Taste Memory, Pantry Score |
| 3 | Business Mode | Full recipe costing, stock deduction on orders, supplier management, menu profitability |
| 4 | Mobile Optimization | PWA polish, onboarding, push notifications, QR/NFC pantry labels, voice |
| 5 | Monetization | Stripe payments, Pro & Business plans, usage-based AI limits, team billing |
| 6 | Enterprise | Multi-location, public API & integrations, smart-fridge / IoT, advanced nutrition |

## Planned features
- **Native mobile apps** (or deeper PWA install + push).
- **Stripe payments** for Pro / Business / Enterprise tiers.
- **Supplier integrations** & automated reordering.
- **Advanced nutrition analysis** (macro/micro tracking).
- **Multi-location business support** (branches, staff roles).
- **IoT / smart-fridge integrations** and QR/NFC container labels (scan to update quantity/expiry).
- **Voice assistant expansion** (Alexa/Google/WhatsApp/Telegram bots).
- **Emergency Meal Generator**, **Smart Leftover Mode**, **AI Cooking Companion** (step-by-step,
  "fix my recipe", scale servings) — demo data already scaffolded in `lib/demo-data.ts`.
- **Grocery Bill Optimizer** — learn spending patterns from receipts over time.
- **Cultural Meal Intelligence** — region/diet-aware planning (Pakistani, Indian, halal, vegan, …).
- **Admin panel** for household/business administration.

## Engineering follow-ups
- Replace `lib/demo-data.ts` with live hooks across flagship pages.
- Wire AI generation routes for Autopilot and Budget Survival Mode.
- Add automated tests (unit/component/E2E — see [TESTING](TESTING.md)).
- Wire a real analytics provider in `lib/analytics.ts`.
- Persist Family Taste profiles to Firestore and feed them into AI prompts.
