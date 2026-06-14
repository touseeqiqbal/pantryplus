'use client';

/**
 * FirebaseStatus — a live, always-visible badge that verifies the Firebase
 * connection on load and reports the real state:
 *   - "Verifying Firebase…"       while the probe runs
 *   - "Firebase connected"        key verified by Google (stays as a compact pill)
 *   - "Enable sign-in methods"    key valid, but no providers configured
 *   - "Firebase API key invalid"  the key is rejected by Google (with fix steps)
 *   - "Firebase not configured"   required .env.local vars are missing
 *   - "Can't reach Firebase"      offline / network blocked
 *
 * Healthy state stays a small readable pill (click to expand details / re-check);
 * unhealthy states stay fully expanded with guidance.
 */

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { verifyFirebase, type FirebaseStatus as Status } from '@/lib/firebase/verify';

export default function FirebaseStatus() {
  const [status, setStatus] = useState<Status>({ state: 'checking' });
  const [expanded, setExpanded] = useState(false);

  const run = useCallback(async () => {
    setStatus({ state: 'checking' });
    const result = await verifyFirebase();
    setStatus(result);
    // Auto-expand details for any problem state; keep healthy state compact.
    setExpanded(result.state !== 'connected' && result.state !== 'checking');
  }, []);

  useEffect(() => {
    run();
  }, [run]);

  const healthy = status.state === 'connected';
  const ui = getUI(status);
  const showDetail = expanded && !!ui.detail && status.state !== 'checking';

  return (
    <div className="fixed bottom-20 left-3 sm:bottom-4 sm:left-4 z-[1700] print:hidden">
      <motion.div
        initial={{ y: 16, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 22, stiffness: 320 }}
        className={`max-w-[18rem] rounded-2xl border shadow-lg backdrop-blur-md ${ui.box}`}
      >
        <button
          onClick={() => {
            if (status.state === 'checking') return;
            setExpanded((s) => !s);
          }}
          className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left"
        >
          <span className="relative flex h-3 w-3 shrink-0 items-center justify-center">
            {status.state === 'checking' ? (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" />
            ) : (
              <>
                {healthy && (
                  <span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-40 animate-ping" />
                )}
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-current" />
              </>
            )}
          </span>
          <span className="flex-1 text-sm font-semibold leading-tight">{ui.title}</span>
          <span className="text-base leading-none">{ui.icon}</span>
        </button>

        <AnimatePresence initial={false}>
          {showDetail && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 border-t border-current/15 px-3.5 py-2.5 text-xs leading-relaxed opacity-90">
                {ui.detail}
                <button
                  onClick={run}
                  className="mt-1 rounded-lg bg-current/15 px-2.5 py-1 text-xs font-semibold transition-colors hover:bg-current/25"
                >
                  Re-check
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function getUI(status: Status): {
  box: string;
  title: string;
  icon: string;
  detail?: React.ReactNode;
} {
  switch (status.state) {
    case 'checking':
      return {
        box: 'bg-gray-100/90 dark:bg-gray-800/90 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300',
        title: 'Verifying Firebase…',
        icon: '',
      };
    case 'connected':
      return {
        box: 'bg-green-50/95 dark:bg-green-900/40 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
        title: 'Firebase connected',
        icon: '✓',
        detail: (
          <p>
            Verified with Google for project{' '}
            <span className="font-mono font-semibold">{status.projectId}</span>. Auth &amp;
            Firestore are reachable.
          </p>
        ),
      };
    case 'auth-disabled':
      return {
        box: 'bg-amber-50/95 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300',
        title: 'Enable sign-in methods',
        icon: '⚠️',
        detail: (
          <p>
            The API key is valid for{' '}
            <span className="font-mono font-semibold">{status.projectId}</span>, but no sign-in
            providers are set up. In Firebase Console → <b>Authentication → Sign-in method</b>,
            enable <b>Email/Password</b> and <b>Google</b>.
          </p>
        ),
      };
    case 'invalid-key':
      return {
        box: 'bg-red-50/95 dark:bg-red-900/40 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
        title: 'Firebase API key invalid',
        icon: '✕',
        detail: (
          <div className="space-y-1.5">
            <p>Google rejected the key in your <span className="font-mono">.env.local</span>.</p>
            <ol className="list-decimal space-y-0.5 pl-4">
              <li>Firebase Console → ⚙️ Project settings → Your apps → copy the Web app <b>apiKey</b>.</li>
              <li>Replace <span className="font-mono">NEXT_PUBLIC_FIREBASE_API_KEY</span> in <span className="font-mono">.env.local</span>.</li>
              <li>Restart <span className="font-mono">npm run dev</span>.</li>
            </ol>
          </div>
        ),
      };
    case 'not-configured':
      return {
        box: 'bg-amber-50/95 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300',
        title: 'Firebase not configured',
        icon: '⚠️',
        detail: (
          <div className="space-y-1">
            <p>Missing in <span className="font-mono">.env.local</span>:</p>
            <ul className="list-disc pl-4">
              {status.missing.map((m) => (
                <li key={m} className="font-mono text-[11px]">{m}</li>
              ))}
            </ul>
            <p>Add them and restart the dev server.</p>
          </div>
        ),
      };
    case 'offline':
      return {
        box: 'bg-gray-100/90 dark:bg-gray-800/90 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300',
        title: "Can't reach Firebase",
        icon: '⚡',
        detail: <p>You appear to be offline. The app still works locally and will sync when back online.</p>,
      };
  }
}
