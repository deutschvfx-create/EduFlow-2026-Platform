// Imports cleaned up
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import api from "@/lib/api";
import { getModulesConfig } from "@/app/actions";
import ClientSidebar from "./client-sidebar";


import { HelpAssistant } from "@/components/help/help-assistant";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    // Fetch config on server (optional or standard)
    const modulesConfig = await getModulesConfig();

    return (
        <ClientSidebar modulesConfig={modulesConfig}>
            {children}
            <HelpAssistant />
        </ClientSidebar>
    );
}
