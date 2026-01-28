
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { UserService, UserData } from "@/lib/services/firestore";
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                // Fetch extended user data from Firestore
                const data = await UserService.getUser(firebaseUser.uid);
                setUserData(data);

                // Basic Route Protection
                if (data) {
                    if (pathname === '/login' || pathname === '/register') {
                        // Redirect if already logged in
                        if (data.role === 'STUDENT') router.push('/student');
                        else if (['OWNER', 'DIRECTOR', 'ADMIN'].includes(data.role)) router.push('/director');
                    }
                }
            } else {
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [pathname, router]);

    // Protected Routes Check - ВРЕМЕННО ОТКЛЮЧЕНО
    // Раскомментируйте когда настроите Firebase Auth
    /*
    useEffect(() => {
        if (loading) return;

        if (!user && (pathname.startsWith('/student') || pathname.startsWith('/director') || pathname.startsWith('/app'))) {
            router.push('/login');
        }

        if (userData) {
            if (pathname.startsWith('/director') && userData.role === 'STUDENT') {
                router.push('/student');
            }
            if (pathname.startsWith('/student') && ['OWNER', 'DIRECTOR'].includes(userData.role)) {
                // Optional: Directors might want to see student view? For now strict.
                router.push('/director');
            }
        }
    }, [user, userData, loading, pathname, router]);
    */

    return (
        <AuthContext.Provider value={{ user, userData, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
