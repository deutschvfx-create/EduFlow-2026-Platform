import "server-only";
import admin from 'firebase-admin';

// Initialize Firebase Admin
// We check if apps are already initialized to avoid "Release" errors in dev HMR
if (!admin.apps.length) {
    // Only attempt init if keys are present (prevents build crash)
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                }),
            });
            console.log("🔥 Firebase Admin Initialized");
        } catch (error) {
            console.error("❌ Firebase Admin Init Error:", error);
        }
    } else {
        console.warn("⚠️ Firebase Admin skipped: Missing Env Vars (OK during build)");
    }
}

// Exports are nullable if init failed/skipped
export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminDb = admin.apps.length ? admin.firestore() : null;
