'use client';

import PlaceholderPage from "@/components/placeholder-page";
import { ModuleGuard } from "@/components/system/module-guard";

export default function Page() {
    return (
        <ModuleGuard module="chat">
            <PlaceholderPage title="Чаты" />
        </ModuleGuard>
    );
}
