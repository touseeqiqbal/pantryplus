/**
 * Recipe API Service
 * Uses Spoonacular API for recipe data
 * Free tier: 150 requests/day
 */

export interface Recipe {
    id: number;
    title: string;
    image: string;
    imageType?: string;
    usedIngredientCount: number;
    missedIngredientCount: number;
    missedIngredients: Ingredient[];
    usedIngredients: Ingredient[];
    unusedIngredients?: Ingredient[];
    likes?: number;
}

export interface Ingredient {
    id: number;
    amount: number;
    unit: string;
    unitLong: string;
    unitShort: string;
    aisle: string;
    name: string;
    original: string;
    originalName: string;
    meta: string[];
    image: string;
}

export interface RecipeDetails {
    id: number;
    title: string;
    image: string;
    servings: number;
    readyInMinutes: number;
    preparationMinutes?: number;
    cookingMinutes?: number;
    sourceUrl: string;
    summary: string;
    cuisines: string[];
    dishTypes: string[];
    diets: string[];
    instructions: string;
    analyzedInstructions: AnalyzedInstruction[];
    extendedIngredients: ExtendedIngredient[];
    nutrition?: {
        nutrients: Nutrient[];
    };
}

export interface AnalyzedInstruction {
    name: string;
    steps: Step[];
}

export interface Step {
    number: number;
    step: string;
    ingredients: { id: number; name: string; image: string }[];
    equipment: { id: number; name: string; image: string }[];
    length?: { number: number; unit: string };
}

export interface ExtendedIngredient {
    id: number;
    aisle: string;
    image: string;
    name: string;
    amount: number;
    unit: string;
    original: string;
    meta: string[];
}

export interface Nutrient {
    name: string;
    amount: number;
    unit: string;
    percentOfDailyNeeds?: number;
}

// Note: You'll need to add your Spoonacular API key to .env.local
// NEXT_PUBLIC_SPOONACULAR_API_KEY=your_api_key_here
const API_KEY = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY || '';
const BASE_URL = 'https://api.spoonacular.com';

/**
 * Find recipes by ingredients
 * @param ingredients - Array of ingredient names
 * @param number - Number of recipes to return (default: 10)
 * @returns Array of recipes
 */
export async function findRecipesByIngredients(
    ingredients: string[],
    number: number = 10
): Promise<Recipe[]> {
    // Always return mock recipes if no API key
    if (!API_KEY) {
        console.warn('Spoonacular API key not configured, using mock recipes');
        return getMockRecipes(ingredients);
    }

    try {
        // If ingredients array is empty or has very few items, return mock recipes
        if (ingredients.length === 0) {
            console.log('No ingredients provided, using mock recipes');
            return getMockRecipes(ingredients);
        }

        const ingredientsParam = ingredients.join(',');
        const response = await fetch(
            `${BASE_URL}/recipes/findByIngredients?ingredients=${encodeURIComponent(
                ingredientsParam
            )}&number=${number}&ranking=2&ignorePantry=true&apiKey=${API_KEY}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            console.warn(`API returned ${response.status}, using mock recipes`);
            throw new Error('Failed to fetch recipes');
        }

        const recipes = await response.json();

        // If API returns empty results, use mock recipes
        if (!recipes || recipes.length === 0) {
            console.log('API returned no recipes, using mock recipes');
            return getMockRecipes(ingredients);
        }

        return recipes;
    } catch (error) {
        console.error('Recipe API error:', error);
        console.log('Falling back to mock recipes');
        return getMockRecipes(ingredients);
    }
}

/**
 * Get recipe details by ID
 * @param id - Recipe ID
 * @returns Recipe details
 */
export async function getRecipeDetails(id: number): Promise<RecipeDetails | null> {
    if (!API_KEY) {
        console.warn('Spoonacular API key not configured, using mock data');
        return getMockRecipeDetails(id);
    }

    try {
        const response = await fetch(
            `${BASE_URL}/recipes/${id}/information?includeNutrition=true&apiKey=${API_KEY}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch recipe details');
        }

        return await response.json();
    } catch (error) {
        console.error('Recipe details error:', error);
        return getMockRecipeDetails(id);
    }
}

/**
 * Search recipes by query
 * @param query - Search query
 * @param number - Number of results (default: 10)
 * @returns Search results
 */
