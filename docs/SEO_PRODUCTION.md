# SEO & Production Readiness

## SEO
- **Metadata helper:** `lib/seo.ts` → `buildMetadata({ title, description, path, keywords })` returns a
  Next.js `Metadata` object with title, description, canonical URL, Open Graph and Twitter cards.
  Every public page exports metadata via this helper.
- **Site config:** `siteConfig` centralizes name, tagline ("The AI Kitchen Operating System"),
  description, URL (`NEXT_PUBLIC_SITE_URL`), and core keywords.
- **Structured data (JSON-LD):** `app/components/marketing/SEOJsonLd.tsx` with builders for
  `Organization`, `SoftwareApplication`, `FAQPage`, `BreadcrumbList`, and `Article` (blog posts).
- **Sitemap:** `app/sitemap.ts` lists all public + blog routes.
- **Robots:** `app/robots.ts` allows public pages, disallows authenticated app routes and `/api`.
- **Server rendering:** marketing pages are server components, so content is crawlable.
- **Core keywords** (used naturally, not stuffed): AI kitchen assistant, pantry management app, AI meal
  planner, grocery budget app, food waste reduction app, kitchen inventory app, offline-first PWA,
  household management app, recipe planning app, small food business inventory.

## Production utilities
| Concern | File |
|---|---|
| Env validation | `lib/env.ts` (Zod; server/client split) |
| Analytics abstraction | `lib/analytics.ts` (`track(event, props)`) |
| Rate limiting | `lib/rate-limit.ts` (fixed-window; for AI routes) |
| Error/empty/loading states | `app/components/ui/{ErrorState,EmptyState,LoadingState}.tsx` |
| Security headers / CSP | `next.config.mjs` |
| Input validation | Zod (contact form, budget planner; extend to other forms) |

## Security headers
`next.config.mjs` sets a Content-Security-Policy (allowing Firebase/Google auth domains), plus
`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and HSTS.

## Analytics events
`sign_up`, `sign_in`, `inventory_item_added`, `meal_plan_generated`, `ai_chat_used`,
`receipt_scanned`, `shopping_list_created`, `business_costing_used`, `waste_coach_viewed`,
`budget_plan_generated`, `contact_submitted`, `pricing_cta_clicked`. Wire a provider in
`lib/analytics.ts → dispatch()`.

## Checklist before launch
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the production domain.
- [ ] Add an OG image at `/opengraph-image` (or update `siteConfig.ogImage`).
- [ ] Wire a real analytics provider.
- [ ] Apply rate limiting + Zod validation to all AI routes.
- [ ] Replace demo data (`lib/demo-data.ts`) with live hooks.
- [ ] Review legal pages (privacy/terms) with counsel.
