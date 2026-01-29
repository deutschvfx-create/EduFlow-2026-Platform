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
    Wand2
} from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
    {
        label: "Меню",
        isDrawer: true,
        icon: Menu
    },
    {
        label: "Главная",
        href: "/app/dashboard",
        icon: Home
    },
    {
        label: "Студенты",
        href: "/app/students",
        icon: Users
    },
    {
        label: "Расписание",
        href: "/app/schedule",
        icon: Calendar
    },
    {
        label: "Гайд",
        isHelp: true,
        icon: Wand2
    },
];

interface MobileNavBarProps {
    onOpenMenu?: () => void;
}

export function MobileNavBar({ onOpenMenu }: MobileNavBarProps) {
    const pathname = usePathname();

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
                className={`relative flex flex-col items-center justify-center min-w-[56px] py-1.5 px-2 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer ${(item.isDrawer || item.isHelp) ? 'text-zinc-500' : ''}`}
            >
                {/* Active indicator */}
                {isActive && (
                    <motion.div
                        layoutId="mobile-nav-indicator"
                        className="absolute inset-0 bg-indigo-500/10 rounded-xl border border-indigo-500/20"
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    />
                )}

                {/* Icon */}
                <div className="relative">
                    <Icon
                        className={`h-5 w-5 transition-colors ${isActive
                            ? 'text-indigo-400'
                            : 'text-zinc-500'
                            }`}
                    />

                    {/* Active dot */}
                    {isActive && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-indigo-500 rounded-full"
                        />
                    )}
                </div>

                {/* Label */}
                <span
                    className={`text-[10px] font-medium mt-1 transition-colors ${isActive
                        ? 'text-indigo-400'
                        : 'text-zinc-500'
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
            <div className="relative bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800 shadow-2xl">
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
