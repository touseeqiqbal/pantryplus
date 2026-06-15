/**
 * Isolated demo / placeholder data for the flagship AI & business feature pages.
 *
 * This keeps mock data OUT of components so it's trivial to replace with real
 * data later. Each export notes how to wire it to live data (inventory hooks,
 * AI API routes, Firestore) via TODO comments.
 *
 * NOTE: nothing here is medical or financial advice — it's illustrative content
 * for demos and the university evaluation.
 */

// ── Kitchen Autopilot ────────────────────────────────────────────────────────
// TODO: replace with output from /api/ AI route fed by useInventory() + budget
//       + family taste profiles + meal history.
export interface AutopilotMeal {
  day: string;
  meal: string;
  usesExpiring: string[];
  estCost: number;
}

export const demoAutopilotPlan: AutopilotMeal[] = [
  { day: 'Mon', meal: 'Chicken & spinach pasta', usesExpiring: ['spinach', 'chicken'], estCost: 3.2 },
  { day: 'Tue', meal: 'Yogurt berry smoothie + eggs', usesExpiring: ['yogurt'], estCost: 1.9 },
  { day: 'Wed', meal: 'Lentil & potato curry with rice', usesExpiring: ['potatoes'], estCost: 2.1 },
  { day: 'Thu', meal: 'Veggie fried rice', usesExpiring: ['rice', 'carrots'], estCost: 1.6 },
  { day: 'Fri', meal: 'Tomato & egg shakshuka', usesExpiring: ['tomatoes', 'eggs'], estCost: 2.4 },
];

export const demoAutopilotSummary = {
  mealsPlanned: 5,
  estWeekCost: 11.2,
  estSavings: 18.5,
  itemsReused: 9,
  shoppingItems: ['Milk', 'Bread', 'Onions', 'Bell peppers'],
};

// ── Food Waste Coach ─────────────────────────────────────────────────────────
// TODO: derive from useInventory() items sorted by expiry date.
export type WasteAction = 'use-today' | 'use-week' | 'freeze' | 'donate';

export interface WasteItem {
  name: string;
  qty: string;
  daysLeft: number;
  action: WasteAction;
  value: number;
  tip: string;
}

export const demoWasteItems: WasteItem[] = [
  { name: 'Spinach', qty: '1 bag', daysLeft: 1, action: 'use-today', value: 2.5, tip: 'Wilt into tonight’s pasta or a smoothie.' },
  { name: 'Yogurt', qty: '500g', daysLeft: 2, action: 'use-today', value: 1.8, tip: 'Blend into a breakfast smoothie tomorrow.' },
  { name: 'Chicken breast', qty: '600g', daysLeft: 2, action: 'freeze', value: 4.1, tip: 'Freeze half today to extend life by weeks.' },
  { name: 'Tomatoes', qty: '4', daysLeft: 3, action: 'use-week', value: 1.2, tip: 'Make shakshuka or a quick sauce.' },
  { name: 'Bread', qty: '½ loaf', daysLeft: 3, action: 'freeze', value: 0.9, tip: 'Freeze slices; toast straight from frozen.' },
  { name: 'Canned beans', qty: '3 cans', daysLeft: 30, action: 'donate', value: 2.4, tip: 'Surplus pantry staples — consider donating.' },
];

export const demoWasteImpact = {
  monthSaved: 42.6,
  wasteAvoidedKg: 6.3,
  co2AvoidedKg: 15.8,
  mealsCreated: 11,
};

export const demoStorageTips = [
  'Store herbs like flowers — stems in water, loosely covered.',
  'Keep potatoes and onions apart; together they spoil faster.',
  'Freeze ripe bananas for smoothies and baking.',
  'Refrigerate bread only if your kitchen is hot/humid; otherwise freeze.',
];

// ── Budget Survival Mode ─────────────────────────────────────────────────────
// TODO: generate via AI route using budget + days + diet + available ingredients.
export interface BudgetMeal {
  day: number;
  breakfast: string;
  lunch: string;
  dinner: string;
}

