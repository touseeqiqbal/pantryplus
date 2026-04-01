'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInventory } from '@/lib/hooks/useInventory';
import { useShopping } from '@/lib/hooks/useShopping';
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
} from '@heroicons/react/24/outline';

export default function AIInsightsDashboard() {
    const { items: inventoryItems } = useInventory();
    const { items: shoppingItems } = useShopping();

    const [wasteInsights, setWasteInsights] = useState<WasteInsight | null>(null);
    const [usagePatterns, setUsagePatterns] = useState<UsagePattern[]>([]);
    const [recurringItems, setRecurringItems] = useState<Array<{ name: string; frequency: number }>>([]);
    const [mealPlan, setMealPlan] = useState<MealPlanDay[]>([]);
    const [inventoryValue, setInventoryValue] = useState(0);

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
    }, [inventoryItems, shoppingItems]);

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
                        ${inventoryValue.toFixed(0)}
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
                            Estimated waste value: <span className="font-bold text-red-600">${wasteInsights.wasteValue.toFixed(2)}</span>
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
                                            {item.count} times • ${item.value.toFixed(2)}
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
                                    <button className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                                        Auto-Reorder
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
                                    <span className="text-green-600 dark:text-green-400 font-semibold">${day.cost.toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                        View Full Meal Plan
                    </button>
                </motion.div>
            )}

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
