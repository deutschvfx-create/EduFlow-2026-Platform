import { getAdminDb } from "./lib/firebase-admin.js";
import fs from "fs";

async function findOwner() {
    const db = getAdminDb();
    if (!db) {
        console.error("Firebase Admin not initialized. Check your .env variables.");
        return;
    }

    const snapshot = await db.collection('users').where('role', '==', 'owner').limit(1).get();

    if (snapshot.empty) {
        console.log("No owner found.");
        return;
    }

    const owner = snapshot.docs[0];
    const uid = owner.id;
    console.log(`FOUND_OWNER_UID: ${uid}`);
}

findOwner().catch(console.error);
