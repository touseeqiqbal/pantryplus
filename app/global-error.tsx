'use client';

/**
 * Global error boundary. Catches errors thrown in the root layout itself (where
 * the page-level error.tsx cannot). Must render its own <html>/<body>.
 */
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[PantryPlus] Global error:', error);
  }, [error]);

  const resetLocalData = async () => {
    try {
      if (typeof indexedDB !== 'undefined' && indexedDB.databases) {
        const dbs = await indexedDB.databases();
        await Promise.all(dbs.map((d) => (d.name ? indexedDB.deleteDatabase(d.name) : undefined)));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      localStorage.clear();
    } catch {
      /* best effort */
    }
    window.location.href = '/';
  };

  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', margin: 0 }}>
        <div
          style={{
            minHeight: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
            padding: 24,
            textAlign: 'center',
            background: '#f9fafb',
            color: '#111827',
          }}
        >
          <div style={{ fontSize: 48 }}>🍳</div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Something went wrong</h1>
            <p style={{ maxWidth: 420, margin: '8px auto 0', fontSize: 14, color: '#6b7280' }}>
              The app hit an unexpected error. Try again, or reset local data if it keeps happening.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={reset}
              style={{ borderRadius: 12, background: '#4f46e5', color: '#fff', border: 0, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Try again
            </button>
            <button
              onClick={resetLocalData}
              style={{ borderRadius: 12, background: '#fff', color: '#374151', border: '1px solid #d1d5db', padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Reset local data &amp; reload
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
