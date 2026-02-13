"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { SchoolSwitcher } from "@/components/shared/school-switcher";
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
    ExternalLink,
    Gamepad2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRole } from "@/hooks/use-role";
import { useModules } from "@/hooks/use-modules";

const allMenuItems = [
    { label: "Дашборд", href: "/app/dashboard", icon: LayoutDashboard, category: "quick" },
    { label: "Миссии", href: "/app/games", icon: Gamepad2, category: "quick" },
    { label: "Студенты", href: "/app/students", icon: Users, category: "quick" },
    { label: "Расписание", href: "/app/schedule", icon: Calendar, category: "quick" },
    { label: "Чаты", href: "/app/chat", icon: MessageSquare, category: "quick" },
    { label: "Преподаватели", href: "/app/teachers", icon: GraduationCap, category: "all" },
    { label: "Факультеты", href: "/app/faculties", icon: Building2, category: "all" },
    { label: "Кафедры", href: "/app/departments", icon: DoorOpen, category: "all" },
    { label: "Группы", href: "/app/groups", icon: Layers, category: "all" },
    { label: "Курсы", href: "/app/courses", icon: BookOpen, category: "all" },
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
    const { role, isOwner, isTeacher, isStudent } = useRole();
    const { modules } = useModules();

    const allowedMenuItems = useMemo(() => {
        return allMenuItems.filter(item => {
            // 1. Check Module Status
            if (modules) {
                if (item.href.includes('teachers') && !modules.teachers) return false;
                if (item.href.includes('faculties') && !modules.faculties) return false;
                if (item.href.includes('departments') && !modules.departments) return false;
                if (item.href.includes('groups') && !modules.groups) return false;
                if (item.href.includes('courses') && !modules.courses) return false;
                if (item.href.includes('schedule') && !modules.schedule) return false;
                if (item.href.includes('attendance') && !modules.attendance) return false;
                if (item.href.includes('grades') && !modules.grades) return false;
                if (item.href.includes('announcements') && !modules.announcements) return false;
                if (item.href.includes('chat') && !modules.chat) return false;
                if (item.href.includes('reports') && !modules.reports) return false;
                if (item.href.includes('students') && !modules.students) return false;
            }

            if (isOwner) return true; // Owners see everything

            // Teacher restrictions
            if (isTeacher) {
                const hiddenForTeachers = ["/app/faculties", "/app/departments", "/app/reports", "/app/payments", "/app/settings"];
                return !hiddenForTeachers.includes(item.href);
            }

            // Student restrictions (even more limited)
            if (isStudent) {
                const allowedForStudents = ["/app/dashboard", "/app/schedule", "/app/chat", "/app/attendance", "/app/grades", "/app/games"];

                const itemPath = item.href;
                if (allowedForStudents.includes(itemPath)) {
                    if (itemPath === "/app/grades") return { ...item, href: "/student/grades" };
                    if (itemPath === "/app/games") return { ...item, href: "/student/games" };
                    return item;
                }
                return false;
            }

            return false;
        });
    }, [isOwner, isTeacher, isStudent, modules]);

    const filteredItems = useMemo(() => {
        if (!searchQuery) return allowedMenuItems;
        return allowedMenuItems.filter(item =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, allowedMenuItems]);

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
                    className="laptop:hidden text-muted-foreground hover:text-foreground"
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
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.2}
                            onDragEnd={(_, info) => {
                                if (info.offset.x < -100) setIsOpen(false);
                            }}
                            data-help-id="mobile-drawer"
                            className="fixed left-0 top-0 bottom-0 w-[85%] tablet:w-[30%] tablet:max-w-[320px] bg-background border-r border-border z-[101] laptop:hidden flex flex-col shadow-2xl"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-2 pl-0 bg-card/50">
                                <SchoolSwitcher className="text-foreground hover:bg-slate-200/50" />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsOpen(false)}
                                    className="text-muted-foreground hover:text-foreground bg-secondary/50 h-8 w-8 rounded-lg shrink-0 mr-2"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-2 space-y-6">
                                {/* User Profile Section */}
                                <div className="space-y-2">
                                    <div
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className={`flex items-center gap-3 p-2 rounded-xl border transition-all cursor-pointer ${isProfileOpen ? 'bg-secondary/80 border-border shadow-lg' : 'bg-card/50 border-border hover:bg-card'
                                            }`}
                                    >
                                        <Avatar className="h-10 w-10 border-2 border-primary/20">
                                            <AvatarImage src={userData?.photoURL} />
                                            <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-foreground font-bold">
                                                {userData?.firstName?.[0] || userData?.name?.[0] || "U"}
                                                {userData?.lastName?.[0] || userData?.name?.[1] || ""}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-foreground truncate">
                                                {userData?.firstName || userData?.name || "Пользователь"} {userData?.lastName || ""}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">{role || "student"}</p>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: isProfileOpen ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                        </motion.div>
                                    </div>

                                    <AnimatePresence>
                                        {isProfileOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden bg-card/40 rounded-xl border border-border/50"
                                            >
                                                <div className="p-1 space-y-1">
                                                    <Link href="/app/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                                                        <UserIcon className="h-4 w-4" />
                                                        <span>Мой профиль</span>
                                                    </Link>
                                                    <Link href="/app/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
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
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Поиск модулей..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 h-11 bg-card blur-overlay border-border focus:border-primary/50 rounded-xl text-sm"
                                    />
                                </div>

                                {/* Navigation Groups */}
                                <div className="space-y-6">
                                    {quickAccessItems.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between px-2">
                                                <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Быстрый доступ</h3>
                                                <button className="text-[10px] text-primary font-bold hover:underline">ИЗМЕНИТЬ</button>
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
                                            <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2">Все модули</h3>
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
                            <div className="p-4 border-t border-border/50 bg-background flex items-center justify-between">
                                <Link href="#" className="text-[10px] text-muted-foreground hover:text-muted-foreground transition-colors">
                                    Privacy Policy
                                </Link>
                                <span className="text-[10px] text-muted-foreground">v2.1.0-beta</span>
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
            className={`flex items-center justify-between group px-4 py-3.5 rounded-2xl transition-all active:scale-[0.98] ${isActive
                ? 'bg-primary/15 text-primary border border-primary/30 shadow-lg shadow-cyan-500/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50 border border-transparent'
                }`}
        >
            <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-primary/20 text-primary' : 'bg-secondary/50 text-muted-foreground group-hover:text-foreground'}`}>
                    <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold tracking-tight">{item.label}</span>
            </div>
            {isActive && (
                <motion.div
                    layoutId="active-drawer-dot"
                    className="w-1.5 h-1.5 rounded-full bg-primary"
                />
            )}
        </Link>
    );
}