export const demoBudgetPlan: BudgetMeal[] = [
  { day: 1, breakfast: 'Eggs & toast', lunch: 'Lentil soup', dinner: 'Rice & potato curry' },
  { day: 2, breakfast: 'Yogurt & banana', lunch: 'Leftover curry wrap', dinner: 'Egg fried rice' },
  { day: 3, breakfast: 'Oats', lunch: 'Bean & rice bowl', dinner: 'Veg pasta' },
  { day: 4, breakfast: 'Eggs & toast', lunch: 'Pasta salad', dinner: 'Lentil dal & rice' },
  { day: 5, breakfast: 'Yogurt smoothie', lunch: 'Potato omelette', dinner: 'Fried rice with veg' },
];

export const demoBudgetSummary = {
  budget: 25,
  estCost: 21.4,
  remaining: 3.6,
  days: 5,
  reusedItems: ['rice', 'eggs', 'lentils', 'yogurt', 'potatoes'],
  shoppingList: ['Onions', 'Carrots', 'Bread', 'Milk', 'Bananas'],
};

// ── AI Family Taste Memory ───────────────────────────────────────────────────
// TODO: persist to Firestore under the household; read into AI prompts.
export interface FamilyMember {
  name: string;
  emoji: string;
  likes: string[];
  dislikes: string[];
  allergies: string[];
  diet: string;
}

export const demoFamily: FamilyMember[] = [
  { name: 'Ali', emoji: '🧔', likes: ['Spicy food', 'Rice meals'], dislikes: ['Bland food'], allergies: [], diet: 'High-protein' },
  { name: 'Mom', emoji: '👩', likes: ['Salads', 'Tea'], dislikes: ['Fried food'], allergies: [], diet: 'Low-sugar' },
  { name: 'Dad', emoji: '👨', likes: ['Rice', 'Meat'], dislikes: [], allergies: [], diet: 'No restriction' },
  { name: 'Sara', emoji: '👧', likes: ['Pasta', 'Fruit'], dislikes: ['Broccoli'], allergies: ['Peanuts'], diet: 'Kid-friendly' },
];

export const demoTasteExplanations = [
  'Avoided peanuts because Sara is allergic.',
  'Chose a low-sugar breakfast because Mom prefers it.',
  'Reused rice — your family already has 2kg in inventory.',
  'Added a spicy option for Ali twice this week.',
];

// ── Pantry Score ─────────────────────────────────────────────────────────────
// TODO: compute from real waste, budget, meal-plan completion & inventory data.
export const demoPantryScore = {
  score: 84,
  breakdown: [
    { label: 'Low food waste', value: 90 },
    { label: 'Budget control', value: 82 },
    { label: 'Balanced meals', value: 78 },
    { label: 'Inventory accuracy', value: 88 },
    { label: 'Meal plan completion', value: 80 },
  ],
  badges: [
    { emoji: '♻️', name: 'Waste Warrior' },
    { emoji: '💰', name: 'Budget Master' },
    { emoji: '🥗', name: 'Healthy Planner' },
    { emoji: '🛒', name: 'Smart Shopper' },
  ],
};

// ── Insights ─────────────────────────────────────────────────────────────────
export const demoInsights = {
  wasteSaved: 42.6,
  spendTrend: [120, 98, 110, 86, 92, 78],
  spendMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  topIngredients: ['Rice', 'Eggs', 'Chicken', 'Onions', 'Tomatoes'],
  budgetUsedPct: 68,
  mealPlanCompletionPct: 80,
  recommendations: [
    'You spend 28% of your grocery budget on snacks — try smaller, planned buys.',
    'Rice-based meals saved you the most money last month.',
    'You bought tomatoes 4 times but wasted them twice — buy smaller quantities.',
  ],
};

// ── Business Recipe Costing ──────────────────────────────────────────────────
// TODO: replace with useMenuItems() + useIngredientMapping() real costing.
export interface CostingExample {
  item: string;
  emoji: string;
  ingredientCost: number;
  packaging: number;
  sellingPrice: number;
}

export const demoCosting: CostingExample[] = [
  { item: 'Chicken Biryani', emoji: '🍛', ingredientCost: 2.1, packaging: 0.4, sellingPrice: 5.0 },
  { item: 'Chocolate Cake', emoji: '🍰', ingredientCost: 6.2, packaging: 1.0, sellingPrice: 15.0 },
  { item: 'Veg Tiffin Box', emoji: '🍱', ingredientCost: 1.8, packaging: 0.5, sellingPrice: 4.5 },
];

