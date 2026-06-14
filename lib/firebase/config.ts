import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Check if Firebase is properly configured (not for SSR/build time)
const isFirebaseConfigured = () => {
  if (typeof window === 'undefined') return true; // Skip check during SSR/build
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
  );
};

// Initialize Firebase only on client side
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

if (typeof window !== 'undefined') {
  if (!isFirebaseConfigured()) {
    console.warn(
      'Firebase is not configured. Please add your Firebase credentials to .env.local'
    );
  } else {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);

      // ignoreUndefinedProperties lets us write partial objects (optional fields
      // left undefined) without addDoc/updateDoc throwing — the app's hooks spread
      // optional fields that are frequently undefined. Offline persistence is
      // intentionally handled by IndexedDB (Dexie), not Firestore.
      db = initializeFirestore(app, { ignoreUndefinedProperties: true });
    } else {
      app = getApps()[0];
      auth = getAuth(app);
      db = getFirestore(app);
    }
  }
}

export { app, auth, db };
