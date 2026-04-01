'use client';

import { useState, useEffect } from 'react';
import { db, InventoryItem } from '@/lib/db/dexie';
import { useActivityLog } from './useActivityLog';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { db as firestore } from '@/lib/firebase/config';
import { useAuth } from './useAuth';
import { useHousehold } from './useHousehold';

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { logActivity } = useActivityLog();

  // Load items from IndexedDB on mount
  useEffect(() => {
    const loadItems = async () => {
      if (!currentHousehold) {
        setItems([]);
        setLoading(false);
        return;
      }

      const localItems = await db.inventory
        .where('householdId')
        .equals(currentHousehold.firebaseId || '')
        .toArray();
      setItems(localItems);
      setLoading(false);
    };
    loadItems();
  }, [currentHousehold]);

  // Sync with Firebase when user is authenticated
  useEffect(() => {
    if (!user || !currentHousehold || !firestore) return;

    const q = query(
      collection(firestore, 'inventory'),
      where('householdId', '==', currentHousehold.firebaseId)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      // Process all changes sequentially to avoid race conditions
      await Promise.all(snapshot.docChanges().map(async (change) => {
        const data = change.doc.data();
        const item: InventoryItem = {
          firebaseId: change.doc.id,
          householdId: data.householdId,
          name: data.name,
          category: data.category,
          quantity: data.quantity,
          unit: data.unit,
          expiryDate: data.expiryDate,
          minThreshold: data.minThreshold,
          barcode: data.barcode,
          location: data.location,
          notes: data.notes,
          imageUrl: data.imageUrl,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          syncStatus: 'synced',
        };

        if (change.type === 'added' || change.type === 'modified') {
          // Check if item already exists in IndexedDB by firebaseId
          const existingItem = await db.inventory.where('firebaseId').equals(change.doc.id).first();

          if (existingItem && existingItem.id) {
            // Update existing item
            await db.inventory.update(existingItem.id, item);
          } else {
            // Check if we have a local item that was just created (might not have firebaseId yet but matches other props)
            // This is a fallback for the race condition where we just added it locally
            const localItem = await db.inventory
              .where('createdAt')
              .equals(item.createdAt)
              .first();

            if (localItem && localItem.id) {
              await db.inventory.update(localItem.id, {
                ...item,
                firebaseId: change.doc.id,
                syncStatus: 'synced'
              });
            } else {
              // Add new item
              await db.inventory.put(item);
            }
          }
        } else if (change.type === 'removed') {
          await db.inventory.where('firebaseId').equals(change.doc.id).delete();
        }
      }));

      // Reload items from IndexedDB
      const localItems = await db.inventory
        .where('householdId')
        .equals(currentHousehold.firebaseId || '')
        .toArray();
      setItems(localItems);
    });

    return unsubscribe;
  }, [user, currentHousehold]);

  const addItem = async (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus' | 'householdId' | 'firebaseId'>) => {
    if (!currentHousehold) throw new Error('No household selected');

    const now = new Date().toISOString();
    const newItem: InventoryItem = {
      ...item,
      householdId: currentHousehold.firebaseId || '',
      createdAt: now,
      updatedAt: now,
      syncStatus: user ? 'pending' : 'synced',
    };

    // Add to IndexedDB
    const id = await db.inventory.add(newItem);

    // Sync to Firebase if user is authenticated
    if (user && firestore) {
      try {
        const docRef = await addDoc(collection(firestore, 'inventory'), newItem);

        // Update local item with Firebase ID
        await db.inventory.update(id, {
          firebaseId: docRef.id,
          syncStatus: 'synced',
        });
      } catch (error) {
        console.error('Error syncing to Firebase:', error);
        await db.inventory.update(id, { syncStatus: 'error' });
      }
    }

    // Reload items
    const updatedItems = await db.inventory
      .where('householdId')
      .equals(currentHousehold.firebaseId || '')
      .toArray();
    setItems(updatedItems);
  };

  const updateItem = async (id: number, updates: Partial<InventoryItem>) => {
    const item = await db.inventory.get(id);
    if (!item) return;

    const updatedItem = {
      ...updates,
      updatedAt: new Date().toISOString(),
      syncStatus: user ? 'pending' as const : 'synced' as const,
    };

    // Update in IndexedDB
    await db.inventory.update(id, updatedItem);

    // Sync to Firebase if user is authenticated and item has firebaseId
    if (user && item.firebaseId && firestore) {
      try {
        const docRef = doc(firestore, 'inventory', item.firebaseId);
        await updateDoc(docRef, {
          ...updatedItem,
          syncStatus: 'synced',
        });

        await db.inventory.update(id, { syncStatus: 'synced' });
      } catch (error) {
        console.error('Error syncing to Firebase:', error);
        await db.inventory.update(id, { syncStatus: 'error' });
      }
    }

    // Reload items
    const updatedItems = await db.inventory
      .where('householdId')
      .equals(currentHousehold?.firebaseId || '')
      .toArray();
    setItems(updatedItems);
  };

  const deleteItem = async (id: number) => {
    const item = await db.inventory.get(id);
    if (!item) return;

    // Delete from IndexedDB
    await db.inventory.delete(id);

    // Delete from Firebase if user is authenticated and item has firebaseId
    if (user && item.firebaseId && firestore) {
      try {
        await deleteDoc(doc(firestore, 'inventory', item.firebaseId));
      } catch (error) {
        console.error('Error deleting from Firebase:', error);
      }
    }

    // Reload items
    const updatedItems = await db.inventory
      .where('householdId')
      .equals(currentHousehold?.firebaseId || '')
      .toArray();
    setItems(updatedItems);
  };

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
  };
}
