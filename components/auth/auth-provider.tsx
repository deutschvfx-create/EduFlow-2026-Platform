"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot, setDoc, serverTimestamp, getDoc, updateDoc } from "firebase/firestore";
import { UserData } from "@/lib/services/firestore";
import { useRouter, usePathname } from "next/navigation";
import { PauseCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    const [isBlocked, setIsBlocked] = useState(false);
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
                        // Check if session already exists to avoid overwriting 'blocked' status
                        const sessionSnap = await getDoc(sessionRef);

                        if (!sessionSnap.exists()) {
                            await setDoc(sessionRef, {
                                id: deviceId,
                                device: name,
                                userAgent: navigator.userAgent,
                                lastActive: serverTimestamp(),
                                isCurrent: true,
                                type: type,
                                status: 'active'
                            });
                        } else {
                            // Just update activity and metadata, but NOT status
                            await updateDoc(sessionRef, {
                                lastActive: serverTimestamp(),
                                device: name,
                                isCurrent: true
                            });
                        }

                        // MONITOR THIS SESSION 
                        unsubscribeSession = onSnapshot(sessionRef, (docSnap) => {
                            if (!docSnap.exists()) {
                                console.log("🚨 Session record deleted. Logging out...");
                                auth.signOut();
                                return;
                            }

                            const data = docSnap.data();
                            const status = data?.status;
                            console.log("📡 Remote session status:", status);

                            if (status === 'blocked') {
                                setIsBlocked(true);
                            } else {
                                setIsBlocked(false);
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
                setIsBlocked(false);
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
            {isBlocked ? (
                <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-6">
                        <PauseCircle className="w-8 h-8" />
                    </div>
                    <h1 className="text-xl font-bold text-white mb-2">Аккаунт приостановлен</h1>
                    <p className="text-neutral-400 max-w-xs text-sm mb-8">
                        Ваша сессия была временно заблокирована администратором. Доступ восстановится автоматически, когда ограничение будет снято.
                    </p>
                    <div className="flex gap-4">
                        <Button
                            variant="default"
                            onClick={() => window.location.reload()}
                            className="bg-indigo-600 hover:bg-indigo-500"
                        >
                            Проверить статус
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => auth.signOut()}
                            className="text-neutral-500 hover:text-white"
                        >
                            Выйти
                        </Button>
                    </div>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
}
