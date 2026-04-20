'use client';

import { useState, useEffect } from 'react';
import { db, MenuItem } from '@/lib/db/dexie';
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
import { useBusiness } from './useBusiness';
import { useAppMode } from './useAppMode';

export function useMenuItems() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { currentBusiness } = useBusiness();
  const { isBusiness } = useAppMode();

  const businessId = currentBusiness?.firebaseId;

  // Load menu items from IndexedDB
  useEffect(() => {
    const loadItems = async () => {
      if (!isBusiness || !businessId) {
        setMenuItems([]);
        setLoading(false);
        return;
      }

      const localItems = await db.menuItems
        .where('businessId')
        .equals(businessId)
        .toArray();
      setMenuItems(localItems);
      setLoading(false);
    };
    loadItems();
  }, [businessId, isBusiness]);

  // Sync with Firebase
  useEffect(() => {
    if (!user || !isBusiness || !businessId || !firestore) return;

    const q = query(
      collection(firestore, 'menuItems'),
      where('businessId', '==', businessId)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      await Promise.all(snapshot.docChanges().map(async (change) => {
        const data = change.doc.data();
        const item: MenuItem = {
          firebaseId: change.doc.id,
          businessId: data.businessId,
          name: data.name,
          category: data.category,
          price: data.price,
          costPrice: data.costPrice,
          imageUrl: data.imageUrl,
          isActive: data.isActive,
          recipeMappingId: data.recipeMappingId,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          syncStatus: 'synced',
        };

        if (change.type === 'added' || change.type === 'modified') {
          await db.menuItems.put(item);
        } else if (change.type === 'removed') {
          await db.menuItems.where('firebaseId').equals(change.doc.id).delete();
        }
      }));

      const localItems = await db.menuItems
        .where('businessId')
        .equals(businessId)
        .toArray();
      setMenuItems(localItems);
    });

    return unsubscribe;
  }, [user, businessId, isBusiness]);

  const addMenuItem = async (item: Omit<MenuItem, 'id' | 'firebaseId' | 'businessId' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => {
    if (!businessId) throw new Error('No business selected');

    const now = new Date().toISOString();
    const newItem: Omit<MenuItem, 'id'> = {
      ...item,
      businessId,
      createdAt: now,
      updatedAt: now,
      syncStatus: user ? 'pending' : 'synced',
    };

    const id = await db.menuItems.add(newItem as MenuItem);

    if (user && firestore) {
      try {
        const docRef = await addDoc(collection(firestore, 'menuItems'), newItem);
        await db.menuItems.update(id, { firebaseId: docRef.id, syncStatus: 'synced' });
      } catch (error) {
        console.error('Error syncing menu item:', error);
        await db.menuItems.update(id, { syncStatus: 'error' });
      }
    }

    const updated = await db.menuItems.where('businessId').equals(businessId).toArray();
    setMenuItems(updated);
  };

  const updateMenuItem = async (id: number, updates: Partial<MenuItem>) => {
    const item = await db.menuItems.get(id);
    if (!item) return;

    const updatedItem = {
      ...updates,
      updatedAt: new Date().toISOString(),
      syncStatus: user ? 'pending' as const : 'synced' as const,
    };

    await db.menuItems.update(id, updatedItem);

    if (user && item.firebaseId && firestore) {
      try {
        const docRef = doc(firestore, 'menuItems', item.firebaseId);
        await updateDoc(docRef, { ...updatedItem, syncStatus: 'synced' });
        await db.menuItems.update(id, { syncStatus: 'synced' });
      } catch (error) {
        console.error('Error updating menu item:', error);
      }
    }

    const updated = await db.menuItems.where('businessId').equals(businessId || '').toArray();
    setMenuItems(updated);
  };

  const deleteMenuItem = async (id: number) => {
    const item = await db.menuItems.get(id);
    if (!item) return;

    await db.menuItems.delete(id);

    if (user && item.firebaseId && firestore) {
      try {
        await deleteDoc(doc(firestore, 'menuItems', item.firebaseId));
      } catch (error) {
        console.error('Error deleting menu item:', error);
      }
    }

    const updated = await db.menuItems.where('businessId').equals(businessId || '').toArray();
    setMenuItems(updated);
  };

  return {
    menuItems,
    loading,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
  };
}
