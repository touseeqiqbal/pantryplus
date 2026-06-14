/**
 * Active Firebase connection verification.
 *
 * Initializing the Firebase SDK does NOT validate the API key — the key is only
 * checked by Google when an actual request is made. This helper performs one
 * lightweight request against the Identity Toolkit (the same service Auth uses)
 * so the app can show a real "connected / verified" status on load instead of
 * only discovering a bad key when the user tries to sign in.
 *
 * Probe logic: any Identity Toolkit call made with an invalid key returns
 * HTTP 400 with status API_KEY_INVALID. With a valid key the same call returns
 * 200 (or a *different* error such as CONFIGURATION_NOT_FOUND). So:
 *   - 200                     → connected
 *   - 400 API_KEY_INVALID     → the key is genuinely rejected by Google
 *   - 400 CONFIGURATION_*     → key is valid, but sign-in providers aren't set up
 *   - any other 400           → key was accepted (treated as connected)
 *   - fetch throws            → offline / can't reach Google
 */

export type FirebaseStatus =
  | { state: 'checking' }
  | { state: 'connected'; projectId: string }
  | { state: 'auth-disabled'; projectId: string }
  | { state: 'invalid-key'; detail: string }
  | { state: 'not-configured'; missing: string[] }
  | { state: 'offline'; detail: string };

const REQUIRED_ENV: Record<string, string> = {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
};

export async function verifyFirebase(): Promise<FirebaseStatus> {
  const apiKey = REQUIRED_ENV.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = REQUIRED_ENV.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  const missing = Object.entries(REQUIRED_ENV)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) return { state: 'not-configured', missing };

  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'connection-probe@pantryplus.app',
          continueUri:
            typeof window !== 'undefined' ? window.location.origin : 'http://localhost',
        }),
      }
    );

    if (res.ok) return { state: 'connected', projectId };

    const data = await res.json().catch(() => null);
    const msg: string = data?.error?.message || '';
    const status: string = data?.error?.status || '';

    if (
      status === 'API_KEY_INVALID' ||
      /api[-_ ]?key[-_ ]?(not[-_ ]?valid|invalid)/i.test(msg) ||
      /API_KEY_INVALID/i.test(msg)
    ) {
      return { state: 'invalid-key', detail: msg || 'API key not valid' };
    }

    if (status === 'CONFIGURATION_NOT_FOUND' || /CONFIGURATION_NOT_FOUND/i.test(msg)) {
      return { state: 'auth-disabled', projectId };
    }

    // A 400 that isn't key-related still proves Google accepted the key.
    return { state: 'connected', projectId };
  } catch (err) {
    return { state: 'offline', detail: (err as Error)?.message || 'Could not reach Google' };
  }
}
