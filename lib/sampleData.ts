/**
 * Optional starter inventory for first-run users who pick "Start with sample
 * data" during onboarding. Gives a brand-new account something to explore so
 * the dashboard, expiry watch, recipes and AI all have data to work with.
 *
 * The seeder writes directly to Dexie (and best-effort to Firestore) given an
 * explicit householdId, so it does NOT depend on the useInventory() hook's
 * context being ready — avoiding the stale-closure timing problem when we seed
 * immediately after creating the household.
 */
import { db, InventoryItem } from '@/lib/db/dexie';
import { collection, addDoc } from 'firebase/firestore';
import { db as firestore } from '@/lib/firebase/config';

type Units = 'metric' | 'imperial';

interface SampleSpec {
  name: string;
  category: string;
  quantity: number;
  unit: { metric: string; imperial: string };
  /** Days from now until expiry (undefined = no expiry, e.g. dry staples). */
  expiresInDays?: number;
  minThreshold?: number;
  location: string;
}

// A realistic, cuisine-neutral starter pantry. A few items expire within a week
// on purpose so the "Expiring Soon" and sustainability widgets light up.
const SAMPLE_SPECS: SampleSpec[] = [
  { name: 'Milk', category: 'Dairy', quantity: 1, unit: { metric: 'L', imperial: 'gal' }, expiresInDays: 4, location: 'Fridge' },
  { name: 'Eggs', category: 'Dairy', quantity: 12, unit: { metric: 'pcs', imperial: 'pcs' }, expiresInDays: 12, location: 'Fridge' },
  { name: 'Bread', category: 'Bakery', quantity: 1, unit: { metric: 'loaf', imperial: 'loaf' }, expiresInDays: 3, location: 'Pantry' },
  { name: 'Chicken Breast', category: 'Meat', quantity: 1, unit: { metric: '500 g', imperial: '1 lb' }, expiresInDays: 2, location: 'Fridge' },
  { name: 'Spinach', category: 'Produce', quantity: 1, unit: { metric: 'bag', imperial: 'bag' }, expiresInDays: 1, location: 'Fridge' },
  { name: 'Tomatoes', category: 'Produce', quantity: 6, unit: { metric: 'pcs', imperial: 'pcs' }, expiresInDays: 5, location: 'Counter' },
  { name: 'Bananas', category: 'Produce', quantity: 6, unit: { metric: 'pcs', imperial: 'pcs' }, expiresInDays: 4, location: 'Counter' },
  { name: 'Yogurt', category: 'Dairy', quantity: 1, unit: { metric: '500 g', imperial: '16 oz' }, expiresInDays: 6, location: 'Fridge' },
  { name: 'Cheese', category: 'Dairy', quantity: 1, unit: { metric: '250 g', imperial: '8 oz' }, expiresInDays: 14, location: 'Fridge' },
  { name: 'Onions', category: 'Produce', quantity: 1, unit: { metric: '1 kg', imperial: '2 lb' }, expiresInDays: 20, minThreshold: 1, location: 'Pantry' },
  { name: 'Rice', category: 'Pantry', quantity: 1, unit: { metric: '2 kg', imperial: '5 lb' }, minThreshold: 1, location: 'Pantry' },
  { name: 'Pasta', category: 'Pantry', quantity: 2, unit: { metric: '500 g', imperial: '1 lb' }, minThreshold: 1, location: 'Pantry' },
];

const daysFromNow = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

/**
 * Seed the starter inventory for a household. Mirrors useInventory().addItem:
 * writes to IndexedDB first (offline-first) then best-effort to Firestore,
 * reconciling by firebaseId so a realtime echo can't create duplicates.
 */
export async function seedSampleInventory(
  householdId: string,
  userId: string | null,
  units: Units = 'metric'
): Promise<void> {
  const now = new Date().toISOString();

  for (const spec of SAMPLE_SPECS) {
    const newItem: Partial<InventoryItem> = {
      householdId,
      name: spec.name,
      category: spec.category,
      quantity: spec.quantity,
      unit: spec.unit[units],
      location: spec.location,
      ...(spec.expiresInDays !== undefined ? { expiryDate: daysFromNow(spec.expiresInDays) } : {}),
      ...(spec.minThreshold !== undefined ? { minThreshold: spec.minThreshold } : {}),
      isPrivate: false,
      createdBy: userId || '',
      createdAt: now,
      updatedAt: now,
      syncStatus: userId ? 'pending' : 'synced',
    };

    const localId = await db.inventory.add(newItem as InventoryItem);

    if (userId && firestore) {
      try {
        const docRef = await addDoc(collection(firestore, 'inventory'), newItem);
        const echo = await db.inventory.where('firebaseId').equals(docRef.id).first();
        if (echo?.id != null && echo.id !== localId) {
          await db.inventory.delete(localId);
        } else {
          await db.inventory.update(localId, { firebaseId: docRef.id, syncStatus: 'synced' });
        }
      } catch (err) {
        console.error('[sampleData] failed to sync starter item:', spec.name, err);
        await db.inventory.update(localId, { syncStatus: 'error' });
      }
    }
  }
}

export const SAMPLE_ITEM_COUNT = SAMPLE_SPECS.length;
