"use client";

import { getModulesConfig } from "@/app/actions";
import { useQuery } from "@tanstack/react-query";
import { ConnectivityProvider } from "@/lib/connectivity-context";
import { ConnectivityHub } from "@/components/dashboard/connectivity-hub";
import { OfflineDataProvider } from "@/components/system/offline-data-provider";
import { PageTransition } from "@/components/system/page-transition";
import { HelpAssistant } from "@/components/help/help-assistant";
import { MobileLayout } from "@/components/layouts/mobile-layout";
import { DesktopLayout } from "@/components/layouts/desktop-layout";
import { OrganizationProvider } from "@/hooks/use-organization";
import { useAuth } from "@/components/auth/auth-provider";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { userData } = useAuth();

    // Fetch modules config on client side
    const { data: modulesConfig } = useQuery({
        queryKey: ['modules-config', userData?.organizationId],
        queryFn: () => getModulesConfig(userData?.organizationId || undefined),
        enabled: !!userData?.organizationId
    });

    return (
        <OrganizationProvider>
            <ConnectivityProvider>
                <OfflineDataProvider>
                    {/* Mobile & Tablet Layout (< 1025px) */}
                    <div className="laptop:hidden">
                        <MobileLayout>
                            <PageTransition>
                                {children}
                            </PageTransition>
                        </MobileLayout>
                    </div>

                    {/* Laptop & Desktop Layout (≥ 1025px) */}
                    <div className="hidden laptop:block">
                        <DesktopLayout modulesConfig={modulesConfig}>
                            <PageTransition>
                                {children}
                            </PageTransition>
                        </DesktopLayout>
                    </div>

                    {/* Global components */}
                    <ConnectivityHub />
                    <HelpAssistant />
                </OfflineDataProvider>
            </ConnectivityProvider>
        </OrganizationProvider>
    );
}
