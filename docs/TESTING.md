# Testing & QA

## Static checks
| Check | Command |
|---|---|
| Type safety | `npx tsc --noEmit` |
| Linting | `npm run lint` |
| Production build | `npm run build` |

TypeScript runs in `strict` mode. The codebase is kept type-clean.

## Manual test plan

### Authentication
- [ ] Sign up (email/password) and sign in.
- [ ] Google sign-in.
- [ ] Friendly errors for wrong password / invalid key.
- [ ] Signed-in users are redirected away from auth pages.

### Offline-first & sync
- [ ] Add inventory while offline → appears instantly.
- [ ] Reconnect → item syncs to Firestore (status changes pending → synced).
- [ ] Edit the same item on two devices → Last-Write-Wins resolves.

### Core modules
- [ ] Inventory CRUD, expiry alerts.
- [ ] Shopping list add/check/clear.
- [ ] Meal planner & recipes.
- [ ] Tasks, expenses, budgets.
- [ ] Household invite/join with roles.

### Flagship AI
- [ ] `/assistant` streams a response (requires `GOOGLE_GENERATIVE_AI_API_KEY`).
- [ ] `/autopilot`, `/waste-coach` reflect real expiring inventory when present.
- [ ] `/budget-planner` validates inputs (Zod) and generates a plan.
- [ ] `/scan` routes to receipt/photo flows.
- [ ] `/insights` renders Pantry Score; `/family` shows taste profiles; `/health` shows disclaimer.

### Business mode
- [ ] `/business` hub links work; `/business/costing` shows correct margins.

### Marketing & SEO
- [ ] All public pages load **without login**.
- [ ] `/sitemap.xml` and `/robots.txt` resolve.
- [ ] Page titles/descriptions and JSON-LD present (view source).
- [ ] Contact form validates and shows a success toast.

### Responsive & a11y
- [ ] Mobile / tablet / desktop layouts.
- [ ] Keyboard navigation and visible focus rings.
- [ ] Dark mode across pages.

## Suggested automated testing (future)
- Unit: `lib/rate-limit.ts`, `lib/demo-data.ts` (`costingMetrics`), `lib/seo.ts`.
- Component: marketing sections render expected content.
- E2E (Playwright): sign-up → add inventory → offline → sync → AI chat.
