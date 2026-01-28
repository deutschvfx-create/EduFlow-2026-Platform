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
    Settings
} from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
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
        label: "Чаты",
        href: "/app/chat",
        icon: MessageSquare
    },
    {
        label: "Ещё",
        href: "/app/settings",
        icon: Menu
    },
];

export function MobileNavBar() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
            {/* Glassmorphic background */}
            <div className="relative bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800 shadow-2xl">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/50 to-transparent pointer-events-none" />

                {/* Navigation items */}
                <div className="relative flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="relative flex flex-col items-center justify-center min-w-[64px] py-2 px-3 rounded-xl transition-all duration-200 active:scale-95"
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
                                        className={`h-6 w-6 transition-colors ${isActive
                                                ? 'text-indigo-400'
                                                : 'text-zinc-500'
                                            }`}
                                    />

                                    {/* Active dot */}
                                    {isActive && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full"
                                        />
                                    )}
                                </div>

                                {/* Label */}
                                <span
                                    className={`text-xs font-medium mt-1 transition-colors ${isActive
                                            ? 'text-indigo-400'
                                            : 'text-zinc-500'
                                        }`}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
