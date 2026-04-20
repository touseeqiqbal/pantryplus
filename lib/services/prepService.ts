import { db, InventoryItem, IngredientMapping } from '@/lib/db/dexie';

export interface PrepRequirement {
    inventoryItemId: string;
    name: string;
    requiredQuantity: number;
    unit: string;
    station?: string;
    status: 'pending' | 'completed';
}

/**
 * Service to handle Demand Forecasting and Prep List Generation
 */
export const prepService = {
    /**
     * Calculates what needs to be prepped for the current shift.
     */
    async generateDailyPrepList(businessId: string): Promise<PrepRequirement[]> {
        // 1. Get all active menu items for this business
        const menuItems = await db.menuItems.where('businessId').equals(businessId).toArray();
        const prepList: Map<string, PrepRequirement> = new Map();

        for (const item of menuItems) {
            if (!item.isActive || !item.firebaseId) continue;

            // 2. Fetch the BOM for this item
            const mapping = await db.ingredientMappings
                .where('menuItemId')
                .equals(item.firebaseId)
                .first();

            if (!mapping) continue;

            // 3. Simple Demand Forecast (e.g., Target 20 portions of each active dish)
            // In a mature app, this would use AI based on historic YieldLogs
            const forecastedSales = 20; 

            for (const ing of mapping.ingredients) {
                const totalNeeded = forecastedSales * ing.quantity * ing.wastageFactor;

                const existing = prepList.get(ing.inventoryItemId);
                if (existing) {
                    existing.requiredQuantity += totalNeeded;
                } else {
                    // Fetch the name for display if not in mapping
                    const invItem = await db.inventory.where('firebaseId').equals(ing.inventoryItemId).first();
                    
                    prepList.set(ing.inventoryItemId, {
                        inventoryItemId: ing.inventoryItemId,
                        name: invItem?.name || 'Unknown Ingredient',
                        requiredQuantity: totalNeeded,
                        unit: ing.unit,
                        station: this.getStationForCategory(invItem?.category || ''),
                        status: 'pending'
                    });
                }
            }
        }

        return Array.from(prepList.values());
    },

    /**
     * Heuristic to group ingredients by kitchen station
     */
    getStationForCategory(category: string): string {
        const cat = category.toLowerCase();
        if (cat.includes('meat') || cat.includes('poultry') || cat.includes('hot')) return 'Hot Station';
        if (cat.includes('veg') || cat.includes('fruit') || cat.includes('cold') || cat.includes('salad')) return 'Cold Station';
        if (cat.includes('dairy') || cat.includes('bakery') || cat.includes('bread')) return 'Bakery/Dairy';
        return 'General Prep';
    }
};
