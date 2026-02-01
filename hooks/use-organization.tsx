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
    const { userData } = useAuth();
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

    // Sync with currentUser's organizationId if not set manually
    useEffect(() => {
        if (userData?.organizationId && !currentOrganizationId) {
            // For students, skip 'pending_invite'
            if (userData.organizationId !== 'pending_invite') {
                setCurrentOrganizationId(userData.organizationId);
            }
        }
    }, [userData, currentOrganizationId]);

    const currentOrganization = organizations.find(org => org.id === currentOrganizationId) || null;

    const switchOrganization = (orgId: string) => {
        setCurrentOrganizationId(orgId);
    };

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
