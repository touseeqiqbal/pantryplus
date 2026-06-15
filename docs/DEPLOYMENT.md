# Deployment

## Recommended platform
**Vercel** (zero-config for Next.js App Router with API routes and SSR). The app is **not** a static
export — it needs the Next.js server runtime for API/AI routes.

> Cloudflare Pages also works but requires the `@cloudflare/next-on-pages` adapter for the dynamic/AI
> routes.

## Build settings
| Setting | Value |
|---|---|
| Framework preset | Next.js |
| Root directory | `./` |
| Build command | `next build` (default) |
| Output | Next.js default (do **not** set a static output dir) |
| Install command | `npm install` |

## Environment variables (set in the host dashboard)
`.env.local` is gitignored and is **not** deployed — add every variable to the platform:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
NEXT_PUBLIC_SPOONACULAR_API_KEY
NEXT_PUBLIC_SITE_URL          # production domain — drives canonical/OG/sitemap
GOOGLE_GENERATIVE_AI_API_KEY  # server only — powers all AI features
```

`NEXT_PUBLIC_*` values are inlined **at build time** — set them before/at build, then redeploy if
changed.

## Post-deploy Firebase steps
1. **Authentication → Settings → Authorized domains:** add the production domain (else Google sign-in
   fails with `auth/unauthorized-domain`).
2. **Authentication → Sign-in method:** enable Email/Password and Google.
3. **Firestore:** create the database and **publish `firestore.rules`**.
4. (Optional) Add Firestore composite indexes if queries require them.

## Local production check
```bash
npm run build && npm run start
```
> Note: a full production build writes 250 MB+ to `.next`. Ensure adequate free disk space.

## Service worker
`next-pwa` is disabled in development and enabled in production. After a deploy that changes the PWA
manifest or chunks, users may need to clear the old service worker (DevTools → Application → Clear
site data) to pick up changes.
