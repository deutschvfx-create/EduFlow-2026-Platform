"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Organization } from "@/lib/types/organization";

interface OrganizationContextType {
    currentOrganizationId: string | null;
    currentOrganization: Organization | null;
    organizations: Organization[];
    switchOrganization: (orgId: string) => void;
    createOrganization: (org: Organization) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
    const [currentOrganizationId, setCurrentOrganizationId] = useState<string | null>(null);
    const [organizations, setOrganizations] = useState<Organization[]>([]);

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
