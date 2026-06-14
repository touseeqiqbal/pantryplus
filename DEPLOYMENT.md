# Deployment Guide — PantryPlus

PantryPlus is a Next.js 14 (App Router) PWA. This guide covers deploying to
Vercel (recommended) and the Firebase setup it depends on.

## 1. Prerequisites

- Node.js 18+
- A Firebase project (Authentication + Cloud Firestore enabled)
- A Google Gemini API key (for AI features)
- A GitHub repository containing this project

## 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in every value:

```bash
cp .env.example .env.local
```

| Variable | Where to get it |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase Console → Project Settings → Your apps |
| `GOOGLE_GENERATIVE_AI_API_KEY` | https://aistudio.google.com/ (keep secret) |
| `NEXT_PUBLIC_SPOONACULAR_API_KEY` | https://spoonacular.com/food-api (optional) |

`.env.local` is gitignored and must never be committed.

## 3. Deploy Firestore Security Rules

The rules in [`firestore.rules`](firestore.rules) enforce household isolation,
role checks, and input validation. Deploy them with the Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

Verify in Firebase Console → Firestore → Rules that the published rules match.

## 4. Deploy to Vercel

1. Push the repository to GitHub.
2. In Vercel, **New Project → Import** the GitHub repo.
3. Framework preset: **Next.js** (auto-detected).
4. Add every variable from `.env.local` under **Settings → Environment Variables**
   (Production, Preview, and Development).
5. Click **Deploy**. Vercel runs `npm run build` and publishes.

Every `git push` to `main` triggers a production deploy; pull requests get
isolated **Preview Deployments** automatically.

### Build settings (defaults are correct)

- Build command: `npm run build`
- Output: `.next`
- Install command: `npm install`

## 5. Post-deploy checklist

- [ ] App loads over HTTPS (Vercel provides this automatically).
- [ ] Sign-in (Email + Google) works — add the Vercel domain to Firebase Auth
      → Settings → Authorized domains.
- [ ] Firestore reads/writes succeed (rules deployed).
- [ ] PWA installable (Lighthouse → PWA audit).
- [ ] Service worker registers in production (`next-pwa` is disabled in dev).
- [ ] Security headers present (check the response headers / `securityheaders.com`).

## 6. Alternative hosts

- **Firebase Hosting** — use `firebase init hosting` with the Next.js framework
  integration.
- **Netlify** — use the official Next.js runtime plugin.

## 7. Maintenance

- Regenerate PWA assets after a logo change: `npm run generate-icons`.
- Audit dependencies periodically: `npm audit`.
- Monitor runtime + analytics in the Vercel dashboard and Firebase Console.
