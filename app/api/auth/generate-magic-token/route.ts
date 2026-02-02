
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
    try {
        // 1. Get the ID token from the request headers
        const authHeader = req.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Check if Admin is initialized (Prevents runtime crash if keys are missing)
        if (!adminAuth) {
            console.error("Firebase Admin not initialized (Missing Env Vars)");
            return NextResponse.json({ error: "Server Configuration Error: Missing Environment Variables" }, { status: 500 });
        }

        const idToken = authHeader.split("Bearer ")[1];

        // 3. Verify the ID token using Firebase Admin
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // 4. Create a Custom Token for this UID
        const customToken = await adminAuth.createCustomToken(uid, {
            magicLogin: true
        });

        // 5. Return the custom token and a generated link
        return NextResponse.json({
            token: customToken,
            url: `${req.nextUrl.origin}/magic-login?token=${customToken}`
        });

    } catch (error) {
        console.error("Error generating magic token:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
