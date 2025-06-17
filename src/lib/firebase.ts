
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
let authInstance; 
let dbInstance; 

console.log("Firebase: Attempting to initialize...");
console.log("Firebase Config Used:", {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Loaded' : 'MISSING',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Loaded' : 'MISSING',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Loaded' : 'MISSING',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'Loaded' : 'MISSING',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'Loaded' : 'MISSING',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'Loaded' : 'MISSING',
});


try {
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    console.error("Firebase Critical Error: NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set in .env. Firebase services will fail.");
  } else {
    console.log("Firebase: NEXT_PUBLIC_FIREBASE_PROJECT_ID is set:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  }
  
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  console.log("Firebase: App initialized or retrieved.");

  authInstance = getAuth(app);
  console.log("Firebase: Auth instance obtained.");
  
  dbInstance = getFirestore(app);
  console.log("Firebase: Firestore instance obtained.");

  // Check if running in development and if emulators are intended (optional)
  // const useEmulators = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true';
  // if (useEmulators) {
  //   console.log("Firebase: Attempting to connect to emulators...");
  //   try {
  //     connectAuthEmulator(authInstance, "http://localhost:9099", { disableWarnings: true });
  //     connectFirestoreEmulator(dbInstance, "localhost", 8080);
  //     console.log("Firebase: Successfully connected to Auth and Firestore emulators.");
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
  console.log("Firebase: Successfully initialized and configured all services.");

} catch (error: any) {
  console.error("Firebase: Failed to initialize application.", error.code ? `${error.code} - ${error.message}` : error);
  // Ensure instances are null if initialization fails catastrophically before they are assigned
  if (!authInstance) authInstance = null as any; 
  if (!dbInstance) dbInstance = null as any;
}

const auth = authInstance;
const db = dbInstance;

export { app, auth, db };
