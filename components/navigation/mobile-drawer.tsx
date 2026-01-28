"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Menu,
    X,
    LayoutDashboard,
    Users,
    GraduationCap,
    Building2,
    DoorOpen,
    Layers,
    BookOpen,
    Calendar,
    CheckSquare,
    Award,
    Megaphone,
    MessageSquare,
    BarChart3,
    Settings,
    CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";

const allMenuItems = [
    { label: "Дашборд", href: "/app/dashboard", icon: LayoutDashboard },
    { label: "Студенты", href: "/app/students", icon: Users },
    { label: "Преподаватели", href: "/app/teachers", icon: GraduationCap },
    { label: "Факультеты", href: "/app/faculties", icon: Building2 },
    { label: "Кафедры", href: "/app/departments", icon: DoorOpen },
    { label: "Группы", href: "/app/groups", icon: Layers },
    { label: "Предметы", href: "/app/courses", icon: BookOpen },
    { label: "Расписание", href: "/app/schedule", icon: Calendar },
    { label: "Посещаемость", href: "/app/attendance", icon: CheckSquare },
    { label: "Оценки", href: "/app/grades", icon: Award },
    { label: "Объявления", href: "/app/announcements", icon: Megaphone },
    { label: "Чаты", href: "/app/chat", icon: MessageSquare },
    { label: "Отчёты", href: "/app/reports", icon: BarChart3 },
    { label: "Платежи", href: "/app/payments", icon: CreditCard },
    { label: "Настройки", href: "/app/settings", icon: Settings },
];

interface MobileDrawerProps {
    trigger?: React.ReactNode;
}

export function MobileDrawer({ trigger }: MobileDrawerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    return (
        <>
            {/* Trigger button */}
            {trigger ? (
                <div onClick={() => setIsOpen(true)}>{trigger}</div>
            ) : (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(true)}
                    className="lg:hidden text-zinc-400 hover:text-white"
                >
                    <Menu className="h-6 w-6" />
                </Button>
            )}

            {/* Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/80 z-50 lg:hidden"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed left-0 top-0 bottom-0 w-80 bg-zinc-900 z-50 lg:hidden overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                        <span className="text-white font-bold text-lg">E</span>
                                    </div>
                                    <h2 className="text-lg font-bold text-white">EduFlow</h2>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsOpen(false)}
                                    className="text-zinc-400 hover:text-white"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* Menu items */}
                            <nav className="p-4 space-y-2">
                                {allMenuItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    const Icon = item.icon;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                                }`}
                                        >
                                            <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                                            <span className="font-medium">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
