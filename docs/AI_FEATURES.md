# AI Features

## Provider
Google **Gemini** via `@ai-sdk/google` (`gemini-1.5-flash`). The API key
(`GOOGLE_GENERATIVE_AI_API_KEY`) is **server-only** and is never exposed to the client. All AI runs in
Next.js API routes under `app/api/`.

## API routes
| Route | Purpose | Returns |
|---|---|---|
| `/api/chat` | Living Kitchen Brain assistant (inventory + household aware) | Plain text stream |
| `/api/vision` | Identify pantry items from a photo | Structured items |
| `/api/expenses/scan` | Receipt → itemized expenses/inventory | Structured items |
| `/api/recipes/ai` | Generate recipes from available ingredients | Recipe data |
| `/api/recipes/substitute` | Ingredient substitutions | Suggestions |
| `/api/insights/health` | Wellness/nutrition insights | Structured insights |
| `/api/insights/predictive` | Spoilage prediction & anomalies | Structured insights |
| `/api/shopping/generate` | Shopping list from a meal plan | List items |

## Flagship feature → data flow
- **Kitchen Autopilot** (`/autopilot`): inventory + expiry + budget + family tastes → meal plan +
  shopping list + savings. *(UI complete; live AI generation is wired to demo data with TODOs.)*
- **Living Kitchen Brain** (`/assistant`): streams from `/api/chat`, fed real inventory and household
  context — fully functional.
- **Food Waste Coach** (`/waste-coach`): reads inventory expiry to produce use-first/freeze/donate
  guidance; AI recipe ideas from expiring items.
- **Budget Survival Mode** (`/budget-planner`): budget + ingredients + diet → cheap plan. Inputs
  validated with Zod; generation mocked with a clear TODO for the AI route.
- **Family Taste Memory** (`/family`): per-person likes/allergies/diet feed AI prompts with
  explanations ("avoided peanuts because Sara is allergic").
- **Smart Scan** (`/scan`): routes to `/api/vision` and `/api/expenses/scan`.
- **Insights & Pantry Score** (`/insights`): analytics + gamified score.

## Safety
- AI suggestions are **guidance, not professional/medical/financial advice**. The Health page shows a
  prominent disclaimer.
- Inputs to AI routes should be validated (Zod) and rate-limited (`lib/rate-limit.ts`) to control
  abuse and cost.

## Reliability
- The assistant reads the streamed response chunk-by-chunk and renders progressively.
- AI failures degrade gracefully (friendly error, app remains usable offline).
