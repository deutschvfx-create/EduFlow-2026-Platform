"use client";

import { useState, useMemo } from "react";
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
    CreditCard,
    Search,
    ChevronDown,
    User as UserIcon,
    Bell,
    LogOut,
    ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const allMenuItems = [
    { label: "Дашборд", href: "/app/dashboard", icon: LayoutDashboard, category: "quick" },
    { label: "Студенты", href: "/app/students", icon: Users, category: "quick" },
    { label: "Расписание", href: "/app/schedule", icon: Calendar, category: "quick" },
    { label: "Чаты", href: "/app/chat", icon: MessageSquare, category: "quick" },
    { label: "Преподаватели", href: "/app/teachers", icon: GraduationCap, category: "all" },
    { label: "Факультеты", href: "/app/faculties", icon: Building2, category: "all" },
    { label: "Кафедры", href: "/app/departments", icon: DoorOpen, category: "all" },
    { label: "Группы", href: "/app/groups", icon: Layers, category: "all" },
    { label: "Предметы", href: "/app/courses", icon: BookOpen, category: "all" },
    { label: "Посещаемость", href: "/app/attendance", icon: CheckSquare, category: "all" },
    { label: "Оценки", href: "/app/grades", icon: Award, category: "all" },
    { label: "Объявления", href: "/app/announcements", icon: Megaphone, category: "all" },
    { label: "Отчёты", href: "/app/reports", icon: BarChart3, category: "all" },
    { label: "Платежи", href: "/app/payments", icon: CreditCard, category: "all" },
    { label: "Настройки", href: "/app/settings", icon: Settings, category: "all" },
];

interface MobileDrawerProps {
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function MobileDrawer({ trigger, open: controlledOpen, onOpenChange }: MobileDrawerProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setIsOpen = (value: boolean) => {
        if (onOpenChange) onOpenChange(value);
        setInternalOpen(value);
    };

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const pathname = usePathname();
    const { userData } = useAuth();

    const filteredItems = useMemo(() => {
        if (!searchQuery) return allMenuItems;
        return allMenuItems.filter(item =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const quickAccessItems = filteredItems.filter(i => i.category === "quick");
    const otherModules = filteredItems.filter(i => i.category === "all");

    return (
        <>
            {/* Trigger button */}
            {trigger ? (
                <div onClick={() => setIsOpen(true)} className="cursor-pointer">{trigger}</div>
            ) : (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(true)}
                    className="laptop:hidden text-zinc-400 hover:text-white"
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
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] laptop:hidden"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 240 }}
                            className="fixed left-0 top-0 bottom-0 w-[85%] max-w-[340px] bg-zinc-950 border-r border-zinc-800 z-[101] laptop:hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 bg-zinc-900/50">
                                <div className="flex flex-col">
                                    <h2 className="text-xl font-black text-white leading-none tracking-tight">EduFlow</h2>
                                    <span className="text-[10px] text-zinc-500 font-medium mt-1 uppercase tracking-wider">Language School Management</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsOpen(false)}
                                    className="text-zinc-400 hover:text-white bg-zinc-800/50 h-8 w-8 rounded-lg"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-2 space-y-6">
                                {/* User Profile Section */}
                                <div className="space-y-2">
                                    <div
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className={`flex items-center gap-3 p-2 rounded-xl border transition-all cursor-pointer ${isProfileOpen ? 'bg-zinc-800/80 border-zinc-700 shadow-lg' : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900'
                                            }`}
                                    >
                                        <Avatar className="h-10 w-10 border-2 border-indigo-500/20">
                                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">
                                                {userData?.name?.substring(0, 2).toUpperCase() || "US"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-white truncate">{userData?.name || "Пользователь"}</p>
                                            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-tighter">{userData?.role || "GUEST"}</p>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: isProfileOpen ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ChevronDown className="h-4 w-4 text-zinc-500" />
                                        </motion.div>
                                    </div>

                                    <AnimatePresence>
                                        {isProfileOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden bg-zinc-900/40 rounded-xl border border-zinc-800/50"
                                            >
                                                <div className="p-1 space-y-1">
                                                    <Link href="/app/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                                                        <UserIcon className="h-4 w-4" />
                                                        <span>Мой профиль</span>
                                                    </Link>
                                                    <Link href="/app/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                                                        <Bell className="h-4 w-4" />
                                                        <span>Уведомления</span>
                                                    </Link>
                                                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
                                                        <LogOut className="h-4 w-4" />
                                                        <span>Выйти</span>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Search Section */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                    <Input
                                        placeholder="Поиск модулей..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 h-11 bg-zinc-900 blur-overlay border-zinc-800 focus:border-indigo-500/50 rounded-xl text-sm"
                                    />
                                </div>

                                {/* Navigation Groups */}
                                <div className="space-y-6">
                                    {quickAccessItems.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between px-2">
                                                <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em]">Быстрый доступ</h3>
                                                <button className="text-[10px] text-indigo-400 font-bold hover:underline">ИЗМЕНИТЬ</button>
                                            </div>
                                            <div className="space-y-1">
                                                {quickAccessItems.map((item) => (
                                                    <DrawerItem key={item.href} item={item} pathname={pathname} onClose={() => setIsOpen(false)} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {otherModules.length > 0 && (
                                        <div className="space-y-2">
                                            <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] px-2">Все модули</h3>
                                            <div className="space-y-1">
                                                {otherModules.map((item) => (
                                                    <DrawerItem key={item.href} item={item} pathname={pathname} onClose={() => setIsOpen(false)} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-zinc-800/50 bg-zinc-950 flex items-center justify-between">
                                <Link href="#" className="text-[10px] text-zinc-500 hover:text-zinc-400 transition-colors">
                                    Privacy Policy
                                </Link>
                                <span className="text-[10px] text-zinc-600">v2.1.0-beta</span>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

function DrawerItem({ item, pathname, onClose }: { item: any, pathname: string, onClose: () => void }) {
    const isActive = pathname === item.href;
    const Icon = item.icon;

    return (
        <Link
            href={item.href}
            onClick={onClose}
            data-help-id={`sidebar-item-${item.href}`}
            className={`flex items-center justify-between group px-3 py-2.5 rounded-xl transition-all ${isActive
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
                }`}
        >
            <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-800/50 text-zinc-500 group-hover:text-zinc-300'}`}>
                    <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold tracking-tight">{item.label}</span>
            </div>
            {isActive && (
                <motion.div
                    layoutId="active-drawer-dot"
                    className="w-1.5 h-1.5 rounded-full bg-indigo-500"
                />
            )}
        </Link>
    );
}
