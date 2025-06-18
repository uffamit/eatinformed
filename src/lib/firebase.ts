
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

console.log("Firebase Lib: Attempting to initialize Firebase...");

// Log the actual values being used for initialization
console.log("Firebase Lib: Raw .env values seen by this module:", {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

console.log("Firebase Lib: FirebaseConfig object constructed for initializeApp:", firebaseConfig);


if (typeof window !== 'undefined') { // Ensure Firebase is initialized only on the client-side
  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId || firebaseConfig.apiKey === "YOUR_API_KEY" || firebaseConfig.projectId === "YOUR_PROJECT_ID") {
    console.error("Firebase Lib CRITICAL Error: Missing or placeholder Firebase configuration values (apiKey, authDomain, projectId).");
    console.error("Firebase Lib CRITICAL Error: VALUES USED -> apiKey:", firebaseConfig.apiKey, "authDomain:", firebaseConfig.authDomain, "projectId:", firebaseConfig.projectId);
    console.error("Firebase Lib CRITICAL Error: This usually means NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, or NEXT_PUBLIC_FIREBASE_PROJECT_ID are not set correctly in your .env file or have placeholder values like 'YOUR_PROJECT_ID'.");
    console.error("Firebase Lib CRITICAL Error: Firebase services (Auth, Firestore) WILL FAIL. Please verify your .env file and RESTART your development server.");
    authInstance = null;
    dbInstance = null;
  } else {
    console.log("Firebase Lib: All critical Firebase configurations (apiKey, authDomain, projectId) appear to be correctly loaded with actual values.");
    try {
      app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      console.log("Firebase Lib: Firebase App initialized or retrieved successfully.");

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
      console.log("Firebase Lib: Successfully initialized and configured related Firebase services.");

    } catch (error: any) {
      console.error("Firebase Lib: CRITICAL - Failed to initialize Firebase application or core services.", error.code ? `${error.code} - ${error.message}` : error);
      console.error("Firebase Lib: This could be due to incorrect Firebase config values (even if present and not placeholders), issues with the Firebase project itself, or network problems.");
      authInstance = null;
      dbInstance = null;
      console.error("Firebase Lib: Auth and DB instances have been set to null due to initialization failure. Check .env config and Firebase project status, then RESTART your development server.");
    }
  }
} else {
  console.log("Firebase Lib: Skipping Firebase initialization on the server-side.");
}

const auth = authInstance;
const db = dbInstance;

export { app, auth, db };
