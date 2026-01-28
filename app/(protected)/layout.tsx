"use client";

import { getModulesConfig } from "@/app/actions";
import { useQuery } from "@tanstack/react-query";
import { ConnectivityProvider } from "@/lib/connectivity-context";
import { ConnectivityHub } from "@/components/dashboard/connectivity-hub";
import { PageTransition } from "@/components/system/page-transition";
import { HelpAssistant } from "@/components/help/help-assistant";
import { MobileLayout } from "@/components/layouts/mobile-layout";
import { DesktopLayout } from "@/components/layouts/desktop-layout";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    // Fetch modules config on client side
    const { data: modulesConfig } = useQuery({
        queryKey: ['modules-config'],
        queryFn: () => getModulesConfig()
    });

    return (
        <ConnectivityProvider>
            {/* Mobile Layout (< 1024px) */}
            <div className="lg:hidden">
                <MobileLayout>
                    <PageTransition>
                        {children}
                    </PageTransition>
                </MobileLayout>
            </div>

            {/* Desktop Layout (≥ 1024px) */}
            <div className="hidden lg:block">
                <DesktopLayout modulesConfig={modulesConfig}>
                    <PageTransition>
                        {children}
                    </PageTransition>
                </DesktopLayout>
            </div>

            {/* Global components */}
            <ConnectivityHub />
            <HelpAssistant />
        </ConnectivityProvider>
    );
}
