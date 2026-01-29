'use client';

import { Teacher } from "@/lib/types/teacher";
import { TeacherCard } from "./teacher-card";

interface TeacherGridProps {
    teachers: Teacher[];
    onEditPermissions: (teacher: Teacher) => void;
    controlMode?: boolean;
    selectedIds?: string[];
    onToggleSelect?: (id: string) => void;
}

export function TeacherGrid({ teachers, onEditPermissions, controlMode, selectedIds = [], onToggleSelect }: TeacherGridProps) {
    if (teachers.length === 0) {
        return (
            <div className="text-center py-20 bg-zinc-900/50 rounded-lg border border-zinc-800 border-dashed">
                <p className="text-zinc-500 mb-2">Преподаватели не найдены</p>
                <p className="text-sm text-zinc-600">Попробуйте изменить фильтры или добавьте нового преподавателя</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 laptop:grid-cols-3 gap-4">
            {teachers.map((teacher) => (
                <TeacherCard
                    key={teacher.id}
                    teacher={teacher}
                    onEditPermissions={onEditPermissions}
                    controlMode={controlMode}
                    isSelected={selectedIds.includes(teacher.id)}
                    onToggleSelect={onToggleSelect ? () => onToggleSelect(teacher.id) : undefined}
                />
            ))}
        </div>
    );
}
