import "server-only";
import admin from 'firebase-admin';

// Helper to format private key
const formatPrivateKey = (key: string) => {
    // 1. Remove JSON stringification artifacts
    let cleanKey = key.replace(/\\n/g, '\n').replace(/"/g, '');

    // 2. Check if it's already a valid multiline PEM (has headers and newlines)
    if (cleanKey.includes('-----BEGIN PRIVATE KEY-----') && cleanKey.includes('\n')) {
        return cleanKey;
    }

    // 3. Fallback: Reconstruct PEM if it was flattened/mangled
    // Remove existing headers/footers to isolate the body
    const header = "-----BEGIN PRIVATE KEY-----";
    const footer = "-----END PRIVATE KEY-----";

    // Remove headers/footers and all whitespace (spaces/tabs/newlines) from the body
    const body = cleanKey
        .replace(header, '')
        .replace(footer, '')
        .replace(/\s/g, '');

    // Return clean PEM
    return `${header}\n${body}\n${footer}`;
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
            console.log("DEBUG ENV:", {
                projectId: process.env.FIREBASE_PROJECT_ID ? 'exists' : 'missing',
                email: process.env.FIREBASE_CLIENT_EMAIL ? 'exists' : 'missing',
                key: process.env.FIREBASE_PRIVATE_KEY ? 'exists' : 'missing',
                allKeys: Object.keys(process.env).filter(k => k.startsWith('FIREBASE_'))
            });
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
