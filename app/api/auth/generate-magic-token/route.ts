
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
    try {
        // 1. Get the ID token from the request headers
        const authHeader = req.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const idToken = authHeader.split("Bearer ")[1];

        // 2. Verify the ID token using Firebase Admin
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // 3. Create a Custom Token for this UID
        // We can add additional claims if needed, e.g. { magicLogin: true }
        const customToken = await adminAuth.createCustomToken(uid, {
            magicLogin: true
        });

        // 4. Return the custom token and a generated link
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
