/**
 * Marketing site content (single source of truth).
 *
 * All public-facing copy lives here as typed data so the marketing components
 * stay presentational and the messaging stays consistent. Positioning:
 * "Pantry Plus — the AI Kitchen Operating System."
 */

export interface FlagshipFeature {
  id: string;
  emoji: string;
  name: string;
  tagline: string;
  description: string;
  bullets: string[];
  href: string;
  gradient: string;
}

/** The 7 flagship features that make Pantry Plus an AI Kitchen OS. */
export const flagshipFeatures: FlagshipFeature[] = [
  {
    id: 'autopilot',
    emoji: '🧭',
    name: 'Kitchen Autopilot',
    tagline: 'Your kitchen, on autopilot',
    description:
      'Combines inventory, expiry dates, budget, family preferences and meal history to automatically answer: what to cook, what expires soon, what to buy, and how much you can save this week.',
    bullets: [
      'Auto-generated weekly meal plan',
      'Smart shopping list for only what you’re missing',
      'Waste-reduction suggestions with money saved',
    ],
    href: '/autopilot',
    gradient: 'from-indigo-500 to-purple-600',
  },
  {
    id: 'waste-coach',
    emoji: '♻️',
    name: 'Food Waste Coach',
    tagline: 'Use it before you lose it',
    description:
      'A "Use Before Waste" engine that tells you what to use first, freeze, or donate — with measurable impact: money saved, food waste avoided, and CO₂ reduced.',
    bullets: [
      'Use First Today / This Week / Freeze Now',
      'AI recipes from your expiring ingredients',
      'Monthly waste & savings estimate',
    ],
    href: '/waste-coach',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'budget-survival',
    emoji: '💸',
    name: 'Budget Survival Mode',
    tagline: '“I have $20. Feed me for 5 days.”',
    description:
      'Built for students and tight weeks. Enter your budget and ingredients and get a cheap, realistic meal plan, cooking schedule, shopping list, and leftover reuse plan.',
    bullets: [
      'Cost-optimized meal plan for your budget',
      'Reuses what you already own first',
      'Cultural & dietary meal intelligence',
    ],
    href: '/budget-planner',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    id: 'taste-memory',
    emoji: '🧠',
    name: 'AI Family Taste Memory',
    tagline: 'Knows what your family actually eats',
    description:
      'Learns each person’s likes, dislikes, allergies and diet goals — then personalizes every suggestion. “Avoided peanuts because Sara is allergic. Chose low-sugar because Mom prefers it.”',
    bullets: [
      'Per-person preferences & allergies',
      'Diet goals (low-sugar, high-protein, halal, vegan…)',
      'Explanations for every recommendation',
    ],
    href: '/family',
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    id: 'scan',
    emoji: '🧾',
    name: 'Smart Receipt-to-Inventory',
    tagline: 'Snap a receipt, stock your pantry',
    description:
      'Scan receipts, barcodes, or a photo of your shelf and Pantry Plus turns them into inventory automatically — and learns your grocery spending over time.',
    bullets: [
      'Receipt → itemized inventory in seconds',
      'Barcode & pantry-shelf photo scanning',
      'Grocery Bill Optimizer insights',
    ],
    href: '/scan',
    gradient: 'from-sky-500 to-blue-600',
  },
  {
    id: 'business-costing',
    emoji: '📊',
    name: 'Business Recipe Costing',
    tagline: 'Know the profit in every plate',
    description:
      'A co-pilot for home bakers, tiffin services, cafés and cloud kitchens: recipe costing, profit margins, prep checklists, stock deduction and supplier tracking.',
    bullets: [
      'Cost per serving & profit margin',
      'Ingredient stock deduction on sales',
      'Prep checklists & supplier list',
    ],
    href: '/business',
    gradient: 'from-violet-500 to-fuchsia-600',
  },
  {
    id: 'pantry-score',
    emoji: '🏆',
    name: 'Pantry Score',
    tagline: 'Make good habits stick',
    description:
      'Gamifies your kitchen with a household score based on low waste, budget control, balanced meals and meal-plan completion — plus badges like Waste Warrior and Budget Master.',
    bullets: [
      'A single 0–100 household score',
      'Badges & weekly streaks',
      'Habit-forming, family-friendly',
    ],
    href: '/insights',
    gradient: 'from-cyan-500 to-emerald-600',
  },
];

export interface ModuleFeature {
  emoji: string;
  title: string;
  description: string;
}

