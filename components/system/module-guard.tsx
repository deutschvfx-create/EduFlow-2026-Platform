'use client';

import { useModules } from "@/hooks/use-modules";
import { ModuleKey } from "@/lib/config/modules";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Lock } from "lucide-react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export function ModuleGuard({
    module,
    children
}: {
    module: ModuleKey;
    children: React.ReactNode;
}) {
    const { modules, isLoaded } = useModules();

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!modules[module]) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="bg-card p-4 rounded-full mb-4 border border-border">
                    <Lock className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Модуль отключён</h2>
                <p className="text-muted-foreground max-w-md mb-8">
                    Доступ к разделу ограничен администратором в настройках системы.
                </p>
                <Link href="/app/dashboard">
                    <Button variant="default" className="gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Перейти в Дашборд
                    </Button>
                </Link>
            </div>
        );
    }

    return <>{children}</>;
}
