"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Home,
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
    LogOut,
    Menu,
    X,
    MapPin,
    ShieldAlert,
    Search,
    Activity,
    Gamepad2,
    BellRing,
    MessageCircle,
    User
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useModules } from "@/hooks/use-modules"; // Using hook instead of props
import { useAuth } from "@/components/auth/auth-provider";
import { SchoolSwitcher } from "@/components/shared/school-switcher";
import { ContextBreadcrumb } from "@/components/navigation/context-breadcrumb";

const sidebarItems = [
    {
        title: "Главная",
        items: [
            { label: "Общий обзор", href: "/app/home", icon: Home },
            { label: "Дашборд школы", href: "/app/dashboard", icon: LayoutDashboard },
        ]
    },
    {
        title: "Люди",
        items: [
            { label: "Студенты", href: "/app/students", icon: Users },
            { label: "Преподаватели", href: "/app/teachers", icon: GraduationCap },
        ]
    },
    {
        title: "Структура",
        items: [
            { label: "Факультеты", href: "/app/faculties", icon: Building2 },
            { label: "Кафедры", href: "/app/departments", icon: DoorOpen },
            { label: "Группы", href: "/app/groups", icon: Layers },
            { label: "Аудитории", href: "/app/classrooms", icon: MapPin },
        ]
    },
    {
        title: "Обучение",
        items: [
            { label: "Курсы", href: "/app/courses", icon: BookOpen },
            { label: "Расписание", href: "/app/schedule", icon: Calendar },
            { label: "Журнал", href: "/app/attendance", icon: CheckSquare },
            { label: "Оценки", href: "/app/grades", icon: Award },
        ]
    },
    {
        title: "Коммуникация",
        items: [
            { label: "Объявления", href: "/app/announcements", icon: BellRing },
            { label: "Чаты", href: "/app/chat", icon: MessageCircle },
        ]
    },
    {
        title: "Аналитика",
        items: [
            { label: "Отчёты", href: "/app/reports", icon: BarChart3 },
        ]
    },
    {
        title: "Система",
        items: [
            { label: "Профиль", href: "/app/profile", icon: User },
            { label: "Настройки", href: "/app/settings", icon: Settings },
        ]
    },
];

