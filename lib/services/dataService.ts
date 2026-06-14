/**
 * Data lifecycle service (Module 11: Data Privacy — "Right to be Forgotten").
 *
 * Provides a one-click "Delete All Data" that removes BOTH the local IndexedDB
 * copy and the user's cloud records. Cloud deletion is scoped to households the
 * user OWNS (we cannot delete data owned by other members), plus the user's own
 * notifications. Everything is best-effort: a failure on one document never
 * aborts the rest.
 */

import { db } from '@/lib/db/dexie';
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db as firestore } from '@/lib/firebase/config';

// Household-scoped collections that should be removed with an owned household.
const HOUSEHOLD_COLLECTIONS = [
  'inventory',
  'shopping',
  'recipes',
  'meals',
  'tasks',
  'expenses',
  'budgets',
  'activities',
];

async function clearLocalData(): Promise<void> {
  // Wipe every Dexie table.
  await Promise.all(db.tables.map((table) => table.clear().catch(() => undefined)));

  // Clear app-level localStorage (settings, integration connections, etc.).
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.clear();
    } catch {
      /* ignore */
    }
  }
}

async function deleteCloudData(userId: string, email?: string | null): Promise<void> {
  if (!firestore) return;

  // 1. Delete the user's own notifications.
  try {
    const notifSnap = await getDocs(
      query(collection(firestore, 'notifications'), where('userId', '==', userId))
    );
    await Promise.all(notifSnap.docs.map((d) => deleteDoc(d.ref).catch(() => undefined)));
  } catch {
    /* ignore */
  }

  // 2. Find households this user OWNS and cascade-delete their contents.
  try {
    const householdSnap = await getDocs(
      query(collection(firestore, 'households'), where('createdBy', '==', userId))
    );

    for (const householdDoc of householdSnap.docs) {
      const householdId = householdDoc.id;

      for (const collName of HOUSEHOLD_COLLECTIONS) {
        try {
          const childSnap = await getDocs(
            query(collection(firestore, collName), where('householdId', '==', householdId))
          );
          await Promise.all(childSnap.docs.map((d) => deleteDoc(d.ref).catch(() => undefined)));
        } catch {
          /* ignore individual collection failures */
        }
      }

      // Remove pending invitations for the household.
      try {
        const invSnap = await getDocs(
          query(collection(firestore, 'invitations'), where('householdId', '==', householdId))
        );
        await Promise.all(invSnap.docs.map((d) => deleteDoc(d.ref).catch(() => undefined)));
      } catch {
        /* ignore */
      }

      // Finally delete the household document itself.
      await deleteDoc(doc(firestore, 'households', householdId)).catch(() => undefined);
    }
  } catch {
    /* ignore */
  }

  // 3. Decline/remove invitations addressed to this user's email.
  if (email) {
    try {
      const invSnap = await getDocs(
        query(collection(firestore, 'invitations'), where('invitedEmail', '==', email))
      );
      await Promise.all(invSnap.docs.map((d) => deleteDoc(d.ref).catch(() => undefined)));
    } catch {
      /* ignore */
    }
  }
}

/**
 * Delete all of the user's local and (owned) cloud data.
 * Returns true on completion. Always clears local data even if cloud fails.
 */
export async function deleteAllUserData(
  userId: string | undefined,
  email?: string | null
): Promise<boolean> {
  if (userId) {
    try {
      await deleteCloudData(userId, email);
    } catch (error) {
      console.error('Cloud data deletion error (continuing with local wipe):', error);
    }
  }
  await clearLocalData();
  return true;
}
