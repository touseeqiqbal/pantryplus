/**
 * Barcode Lookup Service
 * Uses Open Food Facts API for product information
 */

export interface ProductInfo {
    name: string;
    category?: string;
    brand?: string;
    quantity?: string;
    imageUrl?: string;
    ingredients?: string[];
    nutritionFacts?: {
        calories?: number;
        protein?: number;
        carbs?: number;
        fat?: number;
    };
}

/**
 * Look up product information by barcode
 * @param barcode - The barcode number (EAN-13, UPC-A, etc.)
 * @returns Product information or null if not found
 */
export async function lookupBarcode(barcode: string): Promise<ProductInfo | null> {
    try {
        // Open Food Facts API
        const response = await fetch(
            `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
        );

        if (!response.ok) {
            throw new Error('Product not found');
        }

        const data = await response.json();

        if (data.status === 0) {
            return null; // Product not found
        }

        const product = data.product;

        // Extract and format product information
        const productInfo: ProductInfo = {
            name: product.product_name || product.product_name_en || 'Unknown Product',
            category: product.categories_tags?.[0]?.replace('en:', '') || undefined,
            brand: product.brands || undefined,
            quantity: product.quantity || undefined,
            imageUrl: product.image_url || product.image_front_url || undefined,
            ingredients: product.ingredients_text_en?.split(', ') || undefined,
            nutritionFacts: {
                calories: product.nutriments?.['energy-kcal_100g'],
                protein: product.nutriments?.proteins_100g,
                carbs: product.nutriments?.carbohydrates_100g,
                fat: product.nutriments?.fat_100g,
            },
        };

        return productInfo;
    } catch (error) {
        console.error('Barcode lookup error:', error);
        return null;
    }
}

/**
 * Search for products by name
 * @param query - Search query
 * @param limit - Maximum number of results
 * @returns Array of product information
 */
export async function searchProducts(
    query: string,
    limit: number = 10
): Promise<ProductInfo[]> {
    try {
        const response = await fetch(
            `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
                query
            )}&search_simple=1&action=process&json=1&page_size=${limit}`
        );

        if (!response.ok) {
            throw new Error('Search failed');
        }

        const data = await response.json();

        return data.products.map((product: any) => ({
            name: product.product_name || product.product_name_en || 'Unknown Product',
            category: product.categories_tags?.[0]?.replace('en:', '') || undefined,
            brand: product.brands || undefined,
            quantity: product.quantity || undefined,
            imageUrl: product.image_url || product.image_front_url || undefined,
        }));
    } catch (error) {
        console.error('Product search error:', error);
        return [];
    }
}

/**
 * Get category suggestions based on product name
 * @param productName - Name of the product
 * @returns Suggested category
 */
export function suggestCategory(productName: string): string {
    const name = productName.toLowerCase();

    // Fruits & Vegetables
    if (
        /apple|banana|orange|grape|berry|tomato|potato|carrot|lettuce|spinach|broccoli/i.test(
            name
        )
    ) {
        return 'Fruits & Vegetables';
    }

    // Dairy
    if (/milk|cheese|yogurt|butter|cream/i.test(name)) {
        return 'Dairy';
    }

    // Meat & Seafood
    if (/chicken|beef|pork|fish|salmon|tuna|shrimp/i.test(name)) {
        return 'Meat & Seafood';
    }

    // Grains & Bread
    if (/bread|rice|pasta|cereal|flour|oats/i.test(name)) {
        return 'Grains & Bread';
    }

    // Beverages
    if (/juice|soda|coffee|tea|water|beer|wine/i.test(name)) {
        return 'Beverages';
    }

    // Snacks
    if (/chips|cookies|crackers|candy|chocolate/i.test(name)) {
        return 'Snacks';
    }

    // Condiments & Sauces
    if (/sauce|ketchup|mayo|mustard|oil|vinegar|spice/i.test(name)) {
        return 'Condiments & Sauces';
    }

    // Frozen Foods
    if (/frozen|ice cream/i.test(name)) {
        return 'Frozen Foods';
    }

    // Canned Goods
    if (/canned|can of/i.test(name)) {
        return 'Canned Goods';
    }

    return 'Other';
}

/**
 * Estimate expiry date based on category
 * @param category - Product category
 * @returns Suggested expiry date (days from now)
 */
export function estimateExpiryDays(category: string): number {
    const categoryMap: Record<string, number> = {
        'Fruits & Vegetables': 7,
        'Dairy': 14,
        'Meat & Seafood': 3,
        'Grains & Bread': 7,
        'Beverages': 90,
        'Snacks': 180,
        'Condiments & Sauces': 365,
        'Frozen Foods': 180,
        'Canned Goods': 730,
        'Other': 30,
    };

    return categoryMap[category] || 30;
}
