import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
    try {
        // 1. Get the ID token from the request headers
        const authHeader = req.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const adminAuth = getAdminAuth();

        // 2. Check if Admin is initialized (Prevents runtime crash if keys are missing)
        if (!adminAuth) {
            console.error("Firebase Admin not initialized. Checking Keys...");
            const missing = [];
            if (!process.env.FIREBASE_PROJECT_ID) missing.push("FIREBASE_PROJECT_ID");
            if (!process.env.FIREBASE_CLIENT_EMAIL) missing.push("FIREBASE_CLIENT_EMAIL");
            if (!process.env.FIREBASE_PRIVATE_KEY) missing.push("FIREBASE_PRIVATE_KEY");

            return NextResponse.json({
                error: `Server Configuration Error: Missing Environment Variables (${missing.join(', ') || 'Unknown'})`
            }, { status: 500 });
        }

        const idToken = authHeader.split("Bearer ")[1];

        // 3. Verify the ID token using Firebase Admin
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // 4. Create a Custom Token for this UID
        // We can add additional claims if needed, e.g. { magicLogin: true }
        const customToken = await adminAuth.createCustomToken(uid, {
            magicLogin: true
        });

        // 5. Return the custom token and a generated link
        // We assume the app is hosted at the origin of the request or specified env
        return NextResponse.json({
            token: customToken,
            url: `${req.nextUrl.origin}/magic-login?token=${customToken}`
        });

    } catch (error) {
        console.error("Error generating magic token:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
