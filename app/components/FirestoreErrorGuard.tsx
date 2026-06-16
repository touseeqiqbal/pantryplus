'use client';

/**
 * Firestore fatal-error guard.
 *
 * The Firestore SDK (10.x) can throw UNCAUGHT errors from its internal async
 * queue (timers / promises) when it deserializes a malformed document — e.g. an
 * array containing a `null` element:
 *
 *   TypeError: Cannot use 'in' operator to search for 'nullValue' in null
 *   FIRESTORE INTERNAL ASSERTION FAILED: Unexpected state
 *
 * Because these are thrown from a `setTimeout` callback (not during React
 * render), no React error boundary can catch them — they bubble to the window
 * and trigger Next.js's full-page "Application error" white screen, taking the
 * entire app down.
 *
 * This guard intercepts those specific errors at the window level and stops them
 * from tearing down the app. Realtime sync for the affected document is degraded
 * until the bad document is repaired/removed on the server, but the rest of the
 * app keeps working instead of white-screening.
 */
import { useEffect } from 'react';

const FIRESTORE_FATAL_SIGNATURES = [
  'INTERNAL ASSERTION FAILED',
  'Unexpected state',
  "Cannot use 'in' operator to search for 'nullValue'",
];

function isFirestoreFatal(message?: string | null): boolean {
  if (!message) return false;
  return FIRESTORE_FATAL_SIGNATURES.some((sig) => message.includes(sig));
}

export default function FirestoreErrorGuard() {
  useEffect(() => {
    let warned = false;
    const warnOnce = () => {
      if (warned) return;
      warned = true;
      console.warn(
        '[PantryPlus] Suppressed a fatal Firestore error caused by a corrupt document ' +
          '(likely a null inside an array). Realtime sync is degraded until the document ' +
          'is repaired. Fix: delete the offending document (e.g. in the `households` ' +
          'collection) in the Firebase console, then clear site data and reload.'
      );
    };

    const onError = (event: ErrorEvent) => {
      if (isFirestoreFatal(event.message) || isFirestoreFatal(event.error?.message)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        warnOnce();
      }
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = typeof reason === 'string' ? reason : reason?.message;
      if (isFirestoreFatal(message)) {
        event.preventDefault();
        warnOnce();
      }
    };

    // Capture phase so we run before Next.js's own handlers.
    window.addEventListener('error', onError, true);
    window.addEventListener('unhandledrejection', onRejection, true);
    return () => {
      window.removeEventListener('error', onError, true);
      window.removeEventListener('unhandledrejection', onRejection, true);
    };
  }, []);

  return null;
}
