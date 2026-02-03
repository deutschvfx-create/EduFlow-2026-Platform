'use client';

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Group } from "@/lib/types/group";
import { Course } from "@/lib/types/course";
import { Teacher } from "@/lib/types/teacher";

interface ReportsFiltersProps {
    groups: Group[];
    courses: Course[];
    teachers: Teacher[];
    groupId: string;
    onGroupChange: (val: string) => void;
    courseId: string;
    onCourseChange: (val: string) => void;
    teacherId: string;
    onTeacherChange: (val: string) => void;
    dateRange: string;
    onDateRangeChange: (val: string) => void;
}

export function ReportsFilters({
    groups,
    courses,
    teachers,
    groupId,
    onGroupChange,
    courseId,
    onCourseChange,
    teacherId,
    onTeacherChange,
    dateRange,
    onDateRangeChange
}: ReportsFiltersProps) {

    const clearFilters = () => {
        onGroupChange("all");
        onCourseChange("all");
        onTeacherChange("all");
        onDateRangeChange("week");
    };

    return (
        <div className="flex flex-col gap-4 mb-6 bg-zinc-900/40 p-5 rounded-2xl border border-white/5 backdrop-blur-xl shadow-2xl">
            <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-4 gap-3">
                <Select value={groupId} onValueChange={onGroupChange}>
                    <SelectTrigger className="h-11 bg-zinc-950/50 border-white/10 rounded-xl focus:ring-indigo-500/50">
                        <SelectValue placeholder="Группа" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 rounded-xl">
                        <SelectItem value="all">Все группы</SelectItem>
                        {groups.map(g => (
                            <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={courseId} onValueChange={onCourseChange}>
                    <SelectTrigger className="h-11 bg-zinc-950/50 border-white/10 rounded-xl focus:ring-indigo-500/50">
                        <SelectValue placeholder="Предмет" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 rounded-xl">
                        <SelectItem value="all">Все предметы</SelectItem>
                        {courses.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={teacherId} onValueChange={onTeacherChange}>
                    <SelectTrigger className="h-11 bg-zinc-950/50 border-white/10 rounded-xl focus:ring-indigo-500/50">
                        <SelectValue placeholder="Преподаватель" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 rounded-xl">
                        <SelectItem value="all">Все преподаватели</SelectItem>
                        {teachers.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={dateRange} onValueChange={onDateRangeChange}>
                    <SelectTrigger className="h-11 bg-zinc-950/50 border-white/10 rounded-xl focus:ring-indigo-500/50">
                        <SelectValue placeholder="Период" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 rounded-xl">
                        <SelectItem value="week">Эта неделя</SelectItem>
                        <SelectItem value="month">Этот месяц</SelectItem>
                        <SelectItem value="semester">Этот семестр</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center justify-between pt-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Active Monitoring Filters</p>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-[10px] uppercase font-black tracking-widest text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg gap-2"
                >
                    <X className="h-3 w-3" />
                    Reset System
                </Button>
            </div>
        </div>
    );
}
