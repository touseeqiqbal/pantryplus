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
import { useBusiness } from './useBusiness';
import { useAppMode } from './useAppMode';

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { currentBusiness } = useBusiness();
  const { isBusiness } = useAppMode();
  const { logActivity } = useActivityLog();

  // Determine the current context ID and field name
  const contextId = isBusiness ? currentBusiness?.firebaseId : currentHousehold?.firebaseId;
  const contextField = isBusiness ? 'businessId' : 'householdId';

  // Load items from IndexedDB on mount or context change
  useEffect(() => {
    const loadItems = async () => {
      if (!contextId) {
        setItems([]);
        setLoading(false);
        return;
      }

      const localItems = await db.inventory
        .where(contextField)
        .equals(contextId)
        .toArray();
      setItems(localItems);
      setLoading(false);
    };
    loadItems();
  }, [contextId, contextField, isBusiness]);

  // Sync with Firebase
  useEffect(() => {
    if (!user || !contextId || !firestore) return;

    const q = query(
      collection(firestore, 'inventory'),
      where(contextField, '==', contextId)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      await Promise.all(snapshot.docChanges().map(async (change) => {
        const data = change.doc.data();
        const item: InventoryItem = {
          firebaseId: change.doc.id,
          householdId: data.householdId || '',
          businessId: data.businessId || '',
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
          await db.inventory.put(item);
        } else if (change.type === 'removed') {
          await db.inventory.where('firebaseId').equals(change.doc.id).delete();
        }
      }));

      // Reload items from IndexedDB
      const localItems = await db.inventory
        .where(contextField)
        .equals(contextId)
        .toArray();
      setItems(localItems);
    });

    return unsubscribe;
  }, [user, contextId, contextField]);

  const addItem = async (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus' | 'householdId' | 'businessId' | 'firebaseId'>) => {
    if (!contextId) throw new Error('No context selected');

    const now = new Date().toISOString();
    const newItem: Partial<InventoryItem> = {
      ...item,
      [contextField]: contextId,
      createdAt: now,
      updatedAt: now,
      syncStatus: user ? 'pending' : 'synced',
    };

    // Add to IndexedDB
    const id = await db.inventory.add(newItem as InventoryItem);

    if (user && firestore) {
      try {
        const docRef = await addDoc(collection(firestore, 'inventory'), newItem);
        await db.inventory.update(id, {
          firebaseId: docRef.id,
          syncStatus: 'synced',
        });
      } catch (error) {
        console.error('Error syncing to Firebase:', error);
        await db.inventory.update(id, { syncStatus: 'error' });
      }
    }

    const updatedItems = await db.inventory
      .where(contextField)
      .equals(contextId)
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

    await db.inventory.update(id, updatedItem);

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

    const updatedItems = await db.inventory
      .where(contextField)
      .equals(contextId || '')
      .toArray();
    setItems(updatedItems);
  };

  const deleteItem = async (id: number) => {
    const item = await db.inventory.get(id);
    if (!item) return;

    await db.inventory.delete(id);

    if (user && item.firebaseId && firestore) {
      try {
        await deleteDoc(doc(firestore, 'inventory', item.firebaseId));
      } catch (error) {
        console.error('Error deleting from Firebase:', error);
      }
    }

    const updatedItems = await db.inventory
      .where(contextField)
      .equals(contextId || '')
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
