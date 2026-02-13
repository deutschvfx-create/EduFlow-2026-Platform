"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    Users,
    Calendar,
    MessageSquare,
    Menu,
    LayoutDashboard,
    Settings,
    Award
} from "lucide-react";
import { motion } from "framer-motion";
import { useRole } from "@/hooks/use-role";



interface MobileNavBarProps {
    onOpenMenu?: () => void;
}

export function MobileNavBar({ onOpenMenu }: MobileNavBarProps) {
    const pathname = usePathname();
    const { isStudent } = useRole();

    const navItems = [
        {
            label: "Меню",
            isDrawer: true,
            icon: Menu
        },
        {
            label: isStudent ? "Моё" : "Главная",
            href: isStudent ? "/student" : "/app/dashboard",
            icon: isStudent ? LayoutDashboard : Home
        },
        {
            label: "Студенты",
            href: "/app/students",
            icon: Users,
            hidden: isStudent
        },
        {
            label: "Оценки",
            href: "/student/grades",
            icon: Award,
            hidden: !isStudent
        },
        {
            label: "Расписание",
            href: "/app/schedule",
            icon: Calendar
        },
        {
            label: "Чаты",
            href: "/app/chat",
            icon: MessageSquare,
            hidden: !isStudent
        },
    ].filter(item => !item.hidden);

    const renderItem = (item: any) => {
        const isActive = item.href ? (pathname === item.href || pathname.startsWith(item.href + '/')) : false;
        const Icon = item.icon;

        const content = (
            <div
                onClick={() => {
                    if (item.isDrawer && onOpenMenu) {
                        onOpenMenu();
                    } else if (item.isHelp) {
                        window.dispatchEvent(new CustomEvent('open-help'));
                    }
                }}
                className={`relative flex flex-col items-center justify-center min-w-[64px] tablet:min-w-[80px] py-2 tablet:py-3 px-3 rounded-2xl transition-all active:scale-90 active:bg-white/5 cursor-pointer ${(item.isDrawer || item.isHelp) ? 'text-muted-foreground' : ''}`}
            >
                {/* Active indicator */}
                {isActive && (
                    <motion.div
                        layoutId="mobile-nav-indicator"
                        className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20"
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    />
                )}

                {/* Icon */}
                <div className="relative">
                    <Icon
                        className={`h-5 w-5 tablet:h-6 tablet:w-6 transition-colors ${isActive
                            ? 'text-primary'
                            : 'text-muted-foreground'
                            }`}
                    />

                    {/* Active dot */}
                    {isActive && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-1.5 h-1.5 tablet:w-2 tablet:h-2 bg-primary rounded-full"
                        />
                    )}
                </div>

                {/* Label */}
                <span
                    className={`text-[10px] tablet:text-xs font-bold mt-1 transition-colors ${isActive
                        ? 'text-primary'
                        : 'text-muted-foreground'
                        }`}
                >
                    {item.label}
                </span>
            </div>
        );

        if (item.isDrawer || item.isHelp) {
            return (
                <div key={item.isDrawer ? "mobile-menu-drawer" : "mobile-help-trigger"} data-help-id={item.isDrawer ? "mobile-nav-menu" : "mobile-help-trigger"}>
                    {content}
                </div>
            );
        }

        return (
            <Link
                key={item.href}
                href={item.href}
                data-help-id={`mobile-nav-${item.label.toLowerCase()}`}
            >
                {content}
            </Link>
        );
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 laptop:hidden" data-help-id="mobile-nav">
            {/* Glassmorphic background */}
            <div className="relative bg-card/95 backdrop-blur-xl border-t border-border shadow-2xl">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/50 to-transparent pointer-events-none" />

                {/* Navigation items */}
                <div className="relative flex items-center justify-around px-1 py-2 safe-area-inset-bottom">
                    {navItems.map(renderItem)}
                </div>
            </div>
        </nav>
    );
}
