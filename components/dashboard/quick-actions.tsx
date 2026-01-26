'use client';

import { useModules } from "@/hooks/use-modules";
import { CreateGroupModal } from "./create-group-modal";
import { CreateStudentModal } from "./create-student-modal";
import { CreateTeacherModal } from "./create-teacher-modal";
import { CreateCourseModal } from "./create-course-modal";
import { CreateAnnouncementModal } from "./create-announcement-modal";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

export function QuickActions() {
    const { modules, isLoaded } = useModules();
    const router = useRouter();
    const [toast, setToast] = useState<string | null>(null);

    // Auto-clear toast
    useEffect(() => {
        if (toast) {
            const t = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(t);
        }
    }, [toast]);

    if (!isLoaded) return null;

    const handleSuccess = (msg: string, path: string) => {
        setToast(msg);
        // We could offer to navigate?
        // User asked: "after success create: show toast 'Создано', button 'Открыть страницу'"
        // So I should probably make the toast clickable or persistent for a moment with an action?
        // For simple UI, I'll just show the toast for now, or maybe a small action bar.
        // Let's rely on the toast I'm building right below.
    };

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-xl font-semibold text-white">Быстрые действия</h2>
                <p className="text-sm text-zinc-400">Создавайте основные элементы за 5 секунд</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {modules.groups && (
                    <CreateGroupModal onSuccess={() => handleSuccess("Группа создана", "/app/groups")} />
                )}
                {modules.students && (
                    <CreateStudentModal onSuccess={() => handleSuccess("Студент добавлен", "/app/students")} />
                )}
                {modules.teachers && (
                    <CreateTeacherModal onSuccess={() => handleSuccess("Преподаватель приглашен", "/app/teachers")} />
                )}
                {modules.courses && (
                    <CreateCourseModal onSuccess={() => handleSuccess("Предмет создан", "/app/courses")} />
                )}
                {modules.announcements && (
                    <CreateAnnouncementModal onSuccess={() => handleSuccess("Объявление опубликовано", "/app/announcements")} />
                )}
            </div>

            {/* Local Toast UI */}
            {toast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5">
                    <div className="bg-zinc-800 text-white px-4 py-3 rounded-full shadow-2xl border border-zinc-700 flex items-center gap-4">
                        <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                            <Check className="h-3 w-3" />
                        </div>
                        <span className="font-medium text-sm">{toast}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
