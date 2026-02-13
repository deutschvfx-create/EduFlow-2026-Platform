"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Organization } from "@/lib/types/organization";
import { useAuth } from "@/components/auth/auth-provider";

interface OrganizationContextType {
    currentOrganizationId: string | null;
    currentOrganization: Organization | null;
    organizations: Organization[];
    switchOrganization: (orgId: string) => void;
    createOrganization: (org: Organization) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
    const { userData, memberships } = useAuth();
    const [currentOrganizationId, setCurrentOrganizationId] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('edu_org_id');
        }
        return null;
    });
    const [organizations, setOrganizations] = useState<Organization[]>([]);

    // Save to localStorage when changed
    useEffect(() => {
        if (currentOrganizationId) {
            localStorage.setItem('edu_org_id', currentOrganizationId);
        } else {
            localStorage.removeItem('edu_org_id');
        }
    }, [currentOrganizationId]);

    // Fetch Organizations based on Memberships
    useEffect(() => {
        const fetchOrgs = async () => {
            const { OrganizationService } = await import("@/lib/services/firestore");

            // 1. If we have memberships, fetch them all
            if (memberships.length > 0) {
                const promises = memberships.map(m => OrganizationService.getOrganization(m.organizationId));
                const results = await Promise.all(promises);
                const validOrgs = results.filter((o): o is Organization => o !== null);
                setOrganizations(validOrgs);
            }
            // 2. Fallback: If no memberships but user has deprecated organizationId (Legacy Mode)
            else if (userData?.organizationId && userData.organizationId !== 'pending_invite') {
                const org = await OrganizationService.getOrganization(userData.organizationId);
                if (org) setOrganizations([org as Organization]);
            }
        };
        fetchOrgs();
    }, [memberships, userData]);

    // Smart Selection Logic
    useEffect(() => {
        // If we have organizations loaded...
        if (organizations.length > 0) {
            // Is current selection valid?
            const isCurrentValid = currentOrganizationId && organizations.find(o => o.id === currentOrganizationId);

            if (!isCurrentValid) {
                // Try localStorage
                const localId = typeof window !== 'undefined' ? localStorage.getItem('edu_org_id') : null;
                const isLocalValid = localId && organizations.find(o => o.id === localId);

                if (isLocalValid) {
                    setCurrentOrganizationId(localId);
                } else if (organizations.length === 1) {
                    // ONLY auto-select if there is exactly one choice
                    setCurrentOrganizationId(organizations[0].id);
                }
                // Otherwise leave as null, forcing the use of /select-school or similar selection UI
            }
        }
    }, [organizations, currentOrganizationId]);

    const currentOrganization = organizations.find(org => org.id === currentOrganizationId) || null;

    const switchOrganization = async (orgId: string) => {
        setCurrentOrganizationId(orgId);

        // Persist to Firestore for cross-device sync
        if (userData?.uid) {
            try {
                const { UserService } = await import("@/lib/services/firestore");
                await UserService.updateUser(userData.uid, { currentOrganizationId: orgId });
            } catch (error) {
                console.error("Failed to persist organization preference:", error);
            }
        }
    };

    // Deprecated? No, used for bootstrapping
    const createOrganization = (org: Organization) => {
        setOrganizations(prev => [...prev, org]);
        setCurrentOrganizationId(org.id);
    };

    return (
        <OrganizationContext.Provider
            value={{
                currentOrganizationId,
                currentOrganization,
                organizations,
                switchOrganization,
                createOrganization,
            }}
        >
            {children}
        </OrganizationContext.Provider>
    );
}

export function useOrganization() {
    const context = useContext(OrganizationContext);
    if (context === undefined) {
        throw new Error("useOrganization must be used within an OrganizationProvider");
    }
    return context;
}
