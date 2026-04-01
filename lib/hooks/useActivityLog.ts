'use client';

import { useState, useEffect } from 'react';
import { db, Activity } from '@/lib/db/dexie';
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
} from 'firebase/firestore';
import { db as firestore } from '@/lib/firebase/config';
import { useAuth } from './useAuth';
import { useHousehold } from './useHousehold';

export function useActivityLog() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const { user } = useAuth();
    const { currentHousehold } = useHousehold();

    // Sync from Firebase
    useEffect(() => {
        if (!user || !currentHousehold || !firestore) return;

        const q = query(
            collection(firestore, 'activities'),
            where('householdId', '==', currentHousehold.firebaseId),
            orderBy('timestamp', 'desc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            // Process all changes sequentially to avoid race conditions
            await Promise.all(snapshot.docChanges().map(async (change) => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    const activity: Activity = {
                        firebaseId: change.doc.id,
                        householdId: data.householdId,
                        userId: data.userId,
                        action: data.action,
                        entityType: data.entityType,
                        entityName: data.entityName,
                        details: data.details,
                        timestamp: data.timestamp,
                        syncStatus: 'synced',
                    };

                    const existing = await db.activities.where('firebaseId').equals(change.doc.id).first();
                    if (!existing) {
                        await db.activities.add(activity);
                    }
                }
            }));

            // Update local state
            const localActivities = await db.activities
                .where('householdId')
                .equals(currentHousehold.firebaseId || '')
                .reverse()
                .sortBy('timestamp');

            setActivities(localActivities.slice(0, 50));
        });

        return unsubscribe;
    }, [user, currentHousehold]);

    const logActivity = async (
        action: Activity['action'],
        entityType: Activity['entityType'],
        entityName: string,
        details?: string
    ) => {
        if (!user || !currentHousehold) return;

        const now = new Date().toISOString();
        const activity: Activity = {
            householdId: currentHousehold.firebaseId || '',
            userId: user.uid,
            action,
            entityType,
            entityName,
            details,
            timestamp: now,
            syncStatus: 'pending',
        };

        const id = await db.activities.add(activity);

        if (firestore) {
            try {
                const docRef = await addDoc(collection(firestore, 'activities'), activity);
                await db.activities.update(id, { firebaseId: docRef.id, syncStatus: 'synced' });
            } catch (error) {
                console.error('Error syncing activity:', error);
                await db.activities.update(id, { syncStatus: 'error' });
            }
        }
    };

    return {
        activities,
        logActivity
    };
}
