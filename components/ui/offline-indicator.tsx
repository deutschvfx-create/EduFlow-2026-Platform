'use client';

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";

export function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        setIsOnline(navigator.onLine);

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Register SW (Production Only)
    useEffect(() => {
        if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('SW registered', reg))
                .catch(err => console.error('SW failed', err));
        }
    }, []);

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-2">
            {isOnline ? (
                <Badge variant="outline" className="bg-zinc-900/80 backdrop-blur border-green-900/50 text-green-400 gap-2 shadow-lg">
                    <Wifi className="h-4 w-4" />
                    Онлайн
                </Badge>
            ) : (
                <Badge variant="destructive" className="gap-2 shadow-lg hover:bg-red-600">
                    <WifiOff className="h-4 w-4" />
                    Оффлайн режим
                </Badge>
            )}
        </div>
    );
}
