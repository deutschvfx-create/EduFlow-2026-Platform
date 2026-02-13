import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAZ-pavG6ZxI2BofcMJjCKJu_V47yrAtFA",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "uniwersitet-kontrolle.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "uniwersitet-kontrolle",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "uniwersitet-kontrolle.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "856355317221",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:856355317221:web:42d2aa689a1b50f686bb0c",
};

// Initialize Firebase safely
let app: any = null;
let auth: any = null;
let db: any = null;

try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
} catch (error) {
    console.error("Firebase initialization failed:", error);
}

export { app, auth, db };
