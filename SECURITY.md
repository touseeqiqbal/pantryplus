# Security Overview — PantryPlus

This document summarises the security model of PantryPlus (Module 11 & 12).

## Authentication

- Firebase Authentication with **Email/Password** and **Google OAuth**.
- Sessions and token refresh are managed by the Firebase SDK.
- Protected routes redirect unauthenticated users to `/auth/signin`.

## Household isolation & roles

- Every record is tagged with a `householdId` (or `businessId`).
- Users only ever read/write data for households they belong to.
- Roles: **Owner** (delete household, manage members), **Admin** (invite members,
  manage budgets), **Member** (view/add items).

## Firestore Security Rules

Defined in [`firestore.rules`](firestore.rules) with a **default-deny** policy
(`match /{document=**} { allow read, write: if false; }`). Highlights:

- Reads/writes require authentication **and** household/business membership.
- `create` rules validate `request.resource.data`; `read/update/delete` validate
  the existing `resource.data` (this distinction matters — `resource` is null on
  create, so combined `read, write` rules silently break creates).
- Inventory writes are validated for required fields and types via
  `isValidInventory()` (name, category, quantity ≥ 0, unit).
- Budgets are write-restricted to household admins/owners.
- Yield logs and activity logs are immutable (audit trail).
- Notifications are private to their `userId`.

Deploy rules with `firebase deploy --only firestore:rules`.

## Data privacy

- **Private items** — inventory items can be marked 🔒 Private; they are hidden
  from other household members in the UI (filtered by `createdBy`).
- **Right to be forgotten** — Settings → "Delete All Data" wipes the local
  IndexedDB/localStorage and cascades deletion of the user's owned cloud
  households and their contents (see `lib/services/dataService.ts`).
- **Analytics** — usage analytics are opt-out and not tied to personal records.

## Transport & application headers

Set in [`next.config.mjs`](next.config.mjs) `headers()`:

- **Content-Security-Policy** — restricts script/style/connect origins to self +
  Firebase + Google Fonts; `object-src 'none'`, `frame-ancestors 'none'`.
- **Strict-Transport-Security** — enforces HTTPS.
- **X-Content-Type-Options: nosniff** — blocks MIME sniffing.
- **X-Frame-Options: DENY** — blocks clickjacking.
- **Referrer-Policy: strict-origin-when-cross-origin**.
- **Permissions-Policy** — limits camera/microphone to self, disables geolocation.

## Secrets management

- The Gemini API key (`GOOGLE_GENERATIVE_AI_API_KEY`) is server-only and never
  shipped to the browser.
- Firebase web config keys are `NEXT_PUBLIC_` by design; access is gated by
  Security Rules, not key secrecy.
- `.env.local` is gitignored; `.env.example` documents the required variables.

## Reporting a vulnerability

Please report security issues privately to the project maintainer rather than
opening a public issue.
