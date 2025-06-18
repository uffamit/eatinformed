
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app;
let authInstance: ReturnType<typeof getAuth> | null = null;
let dbInstance: ReturnType<typeof getFirestore> | null = null;

console.log("Firebase Lib: Attempting to initialize Firebase...");

const criticalConfigValues = {
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
};

console.log("Firebase Lib: Raw env vars check (should be populated by Next.js from .env):", {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});

console.log("Firebase Lib: Using a FirebaseConfig object:", {
  apiKey: criticalConfigValues.apiKey ? 'Loaded' : 'MISSING - CRITICAL for Auth',
  authDomain: criticalConfigValues.authDomain ? 'Loaded' : 'MISSING - CRITICAL for Auth',
  projectId: criticalConfigValues.projectId ? `Loaded: ${criticalConfigValues.projectId}` : 'MISSING - CRITICAL for Auth & Firestore',
  storageBucket: firebaseConfig.storageBucket ? 'Loaded' : 'Optional for current features',
  messagingSenderId: firebaseConfig.messagingSenderId ? 'Loaded' : 'Optional for current features',
  appId: firebaseConfig.appId ? 'Loaded' : 'Optional for current features',
});

if (typeof window !== 'undefined') { // Ensure Firebase is initialized only on the client-side
  if (!criticalConfigValues.apiKey || !criticalConfigValues.authDomain || !criticalConfigValues.projectId) {
    console.error("Firebase Lib CRITICAL Error: Missing one or more essential Firebase configuration values (apiKey, authDomain, projectId). This usually means NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, or NEXT_PUBLIC_FIREBASE_PROJECT_ID are not set correctly in your .env file or environment variables. Firebase services (Auth, Firestore) WILL FAIL or behave unexpectedly (e.g., 'auth/configuration-not-found').");
    // Set instances to null to prevent further errors if config is bad
    authInstance = null;
    dbInstance = null;
  } else {
    console.log("Firebase Lib: All critical Firebase configurations (apiKey, authDomain, projectId) are present.");
    try {
      app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      console.log("Firebase Lib: App initialized or retrieved successfully.");

      authInstance = getAuth(app);
      console.log("Firebase Lib: Auth instance obtained successfully.");
      
      dbInstance = getFirestore(app);
      console.log("Firebase Lib: Firestore instance obtained successfully.");

      setPersistence(authInstance, browserLocalPersistence)
        .then(() => {
          console.log("Firebase Lib: Auth persistence set to local.");
        })
        .catch((error) => {
          console.error("Firebase Lib: Error setting auth persistence:", error.code, error.message);
        });
      console.log("Firebase Lib: Successfully initialized and configured related services.");

    } catch (error: any) {
      console.error("Firebase Lib: CRITICAL - Failed to initialize Firebase application or core services.", error.code ? `${error.code} - ${error.message}` : error);
      authInstance = null;
      dbInstance = null;
      console.error("Firebase Lib: Auth and DB instances have been set to null due to initialization failure. Check .env config and Firebase project status.");
    }
  }
} else {
  console.log("Firebase Lib: Skipping Firebase initialization on the server-side.");
}

const auth = authInstance;
const db = dbInstance;

export { app, auth, db };
