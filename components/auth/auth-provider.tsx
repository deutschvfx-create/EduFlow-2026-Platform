"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
// ... imports

// Helper to get persistent device ID
const getDeviceId = () => {
    if (typeof window === 'undefined') return 'unknown';
    let id = localStorage.getItem('eduflow_device_id');
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('eduflow_device_id', id);
    }
    return id;
};

// ... inside AuthProvider
useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser);

        if (firebaseUser) {
            // TRACK SESSION
            if (db) {
                const deviceId = getDeviceId();
                const sessionRef = doc(db, "users", firebaseUser.uid, "sessions", deviceId);

                // Detect device type roughly
                const ua = navigator.userAgent;
                let deviceType = 'desktop';
                if (/mobile/i.test(ua)) deviceType = 'mobile';

                try {
                    await setDoc(sessionRef, {
                        id: deviceId,
                        device: ua, // We'll parse this prettily in UI
                        lastActive: serverTimestamp(),
                        isCurrent: true, // Marker for UI
                        type: deviceType,
                        status: 'active'
                    }, { merge: true });
                } catch (e) {
                    console.error("Failed to register session", e);
                }
            }

            // Subscribe to real-time user data
            if (db) {
                unsubscribeSnapshot = onSnapshot(doc(db, "users", firebaseUser.uid), (doc) => {
                    // ... existing logic
                }, (error) => {
                    // ... error handling
                });
            }
            setLoading(false);
        } else {
            // CLEANUP SESSION NOTIFICATION? 
            // We don't delete on logout automatically to show history, 
            // OR we can set status: 'inactive'. For now, let's leave it.
            setUserData(null);
            if (unsubscribeSnapshot) {
                unsubscribeSnapshot();
                unsubscribeSnapshot = null;
            }
            setLoading(false);
        }
    });

    return () => {
        unsubscribeAuth();
        if (unsubscribeSnapshot) {
            unsubscribeSnapshot();
        }
    };
}, [router]); // Removed pathname dependency to prevent re-subscribing on navigation

useEffect(() => {
    if (loading) return;

    const isProtected = pathname.startsWith('/student') || pathname.startsWith('/app') || pathname.startsWith('/teacher');

    if (!user && isProtected) {
        router.push('/login');
        return;
    }

    if (user && !loading) {
        // If logged in but missing critical meta, force onboarding (at /register)
        if (userData && !userData.organizationId && isProtected) {
            router.push('/register');
        }
    }
}, [user, userData, loading, pathname, router]);

return (
    <AuthContext.Provider value={{ user, userData, loading }}>
        {children}
    </AuthContext.Provider>
);
}
