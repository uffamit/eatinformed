
import admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    
    // Only initialize if the environment variable is properly set
    if (serviceAccountJson && serviceAccountJson !== 'undefined') {
      const serviceAccount = JSON.parse(serviceAccountJson);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      console.warn("Firebase Admin SDK not initialized: FIREBASE_SERVICE_ACCOUNT_JSON is not set or is undefined");
    }
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error);
    // You might want to throw an error here or handle it gracefully
    // depending on whether server-side auth is critical at startup.
  }
}

// It's safer to export the initialized auth object
const adminAuth = admin.apps.length ? admin.auth() : null;

export { adminAuth };
