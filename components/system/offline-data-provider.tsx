'use client';

import { useEffect, useState } from 'react';
import { dbService } from '@/lib/services/database.service';
import { useOrganization } from '@/hooks/use-organization';
import { Capacitor } from '@capacitor/core';

export function OfflineDataProvider({ children }: { children: React.ReactNode }) {
    const [isReady, setIsReady] = useState(false);

    // We do NOT block the app if offline DB fails.
    // The app uses Firestore-first (online) strategies.

    useEffect(() => {
        const init = async () => {
            // Safe init for Native only
            if (Capacitor.isNativePlatform()) {
                try {
                    await dbService.initialize();
                    console.log('[OfflineDataProvider] SQLite initialized');
                } catch (e) {
                    console.error("[OfflineDataProvider] Native DB Init failed", e);
                }
            } else {
                console.log('[OfflineDataProvider] Web Platform - skipping SQLite init');
            }
            // Always set ready to allow app to render
            setIsReady(true);
        };

        init();
    }, []);

    if (!isReady) {
        // Optional: Show splice screen or just transparent
        return null;
    }

    return <>{children}</>;
}
