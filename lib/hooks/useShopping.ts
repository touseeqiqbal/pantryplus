'use client';

import { useState, useEffect } from 'react';
import { db, ShoppingItem } from '@/lib/db/dexie';
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

export function useShopping() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();

  useEffect(() => {
    const loadItems = async () => {
      if (!currentHousehold) {
        setItems([]);
        setLoading(false);
        return;
      }

      const localItems = await db.shopping
        .where('householdId')
        .equals(currentHousehold.firebaseId || '')
        .toArray();
      setItems(localItems);
      setLoading(false);
    };
    loadItems();
  }, [currentHousehold]);

  useEffect(() => {
    if (!user || !currentHousehold || !firestore) return;

    const q = query(
      collection(firestore, 'shopping'),
      where('householdId', '==', currentHousehold.firebaseId)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      // Process all changes sequentially to avoid race conditions
      await Promise.all(snapshot.docChanges().map(async (change) => {
        const data = change.doc.data();
        const item: ShoppingItem = {
          firebaseId: change.doc.id,
          householdId: data.householdId,
          name: data.name,
          quantity: data.quantity,
          unit: data.unit,
          category: data.category,
          purchased: data.purchased,
          addedBy: data.addedBy,
          price: data.price,
          notes: data.notes,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          syncStatus: 'synced',
        };

        if (change.type === 'added' || change.type === 'modified') {
          // Reconcile by firebaseId so the realtime echo updates the existing
          // local row instead of inserting a duplicate.
          const existing = await db.shopping.where('firebaseId').equals(change.doc.id).first();
          if (existing?.id != null) {
            await db.shopping.update(existing.id, item);
          } else {
            await db.shopping.add(item);
          }
        } else if (change.type === 'removed') {
          await db.shopping.where('firebaseId').equals(change.doc.id).delete();
        }
      }));

      const localItems = await db.shopping
        .where('householdId')
        .equals(currentHousehold.firebaseId || '')
        .toArray();
      setItems(localItems);
    });

    return unsubscribe;
  }, [user, currentHousehold]);

  const addItem = async (item: Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus' | 'householdId' | 'firebaseId' | 'addedBy'>) => {
    if (!currentHousehold) throw new Error('No household selected');

    const now = new Date().toISOString();
    const newItem: ShoppingItem = {
      ...item,
      householdId: currentHousehold.firebaseId || '',
      addedBy: user?.uid,
      createdAt: now,
      updatedAt: now,
      syncStatus: user ? 'pending' : 'synced',
    };

    const id = await db.shopping.add(newItem);

    if (user && firestore) {
      try {
        const docRef = await addDoc(collection(firestore, 'shopping'), newItem);

        // Drop the optimistic row if the realtime listener already inserted
        // this doc; otherwise tag the optimistic row with its firebaseId.
        const echo = await db.shopping.where('firebaseId').equals(docRef.id).first();
        if (echo?.id != null && echo.id !== id) {
          await db.shopping.delete(id);
        } else {
          await db.shopping.update(id, {
            firebaseId: docRef.id,
            syncStatus: 'synced',
          });
        }
      } catch (error) {
        console.error('Error syncing to Firebase:', error);
        await db.shopping.update(id, { syncStatus: 'error' });
      }
    }

    const updatedItems = await db.shopping
      .where('householdId')
      .equals(currentHousehold.firebaseId || '')
      .toArray();
    setItems(updatedItems);
  };

  const updateItem = async (id: number, updates: Partial<ShoppingItem>) => {
    const item = await db.shopping.get(id);
    if (!item) return;

    const updatedItem = {
      ...updates,
      updatedAt: new Date().toISOString(),
      syncStatus: user ? 'pending' as const : 'synced' as const,
    };

    await db.shopping.update(id, updatedItem);

    if (user && item.firebaseId && firestore) {
      try {
        const docRef = doc(firestore, 'shopping', item.firebaseId);
        await updateDoc(docRef, {
          ...updatedItem,
          syncStatus: 'synced',
        });

        await db.shopping.update(id, { syncStatus: 'synced' });
      } catch (error) {
        console.error('Error syncing to Firebase:', error);
        await db.shopping.update(id, { syncStatus: 'error' });
      }
    }

    const updatedItems = await db.shopping
      .where('householdId')
      .equals(currentHousehold?.firebaseId || '')
      .toArray();
    setItems(updatedItems);
  };

  const deleteItem = async (id: number) => {
    const item = await db.shopping.get(id);
    if (!item) return;

    await db.shopping.delete(id);

    if (user && item.firebaseId && firestore) {
      try {
        await deleteDoc(doc(firestore, 'shopping', item.firebaseId));
      } catch (error) {
        console.error('Error deleting from Firebase:', error);
      }
    }

    const updatedItems = await db.shopping
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
