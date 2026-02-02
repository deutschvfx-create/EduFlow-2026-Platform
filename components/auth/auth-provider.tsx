"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot, setDoc, serverTimestamp, getDoc, updateDoc, collection, query, where } from "firebase/firestore";
import { UserData } from "@/lib/services/firestore";
import { useRouter, usePathname } from "next/navigation";
import { PauseCircle, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    loading: boolean;
    timeLeft?: number; // In milliseconds
    isSupportSession?: boolean;
    followingSessionId: string | null;
    toggleFollowing: (sessionId: string | null) => void;
    stopMirroring: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userData: null,
    loading: true,
    followingSessionId: null,
    toggleFollowing: () => { },
    stopMirroring: () => { }
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
    const [statusChecking, setStatusChecking] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [sessionReady, setSessionReady] = useState(false);
    const [liveTimeLeft, setLiveTimeLeft] = useState<number | undefined>(undefined);
    const [isSupportSession, setIsSupportSession] = useState(false);
    const [followingSessionId, setFollowingSessionId] = useState<string | null>(null);

    const toggleFollowing = (id: string | null) => {
        setFollowingSessionId(prev => prev === id ? null : id);
    };

    const stopMirroring = async () => {
        if (isSupportSession && user && db) {
            const deviceId = localStorage.getItem('eduflow_device_id');
            if (deviceId) {
                const sessionRef = doc(db, "users", user.uid, "sessions", deviceId);
                await updateDoc(sessionRef, { status: 'paused', lastUpdated: serverTimestamp() });
            }
        } else {
            setFollowingSessionId(null);
        }
    };

    const router = useRouter();
    const pathname = usePathname();

    // Live countdown for Guest sessions
    useEffect(() => {
        if (liveTimeLeft === undefined) return;

        const interval = setInterval(() => {
            setLiveTimeLeft(prev => {
                if (prev === undefined || prev <= 0) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1000;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [liveTimeLeft]);

    // Manual status check for the button
    const checkStatus = async () => {
        if (!user || !db) return;
        setStatusChecking(true);
        setStatusMessage(null);
        try {
            const deviceId = getDeviceId();
            const sessionRef = doc(db, "users", user.uid, "sessions", deviceId);
            const snap = await getDoc(sessionRef);
            if (snap.exists()) {
                const status = snap.data().status;
                const blocked = status === 'blocked';
                setIsBlocked(blocked);
                if (blocked) {
                    setStatusMessage("Доступ всё еще ограничен");
                }
            } else {
                auth.signOut().then(() => window.location.href = '/login');
            }
        } catch (e) {
            console.error(e);
            setStatusMessage("Ошибка проверки");
        } finally {
            setTimeout(() => {
                setStatusChecking(false);
                setTimeout(() => setStatusMessage(null), 3000);
            }, 800);
        }
    };

    useEffect(() => {
        let unsubscribeSnapshot: any = null;
        let unsubscribeSession: any = null;
        let sessionTimer: any = null;

        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            let support = false;

            // Clean up previous listeners
            if (unsubscribeSnapshot) unsubscribeSnapshot();
            if (unsubscribeSession) unsubscribeSession();
            if (sessionTimer) clearTimeout(sessionTimer);
            setLiveTimeLeft(undefined);
            setIsSupportSession(false);

            setUser(firebaseUser);

            if (firebaseUser) {
                // TRACK SESSION
                if (db) {
                    const deviceId = getDeviceId();
                    const sessionRef = doc(db, "users", firebaseUser.uid, "sessions", deviceId);
                    const { type, name } = getDeviceInfo();

                    try {
                        const idTokenResult = await firebaseUser.getIdTokenResult();
                        support = idTokenResult.claims.supportAccess === true;
                        const expiresAt = idTokenResult.claims.expiresAt as number | undefined;

                        setIsSupportSession(support);
                        console.log("🔐 [Auth] User signed in:", firebaseUser.uid, "Support Access:", support);

                        // Check if session already exists
                        const sessionSnap = await getDoc(sessionRef);

                        const sessionData = {
                            id: deviceId,
                            device: support ? `Guest (${name})` : name,
                            userAgent: navigator.userAgent,
                            lastActive: serverTimestamp(),
                            isCurrent: true,
                            type: support ? 'support' : type,
                            ...(support && expiresAt ? { expiresAt } : {})
                        };

                        if (!sessionSnap.exists()) {
                            await setDoc(sessionRef, { ...sessionData, status: 'active' });
                        } else {
                            await updateDoc(sessionRef, sessionData);
                        }

                        // 🕒 TIMER LOGIC: If this is a support session, set auto-logout
                        if (support && expiresAt) {
                            const timeLeft = expiresAt - Date.now();
                            if (timeLeft <= 0) {
                                auth.signOut().then(() => window.location.href = '/login');
                                return;
                            }

                            setLiveTimeLeft(timeLeft);

                            // Set a client-side timer to kick the guest out
                            sessionTimer = setTimeout(() => {
                                auth.signOut().then(() => window.location.href = '/login');
                            }, timeLeft);

                            // Note: we need to clean this up, but this is inside a state change callback
                            // The outer cleanup handles basic unsubscribe, let's store it locally if possible
                            // or rely on the fact that guest sessions are usually short-lived.
                        }

                        // MONITOR THIS SESSION 
                        unsubscribeSession = onSnapshot(sessionRef, (docSnap) => {
                            if (!docSnap.exists()) {
                                // 🚨 SECURITY CRITICAL: If session is deleted, force immediate hard exit
                                auth.signOut().then(() => {
                                    window.location.href = '/login';
                                });
                                return;
                            }

                            const data = docSnap.data();
                            setIsBlocked(data?.status === 'blocked');

                            // Check expiry on snapshot too (extra safety)
                            if (data?.expiresAt && data.expiresAt < Date.now()) {
                                auth.signOut().then(() => window.location.href = '/login');
                            }

                            setSessionReady(true);
                        });
                    } catch (e) {
                        console.error("❌ Failed to register/monitor session:", e);
                        setSessionReady(true);
                    }
                } else {
                    setSessionReady(true);
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
                                } else if (support) {
                                    // 🛡️ SUPPORT FIX: If we are support and no doc orgId yet, 
                                    // still try dashboard to avoid register loop
                                    router.push('/app/dashboard');
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
                setSessionReady(false);
                setLiveTimeLeft(undefined);
                if (unsubscribeSnapshot) unsubscribeSnapshot();
                if (unsubscribeSession) unsubscribeSession();
                if (sessionTimer) clearTimeout(sessionTimer);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeSnapshot) unsubscribeSnapshot();
            if (unsubscribeSession) unsubscribeSession();
            if (sessionTimer) clearTimeout(sessionTimer);
        };
    }, [router]);

    useEffect(() => {
        if (loading || !sessionReady) return;

        const isProtected = pathname.startsWith('/student') || pathname.startsWith('/app') || pathname.startsWith('/teacher');

        if (!user && isProtected) {
            router.push('/login');
            return;
        }

        if (user && !loading) {
            // 🛡️ SUPPORT FIX: Skip registration redirect for support sessions
            if (isSupportSession) return;

            if (userData && !userData.organizationId && isProtected) {
                router.push('/register');
            }
        }
    }, [user, userData, loading, sessionReady, pathname, router]);

    // 🛡️ AUTO-FOLLOW SUPPORT SESSIONS (FOR OWNER)
    useEffect(() => {
        if (!user || !db || isSupportSession) return;

        const sessionsRef = collection(db, "users", user.uid, "sessions");
        const q = query(sessionsRef, where("type", "==", "support"), where("status", "==", "active"));

        const unsubscribe = onSnapshot(q, (snap) => {
            const activeSupportSession = snap.docs.find(doc => {
                const data = doc.data();
                // Consider session active if updated in the last 2 minutes
                const lastUpdated = data.lastUpdated?.toMillis() || 0;
                return Date.now() - lastUpdated < 120000;
            });

            if (activeSupportSession) {
                if (followingSessionId !== activeSupportSession.id) {
                    console.log("🦾 Auto-following guest session:", activeSupportSession.id);
                    setFollowingSessionId(activeSupportSession.id);
                }
            } else if (followingSessionId) {
                // If the guest is gone, stop following
                setFollowingSessionId(null);
            }
        });

        return () => unsubscribe();
    }, [user, isSupportSession, followingSessionId]);

    // 🛡️ GUEST TELEMETRY & OWNER SYNC (BIDIRECTIONAL)
    const isMirroringRef = useRef(false);
    useEffect(() => {
        if (!isSupportSession || !user || !db || !sessionReady) return;

        const deviceId = typeof window !== 'undefined' ? localStorage.getItem('eduflow_device_id') : null;
        if (!deviceId) return;

        const sessionRef = doc(db, "users", user.uid, "sessions", deviceId);

        const PATH_MAP: Record<string, string> = {
            '/app/dashboard': 'Дашборд',
            '/app/attendance': 'Посещаемость',
            '/app/groups': 'Группы',
            '/app/students': 'Студенты',
            '/app/teachers': 'Преподаватели',
            '/app/faculties': 'Факультеты',
            '/app/departments': 'Кафедры',
            '/app/classrooms': 'Аудитории',
            '/app/subjects': 'Предметы',
            '/app/schedule': 'Расписание',
            '/app/grades': 'Оценки',
            '/app/announcements': 'Объявления',
            '/app/chats': 'Чаты',
            '/app/reports': 'Отчёты',
            '/app/settings': 'Настройки',
        };

        const readablePath = PATH_MAP[pathname] || pathname;

        // 1. Sync Current Path & Raw URL (Normalized)
        const normalizedPath = pathname.replace(/\/$/, "");
        updateDoc(sessionRef, {
            currentPath: readablePath,
            rawPath: normalizedPath,
            lastUpdated: serverTimestamp()
        }).catch(e => console.error("Telemetry Path Error:", e));

        // 2. Sync Actions (Guest to Owner)
        const handleGlobalClick = (e: MouseEvent) => {
            if (isMirroringRef.current) return;
            const target = e.target as HTMLElement;
            const element = target.closest('button') || target.closest('a') || target.closest('[role="button"]') || (window.getComputedStyle(target).cursor === 'pointer' ? target : null);

            if (element) {
                const actionText = element.textContent?.trim().substring(0, 40) || (element as any).ariaLabel || (element as any).title || "Действие";

                updateDoc(sessionRef, {
                    lastAction: `Гость нажал "${actionText}"`,
                    remoteCommand: {
                        id: Math.random().toString(36).substr(2, 9),
                        type: 'click',
                        text: actionText,
                        path: normalizedPath,
                        timestamp: Date.now()
                    },
                    lastUpdated: serverTimestamp()
                }).catch(e => console.error("Telemetry Action Error:", e));
            }
        };

        window.addEventListener('click', handleGlobalClick, { capture: true });

        // 3. Listen for Owner Commands (Owner to Guest)
        let lastOwnerCommandId: string | null = null;
        const unsubscribe = onSnapshot(sessionRef, (snap) => {
            const data = snap.data();
            if (!data || !data.ownerCommand || data.ownerCommand.id === lastOwnerCommandId) return;

            lastOwnerCommandId = data.ownerCommand.id;
            console.log("👨‍🏫 Mirroring Owner Navigation to:", data.ownerCommand.path);
            if (data.ownerCommand.path && data.ownerCommand.path !== normalizedPath) {
                router.push(data.ownerCommand.path);
            }

            if (data.ownerCommand.type === 'click') {
                console.log("👨‍🏫 Mirroring Owner Click:", data.ownerCommand.text);
                // Use the same robust findAndClick logic as owner side
                let attempts = 0;
                const interval = setInterval(() => {
                    attempts++;
                    const elements = Array.from(document.querySelectorAll('button, a, [role="button"], .cursor-pointer'));
                    const target = elements.find(el => {
                        const match = data.ownerCommand.text.toLowerCase();
                        return el.textContent?.toLowerCase().includes(match) || (el as any).ariaLabel?.toLowerCase().includes(match);
                    });
                    if (target) {
                        isMirroringRef.current = true;
                        (target as HTMLElement).click();
                        setTimeout(() => { isMirroringRef.current = false; }, 100);
                        clearInterval(interval);
                    } else if (attempts >= 10) clearInterval(interval);
                }, 400);
            }
        });

        return () => {
            window.removeEventListener('click', handleGlobalClick, { capture: true });
            unsubscribe();
        };
    }, [pathname, isSupportSession, user, sessionReady]);

    // 🔄 OWNER MIRRORING (FOLLOW MODE)
    const lastCommandIdRef = useRef<string | null>(null);
    useEffect(() => {
        if (!followingSessionId || !user || !db || isSupportSession) return;

        const sessionRef = doc(db, "users", user.uid, "sessions", followingSessionId);
        const normalizedCurrentPath = pathname.replace(/\/$/, "");

        const unsubscribe = onSnapshot(sessionRef, (snap) => {
            if (!snap.exists()) {
                setFollowingSessionId(null);
                return;
            }

            const data = snap.data();

            // 1. Sync Navigation
            if (data.rawPath && data.rawPath !== normalizedCurrentPath) {
                console.log("🚀 Mirroring Navigation to:", data.rawPath);
                router.push(data.rawPath);
            }

            // 2. Sync Click Actions
            if (data.remoteCommand && data.remoteCommand.id !== lastCommandIdRef.current) {
                lastCommandIdRef.current = data.remoteCommand.id;

                console.log("🔍 Guest Clicked:", data.remoteCommand.text);

                // Retry logic: try finding the element for up to 3 seconds
                let attempts = 0;
                const maxAttempts = 10;
                const interval = setInterval(() => {
                    attempts++;
                    const findAndClick = () => {
                        const selectors = 'button, a, [role="button"], [role="link"], .cursor-pointer';
                        const elements = Array.from(document.querySelectorAll(selectors));

                        const target = elements.find(el => {
                            const text = el.textContent?.trim() || "";
                            const aria = (el as any).ariaLabel || "";
                            const title = (el as any).title || "";

                            const match = data.remoteCommand.text.toLowerCase();
                            return text.toLowerCase().includes(match) ||
                                aria.toLowerCase().includes(match) ||
                                title.toLowerCase().includes(match);
                        });

                        if (target) {
                            console.log("🎯 Mirroring Click ON:", data.remoteCommand.text);
                            isMirroringRef.current = true;
                            (target as HTMLElement).click();
                            setTimeout(() => { isMirroringRef.current = false; }, 100);
                            clearInterval(interval);
                            return true;
                        }
                        return false;
                    };

                    if (findAndClick() || attempts >= maxAttempts) {
                        clearInterval(interval);
                    }
                }, 400);
            }
        });

        // 3. Capture Owner Actions to Sync Back to Guest
        const handleOwnerClick = (e: MouseEvent) => {
            if (isMirroringRef.current) return;
            const target = e.target as HTMLElement;
            const element = target.closest('button') || target.closest('a') || target.closest('[role="button"]') || (window.getComputedStyle(target).cursor === 'pointer' ? target : null);
            if (element) {
                const actionText = element.textContent?.trim().substring(0, 40) || (element as any).ariaLabel || (element as any).title || "Действие";
                updateDoc(sessionRef, {
                    ownerCommand: {
                        id: Math.random().toString(36).substr(2, 9),
                        type: 'click',
                        text: actionText,
                        path: normalizedCurrentPath,
                        timestamp: Date.now()
                    },
                    lastUpdated: serverTimestamp()
                }).catch(e => console.error("Owner Telemetry Error:", e));
            }
        };

        window.addEventListener('click', handleOwnerClick, { capture: true });

        return () => {
            unsubscribe();
            window.removeEventListener('click', handleOwnerClick, { capture: true });
        };
    }, [followingSessionId, pathname, user, router, isSupportSession]);

    // UI RENDERING
    const isProtected = pathname.startsWith('/student') || pathname.startsWith('/app') || pathname.startsWith('/teacher');

    if (loading || (user && !sessionReady)) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Helper for formatting timeLeft
    const formatTimeLeft = (ms: number) => {
        const totalSec = Math.floor(ms / 1000);
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <AuthContext.Provider value={{ user, userData, loading, timeLeft: liveTimeLeft, isSupportSession, followingSessionId, toggleFollowing, stopMirroring }}>
            {/* 🕒 FLOATING TIMER FOR GUEST */}
            {liveTimeLeft !== undefined && liveTimeLeft > 0 && !isBlocked && (
                <div className="fixed top-4 right-4 z-[9999] animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-amber-500 text-black px-4 py-2 rounded-2xl flex items-center gap-2 shadow-2xl font-bold border border-amber-400">
                        <Timer className="w-4 h-4 animate-pulse" />
                        <span className="text-xs uppercase tracking-tighter">Временный доступ:</span>
                        <span className="font-mono text-sm">{formatTimeLeft(liveTimeLeft)}</span>
                    </div>
                </div>
            )}

            {isProtected && (!user || isBlocked) ? (
                <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
                    {isBlocked ? (
                        <>
                            <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-6">
                                <PauseCircle className="w-8 h-8" />
                            </div>
                            <h1 className="text-xl font-bold text-white mb-2">Аккаунт приостановлен</h1>
                            <p className="text-neutral-400 max-w-xs text-sm mb-8">
                                Ваша сессия была временно заблокирована администратором. Доступ восстановится автоматически.
                            </p>
                            <div className="flex gap-4">
                                <Button
                                    variant="default"
                                    onClick={checkStatus}
                                    disabled={statusChecking}
                                    className="bg-indigo-600 hover:bg-indigo-500 min-w-[140px]"
                                >
                                    {statusChecking ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : "Проверить статус"}
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => auth.signOut()}
                                    className="text-neutral-500 hover:text-white"
                                >
                                    Выйти
                                </Button>
                            </div>
                            {statusMessage && (
                                <p className="mt-4 text-[10px] text-amber-500 animate-pulse">
                                    {statusMessage}
                                </p>
                            )}
                        </>
                    ) : (
                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    )}
                </div>
            ) : children}
        </AuthContext.Provider>
    );
}
