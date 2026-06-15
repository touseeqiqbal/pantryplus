# Features

## Core household modules
| Module | Route | Description |
|---|---|---|
| Dashboard | `/dashboard` | Live overview of inventory, expiring items, budget, meal plan |
| Inventory | `/inventory` | Track pantry/fridge/freezer items with quantity, unit, location, expiry |
| Expiry tracking | `/inventory` | Smart alerts and use-first ordering |
| Barcode/photo scanning | `/inventory`, `/scan` | Add items by barcode, photo, or receipt |
| Shopping lists | `/shopping` | Synced lists; AI-generated from meal plans |
| Meal planner | `/meals/planner` | Plan the week around inventory, budget & tastes |
| Recipes & substitutions | `/recipes` | Find recipes from ingredients; AI substitutions |
| Tasks | `/tasks` | Coordinate kitchen chores across the household |
| Expenses & budgets | `/expenses` | Track spending; receipt scanning |
| Household sharing | `/household/*` | Invite members with roles; shared data |
| Settings | `/settings` | Personalization, theme, data management |
| Integrations | `/integrations` | Smart-home / external services |

## Flagship AI features
| Feature | Route | Description |
|---|---|---|
| Kitchen Autopilot | `/autopilot` | Auto meal plan + shopping list + savings |
| Living Kitchen Brain (Assistant) | `/assistant` | Streaming chat, inventory-aware |
| Food Waste Coach | `/waste-coach` | Use-before-waste with money/CO₂ impact |
| Budget Survival Mode | `/budget-planner` | Cheap plan from budget + ingredients |
| AI Family Taste Memory | `/family` | Per-person tastes, allergies, diets |
| Smart Scan Hub | `/scan` | Receipt, item, barcode, shelf scanning |
| Insights & Pantry Score | `/insights` | Analytics + gamified score & badges |
| Health & Wellness | `/health` | Nutrition awareness (not medical advice) |

## Business mode
| Tool | Route | Description |
|---|---|---|
| Hub | `/business` | Entry point to all business tools |
| Dashboard | `/business/dashboard` | Revenue, cost, orders, margin |
| Recipe costing | `/business/costing` | Cost/serving, profit, margin |
| Menu | `/business/menu` | Menu items & recipes |
| Ingredients | `/business/ingredients` | Stock, unit cost, low-stock |
| Prep | `/business/prep` | Daily prep checklists |
| Orders | `/business/orders` | new → preparing → ready → delivered |
| Suppliers | `/business/suppliers` | Contacts & ratings |

## Public marketing site
Landing, Features, Pricing, About, Team, Demo, Roadmap, Blog (+ posts), FAQ, Help, Contact, Privacy,
Terms — all server-rendered for SEO with JSON-LD structured data.

## Platform
- Offline-first PWA (installable, works offline, runtime caching)
- Dark mode (class-based)
- Responsive (mobile / tablet / desktop)
- Accessible (semantic HTML, focus rings, ARIA labels)
- Smooth framer-motion animations
