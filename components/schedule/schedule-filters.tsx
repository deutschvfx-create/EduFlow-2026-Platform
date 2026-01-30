'use client';

import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
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

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Filter, Calendar as CalendarIcon, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
}: Omit<ScheduleFiltersProps, 'currentDate' | 'onWeekChange'>) {
    const activeFiltersCount = [groupFilter, teacherFilter, courseFilter, dayFilter].filter(f => f !== 'all').length;

    const clearFilters = () => {
        onGroupChange('all');
        onTeacherChange('all');
        onCourseChange('all');
        onDayChange('all');
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2 border-dashed border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                    <Filter className="h-4 w-4" />
                    <span className="text-xs font-medium">Фильтры</span>
                    {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="h-5 px-1.5 min-w-[20px] justify-center bg-violet-500/20 text-violet-300 ml-auto pointer-events-none">
                            {activeFiltersCount}
                        </Badge>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] rounded-t-[20px] border-t border-zinc-800 bg-zinc-950 p-0">
                <SheetHeader className="p-6 border-b border-zinc-900">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-lg font-bold">Фильтры расписания</SheetTitle>
                        {activeFiltersCount > 0 && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-red-400 h-8 hover:bg-red-950/20">
                                Сбросить
                            </Button>
                        )}
                    </div>
                </SheetHeader>

                <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(85vh-80px)]">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Группа</label>
                            <Select value={groupFilter} onValueChange={onGroupChange}>
                                <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 h-12">
                                    <SelectValue placeholder="Все группы" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Все группы</SelectItem>
                                    {groups.map(g => (
                                        <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Преподаватель</label>
                            <Select value={teacherFilter} onValueChange={onTeacherChange}>
                                <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 h-12">
                                    <SelectValue placeholder="Все преподаватели" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Все преподаватели</SelectItem>
                                    {teachers.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Предмет</label>
                            <Select value={courseFilter} onValueChange={onCourseChange}>
                                <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 h-12">
                                    <SelectValue placeholder="Все предметы" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Все предметы</SelectItem>
                                    {courses.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button className="w-full h-12 font-bold bg-violet-600 hover:bg-violet-700 text-white rounded-xl">
                            Применить
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
