'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useInventory } from '@/lib/hooks/useInventory';
import { useShopping } from '@/lib/hooks/useShopping';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';
import CookingMode from '../components/CookingMode';
import {
  findRecipesByIngredients,
  getRecipeDetails,
  searchRecipes,
  calculateMatchScore,
  Recipe,
  RecipeDetails,
} from '@/lib/services/recipeService';
import {
  MagnifyingGlassIcon,
  SparklesIcon,
  ClockIcon,
  UserGroupIcon,
  FireIcon,
  ShoppingCartIcon,
  PlayCircleIcon,
  PlusIcon,
  MinusIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';

export default function Recipes() {
  const { user, loading: authLoading } = useAuth();
  const { items: inventoryItems } = useInventory();
  const { addItem: addToShopping } = useShopping();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDetails | null>(null);
  const [showCookingMode, setShowCookingMode] = useState(false);
  const [servings, setServings] = useState(4);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importUrl, setImportUrl] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  // Load recipes when inventory items are available
  useEffect(() => {
    if (mounted && inventoryItems.length >= 0) {
      loadRecipesByIngredients();
    }
  }, [mounted, inventoryItems]);

  const loadRecipesByIngredients = async () => {
    setLoading(true);
    const ingredients = inventoryItems.map(item => item.name);
    const foundRecipes = await findRecipesByIngredients(ingredients, 12);
    setRecipes(foundRecipes);
    setLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    const results = await searchRecipes(searchQuery, 12);
    setRecipes(results.results.map(r => ({
      id: r.id,
      title: r.title,
      image: r.image,
      usedIngredientCount: 0,
      missedIngredientCount: 0,
      missedIngredients: [],
      usedIngredients: [],
      likes: 0,
    })));
    setLoading(false);
  };

  const handleRecipeClick = async (recipeId: number) => {
    const details = await getRecipeDetails(recipeId);
    if (details) {
      setSelectedRecipe(details);
      setServings(details.servings);
    }
  };

  const scaleIngredient = (amount: number, originalServings: number, newServings: number) => {
    return (amount * newServings) / originalServings;
  };

  const addMissingIngredientsToShopping = async () => {
    if (!selectedRecipe) return;

    const scaleFactor = servings / selectedRecipe.servings;

    for (const ingredient of selectedRecipe.extendedIngredients) {
      const scaledAmount = ingredient.amount * scaleFactor;

      await addToShopping({
        name: ingredient.name,
        quantity: scaledAmount,
        unit: ingredient.unit,
        category: ingredient.aisle,
        notes: `For ${selectedRecipe.title}`,
        price: 0,
        purchased: false,
      });
    }

    alert(`Added ${selectedRecipe.extendedIngredients.length} ingredients to shopping list!`);
  };

  const handleImportFromUrl = async () => {
    // This would require a backend service to scrape recipe data
    // For now, show a placeholder
    alert('Recipe import from URL will be available soon! This requires a backend service to scrape recipe data.');
    setShowImportModal(false);
    setImportUrl('');
  };

  if (authLoading || !mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading recipes...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const availableIngredients = inventoryItems.map(item => item.name);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-200 pb-20">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-white/20 dark:border-gray-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Recipes</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {availableIngredients.length} ingredients available
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => setShowImportModal(true)}
                className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all hover:scale-105"
                title="Import Recipe"
              >
                <LinkIcon className="w-6 h-6" />
              </button>
              <button
                onClick={loadRecipesByIngredients}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2"
              >
                <SparklesIcon className="w-5 h-5" />
                <span className="hidden sm:inline">AI Match</span>
              </button>
            </div>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Available Ingredients */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-2xl">🥘</span>
            Your Available Ingredients
          </h3>
          <div className="flex flex-wrap gap-2">
            {availableIngredients.slice(0, 20).map((ingredient, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium"
              >
                {ingredient}
              </span>
            ))}
            {availableIngredients.length > 20 && (
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm font-medium">
                +{availableIngredients.length - 20} more
              </span>
            )}
          </div>
        </motion.div>

        {/* Recipes Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          </div>
        ) : recipes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🍳</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No recipes found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try searching or add more ingredients to your inventory
            </p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe, index) => {
              const matchScore = calculateMatchScore(recipe);

              return (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="card overflow-hidden cursor-pointer group hover:shadow-xl transition-all"
                  onClick={() => handleRecipeClick(recipe.id)}
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {matchScore > 0 && (
                      <div className="absolute top-2 right-2 px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold shadow-lg">
                        {matchScore}% Match
                      </div>
                    )}
                    {recipe.likes && recipe.likes > 0 && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-sm text-white rounded-full text-xs font-medium flex items-center gap-1">
                        <HeartIcon className="w-4 h-4 text-red-500" />
                        {recipe.likes}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {recipe.title}
                    </h3>

                    {/* Ingredients Info */}
                    <div className="flex items-center gap-4 text-sm">
                      {recipe.usedIngredientCount > 0 && (
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          ✓ {recipe.usedIngredientCount} have
                        </span>
                      )}
                      {recipe.missedIngredientCount > 0 && (
                        <span className="text-orange-600 dark:text-orange-400 font-medium">
                          + {recipe.missedIngredientCount} need
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Recipe Details Modal */}
      <AnimatePresence>
        {selectedRecipe && !showCookingMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[1400] overflow-auto"
            onClick={() => setSelectedRecipe(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Image */}
              <div className="relative h-64 md:h-80">
                <img
                  src={selectedRecipe.image}
                  alt={selectedRecipe.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {selectedRecipe.title}
                </h2>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <ClockIcon className="w-5 h-5" />
                    <span>{selectedRecipe.readyInMinutes} min</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <UserGroupIcon className="w-5 h-5" />
                    <span>{selectedRecipe.servings} servings</span>
                  </div>
                  {selectedRecipe.cuisines.length > 0 && (
                    <div className="flex items-center gap-2">
                      {selectedRecipe.cuisines.map(cuisine => (
                        <span key={cuisine} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                          {cuisine}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Portion Scaling */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Adjust Servings
                  </h3>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setServings(Math.max(1, servings - 1))}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <MinusIcon className="w-5 h-5" />
                    </button>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white min-w-[3rem] text-center">
                      {servings}
                    </span>
                    <button
                      onClick={() => setServings(servings + 1)}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                    <span className="text-gray-600 dark:text-gray-400">
                      servings
                    </span>
                  </div>
                </div>

                {/* Ingredients */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Ingredients
                    </h3>
                    <button
                      onClick={addMissingIngredientsToShopping}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <ShoppingCartIcon className="w-4 h-4" />
                      Add to Shopping
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {selectedRecipe.extendedIngredients.map((ingredient, index) => {
                      const scaledAmount = scaleIngredient(
                        ingredient.amount,
                        selectedRecipe.servings,
                        servings
                      );

                      return (
                        <li
                          key={index}
                          className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <span className="text-gray-900 dark:text-white">
                            <span className="font-semibold">
                              {scaledAmount.toFixed(1)} {ingredient.unit}
                            </span>
                            {' '}{ingredient.name}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Nutrition */}
                {selectedRecipe.nutrition && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Nutrition (per serving)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedRecipe.nutrition.nutrients.slice(0, 4).map((nutrient) => (
                        <div key={nutrient.name} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {Math.round(nutrient.amount)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {nutrient.unit} {nutrient.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instructions Preview */}
                {selectedRecipe.analyzedInstructions.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Instructions ({selectedRecipe.analyzedInstructions[0].steps.length} steps)
                    </h3>
                    <div className="space-y-3">
                      {selectedRecipe.analyzedInstructions[0].steps.slice(0, 3).map((step) => (
                        <div key={step.number} className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                            {step.number}
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 flex-1">
                            {step.step}
                          </p>
                        </div>
                      ))}
                      {selectedRecipe.analyzedInstructions[0].steps.length > 3 && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                          +{selectedRecipe.analyzedInstructions[0].steps.length - 3} more steps...
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowCookingMode(true)}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 font-semibold"
                  >
                    <PlayCircleIcon className="w-6 h-6" />
                    Start Cooking Mode
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cooking Mode */}
      <AnimatePresence>
        {showCookingMode && selectedRecipe && (
          <CookingMode
            recipe={selectedRecipe}
            onClose={() => {
              setShowCookingMode(false);
              setSelectedRecipe(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Import Recipe Modal */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[1400]"
            onClick={() => setShowImportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Import Recipe from URL
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                Paste a recipe URL from popular cooking websites
              </p>
              <input
                type="url"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="https://example.com/recipe"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
              />
              <div className="flex gap-4">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportFromUrl}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 font-semibold"
                >
                  Import
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
