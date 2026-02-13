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
import { motion, AnimatePresence } from "framer-motion";

import { SplashScreen } from "@/components/shared/splash-screen";
import { useState, useEffect } from "react";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { userData, isGuest } = useAuth();
    const [showSplash, setShowSplash] = useState(true);

    // Fetch modules config on client side
    const activeOrgId = userData?.organizationId || (typeof window !== 'undefined' ? localStorage.getItem('edu_org_id') : null);
    const { data: modulesConfig } = useQuery({
        queryKey: ['modules-config', activeOrgId],
        queryFn: () => getModulesConfig(activeOrgId || undefined),
        enabled: !!activeOrgId
    });

    return (
        <OrganizationProvider>
            <AnimatePresence mode="wait">
                {showSplash && (
                    <motion.div
                        key="splash"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="fixed inset-0 z-[10000]"
                    >
                        <SplashScreen finishLoading={() => setShowSplash(false)} />
                    </motion.div>
                )}
            </AnimatePresence>

            <ConnectivityProvider>
                <OfflineDataProvider>
                    {/* Guest Banner */}
                    {isGuest && (
                        <div className="bg-primary/10 border-b border-primary/20 py-2 px-4 flex items-center justify-between z-[50]">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Режим ознакомления</span>
                            </div>
                            <button
                                onClick={() => window.location.href = '/register'}
                                className="text-[10px] font-black uppercase tracking-widest bg-primary text-white px-3 py-1 rounded-full hover:bg-[#0F3D4C] transition-colors"
                            >
                                Зарегистрироваться
                            </button>
                        </div>
                    )}

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
