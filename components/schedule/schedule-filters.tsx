'use client';

import { Input } from "@/components/ui/input";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
// import { MOCK_GROUPS_FULL } from "@/lib/mock/groups";
// import { MOCK_TEACHERS } from "@/lib/mock/teachers";
// import { MOCK_COURSES } from "@/lib/mock/courses";
import { Group } from "@/lib/types/group";
import { Teacher } from "@/lib/types/teacher"; // Ensure this type exists or use any for now if needed, but Teacher type exists
import { Course } from "@/lib/types/course"; // Ensure this type exists

interface ScheduleFiltersProps {
    groups: Group[];
    teachers: Teacher[];
    courses: Course[];
    groupFilter: string;
    onGroupChange: (val: string) => void;
    teacherFilter: string;
    onTeacherChange: (val: string) => void;
    courseFilter: string;
    onCourseChange: (val: string) => void;
    dayFilter: string;
    onDayChange: (val: string) => void;
    currentDate: Date;
    onWeekChange: (direction: 'prev' | 'next' | 'today') => void;
}

export function ScheduleFilters({
    groups,
    teachers,
    courses,
    groupFilter,
    onGroupChange,
    teacherFilter,
    onTeacherChange,
    courseFilter,
    onCourseChange,
    dayFilter,
    onDayChange,
    currentDate,
    onWeekChange
}: ScheduleFiltersProps) {
    const hasActiveFilters = groupFilter !== 'all' || teacherFilter !== 'all' || courseFilter !== 'all' || dayFilter !== 'all';

    const clearFilters = () => {
        onGroupChange('all');
        onTeacherChange('all');
        onCourseChange('all');
        onDayChange('all');
    }

    // Format week range
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    startOfWeek.setDate(diff);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const dateRange = `${startOfWeek.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}`;

    return (
        <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col xl:flex-row justify-between items-end xl:items-center gap-4">
                {/* Week Navigation */}
                <div className="flex items-center gap-2 bg-zinc-900 p-1 rounded-md border border-zinc-800">
                    <Button variant="ghost" size="icon" onClick={() => onWeekChange('prev')} className="h-8 w-8 text-zinc-400 hover:text-white">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex flex-col items-center min-w-[140px] cursor-pointer" onClick={() => onWeekChange('today')}>
                        <span className="text-sm font-medium text-zinc-200">{dateRange}</span>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Неделя {Math.ceil((startOfWeek.getDate() + new Date(startOfWeek.getFullYear(), 0, 1).getDay()) / 7)}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => onWeekChange('next')} className="h-8 w-8 text-zinc-400 hover:text-white">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2 w-full xl:w-auto">
                    <Select value={groupFilter} onValueChange={onGroupChange}>
                        <SelectTrigger className="w-full md:w-[160px] bg-zinc-900 border-zinc-800">
                            <SelectValue placeholder="Группа" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все группы</SelectItem>
                            {groups.map(g => (
                                <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={teacherFilter} onValueChange={onTeacherChange}>
                        <SelectTrigger className="w-full md:w-[160px] bg-zinc-900 border-zinc-800">
                            <SelectValue placeholder="Преподаватель" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все преподаватели</SelectItem>
                            {teachers.map(t => (
                                <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={courseFilter} onValueChange={onCourseChange}>
                        <SelectTrigger className="w-full md:w-[160px] bg-zinc-900 border-zinc-800">
                            <SelectValue placeholder="Предмет" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все предметы</SelectItem>
                            {courses.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={dayFilter} onValueChange={onDayChange}>
                        <SelectTrigger className="w-full md:w-[140px] bg-zinc-900 border-zinc-800">
                            <SelectValue placeholder="День недели" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все дни</SelectItem>
                            <SelectItem value="MON">Понедельник</SelectItem>
                            <SelectItem value="TUE">Вторник</SelectItem>
                            <SelectItem value="WED">Среда</SelectItem>
                            <SelectItem value="THU">Четверг</SelectItem>
                            <SelectItem value="FRI">Пятница</SelectItem>
                            <SelectItem value="SAT">Суббота</SelectItem>
                            <SelectItem value="SUN">Воскресенье</SelectItem>
                        </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                        <Button variant="ghost" size="icon" onClick={clearFilters} title="Сбросить фильтры">
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
