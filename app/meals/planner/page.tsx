'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useHousehold } from '@/lib/hooks/useHousehold';
import { useMeals } from '@/lib/hooks/useMeals';
import { useInventory } from '@/lib/hooks/useInventory';
import { useShopping } from '@/lib/hooks/useShopping';
import { useUI } from '@/app/components/ui/Toaster';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface GeneratedShoppingItem {
    name: string;
    quantity: number;
    unit: string;
    category: string;
    forMeals: string[];
}

export default function MealPlanner() {
    const [mounted, setMounted] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ date: string; mealType: string } | null>(null);
    const [mealName, setMealName] = useState('');
    const [servings, setServings] = useState(4);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);
    const [isGeneratingList, setIsGeneratingList] = useState(false);
    const [showListModal, setShowListModal] = useState(false);
    const [generatedList, setGeneratedList] = useState<GeneratedShoppingItem[]>([]);
    const [listNotes, setListNotes] = useState('');
    const [selectedListItems, setSelectedListItems] = useState<Record<number, boolean>>({});
    const [addedToList, setAddedToList] = useState(false);
    const { items: inventory } = useInventory();
    const { user, signOut } = useAuth();
    const { currentHousehold } = useHousehold();
    const { meals, addMeal, deleteMeal } = useMeals();
    const { addItem: addShoppingItem } = useShopping();
    const { toast, confirm } = useUI();
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
        if (await confirm({ message: 'Delete this meal?', confirmText: 'Delete', danger: true })) {
            await deleteMeal(mealId);
        }
    };

    const handleAIGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!aiPrompt.trim()) return;
        
        setIsGenerating(true);
        try {
            const res = await fetch('/api/recipes/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: aiPrompt,
                    inventoryContext: inventory.map(i => ({ name: i.name, quantity: i.quantity })),
                    dietaryProfile: currentHousehold?.settings?.dietaryProfile || "No specific dietary restrictions.",
                    region: 'Pakistan', // Easily configurable from settings later
                    mode: 'EXPIRING'
                })
            });
            if (res.ok) {
                const recipe = await res.json();
                setGeneratedRecipe(recipe);
                setAiPrompt('');
            } else {
                toast('Failed to generate recipe from AI.', 'error');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateShoppingList = async () => {
        // Collect every meal planned in the currently visible week.
        const plannedMeals = weekDates
            .flatMap(date =>
                mealTypes.map(mealType => getMealForSlot(date, mealType))
            )
            .filter(Boolean)
            .map(meal => ({
                name: meal!.recipeName || meal!.customMeal || 'Meal',
                servings: meal!.servings || 1,
            }));

        if (plannedMeals.length === 0) {
            toast('Add some meals to your weekly plan first, then generate a shopping list.', 'info');
            return;
        }

        setIsGeneratingList(true);
        setAddedToList(false);
        try {
            const res = await fetch('/api/shopping/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    meals: plannedMeals,
                    inventoryContext: inventory.map(i => ({
                        name: i.name,
                        quantity: i.quantity,
                        unit: i.unit,
                    })),
                    dietaryProfile:
                        currentHousehold?.settings?.dietaryProfile ||
                        'No specific dietary restrictions.',
                }),
            });

            if (!res.ok) {
                toast('Failed to generate shopping list from AI.', 'error');
                return;
            }

            const data = await res.json();
            const items: GeneratedShoppingItem[] = data.items || [];
            setGeneratedList(items);
            setListNotes(data.notes || '');
            // Pre-select all suggested items.
            setSelectedListItems(
                items.reduce((acc, _item, idx) => ({ ...acc, [idx]: true }), {})
            );
            setShowListModal(true);
        } catch (error) {
            console.error(error);
            toast('Something went wrong generating the shopping list.', 'error');
        } finally {
            setIsGeneratingList(false);
        }
    };

    const handleAddGeneratedItems = async () => {
        const toAdd = generatedList.filter((_item, idx) => selectedListItems[idx]);
        if (toAdd.length === 0) return;

        for (const item of toAdd) {
            await addShoppingItem({
                name: item.name,
                quantity: item.quantity,
                unit: item.unit,
                category: item.category,
                purchased: false,
                notes: 'Generated from meal plan',
            });
        }

        setAddedToList(true);
        setTimeout(() => setShowListModal(false), 1200);
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
                        <div className="flex gap-3">
                            <button
                                onClick={handleGenerateShoppingList}
                                disabled={isGeneratingList}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isGeneratingList ? (
                                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Building...</>
                                ) : (
                                    <>🛒 Generate Shopping List</>
                                )}
                            </button>
                            <Link
                                href="/recipes"
                                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold shadow-sm"
                            >
                                Browse Recipes
                            </Link>
                        </div>
                    </div>

                    {/* AI Context-Aware Search */}
                    <form onSubmit={handleAIGenerate} className="mb-8 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-2xl border border-orange-200 dark:border-orange-800/50 shadow-sm">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="flex-1 w-full">
                                <label className="block text-sm font-semibold text-orange-800 dark:text-orange-300 mb-2">
                                    ✨ Context-Aware Recipe AI
                                </label>
                                <input
                                    type="text"
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    placeholder="e.g., 'Make a quick comfort food using what I have'"
                                    className="w-full px-4 py-3 rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 shadow-sm"
                                    disabled={isGenerating}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isGenerating || !aiPrompt.trim()}
                                className="w-full md:w-auto mt-6 px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
                            >
                                {isGenerating ? (
                                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> Thinking...</>
                                ) : (
                                    <>Generate</>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Highly Structured Intelligent Context Recipe Card */}
                    <AnimatePresence>
                        {generatedRecipe && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-l-4 border-l-orange-500 overflow-hidden"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            {generatedRecipe.recipeName}
                                        </h3>
                                        <div className="flex gap-2 mt-2">
                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-bold">
                                                {generatedRecipe.mode} MODE
                                            </span>
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                                {generatedRecipe.timeLimitMinutes} mins
                                            </span>
                                            <span className="px-3 py-1 border border-orange-200 text-orange-600 text-xs rounded-full font-semibold">
                                                Est: {generatedRecipe.costEstimate} local currency
                                            </span>
                                        </div>
                                    </div>
                                    <button onClick={() => setGeneratedRecipe(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                                </div>

                                <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl text-sm italic text-orange-800 dark:text-orange-200">
                                    " {generatedRecipe.reasoning} "
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                    <div>
                                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 border-b pb-1">Ingredients Pulled From Pantry</h4>
                                        <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                            {generatedRecipe.usedIngredients.map((i: string) => <li key={i}>{i}</li>)}
                                        </ul>

                                        {generatedRecipe.missingIngredients.length > 0 && (
                                            <>
                                                <h4 className="font-semibold text-red-600 dark:text-red-400 mt-4 mb-2 border-b border-red-100 pb-1">Missing (Add to Shopping List)</h4>
                                                <ul className="list-disc pl-5 text-sm text-red-500/80 space-y-1">
                                                    {generatedRecipe.missingIngredients.map((i: string) => <li key={i}>{i}</li>)}
                                                </ul>
                                            </>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 border-b pb-1">Smart Regional Substitutions</h4>
                                        {generatedRecipe.smartSubstitutions.length > 0 ? (
                                            <div className="space-y-3">
                                                {generatedRecipe.smartSubstitutions.map((sub: any, idx: number) => (
                                                    <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 text-sm">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="line-through text-gray-400">{sub.original}</span>
                                                            <span className="font-bold text-orange-500">→ {sub.replacement}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1">{sub.reason}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No exact regional swaps required.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 border-b pb-1">Instructions</h4>
                                    <ol className="list-decimal pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2">
                                        {generatedRecipe.steps.map((step: string, i: number) => <li key={i} className="pl-1">{step}</li>)}
                                    </ol>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

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

            {/* Generated Shopping List Modal */}
            <AnimatePresence>
                {showListModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        onClick={() => setShowListModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                🛒 AI Shopping List
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                {listNotes || 'Generated from your weekly meal plan, minus what you already have.'}
                            </p>

                            {generatedList.length === 0 ? (
                                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                                    🎉 Your inventory already covers this week&apos;s meals — nothing to buy!
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {generatedList.map((item, idx) => (
                                        <label
                                            key={`${item.name}-${idx}`}
                                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={!!selectedListItems[idx]}
                                                onChange={(e) =>
                                                    setSelectedListItems(prev => ({ ...prev, [idx]: e.target.checked }))
                                                }
                                                className="w-5 h-5 rounded text-green-600 focus:ring-green-500"
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {item.name}
                                                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                                        {item.quantity} {item.unit}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {item.category}
                                                    {item.forMeals?.length > 0 && ` · for ${item.forMeals.join(', ')}`}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowListModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Close
                                </button>
                                {generatedList.length > 0 && (
                                    <button
                                        onClick={handleAddGeneratedItems}
                                        disabled={addedToList || Object.values(selectedListItems).every(v => !v)}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                                    >
                                        {addedToList ? '✓ Added!' : 'Add to Shopping List'}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
