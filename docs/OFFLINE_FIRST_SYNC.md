# Offline-First & Sync Engine

## Principle
Pantry Plus is **offline-first**: the UI reads and writes the local database (IndexedDB via Dexie)
first, so every action is instant and works with no connection. The cloud is a synchronization
target, never a dependency for using the app.

## Write path
1. User performs an action (e.g. add inventory item).
2. The record is written to IndexedDB with `syncStatus: 'pending'`.
3. The UI updates immediately from the local DB (reactive hooks).
4. The sync engine later pushes the record to Firestore and marks it `synced`.

## Sync engine
- `app/components/SyncManager.tsx` — a headless component mounted once in the root layout. It triggers
  a sync:
  - on mount (flush anything left pending from a previous session),
  - on the browser `online` event (reconnection),
  - on a 30-second poll while online (retry transient failures).
- `lib/services/syncService.ts` — `syncPendingItems()` reads all `pending` records and writes them to
  Firestore, marking them `synced` (or `error` on failure for retry).

## Conflict resolution
**Last-Write-Wins (LWW):** each record carries an `updatedAt` timestamp. When the same record changes
in multiple places, the most recent write wins. This is simple, predictable, and appropriate for
single-household editing patterns.

## Connectivity awareness
- `app/components/OfflineIndicator.tsx` shows online/offline status.
- `lib/firebase/verify.ts` + `app/components/FirebaseStatus.tsx` (dev only) verify the live Firebase
  connection and surface configuration problems early.

## Firestore transport note
The Firestore client uses `experimentalAutoDetectLongPolling` (`lib/firebase/config.ts`). The default
streaming WebChannel is often blocked by browser tracking-prevention and corporate proxies
(`net::ERR_BLOCKED_BY_CLIENT`); long-polling falls back to ordinary requests these filters allow.

## PWA caching
`next-pwa` provides runtime caching (fonts, images, static assets) and an installable app shell, so
the app loads and runs offline. API routes are excluded from caching.
