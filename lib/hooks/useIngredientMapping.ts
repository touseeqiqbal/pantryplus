'use client';

import { useState, useEffect } from 'react';
import { db, IngredientMapping } from '@/lib/db/dexie';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  setDoc,
} from 'firebase/firestore';
import { db as firestore } from '@/lib/firebase/config';
import { useAuth } from './useAuth';
import { useBusiness } from './useBusiness';

export function useIngredientMapping(menuItemId?: string) {
  const [mapping, setMapping] = useState<IngredientMapping | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { currentBusiness } = useBusiness();

  const businessId = currentBusiness?.firebaseId;

  // Load mapping from IndexedDB
  useEffect(() => {
    const loadMapping = async () => {
      if (!businessId || !menuItemId) {
        setMapping(null);
        setLoading(false);
        return;
      }

      const localMapping = await db.ingredientMappings
        .where('menuItemId')
        .equals(menuItemId)
        .first();
      
      setMapping(localMapping || null);
      setLoading(false);
    };
    loadMapping();
  }, [businessId, menuItemId]);

  // Sync with Firebase
  useEffect(() => {
    if (!user || !businessId || !menuItemId || !firestore) return;

    const q = query(
      collection(firestore, 'ingredientMappings'),
      where('menuItemId', '==', menuItemId)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (!snapshot.empty) {
        const docData = snapshot.docs[0].data();
        const mappingData: IngredientMapping = {
          firebaseId: snapshot.docs[0].id,
          businessId: docData.businessId,
          menuItemId: docData.menuItemId,
          ingredients: docData.ingredients,
          createdAt: docData.createdAt,
          updatedAt: docData.updatedAt,
          syncStatus: 'synced',
        };
        // Reconcile by firebaseId so the realtime echo updates the existing
        // local row instead of inserting a duplicate.
        const existing = await db.ingredientMappings
          .where('firebaseId')
          .equals(snapshot.docs[0].id)
          .first();
        if (existing?.id != null) {
          await db.ingredientMappings.update(existing.id, mappingData as Partial<IngredientMapping>);
        } else {
          await db.ingredientMappings.add(mappingData);
        }
        setMapping(mappingData);
      }
    });

    return unsubscribe;
  }, [user, businessId, menuItemId]);

  const saveMapping = async (ingredients: IngredientMapping['ingredients']) => {
    if (!businessId || !menuItemId) throw new Error('Missing context');

    const now = new Date().toISOString();
    const existing = await db.ingredientMappings.where('menuItemId').equals(menuItemId).first();
    
    const mappingData: Omit<IngredientMapping, 'id'> = {
      businessId,
      menuItemId,
      ingredients,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      syncStatus: user ? 'pending' : 'synced',
    };

    // Local id we will write firebaseId / syncStatus back to.
    let localId: number;
    if (existing?.id) {
       await db.ingredientMappings.update(existing.id, mappingData);
       localId = existing.id;
    } else {
       localId = await db.ingredientMappings.add(mappingData as IngredientMapping);
    }

    if (user && firestore) {
      try {
        // Reuse the existing remote doc if there is one; otherwise create it.
        const q = query(collection(firestore, 'ingredientMappings'), where('menuItemId', '==', menuItemId));
        const snapshot = await (await import('firebase/firestore')).getDocs(q);

        let firebaseId: string;
        if (!snapshot.empty) {
           firebaseId = snapshot.docs[0].id;
           await updateDoc(doc(firestore, 'ingredientMappings', firebaseId), {
              ...mappingData,
              syncStatus: 'synced'
           });
        } else {
           const ref = await addDoc(collection(firestore, 'ingredientMappings'), mappingData);
           firebaseId = ref.id;
        }

        // Write the firebaseId back so the sync service won't create a duplicate.
        await db.ingredientMappings.update(localId, { firebaseId, syncStatus: 'synced' });
        const synced = await db.ingredientMappings.get(localId);
        setMapping(synced || (mappingData as IngredientMapping));
        return;
      } catch (error) {
        console.error('Error saving mapping to Firebase:', error);
        await db.ingredientMappings.update(localId, { syncStatus: 'error' });
      }
    }

    const saved = await db.ingredientMappings.get(localId);
    setMapping(saved || (mappingData as IngredientMapping));
  };

  return {
    mapping,
    loading,
    saveMapping,
  };
}