export async function searchRecipes(
    query: string,
    number: number = 10,
    diet?: string,
    cuisine?: string
): Promise<{ results: RecipeDetails[]; totalResults: number }> {
    if (!API_KEY) {
        console.warn('Spoonacular API key not configured');
        return { results: [], totalResults: 0 };
    }

    try {
        let url = `${BASE_URL}/recipes/complexSearch?query=${encodeURIComponent(
            query
        )}&number=${number}&addRecipeInformation=true&apiKey=${API_KEY}`;

        if (diet) url += `&diet=${diet}`;
        if (cuisine) url += `&cuisine=${cuisine}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to search recipes');
        }

        return await response.json();
    } catch (error) {
        console.error('Recipe search error:', error);
        return { results: [], totalResults: 0 };
    }
}

/**
 * Get random recipes
 * @param number - Number of recipes (default: 10)
 * @param tags - Tags to filter by (e.g., 'vegetarian', 'dessert')
 * @returns Random recipes
 */
export async function getRandomRecipes(
    number: number = 10,
    tags?: string[]
): Promise<{ recipes: RecipeDetails[] }> {
    if (!API_KEY) {
        console.warn('Spoonacular API key not configured');
        return { recipes: [] };
    }

    try {
        let url = `${BASE_URL}/recipes/random?number=${number}&apiKey=${API_KEY}`;
        if (tags && tags.length > 0) {
            url += `&tags=${tags.join(',')}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch random recipes');
        }

        return await response.json();
    } catch (error) {
        console.error('Random recipes error:', error);
        return { recipes: [] };
    }
}

/**
 * Mock recipes for when API key is not configured
 */
