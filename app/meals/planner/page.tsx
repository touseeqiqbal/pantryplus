'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useHousehold } from '@/lib/hooks/useHousehold';
import { useMeals } from '@/lib/hooks/useMeals';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function MealPlanner() {
    const [mounted, setMounted] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ date: string; mealType: string } | null>(null);
    const [mealName, setMealName] = useState('');
    const [servings, setServings] = useState(4);
    const { user, signOut } = useAuth();
    const { currentHousehold } = useHousehold();
    const { meals, addMeal, deleteMeal } = useMeals();
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!user && mounted) {
            router.push('/auth/signin');
        } else if (!currentHousehold && mounted) {
            router.push('/household/setup');
        }
    }, [user, currentHousehold, mounted, router]);

    const getWeekDates = () => {
        const dates = [];
        const today = new Date(selectedDate);
        const dayOfWeek = today.getDay();
        const diff = today.getDate() - dayOfWeek;

        for (let i = 0; i < 7; i++) {
            const date = new Date(today.setDate(diff + i));
            dates.push(date.toISOString().split('T')[0]);
        }
        return dates;
    };

    const weekDates = getWeekDates();
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

    const getMealForSlot = (date: string, mealType: typeof mealTypes[number]) => {
        return meals.find(m => m.date === date && m.mealType === mealType);
    };

    const handleAddMealClick = (date: string, mealType: string) => {
        setSelectedSlot({ date, mealType });
        setMealName('');
        setServings(4);
        setShowAddModal(true);
    };

    const handleSaveMeal = async () => {
        if (!selectedSlot || !mealName.trim() || !currentHousehold) return;

        await addMeal({
            date: selectedSlot.date,
            mealType: selectedSlot.mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
            customMeal: mealName,
            servings: servings,
        });

        setShowAddModal(false);
        setSelectedSlot(null);
        setMealName('');
    };

    const handleDeleteMeal = async (mealId: number | undefined) => {
        if (!mealId) return;
        if (confirm('Are you sure you want to delete this meal?')) {
            await deleteMeal(mealId);
        }
    };

    if (!mounted || !user || !currentHousehold) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <Link href="/dashboard" className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            PantryPlus
                        </Link>
                        <button
                            onClick={() => signOut()}
                            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Meal Planner 🍽️
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Plan your weekly meals
                            </p>
                        </div>
                        <Link
                            href="/recipes"
                            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
                        >
                            Browse Recipes
                        </Link>
                    </div>

                    {/* Week View */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                        <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
                            <div className="p-4 font-semibold text-gray-700 dark:text-gray-300">Meal</div>
                            {weekDates.map((date, idx) => {
                                const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
                                const dayNum = new Date(date).getDate();
                                return (
                                    <div key={date} className="p-4 text-center border-l border-gray-200 dark:border-gray-700">
                                        <div className="font-semibold text-gray-900 dark:text-white">{dayName}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">{dayNum}</div>
                                    </div>
                                );
                            })}
                        </div>

                        {mealTypes.map((mealType) => (
                            <div key={mealType} className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                                <div className="p-4 font-medium text-gray-700 dark:text-gray-300 capitalize border-r border-gray-200 dark:border-gray-700">
                                    {mealType}
                                </div>
                                {weekDates.map((date) => {
                                    const meal = getMealForSlot(date, mealType);
                                    return (
                                        <div
                                            key={`${date}-${mealType}`}
                                            className="p-2 border-l border-gray-200 dark:border-gray-700 min-h-[80px] hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            {meal ? (
                                                <div className="text-sm group relative">
                                                    <div className="font-medium text-gray-900 dark:text-white truncate">
                                                        {meal.recipeName || meal.customMeal}
                                                    </div>
                                                    {meal.servings && (
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {meal.servings} servings
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteMeal(meal.id)}
                                                        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-xs"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleAddMealClick(date, mealType)}
                                                    className="text-xs text-gray-400 dark:text-gray-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                                >
                                                    + Add meal
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                        <p>💡 Tip: Click "+ Add meal" to add a meal to any slot</p>
                    </div>
                </motion.div>
            </main>

            {/* Add Meal Modal */}
            <AnimatePresence>
                {showAddModal && selectedSlot && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                Add Meal
                            </h3>

                            <div className="mb-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    {new Date(selectedSlot.date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                                <p className="text-sm font-medium text-orange-600 dark:text-orange-400 capitalize">
                                    {selectedSlot.mealType}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Meal Name
                                    </label>
                                    <input
                                        type="text"
                                        value={mealName}
                                        onChange={(e) => setMealName(e.target.value)}
                                        placeholder="e.g., Spaghetti Carbonara"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Servings
                                    </label>
                                    <input
                                        type="number"
                                        value={servings}
                                        onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                                        min="1"
                                        max="20"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveMeal}
                                    disabled={!mealName.trim()}
                                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                                >
                                    Add Meal
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
