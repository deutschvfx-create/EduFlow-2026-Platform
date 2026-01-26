'use client';

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
// import { MOCK_GROUPS_FULL } from "@/lib/mock/groups";
// import { MOCK_COURSES } from "@/lib/mock/courses";
import { GradeType } from "@/lib/types/grades";
import { Group } from "@/lib/types/group";
import { Course } from "@/lib/types/course";

interface GradesFiltersProps {
    groups: Group[];
    courses: Course[];
    groupId: string;
    onGroupChange: (val: string) => void;
    courseId: string;
    onCourseChange: (val: string) => void;
    type: GradeType | "all";
    onTypeChange: (val: GradeType | "all") => void;
    date: Date | undefined;
    onDateChange: (date: Date | undefined) => void;
}

export function GradesFilters({
    groups,
    courses,
    groupId,
    onGroupChange,
    courseId,
    onCourseChange,
    type,
    onTypeChange,
    date,
    onDateChange
}: GradesFiltersProps) {

    const clearFilters = () => {
        onGroupChange("all");
        onCourseChange("all");
        onTypeChange("all");
        onDateChange(undefined);
    };

    return (
        <div className="flex flex-col gap-4 mb-6 bg-zinc-950/50 p-4 rounded-lg border border-zinc-900 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
                <div className="flex flex-wrap gap-2 flex-1">
                    <Select value={groupId} onValueChange={onGroupChange}>
                        <SelectTrigger className="w-full md:w-[200px] bg-zinc-900 border-zinc-800">
                            <SelectValue placeholder="Группа *" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Выберите группу</SelectItem>
                            {groups.map(g => (
                                <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={courseId} onValueChange={onCourseChange}>
                        <SelectTrigger className="w-full md:w-[200px] bg-zinc-900 border-zinc-800">
                            <SelectValue placeholder="Предмет" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все предметы</SelectItem>
                            {courses.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={type} onValueChange={(val) => onTypeChange(val as GradeType | "all")}>
                        <SelectTrigger className="w-full md:w-[150px] bg-zinc-900 border-zinc-800">
                            <SelectValue placeholder="Тип работы" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все типы</SelectItem>
                            <SelectItem value="HOMEWORK">Домашняя работа</SelectItem>
                            <SelectItem value="QUIZ">Тест</SelectItem>
                            <SelectItem value="EXAM">Экзамен</SelectItem>
                            <SelectItem value="PROJECT">Проект</SelectItem>
                            <SelectItem value="PARTICIPATION">Активность</SelectItem>
                        </SelectContent>
                    </Select>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[180px] justify-start text-left font-normal bg-zinc-900 border-zinc-800",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP", { locale: ru }) : <span>Дата</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-800" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={onDateChange}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <Button variant="ghost" size="icon" onClick={clearFilters} title="Сбросить фильтры">
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