/** Full module list for the Features page. */
export const moduleFeatures: ModuleFeature[] = [
  { emoji: '📊', title: 'Dashboard', description: 'A live overview of inventory, expiring items, budget and meal plan in one glance.' },
  { emoji: '📦', title: 'Inventory', description: 'Track pantry, fridge and freezer items with quantities, units and locations.' },
  { emoji: '⏰', title: 'Expiry Tracking', description: 'Get ahead of spoilage with smart expiry alerts and use-first ordering.' },
  { emoji: '📷', title: 'Barcode & Photo Scanning', description: 'Add items by barcode, receipt, or a photo of your shelf.' },
  { emoji: '🛒', title: 'Shopping Lists', description: 'Auto-built lists for only what you’re missing, synced across devices.' },
  { emoji: '🍽️', title: 'Meal Planner', description: 'Plan the week around what you own, your budget and your family’s tastes.' },
  { emoji: '📖', title: 'Recipes & Substitutions', description: 'Find recipes from your ingredients and get smart substitution help.' },
  { emoji: '✅', title: 'Tasks', description: 'Coordinate kitchen chores and shopping across the household.' },
  { emoji: '💰', title: 'Expenses & Budgets', description: 'Track grocery spending, set budgets, and scan receipts automatically.' },
  { emoji: '👨‍👩‍👧', title: 'Household Sharing', description: 'Invite family members with roles and shared inventory, meals and tasks.' },
  { emoji: '🤖', title: 'AI Assistant', description: 'The “Living Kitchen Brain” answers what to cook, buy and save.' },
  { emoji: '♻️', title: 'Food Waste Coach', description: 'Use-before-waste guidance with measurable money and CO₂ impact.' },
  { emoji: '🏪', title: 'Business Mode', description: 'Recipe costing, profit margins, prep and suppliers for small food businesses.' },
  { emoji: '📴', title: 'Offline PWA', description: 'Installable, fast, and fully usable offline — syncs when you reconnect.' },
];

export const problems = [
  { emoji: '🗑️', title: 'Food gets wasted', text: 'Households throw away ~⅓ of the food they buy because items are forgotten until they expire.' },
  { emoji: '💸', title: 'Groceries cost too much', text: 'Without visibility, people overbuy, double-buy, and overspend every single week.' },
  { emoji: '😵', title: 'Meal decisions are exhausting', text: '“What’s for dinner?” every day, with no plan that fits the budget or what’s in the fridge.' },
  { emoji: '🤝', title: 'Households fall out of sync', text: 'Inventory, shopping and tasks live in people’s heads — not in one shared place.' },
];

export const solutions = [
  { emoji: '🧭', title: 'Automate the decisions', text: 'Kitchen Autopilot plans meals, builds shopping lists and flags savings automatically.' },
  { emoji: '♻️', title: 'Turn waste into meals', text: 'The Waste Coach turns expiring food into tonight’s dinner — and shows the money saved.' },
  { emoji: '🧠', title: 'Make it personal', text: 'Family Taste Memory tailors every suggestion to allergies, diets and what people actually like.' },
  { emoji: '📴', title: 'Works anywhere', text: 'Offline-first PWA: your kitchen in your pocket, online or off, on any device.' },
];

export interface PricingTier {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
  badge?: string;
}

export const pricingTiers: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'For individuals getting their kitchen organized.',
    features: [
      'Inventory & expiry tracking',
      'Shopping lists & basic meal planner',
      'Offline PWA on all devices',
      'Up to 1 household',
      'Limited AI assistant',
    ],
    cta: 'Get Started',
    ctaHref: '/auth/signup',
  },
  {
    name: 'Pro',
    price: '$5',
    period: '/month',
    description: 'For families who want the AI to run the kitchen.',
    features: [
      'Everything in Free',
      'Kitchen Autopilot & Waste Coach',
      'Budget Survival Mode & Taste Memory',
      'Receipt scanning & Bill Optimizer',
      'Unlimited household members',
      'Pantry Score & insights',
    ],
    cta: 'Coming Soon',
    ctaHref: '/contact',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Business',
    price: '$19',
    period: '/month',
    description: 'For home bakers, tiffin services & cloud kitchens.',
    features: [
      'Everything in Pro',
      'Recipe costing & profit margins',
      'Ingredient stock deduction',
      'Prep checklists & order tracking',
      'Supplier management',
      'Menu profitability analytics',
    ],
    cta: 'Coming Soon',
    ctaHref: '/contact',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For multi-location operators & integrations.',
    features: [
      'Everything in Business',
      'Multi-location support',
      'Priority AI limits',
      'Custom integrations & API',
      'Dedicated support & SLA',
    ],
    cta: 'Contact Us',
    ctaHref: '/contact',
  },
];

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  emoji: string;
}

export const testimonials: Testimonial[] = [
  { quote: 'I had $25 left for the week. Pantry Plus planned 5 days of meals from what I already had and a tiny shopping list. Genuinely saved me.', name: 'Ayesha K.', role: 'University student', emoji: '🎓' },
  { quote: 'We cut our food waste in half. The Waste Coach literally tells us what to cook tonight before it goes off.', name: 'The Rahman Family', role: 'Household of 5', emoji: '👨‍👩‍👧‍👦' },
  { quote: 'For my home baking business, the costing tool finally showed me which cakes actually make a profit.', name: 'Maria S.', role: 'Home baker', emoji: '🧁' },
];

