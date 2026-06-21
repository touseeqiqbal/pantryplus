'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useInventory } from '@/lib/hooks/useInventory';
import { useShopping } from '@/lib/hooks/useShopping';
import { useMeals } from '@/lib/hooks/useMeals';
import { useExpenses } from '@/lib/hooks/useExpenses';
import { useHousehold } from '@/lib/hooks/useHousehold';
import {
    analyzeWaste,
    calculateInventoryValue,
    analyzeUsagePatterns,
    detectRecurringItems,
    generateWeeklyMealPlan,
    suggestBatchCooking,
    WasteInsight,
    UsagePattern,
    MealPlanDay,
} from '@/lib/services/aiService';
import {
    SparklesIcon,
    ChartBarIcon,
    LightBulbIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    CalendarIcon,
    ShoppingCartIcon,
    CurrencyDollarIcon,
    HeartIcon,
    ExclamationCircleIcon,
    ArrowPathRoundedSquareIcon,
    CheckCircleIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import PredictiveDecayAnalyzer from './PredictiveDecayAnalyzer';
import { useCountry } from '@/lib/hooks/useCountry';

export default function AIInsightsDashboard() {
    const router = useRouter();
    const { formatPrice } = useCountry();
    const { items: inventoryItems } = useInventory();
    const { items: shoppingItems, addItem: addShoppingItem } = useShopping();
    const { meals } = useMeals();
    const { expenses } = useExpenses();
    const { currentHousehold } = useHousehold();

    const [wasteInsights, setWasteInsights] = useState<WasteInsight | null>(null);
    const [usagePatterns, setUsagePatterns] = useState<UsagePattern[]>([]);
    const [recurringItems, setRecurringItems] = useState<Array<{ name: string; frequency: number; avgQuantity?: number }>>([]);
    const [reordered, setReordered] = useState<Record<string, boolean>>({});

    const handleAutoReorder = async (name: string, quantity: number) => {
        try {
            await addShoppingItem({
                name,
                quantity: Math.max(1, Math.round(quantity || 1)),
                unit: 'pcs',
                purchased: false,
                notes: 'Auto-reorder (recurring item)',
            });
            setReordered(prev => ({ ...prev, [name]: true }));
        } catch (e) {
            console.error('Auto-reorder failed', e);
        }
    };
    const [mealPlan, setMealPlan] = useState<MealPlanDay[]>([]);
    const [inventoryValue, setInventoryValue] = useState(0);
    const [healthInsights, setHealthInsights] = useState<any>(null);
    const [isHealthLoading, setIsHealthLoading] = useState(false);

    useEffect(() => {
        // Analyze waste (using expired items)
        const expiredItems = inventoryItems.filter(item =>
            item.expiryDate && new Date(item.expiryDate) < new Date()
        );
        const waste = analyzeWaste(expiredItems);
        setWasteInsights(waste);

        // Calculate inventory value
        const value = calculateInventoryValue(inventoryItems);
        setInventoryValue(value);

        // Analyze usage patterns
        const patterns = analyzeUsagePatterns(inventoryItems, inventoryItems);
        setUsagePatterns(patterns.slice(0, 5)); // Top 5

        // Detect recurring shopping items
        const recurring = detectRecurringItems(shoppingItems);
        setRecurringItems(recurring.slice(0, 5));

        // Generate meal plan
        const plan = generateWeeklyMealPlan(
            { budget: 100, caloriesPerDay: 2000 },
            inventoryItems.map(i => i.name)
        );
        setMealPlan(plan);
        
        // Fetch Health Insights (AI powered)
        const fetchHealth = async () => {
            if (inventoryItems.length === 0) return;
            setIsHealthLoading(true);
            try {
                const res = await fetch('/api/insights/health', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        inventory: inventoryItems.map(i => ({ name: i.name, category: i.category, quantity: i.quantity })),
                        meals: meals.slice(0, 10), // Last 10 meals
                        expenses: expenses.slice(0, 10), // Last 10 expenses
                        household: currentHousehold
                    })
                });
                if (!res.ok) throw new Error('Health endpoint error');
                const data = await res.json();
                // Only accept a well-formed response; the render path maps over
                // these arrays, so a partial/error object would crash the panel.
                if (data && Array.isArray(data.observations) && Array.isArray(data.risks) && Array.isArray(data.swaps)) {
                    setHealthInsights(data);
                } else {
                    setHealthInsights(null);
                }
            } catch (error) {
                console.error("Health analysis failed", error);
                setHealthInsights(null);
            } finally {
                setIsHealthLoading(false);
            }
        };
        
        fetchHealth();
    }, [inventoryItems, shoppingItems, meals, expenses, currentHousehold]);

    const batchCookingOpportunities = suggestBatchCooking(mealPlan);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                    <SparklesIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Insights</h2>
                    <p className="text-gray-600 dark:text-gray-400">Smart recommendations powered by AI</p>
                </div>
            </div>

            {/* Predictive Foresight Section (Phase 5) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-gray-900 p-8 rounded-[3rem] border border-indigo-100 dark:border-indigo-900 shadow-xl"
            >
                <PredictiveDecayAnalyzer />
            </motion.div>

            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-4"
                >
                    <div className="flex items-center justify-between mb-2">
                        <CurrencyDollarIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                        <ArrowTrendingUpIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Inventory Value</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {formatPrice(inventoryValue)}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card p-4"
                >
                    <div className="flex items-center justify-between mb-2">
                        <ChartBarIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">TRACKED</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Items Tracked</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {inventoryItems.length}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card p-4"
                >
                    <div className="flex items-center justify-between mb-2">
                        <ArrowTrendingDownIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
                        <span className="text-xs font-medium text-red-600 dark:text-red-400">WASTE</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Items Wasted</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {wasteInsights?.totalWasted || 0}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card p-4"
                >
                    <div className="flex items-center justify-between mb-2">
                        <ShoppingCartIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        <span className="text-xs font-medium text-purple-600 dark:text-purple-400">RECURRING</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Recurring Items</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {recurringItems.length}
                    </p>
                </motion.div>
            </div>

            {/* Waste Reduction Insights */}
            {wasteInsights && wasteInsights.totalWasted > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <ArrowTrendingDownIcon className="w-6 h-6 text-red-600" />
                        Waste Reduction Insights
                    </h3>

                    <div className="mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Estimated waste value: <span className="font-bold text-red-600">{formatPrice(wasteInsights.wasteValue)}</span>
                        </p>
                    </div>

                    {wasteInsights.topWastedItems.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Most Wasted Items:</h4>
                            <div className="space-y-2">
                                {wasteInsights.topWastedItems.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
                                        <span className="text-sm text-red-600 dark:text-red-400">
                                            {item.count} times • {formatPrice(item.value)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <LightBulbIcon className="w-4 h-4 text-yellow-600" />
                            AI Recommendations:
                        </h4>
                        {wasteInsights.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                <span className="text-yellow-600 dark:text-yellow-400 text-lg">💡</span>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{rec}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Usage Patterns */}
            {usagePatterns.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <ChartBarIcon className="w-6 h-6 text-blue-600" />
                        Usage Pattern Analysis
                    </h3>

                    <div className="space-y-3">
                        {usagePatterns.map((pattern, index) => (
                            <div key={index} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-gray-900 dark:text-white">{pattern.itemName}</h4>
                                    {pattern.predictedRunOutDate && (
                                        <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full">
                                            Runs out: {new Date(pattern.predictedRunOutDate).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Consumption Rate</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {pattern.averageConsumptionRate.toFixed(2)} per day
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Recommended Reorder</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {pattern.recommendedReorderQuantity} items
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Recurring Items */}
            {recurringItems.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <ShoppingCartIcon className="w-6 h-6 text-purple-600" />
                        Recurring Shopping Items
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        These items appear frequently in your shopping list. Consider setting up auto-reorder.
                    </p>

                    <div className="space-y-2">
                        {recurringItems.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Bought {item.frequency} times
                                    </span>
                                    <button
                                        onClick={() => handleAutoReorder(item.name, item.avgQuantity || 1)}
                                        disabled={reordered[item.name]}
                                        className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-60"
                                    >
                                        {reordered[item.name] ? '✓ Added' : 'Auto-Reorder'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* AI Meal Plan Preview */}
            {mealPlan.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <CalendarIcon className="w-6 h-6 text-green-600" />
                        AI-Generated Weekly Meal Plan
                    </h3>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {mealPlan.slice(0, 3).map((day, index) => (
                            <div key={index} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{day.day}</h4>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Breakfast</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{day.breakfast}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Lunch</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{day.lunch}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Dinner</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{day.dinner}</p>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800 flex justify-between text-xs">
                                    <span className="text-gray-600 dark:text-gray-400">{day.calories} cal</span>
                                    <span className="text-green-600 dark:text-green-400 font-semibold">{formatPrice(day.cost)}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => router.push('/meals/planner')}
                        className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                        Open Meal Planner
                    </button>
                </motion.div>
            )}

            {/* Health & Nutrition Brain */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card p-6 border-t-4 border-emerald-500 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-gray-900"
            >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                        <HeartIcon className="w-6 h-6 text-emerald-600" />
                    </div>
                    Vitality Brain: Personal Health Guard
                </h3>

                {isHealthLoading ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4">
                        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-emerald-600 dark:text-emerald-400 font-medium animate-pulse">Analyzing Nutritional Patterns...</p>
                    </div>
                ) : healthInsights ? (
                    <div className="space-y-6">
                        {/* Summary Observations */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <LightBulbIcon className="w-4 h-4" />
                                    Key Observations
                                </h4>
                                <ul className="space-y-2">
                                    {healthInsights.observations.map((obs: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
                                            <span className="text-emerald-500">•</span>
                                            {obs}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                                    <ExclamationCircleIcon className="w-4 h-4" />
                                    Habit Alerts
                                </h4>
                                <ul className="space-y-2">
                                    {healthInsights.risks.map((risk: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 bg-orange-50/50 dark:bg-orange-950/20 p-2 rounded-lg border border-orange-100 dark:border-orange-900/30">
                                            <span className="text-orange-500">⚠️</span>
                                            {risk}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Smart Swaps */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <ArrowPathRoundedSquareIcon className="w-4 h-4" />
                                Smart Swaps (Using Your Pantry)
                            </h4>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {healthInsights.swaps.map((swap: any, i: number) => (
                                    <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs line-through text-gray-400">{swap.original}</span>
                                            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                                                {swap.inPantry && <CheckCircleIcon className="w-3 h-3" />}
                                                GO FOR {swap.healthier}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed italic">
                                            "{swap.rationale}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Weekly Improvement Plan */}
                        <div className="bg-emerald-600 p-6 rounded-2xl text-white shadow-xl">
                            <h4 className="font-bold flex items-center gap-2 mb-3">
                                <SparklesIcon className="w-5 h-5" />
                                This Week's Vitality Plan
                            </h4>
                            <p className="text-sm text-emerald-50 leading-loose">
                                {healthInsights.weeklyImprovementPlan}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">Add more items and meals to start generating health insights.</p>
                    </div>
                )}
            </motion.div>

            {/* Batch Cooking Opportunities */}
            {batchCookingOpportunities.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <LightBulbIcon className="w-6 h-6 text-yellow-600" />
                        Batch Cooking Opportunities
                    </h3>

                    <div className="space-y-3">
                        {batchCookingOpportunities.map((opportunity, index) => (
                            <div key={index} className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{opportunity.meal}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    Appears on: {opportunity.days.join(', ')}
                                </p>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                                    💡 {opportunity.savings}
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
