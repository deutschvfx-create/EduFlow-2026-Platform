"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getModulesConfig } from "@/app/actions";
import ClientSidebar from "./client-sidebar";
import { HelpAssistant } from "@/components/help/help-assistant";
import { useQuery } from "@tanstack/react-query";
import { ConnectivityProvider } from "@/lib/connectivity-context";
import { ConnectivityHub } from "@/components/dashboard/connectivity-hub";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    // We use useQuery to fetch config on client side for consistency with other client components
    // and to avoid issues with server actions in a shared protected layout if needed.
    const { data: modulesConfig } = useQuery({
        queryKey: ['modules-config'],
        queryFn: () => getModulesConfig()
    });

    return (
        <ConnectivityProvider>
            <ClientSidebar modulesConfig={modulesConfig}>
                {children}
                <ConnectivityHub />
                <HelpAssistant />
            </ClientSidebar>
        </ConnectivityProvider>
    );
}
