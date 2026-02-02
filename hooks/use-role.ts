"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { UserRole } from "@/lib/services/firestore";

export function useRole() {
    const { userData, loading } = useAuth();

    const role: UserRole | null = userData?.role || null;

    return {
        role,
        isOwner: role === 'OWNER',
        isTeacher: role === 'TEACHER',
        isStudent: role === 'STUDENT',
        loading
    };
}
