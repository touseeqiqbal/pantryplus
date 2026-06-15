# Pantry Plus — AI Kitchen Operating System

**Pantry Plus** is an AI-powered, offline-first kitchen management Progressive Web App (PWA) for
homes, families, and small food businesses. It automates meal decisions, reduces food waste, saves
grocery money, and runs kitchen operations — **online or offline**.

> Final-year project positioning: *Pantry Plus — an AI-Powered Offline-First Kitchen Management System.*

---

## ✨ What makes it different

Not "just another pantry app" — an **AI Kitchen Operating System** built around 7 flagship features:

| Flagship feature | What it does | Route |
|---|---|---|
| 🧭 **Kitchen Autopilot** | Auto meal plan + shopping list + savings from inventory, budget & tastes | `/autopilot` |
| ♻️ **Food Waste Coach** | "Use before waste" engine with money & CO₂ impact | `/waste-coach` |
| 💸 **Budget Survival Mode** | "I have $X, feed me for N days" meal planning | `/budget-planner` |
| 🧠 **AI Family Taste Memory** | Per-person likes, allergies & diets personalize every suggestion | `/family` |
| 🧾 **Smart Receipt-to-Inventory** | Scan receipts, barcodes & shelves into inventory | `/scan` |
| 📊 **Business Recipe Costing** | Cost per serving, profit margins, stock deduction | `/business` |
| 🏆 **Pantry Score** | Gamified household score, badges & habits | `/insights` |

Plus the full assistant ("Living Kitchen Brain") at `/assistant`.

---

## 🧱 Tech stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS (with a CSS-variable design system) + framer-motion
- **Auth:** Firebase Authentication (Email/Password + Google)
- **Cloud DB:** Cloud Firestore (with role-based security rules)
- **Local DB:** Dexie / IndexedDB (offline-first)
- **AI:** Google Gemini via `@ai-sdk/google`
- **Recipes:** Spoonacular API
- **PWA:** `next-pwa` (installable, offline, runtime caching)

---

## 🚀 Features

**Household:** Dashboard · Inventory · Expiry tracking · Barcode/photo scanning · Shopping lists ·
Meal planner · Recipes & substitutions · Tasks · Expenses & budgets · Household sharing with roles.

**AI:** Living Kitchen Brain assistant · Kitchen Autopilot · Waste Coach · Budget Survival Mode ·
Family Taste Memory · Receipt scanning · Insights & Pantry Score · Health/wellness awareness.

**Business mode:** Dashboard · Recipe costing & margins · Menu · Ingredients & stock · Prep
checklists · Order tracking · Supplier management.

**Public marketing site:** Landing, Features, Pricing, About, Team, Demo, Roadmap, Blog, FAQ,
Help, Contact, Privacy, Terms — fully SEO-optimized.

---

## 🤖 AI capabilities

AI runs **server-side only** (the Gemini key is never exposed to the client). API routes live under
`app/api/`:

- `/api/chat` — the assistant (streaming, inventory-aware)
- `/api/vision` — item/photo recognition
- `/api/expenses/scan` — receipt → itemized data
- `/api/recipes/ai` & `/api/recipes/substitute` — recipe generation & substitutions
- `/api/insights/health` & `/api/insights/predictive` — wellness & spoilage prediction
- `/api/shopping/generate` — AI shopping list from a meal plan

See [docs/AI_FEATURES.md](docs/AI_FEATURES.md).

---

## 📴 Offline-first architecture

Every write saves to **IndexedDB first** (instant, works offline). A background **sync engine**
(`lib/services/syncService.ts` + `app/components/SyncManager.tsx`) flushes queued changes to
Firestore when online, using **Last-Write-Wins** conflict resolution.

See [docs/OFFLINE_FIRST_SYNC.md](docs/OFFLINE_FIRST_SYNC.md) and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## 🛠️ Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local (see "Environment variables" below)

# 3. Run the dev server
npm run dev          # http://localhost:3000

# 4. Production
npm run build
npm run start
```

### Environment variables (`.env.local`)

```bash
# Firebase (client — safe to expose, inlined at build time)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...

# Recipes (client)
NEXT_PUBLIC_SPOONACULAR_API_KEY=...

# Site URL — drives canonical + Open Graph + sitemap
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Gemini AI (SERVER ONLY — never prefix with NEXT_PUBLIC)
GOOGLE_GENERATIVE_AI_API_KEY=...
```

Validation lives in `lib/env.ts`. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## 📜 Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | ESLint |
| `npm run generate-icons` | Regenerate PWA icons/screenshots |

---

## 📁 Folder structure (high level)

```
app/
  (marketing)/        # Public marketing site (navbar + footer layout)
    page.tsx          # Landing
    about, team, features, pricing, contact, faq, help,
    roadmap, demo, privacy, terms, blog/[slug]
  api/                # Server-only AI + data routes
  components/
    marketing/        # Reusable marketing sections
    ui/               # LoadingState, EmptyState, ErrorState, Toaster
  dashboard, inventory, shopping, meals, recipes, tasks,
  expenses, household, settings, integrations          # Core app
  autopilot, assistant, waste-coach, budget-planner,
  family, health, insights, scan                       # Flagship AI pages
  business/           # Business mode (dashboard, costing, ingredients, orders, suppliers, menu, prep)
  sitemap.ts, robots.ts
lib/
  firebase/           # config + connection verification
  db/                 # Dexie schema
  hooks/              # useAuth, useInventory, useHousehold, ...
  services/           # syncService, recipeService, ...
  seo.ts, env.ts, analytics.ts, rate-limit.ts,
  marketing.ts, demo-data.ts, blog.ts
docs/                 # Project documentation
firestore.rules       # Role-based security rules
```

---

## 🎓 Final-year project

- **Title:** Pantry Plus — AI-Powered Offline-First Kitchen Management System
- **Problem:** Households and small food businesses waste food, overspend on groceries, and struggle
  to coordinate inventory, meal planning, shopping and kitchen tasks.
- **Solution:** Local-first storage + cloud sync + AI assistance + receipt scanning + meal planning +
  collaborative household & business tools.

See [docs/PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md) and [docs/FUTURE_SCOPE.md](docs/FUTURE_SCOPE.md).

---

## 📚 Documentation

| Doc | Contents |
|---|---|
| [PROJECT_OVERVIEW](docs/PROJECT_OVERVIEW.md) | Problem, solution, objectives, scope |
| [FEATURES](docs/FEATURES.md) | Full feature catalogue |
| [ARCHITECTURE](docs/ARCHITECTURE.md) | System design & data flow |
| [OFFLINE_FIRST_SYNC](docs/OFFLINE_FIRST_SYNC.md) | The sync engine |
| [AI_FEATURES](docs/AI_FEATURES.md) | AI routes & flagship features |
| [SEO_PRODUCTION](docs/SEO_PRODUCTION.md) | SEO & production readiness |
| [SECURITY_MODEL](docs/SECURITY_MODEL.md) | Auth & Firestore rules |
| [DEPLOYMENT](docs/DEPLOYMENT.md) | Deploy & environment |
| [TESTING](docs/TESTING.md) | QA & test plan |
| [FUTURE_SCOPE](docs/FUTURE_SCOPE.md) | Roadmap & future work |

---

Built with Next.js · Firebase · Gemini AI. A final-year project, built to launch.
