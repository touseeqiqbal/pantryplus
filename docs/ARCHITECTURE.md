# Architecture

## Overview
Pantry Plus is a Next.js 14 App Router application combining a **public marketing site** (server
components, SEO-first) and an **authenticated app** (offline-first, AI-powered).

```
┌──────────────────────────────────────────────────────────────┐
│                         Browser (PWA)                          │
│                                                                │
│  Marketing (SSR/SSG)        App (client + RSC)                 │
│  ─ (marketing)/*            ─ dashboard, inventory, ...        │
│  ─ SEO, JSON-LD             ─ flagship AI pages, business      │
│                                                                │
│  React state ── hooks ──┬── Dexie / IndexedDB (local-first)    │
│                         │        │  syncStatus: pending/synced │
│                         │        ▼                             │
│                         │   SyncManager ── syncService (LWW)   │
└─────────────────────────┼────────────────┼───────────────────┘
                          │                │
                          ▼                ▼
                  Next.js API routes   Firebase
                  (/api/* — Gemini)    (Auth + Firestore)
```

## Layers
1. **Presentation** — App Router pages. Public pages are server components for SEO; interactive app
   pages are client components. Shared UI in `app/components/` (`marketing/`, `ui/`).
2. **State & data hooks** — `lib/hooks/*` (`useAuth`, `useInventory`, `useHousehold`, `useAppMode`,
   `useShopping`, ...). These read/write the local DB and expose reactive data.
3. **Local persistence** — `lib/db/dexie.ts` (IndexedDB). The source of truth for the UI; everything
   works offline.
4. **Sync** — `lib/services/syncService.ts` + `app/components/SyncManager.tsx` flush pending records
   to Firestore and reconcile with Last-Write-Wins.
5. **Cloud** — Firebase Auth (identity) + Firestore (shared, role-secured data).
6. **AI** — server-only API routes in `app/api/*` call Gemini via `@ai-sdk/google`. Keys never reach
   the client.

## Key design decisions
- **Offline-first, not offline-capable:** the UI always reads/writes local first; the network is an
  enhancement, never a blocker.
- **Server components for marketing:** maximizes SEO and minimizes client JS.
- **Design system as Tailwind tokens:** `primary`/`accent` palettes registered in
  `tailwind.config.ts` (mirroring `app/styles/design-system.css`) so utilities work consistently.
- **Demo data isolated:** `lib/demo-data.ts`, `lib/marketing.ts`, `lib/blog.ts` keep placeholder
  content out of components, so real data plugs in cleanly.
- **Route groups:** `(marketing)` gives public pages their own navbar/footer layout without changing
  URLs.

## Data model (Firestore collections)
`households`, `businesses`, `branches`, `staff`, `inventory`, `shopping`, `recipes`, `menuItems`,
`ingredientMappings`, `yieldLogs`, `invitations`, `meals`, `tasks`, `expenses`, `budgets`,
`notifications`, `activities`, `users`. Access is governed by `firestore.rules`
(see [SECURITY_MODEL](SECURITY_MODEL.md)).
