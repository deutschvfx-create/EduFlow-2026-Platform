'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
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
    X
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useModules } from "@/hooks/use-modules"; // Using hook instead of props

const sidebarItems = [
    {
        title: "Главная",
        items: [
            { label: "Дашборд", href: "/app/dashboard", icon: LayoutDashboard },
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
        ]
    },
    {
        title: "Обучение",
        items: [
            { label: "Предметы", href: "/app/courses", icon: BookOpen },
            { label: "Расписание", href: "/app/schedule", icon: Calendar },
            { label: "Посещаемость", href: "/app/attendance", icon: CheckSquare },
            { label: "Оценки", href: "/app/grades", icon: Award },
        ]
    },
    {
        title: "Коммуникация",
        items: [
            { label: "Объявления", href: "/app/announcements", icon: Megaphone },
            { label: "Чаты", href: "/app/chat", icon: MessageSquare },
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
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    }

    // Dynamic items based on role
    const dynamicSidebarItems = [...sidebarItems];

    // Add specialized dashboard if it's not already there
    if (user?.role === 'OWNER' || user?.role === 'DIRECTOR') {
        const mainGroup = dynamicSidebarItems.find(g => g.title === "Главная");
        if (mainGroup && !mainGroup.items.find(i => i.href === '/director')) {
            mainGroup.items.unshift({ label: "Обзор директора", href: "/director", icon: LayoutDashboard });
        }
    } else if (user?.role === 'TEACHER') {
        const mainGroup = dynamicSidebarItems.find(g => g.title === "Главная");
        if (mainGroup && !mainGroup.items.find(i => i.href === '/teacher')) {
            mainGroup.items.unshift({ label: "Кабинет учителя", href: "/teacher", icon: LayoutDashboard });
        }
    } else if (user?.role === 'STUDENT') {
        const mainGroup = dynamicSidebarItems.find(g => g.title === "Главная");
        if (mainGroup && !mainGroup.items.find(i => i.href === '/student')) {
            mainGroup.items.unshift({ label: "Моё обучение", href: "/student", icon: LayoutDashboard });
        }
    }

    // Filter Items Logic (Client Side)
    const filteredItems = dynamicSidebarItems.map(group => {
        const newItems = group.items.filter(item => {
            if (item.href === '/director' || item.href === '/teacher' || item.href === '/student') return true;
            if (item.href === '/app/students') return modules ? modules.students : true;
            if (item.href === '/app/dashboard') return true;
            if (item.href === '/app/settings') return true;

            // Map href to config key
            if (item.href.includes('teachers')) return modules?.teachers;
            if (item.href.includes('faculties')) return modules?.faculties;
            if (item.href.includes('departments')) return modules?.departments;
            if (item.href.includes('groups')) return modules?.groups;
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
        <div className="min-h-screen bg-zinc-950 flex font-sans text-zinc-100">
            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:sticky top-0 h-screen z-50 flex flex-col bg-zinc-900 border-r border-zinc-800 transition-all duration-300 transform 
                ${mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'} 
                ${isOpen ? 'lg:w-64' : 'lg:w-20'}
                `}
            >
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800">
                    <div className={`font-bold text-xl bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent transition-all duration-300 ${!isOpen && 'lg:opacity-0 lg:w-0 overflow-hidden'}`}>
                        EduFlow
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileOpen(false)}
                        className="lg:hidden text-zinc-400"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Navigation */}
                <ScrollArea className="flex-1 px-3 py-4">
                    <div className="space-y-6">
                        {filteredItems.map((group: any, i: number) => (
                            <div key={i} className="px-2">
                                {(isOpen || mobileOpen) && (
                                    <h4 className="mb-2 px-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                        {group.title}
                                    </h4>
                                )}
                                <div className="space-y-1">
                                    {group.items.map((item: any) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium
                                                ${isActive
                                                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                                                    }`}
                                            >
                                                {/* Icon rendering needs care if coming from server */}
                                                <item.icon className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                                                <span className={`transition-all duration-300 ${!isOpen && 'lg:hidden'}`}>
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

                {/* Footer / Logout */}
                <div className="p-4 border-t border-zinc-800">
                    <Button
                        variant="ghost"
                        className={`w-full justify-start text-zinc-400 hover:text-red-400 hover:bg-red-500/10 gap-3 ${!isOpen && 'lg:justify-center px-0'}`}
                        onClick={handleLogout}
                    >
                        <LogOut className="h-5 w-5" />
                        <span className={`${!isOpen && 'lg:hidden'}`}>Выйти</span>
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 flex flex-col">
                {/* Mobile Header */}
                <header className="h-16 lg:hidden flex items-center px-4 border-b border-zinc-800 bg-zinc-900 sticky top-0 z-30">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileOpen(true)}
                        className="mr-3 text-zinc-400"
                    >
                        <Menu className="h-6 w-6" />
                    </Button>
                    <div className="font-bold text-lg text-white">EduFlow App</div>
                </header>

                <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
