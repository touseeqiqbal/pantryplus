/**
 * Background Sync Service (Module 10: PWA, Offline Architecture & Performance)
 *
 * The app is offline-first: every write lands in IndexedDB (Dexie) instantly and
 * is tagged syncStatus = 'pending'. When the device is online, the hooks push the
 * change to Firestore immediately. If the device is offline (or Firestore fails),
 * the record stays 'pending' / 'error'.
 *
 * This service is the retry mechanism that flushes those queued records to
 * Firestore once connectivity returns. It is driven by SyncManager, which calls
 * syncPendingItems() on app start, on the window 'online' event, and on a poll.
 *
 * Conflict resolution: Last-Write-Wins (LWW). Before overwriting an existing
 * Firestore document we compare updatedAt timestamps; if the remote copy is newer
 * than our pending local copy, the remote wins and we drop the local change.
 */

import { db } from '@/lib/db/dexie';
import type { Table } from 'dexie';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import { db as firestore } from '@/lib/firebase/config';
import { sanitizeForFirestore } from '@/lib/firebase/sanitize';

// Dexie table name === Firestore collection name for every syncable entity.
const SYNCABLE_TABLES = [
  'inventory',
  'shopping',
  'recipes',
  'meals',
  'tasks',
  'expenses',
  'budgets',
  'households',
  'invitations',
  'activities',
  'businesses',
  'branches',
  'menuItems',
  'ingredientMappings',
  'yieldLogs',
  'staff',
  'notifications',
] as const;

type SyncableRecord = {
  id?: number;
  firebaseId?: string;
  updatedAt?: string;
  createdAt?: string;
  timestamp?: string;
  syncStatus?: 'synced' | 'pending' | 'error';
  [key: string]: unknown;
};

export interface SyncResult {
  pushed: number;
  failed: number;
  skipped: number;
}

let syncInProgress = false;

/**
 * Strip local-only fields before writing a record to Firestore.
 */
function toFirestorePayload(record: SyncableRecord): Record<string, unknown> {
  const { id, ...rest } = record;
  void id;
  // sanitizeForFirestore strips null/undefined array elements that would
  // otherwise corrupt the document and crash the SDK on read-back.
  return sanitizeForFirestore({ ...rest, syncStatus: 'synced' });
}

/**
 * Best-effort timestamp for Last-Write-Wins comparison.
 */
function recordTimestamp(record: SyncableRecord): number {
  const stamp = record.updatedAt || record.timestamp || record.createdAt;
  const parsed = stamp ? Date.parse(stamp) : NaN;
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Flush every 'pending' / 'error' record across all tables to Firestore.
 * Returns counts of what happened. Safe to call repeatedly; it no-ops when a
 * sync is already running, when offline, or when Firestore is not configured.
 */
export async function syncPendingItems(): Promise<SyncResult> {
  const result: SyncResult = { pushed: 0, failed: 0, skipped: 0 };

  if (syncInProgress) return result;
  if (typeof navigator !== 'undefined' && !navigator.onLine) return result;
  if (!firestore) return result;

  syncInProgress = true;

  try {
    for (const tableName of SYNCABLE_TABLES) {
      const table = (db as unknown as Record<string, Table<SyncableRecord, number>>)[tableName];
      if (!table) continue;

      // Filter in JS (not all tables index syncStatus) — the pending set is small.
      const all = await table.toArray();
      const pending = all.filter(
        (r) => r.syncStatus === 'pending' || r.syncStatus === 'error'
      );

      for (const record of pending) {
        if (record.id == null) continue;

        try {
          if (!record.firebaseId) {
            // Never synced — create the document.
            const ref = await addDoc(
              collection(firestore, tableName),
              toFirestorePayload(record)
            );
            await table.update(record.id, {
              firebaseId: ref.id,
              syncStatus: 'synced',
            });
            result.pushed++;
          } else {
            // Already has a remote doc — resolve conflicts via Last-Write-Wins.
            const ref = doc(firestore, tableName, record.firebaseId);
            const remote = await getDoc(ref);

            if (remote.exists()) {
              const remoteData = remote.data() as SyncableRecord;
              if (recordTimestamp(remoteData) > recordTimestamp(record)) {
                // Remote is newer: it wins. Adopt it locally and mark synced.
                await table.update(record.id, {
                  ...remoteData,
                  id: record.id,
                  firebaseId: record.firebaseId,
                  syncStatus: 'synced',
                });
                result.skipped++;
                continue;
              }
            }

            await updateDoc(ref, toFirestorePayload(record));
            await table.update(record.id, { syncStatus: 'synced' });
            result.pushed++;
          }
        } catch (error) {
          console.error(`Sync failed for ${tableName}#${record.id}:`, error);
          await table.update(record.id, { syncStatus: 'error' });
          result.failed++;
        }
      }
    }
  } finally {
    syncInProgress = false;
  }

  if (result.pushed > 0 || result.failed > 0) {
    console.log(
      `[sync] pushed=${result.pushed} failed=${result.failed} skipped=${result.skipped}`
    );
  }

  return result;
}

/**
 * Count records still waiting to sync (for UI badges / status displays).
 */
export async function countPendingItems(): Promise<number> {
  let count = 0;
  for (const tableName of SYNCABLE_TABLES) {
    const table = (db as unknown as Record<string, Table<SyncableRecord, number>>)[tableName];
    if (!table) continue;
    const all = await table.toArray();
    count += all.filter(
      (r) => r.syncStatus === 'pending' || r.syncStatus === 'error'
    ).length;
  }
  return count;
}
