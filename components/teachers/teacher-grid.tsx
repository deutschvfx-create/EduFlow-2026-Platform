'use client';

import { Teacher } from "@/lib/types/teacher";
import { TeacherCard } from "./teacher-card";
import { motion } from "framer-motion";

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
                <p className="text-zinc-500 mb-2 font-bold uppercase tracking-widest text-xs">Преподаватели не найдены</p>
                <p className="text-sm text-zinc-600">Попробуйте изменить фильтры или добавьте нового преподавателя</p>
            </div>
        );
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.03
            }
        }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-12 gap-3 p-1"
        >
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
        </motion.div>
    );
}
