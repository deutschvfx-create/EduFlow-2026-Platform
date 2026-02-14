import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const startTime = Date.now();

        // Test Firestore connection
        let firestoreStatus = 'unknown';
        try {
            const db = getAdminDb();
            if (db) {
                // Simple query to test connection
                await db.collection('_health').limit(1).get();
                firestoreStatus = 'connected';
            } else {
                firestoreStatus = 'not_initialized';
            }
        } catch (error) {
            console.error('Firestore health check failed:', error);
            firestoreStatus = 'error';
        }

        const responseTime = Date.now() - startTime;

        return NextResponse.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            firestore: firestoreStatus,
            responseTime: `${responseTime}ms`,
            environment: process.env.NODE_ENV,
        });
    } catch (error) {
        return NextResponse.json(
            {
                status: 'error',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
