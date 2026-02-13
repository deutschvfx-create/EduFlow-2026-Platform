"use client";

import { usePathname } from "next/navigation";
import { useOrganization } from "@/hooks/use-organization";
import { ChevronRight, Home, School, Layout } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function ContextBreadcrumb() {
    const pathname = usePathname();
    const { organizations, currentOrganizationId } = useOrganization();

    const currentOrg = organizations.find(o => o.id === currentOrganizationId);
    const isGlobal = pathname.startsWith('/app/home') || pathname === '/select-school';

    // Simple breadcrumb logic
    const segments = pathname.split('/').filter(Boolean).slice(1); // skip 'app' or prefix

    return (
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
            {organizations.length > 1 && (
                <>
                    <Link
                        href="/app/home"
                        className={cn(
                            "flex items-center gap-1.5 transition-colors hover:text-primary",
                            isGlobal ? "text-primary" : "text-[#0F3D4C]/30"
                        )}
                    >
                        <Home className="h-3 w-3" />
                        <span>Uni Prime</span>
                    </Link>
                </>
            )}

            {!isGlobal && currentOrg && (
                <>
                    {organizations.length > 1 && (
                        <ChevronRight className="h-3 w-3 text-[#0F3D4C]/20" />
                    )}
                    <Link
                        href="/app/dashboard"
                        className="flex items-center gap-1.5 text-primary transition-colors hover:opacity-80"
                    >
                        <School className="h-3 w-3" />
                        <span className="max-w-[120px] truncate">{currentOrg.name}</span>
                    </Link>
                </>
            )}

            {segments.length > 1 && (
                <>
                    <ChevronRight className="h-3 w-3 text-[#0F3D4C]/20" />
                    <div className="flex items-center gap-1.5 text-[#0F3D4C]/60">
                        <Layout className="h-3 w-3" />
                        <span>{getSegmentLabel(segments[segments.length - 1])}</span>
                    </div>
                </>
            )}
        </nav>
    );
}

function getSegmentLabel(segment: string) {
    const labels: Record<string, string> = {
        'dashboard': 'Дашборд',
        'students': 'Студенты',
        'teachers': 'Преподаватели',
        'courses': 'Курсы',
        'schedule': 'Расписание',
        'attendance': 'Журнал',
        'grades': 'Оценки',
        'reports': 'Отчеты',
        'profile': 'Профиль',
        'settings': 'Настройки',
        'home': 'Обзор'
    };
    return labels[segment] || segment;
}
