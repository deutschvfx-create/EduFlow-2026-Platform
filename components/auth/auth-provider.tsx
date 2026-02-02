"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { UserData } from "@/lib/services/firestore";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userData: null,
    loading: true,
});

export const useAuth = () => useContext(AuthContext);

// Helper to get persistent device ID
const getDeviceId = () => {
    if (typeof window === 'undefined') return 'unknown';
    let id = localStorage.getItem('eduflow_device_id');
    if (!id) {
        try {
            id = window.crypto?.randomUUID() || Math.random().toString(36).substring(2) + Date.now().toString(36);
        } catch (e) {
            id = Math.random().toString(36).substring(2) + Date.now().toString(36);
        }
        localStorage.setItem('eduflow_device_id', id);
    }
    return id;
};

// Helper to detect device type and name
const getDeviceInfo = () => {
    if (typeof window === 'undefined') return { type: 'desktop', name: 'Server' };
    const ua = navigator.userAgent;
    let type: 'desktop' | 'mobile' = 'desktop';
    let name = 'Unknown Device';

    if (/mobile/i.test(ua)) {
        type = 'mobile';
        if (/iPhone/i.test(ua)) name = 'iPhone';
        else if (/iPad/i.test(ua)) name = 'iPad';
        else if (/Android/i.test(ua)) name = 'Android Phone';
        else name = 'Mobile Device';
    } else {
        if (/Macintosh/i.test(ua)) name = 'MacBook / iMac';
        else if (/Windows/i.test(ua)) name = 'Windows PC';
        else if (/Linux/i.test(ua)) name = 'Linux PC';
        else name = 'Desktop';
    }

    // Add browser name
    if (/Chrome/i.test(ua)) name += ' (Chrome)';
    else if (/Safari/i.test(ua)) name += ' (Safari)';
    else if (/Firefox/i.test(ua)) name += ' (Firefox)';
    else if (/Edg/i.test(ua)) name += ' (Edge)';

    return { type, name };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        let unsubscribeSnapshot: (() => void) | null = null;
        let unsubscribeSession: (() => void) | null = null;

        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                // TRACK SESSION
                if (db) {
                    const deviceId = getDeviceId();
                    const sessionRef = doc(db, "users", firebaseUser.uid, "sessions", deviceId);
                    const { type, name } = getDeviceInfo();

                    try {
                        await setDoc(sessionRef, {
                            id: deviceId,
                            device: name,
                            userAgent: navigator.userAgent,
                            lastActive: serverTimestamp(),
                            isCurrent: true,
                            type: type,
                            status: 'active'
                        }, { merge: true });

                        // MONITOR THIS SESSION (for remote logout)
                        unsubscribeSession = onSnapshot(sessionRef, (doc) => {
                            if (!doc.exists() || doc.data()?.status === 'blocked') {
                                console.log("🚨 Session revoked or blocked. Logging out...");
                                auth.signOut();
                                router.push('/login');
                            }
                        });
                    } catch (e) {
                        console.error("❌ Failed to register/monitor session:", e);
                    }
                }

                // Subscribe to real-time user data
                if (db) {
                    unsubscribeSnapshot = onSnapshot(doc(db, "users", firebaseUser.uid), (doc) => {
                        if (doc.exists()) {
                            const data = doc.data() as UserData;
                            setUserData(data);

                            if (window.location.pathname === '/login' || window.location.pathname === '/register') {
                                if (data.organizationId) {
                                    const target = data.role === 'student' ? '/student' : '/app/dashboard';
                                    router.push(target);
                                } else {
                                    if (window.location.pathname !== '/register') router.push('/register');
                                }
                            }
                        } else {
                            setUserData(null);
                        }
                        setLoading(false);
                    }, (error) => {
                        console.error("Failed to subscribe to user data:", error);
                        setLoading(false);
                    });
                } else {
                    setLoading(false);
                }
            } else {
                setUserData(null);
                if (unsubscribeSnapshot) {
                    unsubscribeSnapshot();
                    unsubscribeSnapshot = null;
                }
                if (unsubscribeSession) {
                    unsubscribeSession();
                    unsubscribeSession = null;
                }
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeSnapshot) unsubscribeSnapshot();
            if (unsubscribeSession) unsubscribeSession();
        };
    }, [router]);

    useEffect(() => {
        if (loading) return;

        const isProtected = pathname.startsWith('/student') || pathname.startsWith('/app') || pathname.startsWith('/teacher');

        if (!user && isProtected) {
            router.push('/login');
            return;
        }

        if (user && !loading) {
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
