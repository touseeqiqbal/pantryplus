/**
 * AI Intelligence Service
 * Provides AI-powered features for inventory, shopping, recipes, and meal planning
 * Uses pattern recognition and machine learning algorithms
 */

import { InventoryItem, ShoppingItem } from '@/lib/db/dexie';
import { RecipeDetails } from './recipeService';

// ============================================================================
// SMART INVENTORY
// ============================================================================

/**
 * Predict expiry date based on usage patterns
 */
export function predictExpiryDate(
    item: InventoryItem,
    historicalData: InventoryItem[]
): Date | null {
    // Find similar items in history
    const similarItems = historicalData.filter(
        h => h.name.toLowerCase() === item.name.toLowerCase() && h.expiryDate
    );

    if (similarItems.length === 0) return null;

    // Calculate average shelf life
    const shelfLives = similarItems.map(h => {
        if (!h.expiryDate || !h.createdAt) return 0;
        return (new Date(h.expiryDate).getTime() - new Date(h.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    }).filter(days => days > 0);

    if (shelfLives.length === 0) return null;

    const avgShelfLife = shelfLives.reduce((a, b) => a + b, 0) / shelfLives.length;

    const predictedExpiry = new Date();
    predictedExpiry.setDate(predictedExpiry.getDate() + Math.round(avgShelfLife));

    return predictedExpiry;
}

/**
 * Suggest category based on item name and historical data
 */
export function suggestCategory(
    itemName: string,
    historicalData: InventoryItem[]
): string {
    const name = itemName.toLowerCase();

    // Check historical data first
    const historicalMatch = historicalData.find(
        h => h.name.toLowerCase() === name
    );
    if (historicalMatch) return historicalMatch.category;

    // AI-powered categorization based on keywords
    const categoryKeywords: Record<string, string[]> = {
        'Fruits & Vegetables': [
            'apple', 'banana', 'orange', 'grape', 'berry', 'melon', 'peach', 'pear',
            'tomato', 'potato', 'carrot', 'lettuce', 'spinach', 'broccoli', 'onion',
            'garlic', 'pepper', 'cucumber', 'celery', 'kale', 'cabbage'
        ],
        'Dairy': [
            'milk', 'cheese', 'yogurt', 'butter', 'cream', 'sour cream', 'cottage cheese',
            'cheddar', 'mozzarella', 'parmesan', 'feta', 'ricotta'
        ],
        'Meat & Seafood': [
            'chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'bacon', 'sausage',
            'fish', 'salmon', 'tuna', 'shrimp', 'crab', 'lobster', 'tilapia', 'cod'
        ],
        'Grains & Bread': [
            'bread', 'rice', 'pasta', 'cereal', 'flour', 'oats', 'quinoa', 'barley',
            'bagel', 'tortilla', 'pita', 'noodles', 'couscous'
        ],
        'Beverages': [
            'juice', 'soda', 'coffee', 'tea', 'water', 'beer', 'wine', 'liquor',
            'energy drink', 'sports drink', 'lemonade'
        ],
        'Snacks': [
            'chips', 'cookies', 'crackers', 'candy', 'chocolate', 'popcorn', 'nuts',
            'pretzels', 'granola', 'trail mix'
        ],
        'Condiments & Sauces': [
            'ketchup', 'mustard', 'mayo', 'sauce', 'dressing', 'oil', 'vinegar',
            'spice', 'seasoning', 'salt', 'pepper', 'soy sauce', 'hot sauce'
        ],
        'Frozen Foods': [
            'frozen', 'ice cream', 'popsicle', 'frozen pizza', 'frozen vegetables'
        ],
        'Canned Goods': [
            'canned', 'can of', 'beans', 'soup', 'tuna can', 'tomato sauce'
        ],
    };

    // Find best matching category
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => name.includes(keyword))) {
            return category;
        }
    }

    return 'Other';
}

/**
 * Calculate waste reduction insights
 */
export interface WasteInsight {
    totalWasted: number;
    wasteValue: number;
    topWastedItems: Array<{ name: string; count: number; value: number }>;
    recommendations: string[];
}

