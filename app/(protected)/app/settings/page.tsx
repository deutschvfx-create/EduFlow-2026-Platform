'use client';

import { useModules } from "@/hooks/use-modules";
import { ModuleKey, defaultModulesState } from "@/lib/config/modules";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
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
    RotateCcw,
    Zap,
    MapPin,
    Upload
} from "lucide-react";
import { useState, useEffect } from "react";
import { UserProfileCard } from "@/components/settings/user-profile-card";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsPage() {
    const { modules, toggleModule, setAllModules, resetModules, isLoaded } = useModules();
    const [toastMsg, setToastMsg] = useState<{ text: string, type: 'success' | 'info' } | null>(null);
    const router = useRouter();

    const moduleRoutes: Partial<Record<ModuleKey, string>> = {
        students: "/app/students",
        teachers: "/app/teachers",
        faculties: "/app/faculties",
        departments: "/app/departments",
        groups: "/app/groups",
        classrooms: "/app/classrooms",
        courses: "/app/courses",
        schedule: "/app/schedule",
        attendance: "/app/attendance",
        grades: "/app/grades",
        announcements: "/app/announcements",
        chat: "/app/chat",
        reports: "/app/reports",
    };

    // Clear toast
    useEffect(() => {
        if (toastMsg) {
            const timer = setTimeout(() => setToastMsg(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toastMsg]);

    const showToast = (text: string, type: 'success' | 'info' = 'success') => {
        setToastMsg({ text, type });
    };

    if (!isLoaded) return null;

    // Dependency Graph
    const dependencies: Partial<Record<ModuleKey, ModuleKey[]>> = {
        groups: ['schedule', 'attendance', 'grades'],
        courses: ['schedule', 'grades'],
        schedule: ['attendance'],
        faculties: ['departments'],
    };

    const requirements: Partial<Record<ModuleKey, ModuleKey[]>> = {
        schedule: ['groups', 'courses'],
        attendance: ['groups', 'schedule'],
        grades: ['groups', 'courses'],
        departments: ['faculties'],
    };

    const handleToggle = (key: ModuleKey) => {
        const check = !modules[key];
        let newModules = { ...modules };

        if (!check) {
            const dependents = dependencies[key];
            if (dependents) {
                dependents.forEach(child => {
                    if (newModules[child]) {
                        newModules[child] = false;
                        const subDependents = dependencies[child];
                        if (subDependents) {
                            subDependents.forEach(grandChild => {
                                newModules[grandChild] = false;
                            });
                        }
                    }
                });
            }
            newModules[key] = false;
        } else {
            const required = requirements[key];
            if (required) {
                required.forEach(parent => {
                    newModules[parent] = true;
                });
            }
            newModules[key] = true;
        }

        setAllModules(newModules);
        showToast(`Модуль ${check ? 'включен' : 'отключен'}`, 'info');
    };

    const applyPreset = (type: 'UNIVERSITY' | 'SCHOOL') => {
        if (type === 'UNIVERSITY') {
            setAllModules({ ...defaultModulesState, classrooms: true });
            showToast("Шаблон «Университет» применён");
        } else {
            setAllModules({
                ...defaultModulesState,
                students: true,
                teachers: true,
                groups: true,
                courses: true,
                schedule: true,
                attendance: true,
                announcements: true,
                chat: true,
                faculties: false,
                departments: false,
                grades: false,
                reports: false,
                classrooms: false,
            });
            showToast("Шаблон «Языковой курс» применён");
        }
    };

    const handleReset = () => {
        if (confirm("Сбросить все настройки отображения модулей по умолчанию?")) {
            resetModules();
            showToast("Настройки сброшены");
        }
    };

    const Section = ({ title, children, icon: Icon }: { title: string, children: React.ReactNode, icon?: any }) => (
        <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
                {Icon && <Icon className="h-4 w-4 text-zinc-500" />}
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">{title}</h3>
            </div>
            <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2">
                {children}
            </div>
        </div>
    );

    const ModuleCard = ({
        mKey,
        label,
        icon: Icon,
    }: {
        mKey: ModuleKey,
        label: string,
        icon: any
    }) => {
        const isActive = modules[mKey];
        const reqs = requirements[mKey] || [];
        const missingReqs = reqs.filter(r => !modules[r]);
        const isDisabled = missingReqs.length > 0;

        return (
            <div
                className={`
                    relative group transition-all duration-300 rounded-xl border p-2 cursor-pointer
                    flex flex-col items-center justify-center gap-2 text-center aspect-square sm:aspect-auto sm:h-24
                    ${isActive
                        ? 'bg-indigo-500/10 border-indigo-500/30'
                        : 'bg-zinc-900/40 border-zinc-800/50 hover:border-zinc-700'}
                    ${isDisabled ? 'opacity-30 grayscale pointer-events-none' : 'opacity-100'}
                `}
                onClick={() => handleToggle(mKey)}
            >
                <div className={`
                    h-8 w-8 rounded-lg flex items-center justify-center border transition-all duration-300
                    ${isActive
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-500 group-hover:text-zinc-300'}
                `}>
                    <Icon className="h-4 w-4" />
                </div>

                <div className="flex flex-col min-w-0 px-1">
                    <span className={`text-[11px] font-bold leading-tight transition-colors ${isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
                        {label}
                    </span>
                    {missingReqs.length > 0 && (
                        <div className="flex justify-center mt-1">
                            <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                        </div>
                    )}
                </div>

                <div className="absolute top-1 right-1">
                    <Switch
                        checked={isActive}
                        onCheckedChange={() => handleToggle(mKey)}
                        className="scale-[0.6] data-[state=checked]:bg-indigo-500"
                    />
                </div>

                {isActive && dependencies[mKey] && (
                    <div className="absolute top-1 left-1">
                        <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                    </div>
                )}
            </div>
        );
    };

    const DataCenter = () => {
        const [stats, setStats] = useState<Record<string, number>>({});

        useEffect(() => {
            const keys = ['students', 'teachers', 'groups', 'courses', 'announcements'];
            const newStats: any = {};
            keys.forEach(k => {
                try {
                    const data = localStorage.getItem(`eduflow.${k}`);
                    newStats[k] = data ? JSON.parse(data).length : 0;
                } catch {
                    newStats[k] = 0;
                }
            });
            setStats(newStats);
        }, []);

        return (
            <div className="bg-zinc-950/50 border border-zinc-900 rounded-2xl p-4 sm:p-6 space-y-6 mt-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                            <RotateCcw className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-white tracking-widest italic uppercase">DATA CENTER</h2>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                        {Object.entries(stats).map(([key, count]) => (
                            <div key={key} className="flex flex-col items-center">
                                <span className="text-sm font-black text-white">{count}</span>
                                <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-tighter">
                                    {key === 'students' && 'Студ.'}
                                    {key === 'teachers' && 'Преп.'}
                                    {key === 'groups' && 'Группы'}
                                    {key === 'courses' && 'Предм.'}
                                    {key === 'announcements' && 'Объяв.'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-zinc-900/50 pt-6">
                    <Button
                        variant="ghost"
                        className="h-12 rounded-xl bg-zinc-900/30 hover:bg-zinc-800/50 border border-zinc-900 text-zinc-400 font-bold group"
                        onClick={() => {
                            const data = {
                                students: localStorage.getItem('eduflow.students'),
                                teachers: localStorage.getItem('eduflow.teachers'),
                                groups: localStorage.getItem('eduflow.groups'),
                                courses: localStorage.getItem('eduflow.courses'),
                                announcements: localStorage.getItem('eduflow.announcements'),
                                modules: localStorage.getItem('eduflow-modules-config')
                            };
                            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `eduflow-backup-${new Date().toISOString().split('T')[0]}.json`;
                            a.click();
                            showToast("Резервная копия скачана");
                        }}
                    >
                        <div className="flex flex-col items-center">
                            <Upload className="h-3.5 w-3.5 text-indigo-400 mb-0.5" />
                            <span className="text-[9px] uppercase tracking-wider">Экспорт</span>
                        </div>
                    </Button>

                    <div className="relative group">
                        <Button
                            variant="ghost"
                            className="h-12 w-full rounded-xl bg-zinc-900/30 hover:bg-zinc-800/50 border border-zinc-900 text-zinc-400 font-bold"
                        >
                            <div className="flex flex-col items-center">
                                <RotateCcw className="h-3.5 w-3.5 text-emerald-400 mb-0.5" />
                                <span className="text-[9px] uppercase tracking-wider">Импорт</span>
                            </div>
                        </Button>
                        <input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            accept=".json"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                    try {
                                        const data = JSON.parse(ev.target?.result as string);
                                        if (data.students) localStorage.setItem('eduflow.students', data.students);
                                        if (data.teachers) localStorage.setItem('eduflow.teachers', data.teachers);
                                        if (data.groups) localStorage.setItem('eduflow.groups', data.groups);
                                        if (data.courses) localStorage.setItem('eduflow.courses', data.courses);
                                        if (data.announcements) localStorage.setItem('eduflow.announcements', data.announcements);
                                        if (data.modules) localStorage.setItem('eduflow-modules-config', data.modules);
                                        showToast("Данные успешно импортированы!");
                                        setTimeout(() => window.location.reload(), 1000);
                                    } catch (err) {
                                        alert("Ошибка импорта: Неверный формат файла");
                                    }
                                };
                                reader.readAsText(file);
                            }}
                        />
                    </div>

                    <Button
                        variant="ghost"
                        className="h-12 rounded-xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 text-red-500/60 hover:text-red-400 font-bold"
                        onClick={() => {
                            if (confirm("ВНИМАНИЕ: Это полностью очистит локальную базу данных. Продолжить?")) {
                                const keys = ['eduflow.students', 'eduflow.teachers', 'eduflow.groups', 'eduflow.courses', 'eduflow.announcements', 'eduflow-modules-config'];
                                keys.forEach(k => localStorage.removeItem(k));
                                showToast("База данных очищена", 'info');
                                setTimeout(() => window.location.reload(), 1000);
                            }
                        }}
                    >
                        <div className="flex flex-col items-center">
                            <Zap className="h-3.5 w-3.5 mb-0.5" />
                            <span className="text-[9px] uppercase tracking-wider">Сброс</span>
                        </div>
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20 px-4">
            {/* Custom Toast */}
            <AnimatePresence>
                {toastMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed bottom-8 right-8 z-[100]"
                    >
                        <div className="bg-zinc-900 border border-zinc-800 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4">
                            <div className={`h-2 w-2 rounded-full ${toastMsg.type === 'success' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'}`} />
                            <span className="font-bold text-sm tracking-tight">{toastMsg.text}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* UNIFIED SETTINGS CARD */}
            <UserProfileCard onSave={() => showToast("Профиль обновлен")} />

            {/* PRESETS PANEL */}
            <div className="bg-zinc-950/50 border border-zinc-900 rounded-2xl p-4 sm:p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-[80px] -mr-24 -mt-24" />

                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/20">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-sm font-black text-white tracking-widest uppercase italic">PRESETS</h2>
                                <span className="bg-indigo-500/20 text-indigo-400 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest">v2.0</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            onClick={() => applyPreset('UNIVERSITY')}
                            size="sm"
                            className="bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 h-10 px-4 rounded-xl font-bold text-[10px] tracking-widest uppercase transition-all"
                        >
                            УНИВЕРСИТЕТ
                        </Button>
                        <Button
                            onClick={() => applyPreset('SCHOOL')}
                            size="sm"
                            className="bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 h-10 px-4 rounded-xl font-bold text-[10px] tracking-widest uppercase transition-all"
                        >
                            ЯЗЫКОВАЯ ШКОЛА
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={handleReset}
                            size="sm"
                            className="text-zinc-500 hover:text-white h-10 rounded-xl font-bold text-[10px] tracking-widest uppercase"
                        >
                            СБРОС
                        </Button>
                    </div>
                </div>
            </div>

            {/* MODULES SECTIONS */}
            <div className="space-y-8">
                <Section title="Команда и Студенты" icon={Users}>
                    <ModuleCard mKey="students" label="Студенты" icon={Users} />
                    <ModuleCard mKey="teachers" label="Преподаватели" icon={GraduationCap} />
                </Section>

                <Section title="Инфраструктура" icon={Building2}>
                    <ModuleCard mKey="faculties" label="Факультеты" icon={Building2} />
                    <ModuleCard mKey="departments" label="Кафедры" icon={DoorOpen} />
                    <ModuleCard mKey="classrooms" label="Аудитории" icon={MapPin} />
                    <ModuleCard mKey="groups" label="Группы" icon={Layers} />
                </Section>

                <Section title="Процесс обучения" icon={BookOpen}>
                    <ModuleCard mKey="courses" label="Предметы" icon={BookOpen} />
                    <ModuleCard mKey="schedule" label="Расписание" icon={Calendar} />
                    <ModuleCard mKey="attendance" label="Журнал" icon={CheckSquare} />
                    <ModuleCard mKey="grades" label="Оценки" icon={Award} />
                </Section>

                <Section title="Коммуникация" icon={MessageSquare}>
                    <ModuleCard mKey="announcements" label="Объявления" icon={Megaphone} />
                    <ModuleCard mKey="chat" label="Чаты" icon={MessageSquare} />
                    <ModuleCard mKey="reports" label="Аналитика" icon={BarChart3} />
                </Section>
            </div>

            {/* DATA CENTER */}
            <DataCenter />
        </div>
    );
}
