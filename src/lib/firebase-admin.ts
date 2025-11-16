
import admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON!);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error);
    // You might want to throw an error here or handle it gracefully
    // depending on whether server-side auth is critical at startup.
  }
}

// It's safer to export the initialized auth object
const adminAuth = admin.apps.length ? admin.auth() : null;

export { adminAuth };
