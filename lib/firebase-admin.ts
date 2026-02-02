import "server-only";
import admin from 'firebase-admin';

// Helper to format private key
const formatPrivateKey = (key: string) => {
    return key.replace(/\\n/g, '\n').replace(/"/g, '').replace(/\\r/g, '');
};

let initError: any = null;

function initFirebaseAdmin() {
    if (!admin.apps.length) {
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
            try {
                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId: process.env.FIREBASE_PROJECT_ID,
                        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                        privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
                    }),
                });
                console.log("🔥 Firebase Admin Initialized");
            } catch (error) {
                console.error("❌ Firebase Admin Init Error:", error);
                initError = error;
            }
        } else {
            // Log usage to help debug
            const missing = [];
            if (!process.env.FIREBASE_PROJECT_ID) missing.push("FIREBASE_PROJECT_ID");
            if (!process.env.FIREBASE_CLIENT_EMAIL) missing.push("FIREBASE_CLIENT_EMAIL");
            if (!process.env.FIREBASE_PRIVATE_KEY) missing.push("FIREBASE_PRIVATE_KEY");
            console.warn(`⚠️ Firebase Admin skipped. Missing: ${missing.join(", ")}`);
        }
    }
}

export function getAdminAuth() {
    initFirebaseAdmin();
    if (initError) {
        throw initError;
    }
    return admin.apps.length ? admin.auth() : null;
}

export function getAdminDb() {
    initFirebaseAdmin();
    return admin.apps.length ? admin.firestore() : null;
}

// Deprecated exports for backward compatibility (but might be null if called early)
export const adminAuth = null;
export const adminDb = null;
