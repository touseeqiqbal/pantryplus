/**
 * Maps Firebase Auth error codes to friendly, actionable messages so users see
 * helpful guidance instead of raw SDK strings like
 * "Firebase: Error (auth/api-key-not-valid...)".
 */
export function friendlyAuthError(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const code = (err as { code?: string })?.code || '';
  const message = (err as { message?: string })?.message || '';

  const map: Record<string, string> = {
    'auth/api-key-not-valid': 'App configuration error: the Firebase API key is invalid. Check NEXT_PUBLIC_FIREBASE_* in your .env.local and restart the dev server.',
    'auth/invalid-api-key': 'App configuration error: the Firebase API key is invalid. Check your .env.local and restart the dev server.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/wrong-password': 'Incorrect email or password.',
    'auth/user-not-found': 'No account found with that email.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/email-already-in-use': 'An account already exists with this email. Try signing in.',
    'auth/weak-password': 'Password is too weak — use at least 6 characters.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
    'auth/network-request-failed': 'Network error. Check your internet connection and try again.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    'auth/operation-not-allowed': 'This sign-in method is disabled. Enable it in Firebase Console → Authentication → Sign-in method.',
    'auth/configuration-not-found': 'Authentication is not set up. Enable Email/Password and Google sign-in in your Firebase project.',
  };

  if (code && map[code]) return map[code];
  // Catch the api-key error even when it arrives only in the message text.
  if (message.includes('api-key-not-valid')) return map['auth/api-key-not-valid'];
  return message || fallback;
}
