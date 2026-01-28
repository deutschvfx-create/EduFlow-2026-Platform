"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, Search, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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
        <header className="sticky top-0 z-30 lg:hidden">
            {/* Glassmorphic background */}
            <div className="relative bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-800">
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
                                className="text-zinc-400 hover:text-white hover:bg-zinc-800 shrink-0"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                                <span className="text-white font-bold text-lg">E</span>
                            </div>
                        )}

                        {/* Title */}
                        <motion.h1
                            key={pageTitle}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-lg font-bold text-white truncate"
                        >
                            {pageTitle}
                        </motion.h1>
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

    return titleMap[lastSegment] || 'EduFlow';
}
