import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let adminAuth;
        try {
            adminAuth = getAdminAuth();
        } catch (e: any) {
            console.error("Firebase Admin Init Failed:", e);
            return NextResponse.json({ error: `Init Error: ${e.message || e}` }, { status: 500 });
        }

        if (!adminAuth) {
            return NextResponse.json({ error: "Firebase Admin not initialized" }, { status: 500 });
        }

        const idToken = authHeader.split("Bearer ")[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        const { duration } = await req.json();

        // Create a Custom Token with a "support" claim and maybe the duration info
        // Note: Firebase Custom Tokens expire in 1 hour by default. 
        // If the user wants 24h, we can't do it via Custom Token life itself, 
        // but we can add a claim and check it in the app/database.
        const customToken = await adminAuth.createCustomToken(uid, {
            supportAccess: true,
            expiresAt: Date.now() + getTimeInMs(duration)
        });

        return NextResponse.json({
            token: customToken,
            url: `${req.nextUrl.origin}/support-access?token=${customToken}&duration=${duration}`
        });

    } catch (error) {
        console.error("Error generating support token:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

function getTimeInMs(duration: string): number {
    const unit = duration.slice(-1);
    const value = parseInt(duration.slice(0, -1));
    switch (unit) {
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        default: return 3600 * 1000;
    }
}
