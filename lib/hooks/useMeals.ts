'use client';

import { useState, useEffect } from 'react';
import { db, MealPlan } from '@/lib/db/dexie';
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

export function useMeals() {
    const [meals, setMeals] = useState<MealPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { currentHousehold } = useHousehold();

    // Load meals from IndexedDB
    useEffect(() => {
        const loadMeals = async () => {
            if (!currentHousehold) {
                setLoading(false);
                return;
            }

            const localMeals = await db.meals
                .where('householdId')
                .equals(currentHousehold.firebaseId || '')
                .toArray();
            setMeals(localMeals);
            setLoading(false);
        };

        loadMeals();
    }, [currentHousehold]);

    // Sync with Firebase
    useEffect(() => {
        if (!user || !currentHousehold || !firestore) return;

        const q = query(
            collection(firestore, 'meals'),
            where('householdId', '==', currentHousehold.firebaseId)
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            // Process all changes sequentially to avoid race conditions
            await Promise.all(snapshot.docChanges().map(async (change) => {
                const data = change.doc.data();
                const meal: MealPlan = {
                    firebaseId: change.doc.id,
                    householdId: data.householdId,
                    date: data.date,
                    mealType: data.mealType,
                    recipeId: data.recipeId,
                    recipeName: data.recipeName,
                    customMeal: data.customMeal,
                    servings: data.servings,
                    assignedTo: data.assignedTo,
                    notes: data.notes,
                    nutritionInfo: data.nutritionInfo,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                    syncStatus: 'synced',
                };

                if (change.type === 'added' || change.type === 'modified') {
                    const existing = await db.meals.where('firebaseId').equals(change.doc.id).first();
                    if (existing && existing.id) {
                        await db.meals.update(existing.id, meal);
                    } else {
                        await db.meals.add(meal);
                    }
                } else if (change.type === 'removed') {
                    await db.meals.where('firebaseId').equals(change.doc.id).delete();
                }
            }));

            const localMeals = await db.meals
                .where('householdId')
                .equals(currentHousehold.firebaseId || '')
                .toArray();
            setMeals(localMeals);
        });

        return unsubscribe;
    }, [user, currentHousehold]);

    const addMeal = async (meal: Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus' | 'householdId' | 'firebaseId'>) => {
        if (!currentHousehold) throw new Error('No household selected');

        const now = new Date().toISOString();
        const newMeal: MealPlan = {
            ...meal,
            householdId: currentHousehold.firebaseId || '',
            createdAt: now,
            updatedAt: now,
            syncStatus: user ? 'pending' : 'synced',
        };

        const id = await db.meals.add(newMeal);

        if (user && firestore) {
            try {
                const docRef = await addDoc(collection(firestore, 'meals'), newMeal);
                await db.meals.update(id, { firebaseId: docRef.id, syncStatus: 'synced' });
            } catch (error) {
                console.error('Error syncing meal to Firebase:', error);
                await db.meals.update(id, { syncStatus: 'error' });
            }
        }

        const updatedMeals = await db.meals
            .where('householdId')
            .equals(currentHousehold.firebaseId || '')
            .toArray();
        setMeals(updatedMeals);
    };

    const updateMeal = async (id: number, updates: Partial<MealPlan>) => {
        const meal = await db.meals.get(id);
        if (!meal) return;

        const updatedMeal = {
            ...updates,
            updatedAt: new Date().toISOString(),
            syncStatus: user ? 'pending' as const : 'synced' as const,
        };

        await db.meals.update(id, updatedMeal);

        if (user && meal.firebaseId && firestore) {
            try {
                const docRef = doc(firestore, 'meals', meal.firebaseId);
                await updateDoc(docRef, { ...updatedMeal, syncStatus: 'synced' });
                await db.meals.update(id, { syncStatus: 'synced' });
            } catch (error) {
                console.error('Error syncing meal to Firebase:', error);
                await db.meals.update(id, { syncStatus: 'error' });
            }
        }

        const updatedMeals = await db.meals
            .where('householdId')
            .equals(currentHousehold?.firebaseId || '')
            .toArray();
        setMeals(updatedMeals);
    };

    const deleteMeal = async (id: number) => {
        const meal = await db.meals.get(id);
        if (!meal) return;

        await db.meals.delete(id);

        if (user && meal.firebaseId && firestore) {
            try {
                await deleteDoc(doc(firestore, 'meals', meal.firebaseId));
            } catch (error) {
                console.error('Error deleting meal from Firebase:', error);
            }
        }

        const updatedMeals = await db.meals
            .where('householdId')
            .equals(currentHousehold?.firebaseId || '')
            .toArray();
        setMeals(updatedMeals);
    };

    const getMealPlan = (startDate: string, endDate: string) => {
        return meals.filter(meal => meal.date >= startDate && meal.date <= endDate);
    };

    return {
        meals,
        loading,
        addMeal,
        updateMeal,
        deleteMeal,
        getMealPlan,
    };
}
