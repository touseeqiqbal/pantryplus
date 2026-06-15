/**
 * Static blog system (no CMS required).
 *
 * Posts are authored here as structured data. The blog index and
 * /blog/[slug] pages render this directly and generate SEO + JSON-LD from it.
 * Swap this for a CMS/MDX later without changing the page components.
 */

export interface BlogSection {
  heading?: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO
  readingMinutes: number;
  category: string;
  emoji: string;
  author: string;
  keywords: string[];
  body: BlogSection[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'how-to-reduce-food-waste-at-home',
    title: 'How to Reduce Food Waste at Home (Without Trying Too Hard)',
    excerpt: 'The average household bins about a third of the food it buys. Here’s a simple system — and how an AI waste coach makes it automatic.',
    date: '2026-05-02',
    readingMinutes: 6,
    category: 'Food Waste',
    emoji: '♻️',
    author: 'Pantry Plus Team',
    keywords: ['food waste reduction app', 'reduce food waste', 'use before waste'],
    body: [
      { paragraphs: ['Food waste isn’t a willpower problem — it’s a visibility problem. We forget what we have until it’s too late. The fix is a small set of habits, backed by a system that remembers for you.'] },
      { heading: 'The “use-before-waste” order', paragraphs: ['Instead of asking “what do I feel like?”, ask “what needs using first?” Sort your fridge by what expires soonest and cook from the top down.'], bullets: ['Use First Today — anything with 1–2 days left', 'Use This Week — plan a meal around it', 'Freeze Now — extend life by weeks in seconds', 'Donate Soon — surplus shelf-stable staples'] },
      { heading: 'Make it measurable', paragraphs: ['Tracking impact turns a chore into a game. Pantry Plus estimates the money saved, food waste avoided, and even CO₂ reduced — so you can see the difference week to week.'] },
      { heading: 'Let the AI do the remembering', paragraphs: ['The Food Waste Coach watches your expiry dates and turns them into tonight’s dinner suggestions automatically. You cook; it keeps score.'] },
    ],
  },
  {
    slug: 'ai-meal-planning-for-families',
    title: 'AI Meal Planning for Families: End the “What’s for Dinner?” Spiral',
    excerpt: 'A practical guide to planning a week of meals that fit your budget, your fridge, and everyone’s tastes — in minutes.',
    date: '2026-05-10',
    readingMinutes: 7,
    category: 'Meal Planning',
    emoji: '🍽️',
    author: 'Pantry Plus Team',
    keywords: ['AI meal planner', 'family meal planning', 'recipe planning app'],
    body: [
      { paragraphs: ['Meal planning fails when it ignores reality: the food you already own, the budget you actually have, and the fact that one kid won’t touch broccoli. Good AI planning starts from those constraints.'] },
      { heading: 'Plan from what you have', paragraphs: ['Start with inventory, not recipes. When the plan reuses what’s already in your kitchen, you waste less and spend less automatically.'] },
      { heading: 'Personalize to the household', paragraphs: ['Family Taste Memory remembers allergies, diets and dislikes, so the plan is one everyone will actually eat — and it explains its choices.'] },
      { heading: 'Auto-build the shopping list', paragraphs: ['Once the plan is set, the only thing left is buying what you’re missing. Pantry Plus generates that list for you and keeps it in sync across the household.'] },
    ],
  },
  {
    slug: 'grocery-budgeting-tips-for-students',
    title: 'Grocery Budgeting Tips for Students: Eat Well on $25 a Week',
    excerpt: 'Realistic, no-nonsense tactics to stretch a tiny grocery budget across a full week — plus a “survival mode” that does the math for you.',
    date: '2026-05-18',
    readingMinutes: 5,
    category: 'Budgeting',
    emoji: '💸',
    author: 'Pantry Plus Team',
    keywords: ['grocery budget app', 'student meal budget', 'cheap meal plan'],
    body: [
      { paragraphs: ['Tight budgets reward planning more than anything else. A few cheap, versatile staples can carry a whole week if you build meals around them.'] },
      { heading: 'Anchor on cheap staples', paragraphs: ['Rice, lentils, eggs, potatoes and seasonal veg are the backbone of low-cost, filling meals. Buy these first.'], bullets: ['Cook once, eat twice — plan leftovers on purpose', 'Buy smaller quantities of perishables you tend to waste', 'Track which meals actually cost the least'] },
      { heading: 'Let Budget Survival Mode do the math', paragraphs: ['Tell Pantry Plus “I have $25 and these ingredients — feed me for 5 days” and it returns a meal plan, a cooking schedule, a shopping list, and an estimated cost.'] },
    ],
  },
  {
    slug: 'pantry-inventory-management',
    title: 'Pantry Inventory Management: The Foundation of a Smart Kitchen',
    excerpt: 'Why knowing exactly what you own is the highest-leverage habit in your kitchen — and how to make it effortless.',
    date: '2026-05-25',
    readingMinutes: 6,
    category: 'Inventory',
    emoji: '📦',
    author: 'Pantry Plus Team',
    keywords: ['kitchen inventory app', 'pantry management app', 'pantry inventory'],
    body: [
      { paragraphs: ['Every smart-kitchen feature — meal planning, waste reduction, budgeting — depends on one thing: an accurate picture of what you have. Get inventory right and everything else gets easier.'] },
      { heading: 'Make capture frictionless', paragraphs: ['Manual entry is where inventory apps die. Scan receipts, barcodes, or a photo of your shelf so adding items takes seconds, not minutes.'] },
      { heading: 'Track expiry, not just quantity', paragraphs: ['Knowing you have yogurt is useful; knowing it expires in two days is powerful. Expiry-aware inventory is what unlocks waste reduction.'] },
      { heading: 'Keep it in sync', paragraphs: ['In a household, inventory has to be shared. An offline-first, synced inventory means everyone sees the same truth — even without signal at the store.'] },
    ],
  },
  {
    slug: 'offline-first-apps-for-households',
    title: 'Why Offline-First Matters for Everyday Household Apps',
    excerpt: 'Kitchens, stores and basements have bad signal. Here’s why an offline-first PWA is the right architecture for a household app.',
    date: '2026-06-01',
    readingMinutes: 5,
    category: 'Technology',
    emoji: '📴',
    author: 'Pantry Plus Team',
    keywords: ['offline-first PWA', 'household management app', 'progressive web app'],
    body: [
      { paragraphs: ['The places we use kitchen apps — the back of the fridge, a basement freezer, a crowded grocery aisle — are exactly where connectivity is worst. An app that stalls without signal is an app you stop using.'] },
      { heading: 'Local-first, then sync', paragraphs: ['Offline-first means every action saves instantly on your device, then syncs to the cloud when you reconnect. The interface never waits on the network.'] },
      { heading: 'Installable, like a real app', paragraphs: ['As a PWA, Pantry Plus installs on phones and desktops, launches full-screen, and works offline — without app-store friction.'] },
      { heading: 'Reliable sync across the family', paragraphs: ['A last-write-wins sync engine reconciles changes from multiple people and devices, so the household’s data stays consistent.'] },
    ],
  },
];

export function getAllPosts(): BlogPost[] {
  return [...blogPosts].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
