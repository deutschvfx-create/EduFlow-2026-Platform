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
        <div className="flex flex-col gap-4 mb-6 bg-zinc-950/50 p-4 rounded-lg border border-zinc-900 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
                <div className="flex flex-wrap gap-2 flex-1">
                    <Select value={groupId} onValueChange={onGroupChange}>
                        <SelectTrigger className="w-full md:w-[180px] bg-zinc-900 border-zinc-800">
                            <SelectValue placeholder="Группа" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все группы</SelectItem>
                            {groups.map(g => (
                                <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={courseId} onValueChange={onCourseChange}>
                        <SelectTrigger className="w-full md:w-[180px] bg-zinc-900 border-zinc-800">
                            <SelectValue placeholder="Предмет" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все предметы</SelectItem>
                            {courses.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={teacherId} onValueChange={onTeacherChange}>
                        <SelectTrigger className="w-full md:w-[180px] bg-zinc-900 border-zinc-800">
                            <SelectValue placeholder="Преподаватель" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все преподаватели</SelectItem>
                            {teachers.map(t => (
                                <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={dateRange} onValueChange={onDateRangeChange}>
                        <SelectTrigger className="w-full md:w-[180px] bg-zinc-900 border-zinc-800">
                            <SelectValue placeholder="Период" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">Эта неделя</SelectItem>
                            <SelectItem value="month">Этот месяц</SelectItem>
                            <SelectItem value="semester">Этот семестр</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button variant="ghost" size="icon" onClick={clearFilters} title="Сбросить фильтры">
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
