# Security Model

## Authentication
Firebase Authentication (Email/Password + Google). The client SDK config is validated by
`lib/env.ts` and initialized in `lib/firebase/config.ts`. Friendly auth errors are mapped in
`lib/utils/authErrors.ts`.

## Authorization (Firestore rules)
Defined in `firestore.rules`. Core principles:

- **Authenticated only:** every collection requires `request.auth != null`.
- **Household access:** users can read/write a household's data only if they are a **member**
  (`memberIds` contains their uid). Helpers: `isHouseholdMember`, `isHouseholdOwner`,
  `isHouseholdAdmin`.
- **Roles:** owners/admins manage household settings, budgets and invitations; members manage shared
  inventory, meals, tasks and expenses.
- **Business access:** business data is restricted to the **owner** or assigned **staff**
  (`staff/{businessId_uid}`). Helpers: `isBusinessOwner`, `isBusinessStaff`, `isBusinessMember`.
- **User profiles:** `users/{userId}` is **self-access only** — a user can read/write only their own
  profile.
- **Immutable logs:** `yieldLogs` and `activities` are append-only (no update/delete).
- **Input validation:** inventory writes are validated server-side (`isValidInventory`) for required
  fields and types.
- **Default deny:** a catch-all `match /{document=**} { allow read, write: if false; }` blocks every
  collection not explicitly allowed.

## Create vs update
Rules correctly distinguish `create` (validate `request.resource.data`) from `read/update/delete`
(check `resource.data`) — combined `read,write` rules would silently deny creates because
`resource.data` is null on create.

## Server-side secrets
- `GOOGLE_GENERATIVE_AI_API_KEY` is **server-only**, accessed via `getServerEnv()` and used only in
  `app/api/*`. It is never imported into a client component or prefixed with `NEXT_PUBLIC_`.
- `NEXT_PUBLIC_*` values (Firebase web config, Spoonacular) are public by design.

## Transport & headers
- HTTPS + HSTS enforced via `next.config.mjs` security headers.
- Content-Security-Policy restricts script/connect/frame sources to the app origin plus required
  Firebase/Google domains.

## Data deletion
Users can delete all of their data (local + cloud) via `lib/services/dataService.ts`
(`deleteAllUserData`).
