const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Extract env vars manually from .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        env[match[1].trim()] = match[2].trim().replace(/^"(.*)"$/, '$1');
    }
});

function formatPrivateKey(key) {
    let cleanKey = key.replace(/\\n/g, '\n').replace(/"/g, '');
    if (cleanKey.includes('-----BEGIN PRIVATE KEY-----') && cleanKey.includes('\n')) {
        return cleanKey;
    }
    const header = "-----BEGIN PRIVATE KEY-----";
    const footer = "-----END PRIVATE KEY-----";
    const body = cleanKey.replace(header, '').replace(footer, '').replace(/\s/g, '');
    return `${header}\n${body}\n${footer}`;
}

async function findOwner() {
    if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) {
        console.error("Missing Firebase Admin credentials in .env.local");
        process.exit(1);
    }

    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: env.FIREBASE_PROJECT_ID,
            clientEmail: env.FIREBASE_CLIENT_EMAIL,
            privateKey: formatPrivateKey(env.FIREBASE_PRIVATE_KEY),
        }),
    });

    const db = admin.firestore();
    const snapshot = await db.collection('users').where('role', '==', 'owner').limit(1).get();

    if (snapshot.empty) {
        console.log("No owner found.");
        process.exit(0);
    }

    const owner = snapshot.docs[0];
    console.log(`FOUND_OWNER_UID: ${owner.id}`);
}

findOwner().catch(err => {
    console.error(err);
    process.exit(1);
});
