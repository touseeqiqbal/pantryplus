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

        // Build a real demand forecast per dish from historical sale logs.
        const forecastByItem = await this.forecastDailySales(businessId);

        for (const item of menuItems) {
            if (!item.isActive || !item.firebaseId) continue;

            // 2. Fetch the BOM for this item
            const mapping = await db.ingredientMappings
                .where('menuItemId')
                .equals(item.firebaseId)
                .first();

            if (!mapping) continue;

            // 3. Demand forecast: average daily sales from yield logs, with a
            // baseline fallback for dishes that have no sales history yet.
            const forecastedSales = forecastByItem.get(item.firebaseId) ?? 10;

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
     * Computes average daily sales per menu item from historical 'sale' yield
     * logs. Returns a map of menuItemId -> average portions sold per active day.
     */
    async forecastDailySales(businessId: string): Promise<Map<string, number>> {
        const saleLogs = (await db.yieldLogs.where('businessId').equals(businessId).toArray())
            .filter(log => log.type === 'sale');

        // Aggregate total quantity and the set of distinct sale days per dish.
        const totals = new Map<string, { qty: number; days: Set<string> }>();
        for (const log of saleLogs) {
            const day = (log.timestamp || '').split('T')[0];
            const entry = totals.get(log.entityId) || { qty: 0, days: new Set<string>() };
            entry.qty += log.quantity;
            if (day) entry.days.add(day);
            totals.set(log.entityId, entry);
        }

        const forecast = new Map<string, number>();
        totals.forEach((entry, menuItemId) => {
            const activeDays = Math.max(entry.days.size, 1);
            forecast.set(menuItemId, Math.ceil(entry.qty / activeDays));
        });
        return forecast;
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
