
import "server-only";
import admin from 'firebase-admin';

// Initialize Firebase Admin
// We check if apps are already initialized to avoid "Release" errors in dev HMR
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
        console.log("🔥 Firebase Admin Initialized");
    } catch (error) {
        console.error("❌ Firebase Admin Init Error:", error);
    }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
