'use client';

/**
 * Page-level error boundary. Catches render-time errors in any route and shows a
 * friendly recovery screen instead of a blank "Application error" page.
 */
import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[PantryPlus] Route error:', error);
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
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-gray-50 px-6 text-center dark:bg-gray-950">
      <div className="text-5xl">🍳</div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Something went wrong</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
          The app hit an unexpected error. You can try again, or reset local data if the problem keeps
          happening.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
        >
          Try again
        </button>
        <button
          onClick={resetLocalData}
          className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          Reset local data &amp; reload
        </button>
        <Link
          href="/"
          className="rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-600 hover:underline dark:text-primary-400"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