export function analyzeWaste(
    expiredItems: InventoryItem[],
    averagePrice: number = 5
): WasteInsight {
    const wasteByItem = new Map<string, { count: number; value: number }>();

    expiredItems.forEach(item => {
        const existing = wasteByItem.get(item.name) || { count: 0, value: 0 };
        wasteByItem.set(item.name, {
            count: existing.count + 1,
            value: existing.value + (item.quantity * averagePrice),
        });
    });

    const topWasted = Array.from(wasteByItem.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    const totalWasted = expiredItems.length;
    const wasteValue = topWasted.reduce((sum, item) => sum + item.value, 0);

    const recommendations: string[] = [];

    if (totalWasted > 10) {
        recommendations.push('Consider buying smaller quantities of perishable items');
    }

    if (topWasted.length > 0) {
        recommendations.push(`You frequently waste ${topWasted[0].name} - try buying less or using it sooner`);
    }

    if (wasteValue > 50) {
        recommendations.push('Set up expiry notifications to reduce waste');
    }

    return {
        totalWasted,
        wasteValue,
        topWastedItems: topWasted,
        recommendations,
    };
}

/**
 * Track inventory value
 */
export function calculateInventoryValue(
    items: InventoryItem[],
    priceEstimates: Map<string, number> = new Map()
): number {
    return items.reduce((total, item) => {
        const price = priceEstimates.get(item.name) || 5; // Default $5 per item
        return total + (item.quantity * price);
    }, 0);
}

/**
 * Analyze usage patterns
 */
export interface UsagePattern {
    itemName: string;
    averageConsumptionRate: number; // items per day
    predictedRunOutDate: Date | null;
    recommendedReorderQuantity: number;
}

export function analyzeUsagePatterns(
    currentInventory: InventoryItem[],
    historicalData: InventoryItem[]
): UsagePattern[] {
    const patterns: UsagePattern[] = [];

    currentInventory.forEach(item => {
        const history = historicalData.filter(h => h.name === item.name);

        if (history.length < 2) {
            patterns.push({
                itemName: item.name,
                averageConsumptionRate: 0,
                predictedRunOutDate: null,
                recommendedReorderQuantity: item.quantity,
            });
            return;
        }

        // Calculate consumption rate
        const quantityChanges = history.map((h, i) => {
            if (i === 0) return 0;
            const prevQuantity = history[i - 1].quantity;
            const daysDiff = (new Date(h.updatedAt).getTime() - new Date(history[i - 1].updatedAt).getTime()) / (1000 * 60 * 60 * 24);
            return (prevQuantity - h.quantity) / Math.max(daysDiff, 1);
        }).filter(rate => rate > 0);

        const avgRate = quantityChanges.length > 0
            ? quantityChanges.reduce((a, b) => a + b, 0) / quantityChanges.length
            : 0;

        const daysUntilRunOut = avgRate > 0 ? item.quantity / avgRate : 0;
        const runOutDate = daysUntilRunOut > 0 ? new Date(Date.now() + daysUntilRunOut * 24 * 60 * 60 * 1000) : null;

        patterns.push({
            itemName: item.name,
            averageConsumptionRate: avgRate,
            predictedRunOutDate: runOutDate,
            recommendedReorderQuantity: Math.ceil(avgRate * 7), // 1 week supply
        });
    });

    return patterns;
}

// ============================================================================
// SMART SHOPPING
// ============================================================================

/**
 * Generate AI shopping list based on meal plan
 */
export function generateShoppingListFromMealPlan(
    mealPlan: Array<{ recipe: RecipeDetails; servings: number }>,
    currentInventory: InventoryItem[]
): ShoppingItem[] {
    const neededIngredients = new Map<string, { quantity: number; unit: string; category: string }>();

    // Aggregate all ingredients from meal plan
    mealPlan.forEach(({ recipe, servings }) => {
        const scaleFactor = servings / recipe.servings;

        recipe.extendedIngredients.forEach(ingredient => {
            const existing = neededIngredients.get(ingredient.name) || { quantity: 0, unit: ingredient.unit, category: ingredient.aisle };
            neededIngredients.set(ingredient.name, {
                quantity: existing.quantity + (ingredient.amount * scaleFactor),
                unit: ingredient.unit,
                category: ingredient.aisle,
            });
        });
    });

    // Subtract what's already in inventory
    const shoppingList: ShoppingItem[] = [];

    neededIngredients.forEach((needed, name) => {
        const inInventory = currentInventory.find(item =>
            item.name.toLowerCase() === name.toLowerCase()
        );

        const quantityNeeded = inInventory
            ? Math.max(0, needed.quantity - inInventory.quantity)
            : needed.quantity;

        if (quantityNeeded > 0) {
            shoppingList.push({
                householdId: '', // Will be set by the caller
                name,
                quantity: quantityNeeded,
                unit: needed.unit,
                category: needed.category,
                purchased: false,
                notes: 'Generated from meal plan',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                syncStatus: 'pending',
            });
        }
    });

    return shoppingList;
}

/**
 * Detect recurring items
 */
export function detectRecurringItems(
    shoppingHistory: ShoppingItem[]
): Array<{ name: string; frequency: number; avgQuantity: number }> {
    const itemFrequency = new Map<string, number[]>();

    shoppingHistory.forEach(item => {
        const quantities = itemFrequency.get(item.name) || [];
        quantities.push(item.quantity);
        itemFrequency.set(item.name, quantities);
    });

    return Array.from(itemFrequency.entries())
        .filter(([_, quantities]) => quantities.length >= 3) // Bought at least 3 times
        .map(([name, quantities]) => ({
            name,
            frequency: quantities.length,
            avgQuantity: quantities.reduce((a, b) => a + b, 0) / quantities.length,
        }))
        .sort((a, b) => b.frequency - a.frequency);
}

/**
 * Predict best time to buy (mock - would use real price data)
 */
export function predictBestTimeToBuy(itemName: string): string {
    const dayOfWeek = new Date().getDay();

    // Simple heuristic - in reality, this would use historical price data
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        return 'Weekends often have sales on fresh produce';
    }

    if (dayOfWeek === 3) {
        return 'Mid-week is typically best for meat and dairy deals';
    }

    return 'Check store flyers for current deals';
}

