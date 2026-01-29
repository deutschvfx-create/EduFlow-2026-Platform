"use client";

import ClientSidebar from "@/app/(protected)/client-sidebar";

interface DesktopLayoutProps {
    children: React.ReactNode;
    modulesConfig?: any;
}

export function DesktopLayout({ children, modulesConfig }: DesktopLayoutProps) {
    return (
        <div className="hidden laptop:block">
            <ClientSidebar modulesConfig={modulesConfig}>
                {children}
            </ClientSidebar>
        </div>
    );
}
