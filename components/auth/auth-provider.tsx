
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
                try {
                    const data = await UserService.getUser(firebaseUser.uid);
                    setUserData(data);

                    // Basic Route Protection - Only redirect if we are on login/register
                    // AND not already handled by the page logic
                    if (data && (pathname === '/login' || pathname === '/register')) {
                        if (data.organizationId) {
                            const target = data.role === 'STUDENT' ? '/student' : '/app/dashboard';
                            router.push(target);
                        } else {
                            // If logged in but no org, stay on register to complete onboarding
                            if (pathname !== '/register') router.push('/register');
                        }
                    }
                } catch (e) {
                    console.error("Failed to fetch user data in AuthProvider:", e);
                }
            } else {
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [pathname, router]);

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
