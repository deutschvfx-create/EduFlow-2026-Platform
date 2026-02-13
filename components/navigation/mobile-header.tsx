"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, Search, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MobileDrawer } from "./mobile-drawer";

interface MobileHeaderProps {
    title?: string;
    showBack?: boolean;
    onBack?: () => void;
    actions?: React.ReactNode;
}

export function MobileHeader({
    title,
    showBack = false,
    onBack,
    actions
}: MobileHeaderProps) {
    const router = useRouter();
    const pathname = usePathname();

    // Auto-detect if we should show back button
    const shouldShowBack = showBack || (pathname.split('/').length > 3);

    // Auto-generate title from pathname if not provided
    const pageTitle = title || getPageTitle(pathname);

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    return (
        <header className="sticky top-0 z-30 laptop:hidden">
            {/* Glassmorphic background */}
            <div className="relative bg-card/95 backdrop-blur-xl border-b border-border">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 to-transparent pointer-events-none" />

                {/* Header content */}
                <div className="relative flex items-center justify-between h-16 px-4">
                    {/* Left: Back button or logo */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        {shouldShowBack ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleBack}
                                className="text-muted-foreground hover:text-foreground hover:bg-secondary shrink-0"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        ) : (
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0">
                                <span className="text-foreground font-black text-sm">E</span>
                            </div>
                        )}

                        {/* Title Section */}
                        <div className="flex flex-col min-w-0">
                            <motion.span
                                key={pageTitle}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest truncate"
                            >
                                {pageTitle}
                            </motion.span>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        {actions}
                    </div>
                </div>
            </div>
        </header>
    );
}

// Helper function to generate page title from pathname
function getPageTitle(pathname: string): string {
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];

    const titleMap: Record<string, string> = {
        'dashboard': 'Дашборд',
        'students': 'Студенты',
        'teachers': 'Преподаватели',
        'faculties': 'Факультеты',
        'departments': 'Кафедры',
        'groups': 'Группы',
        'courses': 'Предметы',
        'schedule': 'Расписание',
        'attendance': 'Посещаемость',
        'grades': 'Оценки',
        'announcements': 'Объявления',
        'chat': 'Чаты',
        'reports': 'Отчёты',
        'settings': 'Настройки',
        'payments': 'Платежи',
    };

    return titleMap[lastSegment] || 'UNI PRIME';
}
