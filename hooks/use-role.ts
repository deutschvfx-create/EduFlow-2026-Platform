"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { UserRole } from "@/lib/services/firestore";
import { useOrganization } from "./use-organization";

export function useRole() {
    const { userData, memberships, loading: authLoading } = useAuth();
    const { currentOrganizationId } = useOrganization();

    // 1. Find role in current membership
    const activeMembership = memberships.find(m => m.organizationId === currentOrganizationId);

    // 2. Determine role (Membership role takes precedence over legacy root role)
    const rawRole = (activeMembership?.role) || (userData?.role) || null;
    const role = (typeof rawRole === 'string' ? rawRole.toLowerCase() : null) as UserRole | null;

    return {
        role,
        isOwner: role === 'owner',
        isTeacher: role === 'teacher',
        isStudent: role === 'student',
        activeMembership,
        loading: authLoading
    };
}