function getMockRecipes(ingredients: string[]): Recipe[] {
    return [
        {
            id: 1,
            title: 'Classic Spaghetti Carbonara',
            image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400',
            usedIngredientCount: Math.min(ingredients.length, 3),
            missedIngredientCount: 2,
            missedIngredients: [],
            usedIngredients: [],
            likes: 245,
        },
        {
            id: 2,
            title: 'Chicken Stir Fry with Vegetables',
            image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
            usedIngredientCount: Math.min(ingredients.length, 4),
            missedIngredientCount: 1,
            missedIngredients: [],
            usedIngredients: [],
            likes: 189,
        },
        {
            id: 3,
            title: 'Fresh Garden Salad',
            image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
            usedIngredientCount: Math.min(ingredients.length, 5),
            missedIngredientCount: 0,
            missedIngredients: [],
            usedIngredients: [],
            likes: 156,
        },
        {
            id: 4,
            title: 'Homemade Margherita Pizza',
            image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
            usedIngredientCount: Math.min(ingredients.length, 4),
            missedIngredientCount: 2,
            missedIngredients: [],
            usedIngredients: [],
            likes: 312,
        },
        {
            id: 5,
            title: 'Creamy Mushroom Risotto',
            image: 'https://images.unsplash.com/photo-1476124369491-b79d9f93b4e7?w=400',
            usedIngredientCount: Math.min(ingredients.length, 3),
            missedIngredientCount: 3,
            missedIngredients: [],
            usedIngredients: [],
            likes: 198,
        },
        {
            id: 6,
            title: 'Grilled Salmon with Lemon',
            image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
            usedIngredientCount: Math.min(ingredients.length, 2),
            missedIngredientCount: 2,
            missedIngredients: [],
            usedIngredients: [],
            likes: 267,
        },
        {
            id: 7,
            title: 'Beef Tacos with Guacamole',
            image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400',
            usedIngredientCount: Math.min(ingredients.length, 5),
            missedIngredientCount: 1,
            missedIngredients: [],
            usedIngredients: [],
            likes: 423,
        },
        {
            id: 8,
            title: 'Vegetable Curry',
            image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400',
            usedIngredientCount: Math.min(ingredients.length, 6),
            missedIngredientCount: 2,
            missedIngredients: [],
            usedIngredients: [],
            likes: 178,
        },
        {
            id: 9,
            title: 'Chocolate Chip Cookies',
            image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400',
            usedIngredientCount: Math.min(ingredients.length, 3),
            missedIngredientCount: 4,
            missedIngredients: [],
            usedIngredients: [],
            likes: 891,
        },
        {
            id: 10,
            title: 'Greek Yogurt Parfait',
            image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
            usedIngredientCount: Math.min(ingredients.length, 4),
            missedIngredientCount: 1,
            missedIngredients: [],
            usedIngredients: [],
            likes: 234,
        },
        {
            id: 11,
            title: 'Pad Thai Noodles',
            image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400',
            usedIngredientCount: Math.min(ingredients.length, 5),
            missedIngredientCount: 3,
            missedIngredients: [],
            usedIngredients: [],
            likes: 345,
        },
        {
            id: 12,
            title: 'Caprese Salad',
            image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=400',
            usedIngredientCount: Math.min(ingredients.length, 3),
            missedIngredientCount: 0,
            missedIngredients: [],
            usedIngredients: [],
            likes: 156,
        },
        {
            id: 13,
            title: 'Banana Bread',
            image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=400',
            usedIngredientCount: Math.min(ingredients.length, 4),
            missedIngredientCount: 2,
            missedIngredients: [],
            usedIngredients: [],
            likes: 567,
        },
        {
            id: 14,
            title: 'Chicken Caesar Salad',
            image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
            usedIngredientCount: Math.min(ingredients.length, 4),
            missedIngredientCount: 2,
            missedIngredients: [],
            usedIngredients: [],
            likes: 289,
        },
        {
            id: 15,
            title: 'Vegetable Lasagna',
            image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
            usedIngredientCount: Math.min(ingredients.length, 6),
            missedIngredientCount: 3,
            missedIngredients: [],
            usedIngredients: [],
            likes: 412,
        },
        {
            id: 16,
            title: 'Shrimp Scampi',
            image: 'https://images.unsplash.com/photo-1633504581786-316c8002b1b9?w=400',
            usedIngredientCount: Math.min(ingredients.length, 3),
            missedIngredientCount: 2,
            missedIngredients: [],
            usedIngredients: [],
            likes: 298,
        },
        {
            id: 17,
            title: 'French Toast',
            image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400',
            usedIngredientCount: Math.min(ingredients.length, 3),
            missedIngredientCount: 1,
            missedIngredients: [],
            usedIngredients: [],
            likes: 445,
        },
        {
            id: 18,
            title: 'Quinoa Buddha Bowl',
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
            usedIngredientCount: Math.min(ingredients.length, 7),
            missedIngredientCount: 2,
            missedIngredients: [],
            usedIngredients: [],
            likes: 334,
        },
        {
            id: 19,
            title: 'Pulled Pork Sandwich',
            image: 'https://images.unsplash.com/photo-1619740455993-9e8c6c3e5d2b?w=400',
            usedIngredientCount: Math.min(ingredients.length, 2),
            missedIngredientCount: 3,
            missedIngredients: [],
            usedIngredients: [],
            likes: 523,
        },
        {
            id: 20,
            title: 'Tiramisu',
            image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
            usedIngredientCount: Math.min(ingredients.length, 2),
            missedIngredientCount: 5,
            missedIngredients: [],
            usedIngredients: [],
            likes: 678,
        },
    ];
}

/**
 * Mock recipe details for when API key is not configured
 */
