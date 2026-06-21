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

  // Module 11: hide items another member marked Private. The owner still sees
  // their own private items; everyone sees non-private items.
  const visibleToUser = (list: InventoryItem[]) =>
    list.filter(item => !item.isPrivate || !item.createdBy || item.createdBy === user?.uid);

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
      setItems(visibleToUser(localItems));
      setLoading(false);
    };
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextId, contextField, isBusiness, user]);

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
          isPrivate: data.isPrivate || false,
          createdBy: data.createdBy || '',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          syncStatus: 'synced',
        };

        if (change.type === 'added' || change.type === 'modified') {
          // Reconcile by firebaseId so the realtime echo updates the existing
          // local row instead of inserting a duplicate (put() with no primary
          // key always inserts a new row).
          const existing = await db.inventory.where('firebaseId').equals(change.doc.id).first();
          if (existing?.id != null) {
            await db.inventory.update(existing.id, item);
          } else {
            await db.inventory.add(item);
          }
        } else if (change.type === 'removed') {
          await db.inventory.where('firebaseId').equals(change.doc.id).delete();
        }
      }));

      // Reload items from IndexedDB
      const localItems = await db.inventory
        .where(contextField)
        .equals(contextId)
        .toArray();
      setItems(visibleToUser(localItems));
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, contextId, contextField]);

  const addItem = async (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus' | 'householdId' | 'businessId' | 'firebaseId'>) => {
    if (!contextId) throw new Error('No context selected');

    const now = new Date().toISOString();
    const newItem: Partial<InventoryItem> = {
      ...item,
      [contextField]: contextId,
      createdBy: user?.uid || '',
      createdAt: now,
      updatedAt: now,
      syncStatus: user ? 'pending' : 'synced',
    };

    // Add to IndexedDB
    const id = await db.inventory.add(newItem as InventoryItem);

    if (user && firestore) {
      try {
        const docRef = await addDoc(collection(firestore, 'inventory'), newItem);
        // The realtime listener may have already inserted this doc. If so, drop
        // our optimistic row so we don't end up with duplicates; otherwise tag
        // the optimistic row with its firebaseId.
        const echo = await db.inventory.where('firebaseId').equals(docRef.id).first();
        if (echo?.id != null && echo.id !== id) {
          await db.inventory.delete(id);
        } else {
          await db.inventory.update(id, {
            firebaseId: docRef.id,
            syncStatus: 'synced',
          });
        }
      } catch (error) {
        console.error('Error syncing to Firebase:', error);
        await db.inventory.update(id, { syncStatus: 'error' });
      }
    }

    logActivity('create', 'inventory', item.name);

    const updatedItems = await db.inventory
      .where(contextField)
      .equals(contextId)
      .toArray();
    setItems(visibleToUser(updatedItems));
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

    logActivity('update', 'inventory', updates.name || item.name);

    const updatedItems = await db.inventory
      .where(contextField)
      .equals(contextId || '')
      .toArray();
    setItems(visibleToUser(updatedItems));
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

    logActivity('delete', 'inventory', item.name);

    const updatedItems = await db.inventory
      .where(contextField)
      .equals(contextId || '')
      .toArray();
    setItems(visibleToUser(updatedItems));
  };

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
  };
}
