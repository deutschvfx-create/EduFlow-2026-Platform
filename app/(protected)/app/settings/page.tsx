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
    MapPin
} from "lucide-react";
import { useState, useEffect } from "react";
import { OrganizationProfileCard } from "@/components/settings/organization-profile-card";

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

    const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <div className="space-y-3">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-1">{title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 laptop:grid-cols-3 gap-3">
                {children}
            </div>
        </div>
    );

    const ModuleCard = ({
        mKey,
        label,
        icon: Icon,
        desc
    }: {
        mKey: ModuleKey,
        label: string,
        icon: any,
        desc: string
    }) => {
        const requiredBy = requirements[mKey];
        const depText = requiredBy ? `Зависит от: ${requiredBy.map(k => {
            const map: any = { groups: 'Группы', courses: 'Предметы', schedule: 'Расписание', faculties: 'Факультеты' };
            return map[k] || k;
        }).join(', ')}` : null;

        return (
            <div
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-center justify-between hover:border-zinc-700 hover:bg-zinc-800/30 transition-all group cursor-pointer"
                onClick={() => {
                    if (!modules[mKey]) {
                        // Enable if disabled
                        handleToggle(mKey);
                    }
                    // Navigate
                    if (moduleRoutes[mKey]) {
                        router.push(moduleRoutes[mKey]!);
                    }
                }}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="h-8 w-8 rounded-md bg-zinc-950 flex items-center justify-center border border-zinc-800 group-hover:border-indigo-500/30 transition-colors">
                        <Icon className="h-4 w-4 text-indigo-400" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-zinc-200 truncate group-hover:text-white transition-colors">
                            {label}
                        </span>
                        {depText && (
                            <span className="text-[10px] text-amber-500/90 leading-none truncate">{depText}</span>
                        )}
                    </div>
                </div>
                <div className="flex items-center" data-help-id={`module-toggle-${mKey}`}>
                    <div onClick={(e) => e.stopPropagation()}>
                        <Switch
                            checked={modules[mKey]}
                            onCheckedChange={() => handleToggle(mKey)}
                            className="scale-90"
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10 relative">
            {/* Custom Toast */}
            {toastMsg && (
                <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5">
                    <div className="bg-white text-zinc-900 px-4 py-2 rounded-lg shadow-xl border border-zinc-200 flex items-center gap-3">
                        {toastMsg.type === 'success' ? (
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        ) : (
                            <div className="h-2 w-2 rounded-full bg-indigo-500" />
                        )}
                        <span className="font-medium text-sm">{toastMsg.text}</span>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4" data-help-id="settings-header">
                <div className="hidden laptop:block">
                    <h1 className="text-2xl font-bold tracking-tight text-white">Настройки</h1>
                    <p className="text-sm text-zinc-400">Управление модулями</p>
                </div>
            </div>

            {/* ORGANIZATION PROFILE CARD */}
            <OrganizationProfileCard onSave={() => showToast("Профиль организации сохранён")} />

            {/* ENHANCED QUICK SETTINGS PANEL */}
            <div className="relative bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 border-l-4 border-indigo-500 rounded-lg p-6 shadow-lg shadow-indigo-500/5" data-help-id="settings-toggle-group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Zap className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                Быстрые Настройки
                                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-black uppercase tracking-wider">
                                    Presets
                                </span>
                            </h2>
                            <p className="text-sm text-zinc-500 mt-0.5">Применить готовый шаблон конфигурации</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3" data-help-id="settings-templates">
                        <Button
                            onClick={() => applyPreset('UNIVERSITY')}
                            size="lg"
                            className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 h-11 font-bold shadow-lg"
                        >
                            🎓 Университет
                        </Button>
                        <Button
                            onClick={() => applyPreset('SCHOOL')}
                            size="lg"
                            className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 h-11 font-bold shadow-lg"
                        >
                            🌍 Языковой курс
                        </Button>
                        <Button
                            variant="ghost"
                            size="lg"
                            onClick={handleReset}
                            className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 h-11 font-bold gap-2"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Сбросить
                        </Button>
                    </div>
                </div>
            </div>

            {/* Visual Separator */}
            <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

            <Section title="Люди">
                <ModuleCard mKey="students" label="Студенты" icon={Users} desc="" />
                <ModuleCard mKey="teachers" label="Преподаватели" icon={GraduationCap} desc="" />
            </Section>

            <Section title="Структура">
                <ModuleCard mKey="faculties" label="Факультеты" icon={Building2} desc="" />
                <ModuleCard mKey="departments" label="Кафедры" icon={DoorOpen} desc="" />
                <ModuleCard mKey="groups" label="Группы" icon={Layers} desc="" />
                <ModuleCard mKey="classrooms" label="Аудитории" icon={MapPin} desc="" />
            </Section>

            <Section title="Обучение">
                <ModuleCard mKey="courses" label="Предметы" icon={BookOpen} desc="" />
                <ModuleCard mKey="schedule" label="Расписание" icon={Calendar} desc="" />
                <ModuleCard mKey="attendance" label="Посещаемость" icon={CheckSquare} desc="" />
                <ModuleCard mKey="grades" label="Оценки" icon={Award} desc="" />
            </Section>

            <Section title="Коммуникация">
                <ModuleCard mKey="announcements" label="Объявления" icon={Megaphone} desc="" />
                <ModuleCard mKey="chat" label="Чаты" icon={MessageSquare} desc="" />
            </Section>

            <Section title="Аналитика">
                <ModuleCard mKey="reports" label="Отчёты" icon={BarChart3} desc="" />
            </Section>
            {/* ... previous sections ... */}

            <Section title="Миграция данных">
                <div className="md:col-span-3 bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-1 bg-amber-500 rounded-full" />
                        <div>
                            <h2 className="text-sm font-semibold text-white">Управление данными</h2>
                            <p className="text-xs text-zinc-500">Экспорт и импорт локальной базы данных (JSON)</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-xs border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                            onClick={() => {
                                const data = {
                                    students: localStorage.getItem('eduflow.students'),
                                    teachers: localStorage.getItem('eduflow.teachers'),
                                    groups: localStorage.getItem('eduflow.groups'),
                                    courses: localStorage.getItem('eduflow.courses'),
                                    announcements: localStorage.getItem('eduflow.announcements'),
                                    modules: localStorage.getItem('eduflow.modules')
                                };
                                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `eduflow-backup-${new Date().toISOString().split('T')[0]}.json`;
                                a.click();
                                showToast("Данные экспортированы");
                            }}
                        >
                            📥 Экспортировать JSON
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-xs border-zinc-700 hover:bg-zinc-800 text-zinc-300 relative"
                        >
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
                                            if (data.modules) localStorage.setItem('eduflow.modules', data.modules);
                                            // Reload to apply
                                            window.location.reload();
                                        } catch (err) {
                                            alert("Ошибка импорта: Неверный формат файла");
                                        }
                                    };
                                    reader.readAsText(file);
                                }}
                            />
                            📤 Импортировать JSON
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="text-xs bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50"
                            onClick={() => {
                                if (confirm("ВНИМАНИЕ: Все данные будут удалены! Это действие необратимо.")) {
                                    localStorage.clear();
                                    window.location.reload();
                                }
                            }}
                        >
                            🗑️ Очистить всё
                        </Button>
                    </div>
                </div>
            </Section>
        </div>
    );
}