export const impactStats = [
  { value: 'Up to 40%', label: 'Less food waste' },
  { value: '$1,200+', label: 'Saved per family / year' },
  { value: '100%', label: 'Works offline' },
  { value: '7', label: 'Flagship AI features' },
];

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

export const faqs: FAQItem[] = [
  { category: 'Offline', question: 'Does Pantry Plus work offline?', answer: 'Yes. Pantry Plus is offline-first — it stores your data locally (IndexedDB) so the whole app works without internet. When you reconnect, it automatically syncs to the cloud.' },
  { category: 'AI', question: 'What can the AI actually do?', answer: 'The AI plans meals around your inventory and budget, finds recipes for expiring food, generates shopping lists, suggests substitutions, and personalizes everything to your family’s tastes and allergies.' },
  { category: 'Privacy', question: 'Is my data private?', answer: 'Your kitchen data is tied to your account and household. We don’t sell your data. AI requests are processed to generate suggestions only. You can delete all your data at any time from Settings.' },
  { category: 'Household', question: 'Can my family share one kitchen?', answer: 'Yes. Invite family members to a shared household with roles. Inventory, meals, shopping and tasks stay in sync for everyone.' },
  { category: 'Business', question: 'Who is Business Mode for?', answer: 'Home bakers, tiffin services, small cafés, cloud kitchens and meal-prep sellers. It adds recipe costing, profit margins, prep checklists, stock deduction and supplier tracking.' },
  { category: 'Scanning', question: 'How does receipt scanning work?', answer: 'Snap a photo of your grocery receipt and AI extracts the items, quantities and prices, then adds them to your inventory and expense log — no manual typing.' },
  { category: 'Sync', question: 'How does sync work across devices?', answer: 'Changes save instantly on-device, then sync to the cloud using a last-write-wins engine. Open the app on your phone and laptop and everything stays consistent.' },
  { category: 'Pricing', question: 'Is it free?', answer: 'Yes — the core app is free forever. Pro and Business plans (with Autopilot, Waste Coach, costing and more) are coming soon. Contact us for early access.' },
];

export interface TeamMember {
  name: string;
  role: string;
  emoji: string;
  bio: string;
}

export const team: TeamMember[] = [
  { name: 'Project Lead', role: 'Product & Architecture', emoji: '🧑‍💼', bio: 'Owns the product vision, system architecture and final-year project delivery.' },
  { name: 'Frontend Developer', role: 'UI/UX & PWA', emoji: '🎨', bio: 'Builds the responsive, offline-first interface with Next.js, Tailwind and framer-motion.' },
  { name: 'Backend Developer', role: 'Firebase & Sync', emoji: '🛠️', bio: 'Designs the Firestore data model, security rules and the offline sync engine.' },
  { name: 'AI/ML Developer', role: 'Gemini & Intelligence', emoji: '🤖', bio: 'Builds the AI features — autopilot, waste coach, taste memory and receipt scanning.' },
  { name: 'Documentation & QA', role: 'Quality & Docs', emoji: '📝', bio: 'Owns testing, accessibility, documentation and university evaluation materials.' },
];

export interface RoadmapPhase {
  phase: string;
  title: string;
  status: 'done' | 'in-progress' | 'planned';
  items: string[];
}

export const roadmap: RoadmapPhase[] = [
  { phase: 'Phase 1', title: 'MVP — University Demo', status: 'done', items: ['Inventory & expiry alerts', 'AI assistant & meal planner', 'Shopping list & receipt scanner', 'Offline sync', 'Business costing demo'] },
  { phase: 'Phase 2', title: 'AI Expansion', status: 'in-progress', items: ['Kitchen Autopilot', 'Food Waste Coach', 'Budget Survival Mode', 'Family Taste Memory', 'Pantry Score'] },
  { phase: 'Phase 3', title: 'Business Mode', status: 'planned', items: ['Full recipe costing & margins', 'Stock deduction on orders', 'Supplier management', 'Menu profitability analytics'] },
  { phase: 'Phase 4', title: 'Mobile Optimization', status: 'planned', items: ['PWA polish & onboarding', 'Push notifications', 'QR/NFC pantry labels', 'Voice assistant expansion'] },
  { phase: 'Phase 5', title: 'Monetization', status: 'planned', items: ['Stripe payments', 'Pro & Business plans', 'Usage-based AI limits', 'Team/household billing'] },
  { phase: 'Phase 6', title: 'Enterprise', status: 'planned', items: ['Multi-location support', 'Public API & integrations', 'Smart-fridge / IoT', 'Advanced nutrition analysis'] },
];

/** Quick capability lines for the AI assistant preview section. */
export const aiPreviewPrompts = [
  'What can I cook tonight with what I have?',
  'What’s expiring this week?',
  'Plan 5 days of meals under $20.',
  'I’m out of cream — what can I substitute?',
  'Make a low-sugar plan; Mom is diabetic.',
  'Calculate the profit margin on my biryani.',
];