export function costingMetrics(c: CostingExample) {
  const cost = c.ingredientCost + c.packaging;
  const profit = c.sellingPrice - cost;
  const margin = c.sellingPrice > 0 ? (profit / c.sellingPrice) * 100 : 0;
  return { cost, profit, margin };
}

// ── Emergency Meal Generator ─────────────────────────────────────────────────
export const demoEmergencyMeals = [
  { name: 'Egg fried rice', time: '12 min', tags: ['No-fuss', 'Uses rice'], items: ['Rice', 'Eggs', 'Onion', 'Soy sauce'] },
  { name: 'Cheese omelette', time: '8 min', tags: ['High-protein'], items: ['Eggs', 'Cheese', 'Butter'] },
  { name: 'Yogurt & fruit bowl', time: '3 min', tags: ['No-cook', 'Kids'], items: ['Yogurt', 'Banana', 'Honey'] },
  { name: 'Tuna pasta', time: '15 min', tags: ['Pantry staples'], items: ['Pasta', 'Tuna', 'Olive oil'] },
];

// ── Smart Leftover Mode ──────────────────────────────────────────────────────
export const demoLeftoverIdeas = [
  { from: 'Leftover rice + chicken + veg', into: ['Fried rice', 'Chicken rice bowl', 'Soup', 'Stuffed wraps'] },
  { from: 'Leftover bread', into: ['French toast', 'Croutons', 'Bread pudding'] },
  { from: 'Leftover dal', into: ['Dal paratha', 'Dal soup', 'Spiced dip'] },
];

// ── Business Mode ────────────────────────────────────────────────────────────
// TODO: replace with Firestore-backed business data (useMenuItems, orders, etc.)
export const demoBusinessKpis = {
  revenueMonth: 3240,
  costMonth: 1490,
  ordersMonth: 218,
  avgMargin: 54,
  wasteMonth: 86,
  topItem: 'Chicken Biryani',
};

export interface BusinessIngredient {
  name: string;
  stock: string;
  unitCost: number;
  lowStock: boolean;
  supplier: string;
}

export const demoBusinessIngredients: BusinessIngredient[] = [
  { name: 'Basmati rice', stock: '24 kg', unitCost: 1.4, lowStock: false, supplier: 'Metro Wholesale' },
  { name: 'Chicken', stock: '6 kg', unitCost: 3.2, lowStock: true, supplier: 'Fresh Farms' },
  { name: 'Flour', stock: '18 kg', unitCost: 0.7, lowStock: false, supplier: 'Metro Wholesale' },
  { name: 'Cooking oil', stock: '4 L', unitCost: 2.1, lowStock: true, supplier: 'Daily Mart' },
  { name: 'Cocoa powder', stock: '2 kg', unitCost: 6.5, lowStock: false, supplier: 'Bake Supply Co' },
];

export interface BusinessOrder {
  id: string;
  customer: string;
  item: string;
  qty: number;
  total: number;
  status: 'new' | 'preparing' | 'ready' | 'delivered';
}

export const demoBusinessOrders: BusinessOrder[] = [
  { id: '#1042', customer: 'Ayesha', item: 'Chicken Biryani', qty: 4, total: 20, status: 'new' },
  { id: '#1041', customer: 'Bilal', item: 'Chocolate Cake', qty: 1, total: 15, status: 'preparing' },
  { id: '#1040', customer: 'Café Order', item: 'Veg Tiffin Box', qty: 10, total: 45, status: 'ready' },
  { id: '#1039', customer: 'Sara', item: 'Chicken Biryani', qty: 2, total: 10, status: 'delivered' },
];

export interface Supplier {
  name: string;
  category: string;
  contact: string;
  rating: number;
}

export const demoSuppliers: Supplier[] = [
  { name: 'Metro Wholesale', category: 'Grains & flour', contact: 'orders@metro.example', rating: 4.6 },
  { name: 'Fresh Farms', category: 'Meat & poultry', contact: '+1 555 0100', rating: 4.8 },
  { name: 'Daily Mart', category: 'Oil & staples', contact: 'daily@mart.example', rating: 4.2 },
  { name: 'Bake Supply Co', category: 'Baking', contact: 'hello@bakesupply.example', rating: 4.9 },
];
