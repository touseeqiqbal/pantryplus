'use client';

/**
 * SyncManager (Module 10: Background Sync)
 *
 * Headless component mounted once in the root layout. It flushes queued offline
 * writes to Firestore:
 *   - on mount (catch anything left pending from a previous session)
 *   - whenever the browser fires the 'online' event (reconnection)
 *   - on a 30s poll while online (retry transient failures)
 *
 * It renders nothing.
 */

import { useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { syncPendingItems } from '@/lib/services/syncService';

const POLL_INTERVAL_MS = 30_000;

export default function SyncManager() {
  const { user } = useAuth();

  useEffect(() => {
    // Firestore writes require an authenticated user; skip while signed out.
    if (!user) return;

    let cancelled = false;

    const runSync = () => {
      if (cancelled) return;
      if (typeof navigator !== 'undefined' && !navigator.onLine) return;
      syncPendingItems().catch((err) => console.error('[SyncManager]', err));
    };

    // 1. Sync once on mount.
    runSync();

    // 2. Sync when connectivity returns.
    const handleOnline = () => runSync();
    window.addEventListener('online', handleOnline);

    // 3. Periodic retry while online.
    const interval = window.setInterval(runSync, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.removeEventListener('online', handleOnline);
      window.clearInterval(interval);
    };
  }, [user]);

  return null;
}