function getMockRecipeDetails(id: number): RecipeDetails {
    const recipes: Record<number, RecipeDetails> = {
        1: {
            id: 1,
            title: 'Classic Spaghetti Carbonara',
            image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800',
            servings: 4,
            readyInMinutes: 30,
            sourceUrl: 'https://example.com',
            summary: 'A classic Italian pasta dish with eggs, cheese, and bacon.',
            cuisines: ['Italian'],
            dishTypes: ['main course', 'dinner'],
            diets: [],
            instructions: 'Cook pasta, mix with eggs and cheese, add bacon.',
            analyzedInstructions: [{
                name: '',
                steps: [
                    {
                        number: 1,
                        step: 'Bring a large pot of salted water to boil and cook spaghetti according to package directions.',
                        ingredients: [{ id: 1, name: 'spaghetti', image: 'spaghetti.jpg' }],
                        equipment: [{ id: 1, name: 'pot', image: 'pot.jpg' }],
                        length: { number: 10, unit: 'minutes' }
                    },
                    {
                        number: 2,
                        step: 'While pasta cooks, fry bacon until crispy. Set aside.',
                        ingredients: [{ id: 2, name: 'bacon', image: 'bacon.jpg' }],
                        equipment: [{ id: 2, name: 'pan', image: 'pan.jpg' }],
                        length: { number: 8, unit: 'minutes' }
                    },
                    {
                        number: 3,
                        step: 'Whisk eggs and parmesan cheese together in a bowl.',
                        ingredients: [
                            { id: 3, name: 'eggs', image: 'egg.jpg' },
                            { id: 4, name: 'parmesan', image: 'parmesan.jpg' }
                        ],
                        equipment: [{ id: 3, name: 'bowl', image: 'bowl.jpg' }],
                    },
                    {
                        number: 4,
                        step: 'Drain pasta and immediately toss with egg mixture. The heat will cook the eggs.',
                        ingredients: [],
                        equipment: [],
                    },
                    {
                        number: 5,
                        step: 'Add bacon, season with black pepper, and serve immediately.',
                        ingredients: [{ id: 5, name: 'black pepper', image: 'pepper.jpg' }],
                        equipment: [],
                    }
                ]
            }],
            extendedIngredients: [
                { id: 1, aisle: 'Pasta', image: 'spaghetti.jpg', name: 'spaghetti', amount: 400, unit: 'g', original: '400g spaghetti', meta: [] },
                { id: 2, aisle: 'Meat', image: 'bacon.jpg', name: 'bacon', amount: 200, unit: 'g', original: '200g bacon', meta: [] },
                { id: 3, aisle: 'Dairy', image: 'egg.jpg', name: 'eggs', amount: 4, unit: 'large', original: '4 large eggs', meta: [] },
                { id: 4, aisle: 'Dairy', image: 'parmesan.jpg', name: 'parmesan cheese', amount: 100, unit: 'g', original: '100g parmesan', meta: ['grated'] },
                { id: 5, aisle: 'Spices', image: 'pepper.jpg', name: 'black pepper', amount: 1, unit: 'tsp', original: '1 tsp black pepper', meta: ['freshly ground'] },
            ],
            nutrition: {
                nutrients: [
                    { name: 'Calories', amount: 520, unit: 'kcal' },
                    { name: 'Protein', amount: 28, unit: 'g' },
                    { name: 'Carbohydrates', amount: 52, unit: 'g' },
                    { name: 'Fat', amount: 22, unit: 'g' },
                ]
            }
        },
        // Add more detailed recipes as needed
    };

    // Return the specific recipe or a default one
    return recipes[id] || {
        id,
        title: `Recipe ${id}`,
        image: `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800`,
        servings: 4,
        readyInMinutes: 30,
        sourceUrl: 'https://example.com',
        summary: 'A delicious recipe.',
        cuisines: ['International'],
        dishTypes: ['main course'],
        diets: [],
        instructions: 'Follow the steps below.',
        analyzedInstructions: [{
            name: '',
            steps: [
                {
                    number: 1,
                    step: 'Prepare all ingredients.',
                    ingredients: [],
                    equipment: [],
                },
                {
                    number: 2,
                    step: 'Cook according to your preference.',
                    ingredients: [],
                    equipment: [],
                    length: { number: 20, unit: 'minutes' }
                },
                {
                    number: 3,
                    step: 'Serve hot and enjoy!',
                    ingredients: [],
                    equipment: [],
                }
            ]
        }],
        extendedIngredients: [
            { id: 1, aisle: 'Produce', image: 'vegetables.jpg', name: 'mixed vegetables', amount: 500, unit: 'g', original: '500g mixed vegetables', meta: [] },
            { id: 2, aisle: 'Condiments', image: 'oil.jpg', name: 'olive oil', amount: 2, unit: 'tbsp', original: '2 tbsp olive oil', meta: [] },
        ],
        nutrition: {
            nutrients: [
                { name: 'Calories', amount: 350, unit: 'kcal' },
                { name: 'Protein', amount: 15, unit: 'g' },
                { name: 'Carbohydrates', amount: 45, unit: 'g' },
                { name: 'Fat', amount: 12, unit: 'g' },
            ]
        }
    };
}

/**
 * Calculate recipe match score
 * @param recipe - Recipe object
 * @returns Match percentage (0-100)
 */
export function calculateMatchScore(recipe: Recipe): number {
    const total = recipe.usedIngredientCount + recipe.missedIngredientCount;
    if (total === 0) return 0;
    return Math.round((recipe.usedIngredientCount / total) * 100);
}
