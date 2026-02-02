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
        id = crypto.randomUUID();
        localStorage.setItem('eduflow_device_id', id);
    }
    return id;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

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
                            device: ua,
                            lastActive: serverTimestamp(),
                            isCurrent: true,
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
                        if (doc.exists()) {
                            const data = doc.data() as UserData;
                            setUserData(data);

                            // Basic Route Protection
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
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeSnapshot) {
                unsubscribeSnapshot();
            }
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
