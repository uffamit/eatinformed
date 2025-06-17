
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
let authInstance; // Renamed to avoid conflict with exported 'auth'
let dbInstance; // Renamed to avoid conflict with exported 'db'

try {
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    console.error("Firebase: NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set. Firestore and other Firebase services will likely fail.");
  }
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  authInstance = getAuth(app);
  dbInstance = getFirestore(app);

  setPersistence(authInstance, browserLocalPersistence)
    .then(() => {
      console.log("Firebase: Auth persistence set to local.");
    })
    .catch((error) => {
      console.error("Firebase: Error setting auth persistence:", error.code, error.message);
    });
  console.log("Firebase: Successfully initialized and configured.");

} catch (error: any) {
  console.error("Firebase: Failed to initialize application.", error.code ? `${error.code} - ${error.message}` : error);
  // Depending on the app's needs, you might throw the error or set authInstance/dbInstance to null
  // to be handled gracefully by components. For now, errors will propagate if authInstance/dbInstance are used while undefined.
}

// Export the instances for use in other parts of the application
// It's common practice to export them with the names 'auth' and 'db'
const auth = authInstance;
const db = dbInstance;

export { app, auth, db };
