
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ConnectivityContextType {
    isOnline: boolean;
    latency: number | null;
    lastSync: Date | null;
    downlink: number | null;
    reportLatency: (ms: number) => void;
    updateSync: () => void;
}

const ConnectivityContext = createContext<ConnectivityContextType | undefined>(undefined);

export function ConnectivityProvider({ children }: { children: React.ReactNode }) {
    const [isOnline, setIsOnline] = useState(true);
    const [latency, setLatency] = useState<number | null>(null);
    const [lastSync, setLastSync] = useState<Date | null>(null);
    const [downlink, setDownlink] = useState<number | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const updateStatus = () => {
            setIsOnline(navigator.onLine);
            if ('connection' in navigator) {
                const conn = (navigator as any).connection;
                setDownlink(conn.downlink);
            }
        };

        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);

        updateStatus();


        const handleLatencyEvent = (e: CustomEvent) => setLatency(e.detail);
        const handleSyncEvent = () => setLastSync(new Date());

        window.addEventListener('connectivity:latency' as any, handleLatencyEvent);
        window.addEventListener('connectivity:sync' as any, handleSyncEvent);

        return () => {
            window.removeEventListener('online', updateStatus);
            window.removeEventListener('offline', updateStatus);
            window.removeEventListener('connectivity:latency' as any, handleLatencyEvent);
            window.removeEventListener('connectivity:sync' as any, handleSyncEvent);
        };
    }, []);

    const reportLatency = (ms: number) => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('connectivity:latency', { detail: ms }));
        }
    };
    const updateSync = () => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('connectivity:sync'));
        }
    };

    return (
        <ConnectivityContext.Provider value={{
            isOnline,
            latency,
            lastSync,
            downlink,
            reportLatency,
            updateSync
        }}>
            {children}
        </ConnectivityContext.Provider>
    );
}

export function useConnectivity() {
    const context = useContext(ConnectivityContext);
    if (context === undefined) {
        throw new Error('useConnectivity must be used within a ConnectivityProvider');
    }
    return context;
}