export default function ClientSidebar({
    children,
    // modulesConfig // Deprecated prop in favor of hook
}: {
    children: React.ReactNode,
    modulesConfig?: any
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Use client-side hook for dynamic configuration
    const { modules, isLoaded } = useModules();
    const { userData: user, memberships } = useAuth();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    }

    // Dynamic items based on role
    const dynamicSidebarItems = [...sidebarItems];

    if (user?.role === 'teacher' || user?.role === 'owner') {
        const commsGroup = dynamicSidebarItems.find(g => g.title === "Коммуникация");
        if (commsGroup && !commsGroup.items.find(i => i.href === '/teacher')) {
            commsGroup.items.unshift({ label: "Игры", href: "/teacher", icon: Gamepad2 });
        }
    } else if (user?.role === 'student') {
        const mainGroup = dynamicSidebarItems.find(g => g.title === "Главная");
        if (mainGroup && !mainGroup.items.find(i => i.href === '/student')) {
            mainGroup.items.unshift({ label: "Моё обучение", href: "/student", icon: LayoutDashboard });
        }
    }

    // Filter Items Logic (Client Side)
    const filteredItems = dynamicSidebarItems.map(group => {
        const newItems = group.items.map(item => {
            if (user?.role === 'student' && item.href === '/app/grades') {
                return { ...item, href: '/student/grades' };
            }
            return item;
        }).filter(item => {
            // Logic: Hide Global Overview if user has 0 or 1 organization
            if (item.href === '/app/home' && (memberships?.length || 0) <= 1) {
                return false;
            }

            if (item.href === '/teacher' || item.href === '/student') return true;
            if (item.href === '/app/dashboard') return true;
            if (item.href === '/app/settings') return true;

            // Map href to config key
            if (item.href.includes('teachers')) return modules?.teachers;
            if (item.href.includes('faculties')) return modules?.faculties;
            if (item.href.includes('departments')) return modules?.departments;
            if (item.href.includes('groups')) return modules?.groups;
            if (item.href.includes('classrooms')) return modules?.classrooms;
            if (item.href.includes('courses')) return modules?.courses;
            if (item.href.includes('schedule')) return modules?.schedule;
            if (item.href.includes('attendance')) return modules?.attendance;
            if (item.href.includes('grades')) return modules?.grades;
            if (item.href.includes('announcements')) return modules?.announcements;
            if (item.href.includes('chat')) return modules?.chat;
            if (item.href.includes('reports')) return modules?.reports;

            // Fallback for students if logic above missed (it was first check)
            if (item.href.includes('students')) return modules?.students;

            return true;
        });
        return { ...group, items: newItems };
    }).filter(group => group.items.length > 0);

    return (
        <div className="h-screen w-full bg-background flex font-sans text-foreground overflow-hidden justify-center overflow-x-auto">
            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-40 laptop:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Main Wrapper that centers everything if screen is very wide */}
            <div className="flex w-full min-w-fit justify-center">
                {/* Fixed Sidebar */}
                <aside
                    className={`fixed laptop:sticky top-0 h-screen z-50 flex flex-col bg-[#0F3D4C] border-r border-white/10 transition-all duration-300 transform 
                    ${mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full laptop:translate-x-0'} 
                    w-[260px] min-w-[260px] max-w-[260px]
                    ${user?.organizationId ? 'border-r-primary/50' : 'border-r-white/10'}
                    `}
                >
                    {/* Visual context indicator for active school */}
                    {user?.organizationId && (
                        <div className="absolute inset-y-0 right-0 w-[2px] bg-gradient-to-b from-transparent via-primary to-transparent opacity-50" />
                    )}
                    {/* Header */}
                    <div className="h-[4.5rem] flex items-center justify-between px-3 border-b border-white/10">
                        <SchoolSwitcher />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setMobileOpen(false)}
                            className="laptop:hidden text-sidebar-foreground/70"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Navigation */}
                    <ScrollArea className="flex-1 px-3 py-4">
                        <div className="space-y-6">
                            {/* MASTER SECTION (TOP SECRET) */}
                            {user?.uid === process.env.NEXT_PUBLIC_MASTER_ADMIN_UID && (
                                <div className="px-2 mb-8">
                                    <div className="flex items-center gap-2 mb-3 px-2">
                                        <div className="h-1 w-1 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]" />
                                        <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">
                                            Master Control
                                        </h4>
                                    </div>
                                    <div className="space-y-1">
                                        <Link
                                            href="/app/master-center"
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 text-sm font-black
                                            ${pathname === '/app/master-center'
                                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                                                    : 'text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                                                }`}
                                        >
                                            <ShieldAlert className={`h-5 w-5 ${pathname === '/app/master-center' ? 'text-red-400' : 'text-muted-foreground'}`} />
                                            <span>
                                                Command Center
                                            </span>
                                        </Link>
                                    </div>
                                    <div className="h-px bg-gradient-to-r from-transparent via-sidebar-border to-transparent my-6" />
                                </div>
                            )}

                            {filteredItems.map((group: any, i: number) => (
                                <div key={i} className="px-2">
                                    <h4 className="mb-2 px-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                                        {group.title}
                                    </h4>
                                    <div className="space-y-1">
                                        {group.items.map((item: any) => {
                                            const isActive = pathname === item.href;
                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    data-help-id={`sidebar-item-${item.href}`}
                                                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium
                                                    ${isActive
                                                            ? 'bg-[#2EC4C6]/15 text-[#2EC4C6] border border-[#2EC4C6]/30'
                                                            : 'text-white/65 hover:text-white hover:bg-white/5'
                                                        }`}
                                                >
                                                    <item.icon className={`h-5 w-5 ${isActive ? 'text-[#2EC4C6]' : 'text-white/50'}`} />
                                                    <span>
                                                        {item.label}
                                                    </span>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Footer / Logout / Rating */}
                    <div className="p-4 border-t border-sidebar-border space-y-4">
                        <div className="px-2 py-3 rounded-xl bg-primary/20 border border-primary/10 flex flex-col items-center gap-2">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Activity key={s} className="h-3 w-3 text-primary fill-cyan-400" />
                                ))}
                            </div>
                            <span className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em]">Premium Platform</span>
                        </div>

                        <Button
                            variant="ghost"
                            className="w-full justify-start text-sidebar-foreground/70 hover:text-red-400 hover:bg-red-500/10 gap-3"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Выйти</span>
                        </Button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col bg-background">
                    {/* Mobile Header */}
                    <header className="h-16 laptop:hidden flex items-center px-4 border-b border-sidebar-border bg-sidebar sticky top-0 z-30">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setMobileOpen(true)}
                            className="mr-3 text-sidebar-foreground/70"
                        >
                            <Menu className="h-6 w-6" />
                        </Button>
                        <div className="font-bold text-lg text-white">UNI PRIME App</div>
                    </header>

                    {/* Standardized 1280px Container */}
                    <div className="desktop-layout-container px-6 py-8 min-h-screen overflow-y-visible">
                        <ContextBreadcrumb />
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
