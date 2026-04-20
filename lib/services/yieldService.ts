import { db, InventoryItem, YieldLog, IngredientMapping } from '@/lib/db/dexie';
import { db as firestore } from '@/lib/firebase/config';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';

/**
 * Service to handle business yield logic: Prep, Sales, and Waste events.
 */
export const yieldService = {
    /**
     * Processes a sale event: Deducts raw ingredients from inventory based on BOM.
     */
    async logSale(businessId: string, menuItemId: string, quantitySold: number, staffId: string) {
        // 1. Fetch the mapping (BOM) for this menu item
        const mapping = await db.ingredientMappings
            .where('menuItemId')
            .equals(menuItemId)
            .first();

        if (!mapping) {
            console.warn(`No ingredient mapping found for menu item ${menuItemId}. Skipping deduction.`);
            return null;
        }

        // 2. Perform deductions in a transaction
        return await db.transaction('rw', [db.inventory, db.yieldLogs], async () => {
            const deductions = [];

            for (const ing of mapping.ingredients) {
                // Calculate required quantity: sold * quantityPerDish * wastage
                const requiredQty = quantitySold * ing.quantity * ing.wastageFactor;

                // Find inventory item by firebaseId (which is what mappings store)
                const inventoryItem = await db.inventory
                    .where('firebaseId')
                    .equals(ing.inventoryItemId)
                    .first();

                if (inventoryItem && inventoryItem.id) {
                    const newQuantity = Math.max(0, inventoryItem.quantity - requiredQty);
                    
                    // Update local Dexie
                    await db.inventory.update(inventoryItem.id, {
                        quantity: newQuantity,
                        updatedAt: new Date().toISOString(),
                        syncStatus: 'pending'
                    });

                    // Prepare Firebase sync
                    if (firestore) {
                        try {
                            const invRef = doc(firestore, 'inventory', inventoryItem.firebaseId!);
                            await updateDoc(invRef, {
                                quantity: increment(-requiredQty),
                                syncStatus: 'synced'
                            });
                        } catch (e) {
                            console.error("Firebase deduction failed:", e);
                        }
                    }

                    deductions.push({ name: inventoryItem.name, deducted: requiredQty });
                }
            }

            // 3. Create Yield Log Entry
            const yieldLog: Omit<YieldLog, 'id'> = {
                businessId,
                branchId: 'main', // Default branch for now
                type: 'sale',
                entityId: menuItemId,
                quantity: quantitySold,
                unit: 'servings',
                staffId,
                timestamp: new Date().toISOString(),
                syncStatus: 'pending'
            };

            const logId = await db.yieldLogs.add(yieldLog as YieldLog);

            if (firestore) {
                try {
                    const logRef = await addDoc(collection(firestore, 'yieldLogs'), yieldLog);
                    await db.yieldLogs.update(logId, { firebaseId: logRef.id, syncStatus: 'synced' });
                } catch (e) {
                    console.error("Firebase log failed:", e);
                }
            }

            return { logId, deductions };
        });
    },

    /**
     * Specifically logs waste events (e.g. dropped food, expired inventory)
     */
    async logWaste(businessId: string, inventoryItemId: string, amount: number, reason: string, staffId: string) {
        return await db.transaction('rw', [db.inventory, db.yieldLogs], async () => {
            const item = await db.inventory.where('firebaseId').equals(inventoryItemId).first();
            if (!item || !item.id) return null;

            const newQuantity = Math.max(0, item.quantity - amount);
            await db.inventory.update(item.id, { quantity: newQuantity, updatedAt: new Date().toISOString() });

            const log: Omit<YieldLog, 'id'> = {
                businessId,
                branchId: 'main',
                type: 'waste',
                entityId: inventoryItemId,
                quantity: amount,
                unit: item.unit,
                reason,
                staffId,
                timestamp: new Date().toISOString(),
                syncStatus: 'pending'
            };

            await db.yieldLogs.add(log as YieldLog);
            return true;
        });
    },

    /**
     * Logs a prep event (manual preparation of a raw ingredient)
     * Subtracts quantity from inventory
     */
    async logPrep(businessId: string, inventoryItemId: string, amount: number, staffId: string) {
        return await db.transaction('rw', [db.inventory, db.yieldLogs], async () => {
            const item = await db.inventory.where('firebaseId').equals(inventoryItemId).first();
            if (!item || !item.id) return null;

            const newQuantity = Math.max(0, item.quantity - amount);
            await db.inventory.update(item.id, { 
                quantity: newQuantity, 
                updatedAt: new Date().toISOString(),
                syncStatus: 'pending'
            });

            const log: Omit<YieldLog, 'id'> = {
                businessId,
                branchId: 'main',
                type: 'prep', // Using 'prep' type as defined in dexie.ts
                entityId: inventoryItemId,
                quantity: amount,
                unit: item.unit,
                staffId,
                timestamp: new Date().toISOString(),
                syncStatus: 'pending'
            };

            await db.yieldLogs.add(log as YieldLog);
            return true;
        });
    }
};
