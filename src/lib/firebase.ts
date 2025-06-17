
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth'; // connectAuthEmulator removed for simplicity unless specifically requested
import { getFirestore } from 'firebase/firestore'; // connectFirestoreEmulator removed for simplicity

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
console.log("Firebase Lib: Raw env vars check:", {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});

console.log("Firebase Lib: Using a FirebaseConfig object:", {
  apiKey: firebaseConfig.apiKey ? 'Loaded' : 'MISSING',
  authDomain: firebaseConfig.authDomain ? 'Loaded' : 'MISSING',
  projectId: firebaseConfig.projectId ? `Loaded: ${firebaseConfig.projectId}` : 'MISSING - CRITICAL for Firestore/Auth',
  storageBucket: firebaseConfig.storageBucket ? 'Loaded' : 'MISSING',
  messagingSenderId: firebaseConfig.messagingSenderId ? 'Loaded' : 'MISSING',
  appId: firebaseConfig.appId ? 'Loaded' : 'MISSING',
});


try {
  if (!firebaseConfig.projectId) {
    console.error("Firebase Lib CRITICAL Error: projectId is missing or undefined in firebaseConfig. This usually means NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set correctly in your .env file or environment variables. Firebase services will fail.");
  } else {
    console.log("Firebase Lib: projectId is present in firebaseConfig:", firebaseConfig.projectId);
  }
  
  if (typeof window !== 'undefined') { // Ensure Firebase is initialized only on the client-side
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    console.log("Firebase Lib: App initialized or retrieved successfully.");

    authInstance = getAuth(app);
    console.log("Firebase Lib: Auth instance obtained successfully.");
    
    dbInstance = getFirestore(app);
    console.log("Firebase Lib: Firestore instance obtained successfully.");

    // Example for connecting to emulators (comment out if not using)
    // const useEmulators = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true';
    // if (useEmulators) {
    //   console.log("Firebase Lib: Attempting to connect to emulators (if configured)...");
    //   try {
    //     // Make sure emulators are running on these ports if you uncomment
    //     // connectAuthEmulator(authInstance, "http://localhost:9099", { disableWarnings: true });
    //     // connectFirestoreEmulator(dbInstance, "localhost", 8080);
    //     // console.log("Firebase Lib: Successfully connected to Auth and Firestore emulators.");
    //   } catch (emulatorError) {
    //     console.error("Firebase Lib: Error connecting to emulators:", emulatorError);
    //   }
    // }

    setPersistence(authInstance, browserLocalPersistence)
      .then(() => {
        console.log("Firebase Lib: Auth persistence set to local.");
      })
      .catch((error) => {
        console.error("Firebase Lib: Error setting auth persistence:", error.code, error.message);
      });
    console.log("Firebase Lib: Successfully initialized and configured related services.");
  } else {
    console.log("Firebase Lib: Skipping Firebase initialization on the server-side.");
  }

} catch (error: any) {
  console.error("Firebase Lib: CRITICAL - Failed to initialize Firebase application or core services.", error.code ? `${error.code} - ${error.message}` : error);
  authInstance = null; 
  dbInstance = null;
  console.error("Firebase Lib: Auth and DB instances have been set to null due to initialization failure. Check .env config and Firebase project status.");
}

const auth = authInstance;
const db = dbInstance;

export { app, auth, db };
