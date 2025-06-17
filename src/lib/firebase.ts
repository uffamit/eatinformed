
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

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

console.log("Firebase: Attempting to initialize...");
console.log("Firebase Config Used:", {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Loaded' : 'MISSING',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Loaded' : 'MISSING',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? `Loaded: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}` : 'MISSING - CRITICAL for Firestore/Auth',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'Loaded' : 'MISSING',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'Loaded' : 'MISSING',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'Loaded' : 'MISSING',
});


try {
  if (!firebaseConfig.projectId) {
    console.error("Firebase Critical Error: projectId is missing in firebaseConfig. This usually means NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set correctly in your .env file or environment variables. Firebase services will fail.");
    // Optionally throw to halt further execution if needed
  } else {
    console.log("Firebase: projectId is present in firebaseConfig:", firebaseConfig.projectId);
  }
  
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  console.log("Firebase: App initialized or retrieved successfully.");

  authInstance = getAuth(app);
  console.log("Firebase: Auth instance obtained successfully.");
  
  dbInstance = getFirestore(app);
  console.log("Firebase: Firestore instance obtained successfully.");

  // Example for connecting to emulators (comment out if not using)
  // const useEmulators = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true';
  // if (useEmulators) {
  //   console.log("Firebase: Attempting to connect to emulators (if configured)...");
  //   try {
  //     // Make sure emulators are running on these ports if you uncomment
  //     // connectAuthEmulator(authInstance, "http://localhost:9099", { disableWarnings: true });
  //     // connectFirestoreEmulator(dbInstance, "localhost", 8080);
  //     // console.log("Firebase: Successfully connected to Auth and Firestore emulators.");
  //   } catch (emulatorError) {
  //     console.error("Firebase: Error connecting to emulators:", emulatorError);
  //   }
  // }


  setPersistence(authInstance, browserLocalPersistence)
    .then(() => {
      console.log("Firebase: Auth persistence set to local.");
    })
    .catch((error) => {
      console.error("Firebase: Error setting auth persistence:", error.code, error.message);
    });
  console.log("Firebase: Successfully initialized and configured related services.");

} catch (error: any) {
  console.error("Firebase: CRITICAL - Failed to initialize Firebase application or core services.", error.code ? `${error.code} - ${error.message}` : error);
  authInstance = null; 
  dbInstance = null;
  console.error("Firebase: Auth and DB instances have been set to null due to initialization failure. Check config and Firebase project status.");
}

const auth = authInstance;
const db = dbInstance;

export { app, auth, db };