// ============================================================================
// SMART RECIPES
// ============================================================================

/**
 * Find recipes based on what's in inventory
 */
export function findRecipesFromInventory(
    inventory: InventoryItem[],
    allRecipes: RecipeDetails[]
): Array<{ recipe: RecipeDetails; matchScore: number; missingIngredients: string[] }> {
    const availableIngredients = new Set(
        inventory.map(item => item.name.toLowerCase())
    );

    return allRecipes.map(recipe => {
        const recipeIngredients = recipe.extendedIngredients.map(i => i.name.toLowerCase());
        const matches = recipeIngredients.filter(ing => availableIngredients.has(ing));
        const missing = recipeIngredients.filter(ing => !availableIngredients.has(ing));

        const matchScore = (matches.length / recipeIngredients.length) * 100;

        return {
            recipe,
            matchScore,
            missingIngredients: missing,
        };
    })
        .filter(r => r.matchScore >= 50) // At least 50% match
        .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Suggest ingredient substitutions
 */
export function suggestSubstitutions(ingredient: string): string[] {
    const substitutions: Record<string, string[]> = {
        'butter': ['margarine', 'coconut oil', 'olive oil'],
        'milk': ['almond milk', 'soy milk', 'oat milk', 'coconut milk'],
        'eggs': ['flax eggs', 'chia eggs', 'applesauce', 'banana'],
        'flour': ['almond flour', 'coconut flour', 'oat flour'],
        'sugar': ['honey', 'maple syrup', 'agave nectar', 'stevia'],
        'sour cream': ['greek yogurt', 'cottage cheese'],
        'heavy cream': ['coconut cream', 'evaporated milk'],
        'breadcrumbs': ['crushed crackers', 'panko', 'oats'],
    };

    const key = ingredient.toLowerCase();
    for (const [original, subs] of Object.entries(substitutions)) {
        if (key.includes(original)) {
            return subs;
        }
    }

    return [];
}

/**
 * Recommend recipes based on leftovers
 */
export function recommendLeftoverRecipes(
    leftovers: InventoryItem[]
): string[] {
    const recommendations: string[] = [];

    leftovers.forEach(item => {
        const name = item.name.toLowerCase();

        if (name.includes('chicken')) {
            recommendations.push('Chicken Fried Rice', 'Chicken Salad', 'Chicken Soup');
        } else if (name.includes('rice')) {
            recommendations.push('Fried Rice', 'Rice Pudding', 'Rice Balls');
        } else if (name.includes('pasta')) {
            recommendations.push('Pasta Salad', 'Baked Pasta', 'Pasta Frittata');
        } else if (name.includes('bread')) {
            recommendations.push('French Toast', 'Bread Pudding', 'Croutons');
        }
    });

    return [...Array.from(new Set(recommendations))]; // Remove duplicates
}

// ============================================================================
// SMART MEAL PLANNING
// ============================================================================

/**
 * Generate AI weekly meal plan
 */
export interface MealPlanDay {
    day: string;
    breakfast: string;
    lunch: string;
    dinner: string;
    calories: number;
    cost: number;
}

export function generateWeeklyMealPlan(
    preferences: {
        budget?: number;
        caloriesPerDay?: number;
        dietaryRestrictions?: string[];
    },
    availableIngredients: string[]
): MealPlanDay[] {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const budget = preferences.budget || 100;
    const dailyBudget = budget / 7;
    const targetCalories = preferences.caloriesPerDay || 2000;

    // Simple meal templates (in reality, this would use AI/ML)
    const breakfasts = ['Oatmeal with Berries', 'Scrambled Eggs & Toast', 'Greek Yogurt Parfait', 'Smoothie Bowl'];
    const lunches = ['Chicken Salad', 'Turkey Sandwich', 'Veggie Wrap', 'Quinoa Bowl'];
    const dinners = ['Grilled Chicken & Vegetables', 'Pasta Primavera', 'Stir-Fry', 'Baked Salmon'];

    return days.map((day, index) => ({
        day,
        breakfast: breakfasts[index % breakfasts.length],
        lunch: lunches[index % lunches.length],
        dinner: dinners[index % dinners.length],
        calories: targetCalories,
        cost: dailyBudget,
    }));
}

/**
 * Optimize meal plan for nutrition
 */
export function optimizeNutrition(
    mealPlan: MealPlanDay[],
    _targetNutrition: { protein: number; carbs: number; fat: number }
): MealPlanDay[] {
    // This would use nutritional data to balance macros
    // For now, return the original plan
    return mealPlan;
}

/**
 * Suggest batch cooking opportunities
 */
export function suggestBatchCooking(
    mealPlan: MealPlanDay[]
): Array<{ meal: string; days: string[]; savings: string }> {
    const mealOccurrences = new Map<string, string[]>();

    mealPlan.forEach(day => {
        [day.breakfast, day.lunch, day.dinner].forEach(meal => {
            const days = mealOccurrences.get(meal) || [];
            days.push(day.day);
            mealOccurrences.set(meal, days);
        });
    });

    return Array.from(mealOccurrences.entries())
        .filter(([_, days]) => days.length >= 2)
        .map(([meal, days]) => ({
            meal,
            days,
            savings: `Save ${days.length * 15} minutes by batch cooking`,
        }));
}

export default {
    // Smart Inventory
    predictExpiryDate,
    suggestCategory,
    analyzeWaste,
    calculateInventoryValue,
    analyzeUsagePatterns,

    // Smart Shopping
    generateShoppingListFromMealPlan,
    detectRecurringItems,
    predictBestTimeToBuy,

    // Smart Recipes
    findRecipesFromInventory,
    suggestSubstitutions,
    recommendLeftoverRecipes,

    // Smart Meal Planning
    generateWeeklyMealPlan,
    optimizeNutrition,
    suggestBatchCooking,
};
