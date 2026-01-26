'use client';

import { useState, useEffect } from "react";
// import { MOCK_SCHEDULE } from "@/lib/mock/schedule";
import { ScheduleFilters } from "@/components/schedule/schedule-filters";
import { AddLessonModal } from "@/components/schedule/add-lesson-modal";
import { EditLessonModal } from "@/components/schedule/edit-lesson-modal";
import { LessonCard } from "@/components/schedule/lesson-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, CheckCircle2, XCircle, LayoutGrid } from "lucide-react";
import { Lesson, DayOfWeek } from "@/lib/types/schedule";
import { ModuleGuard } from "@/components/system/module-guard";

const DAYS: DayOfWeek[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const DayLabels: Record<DayOfWeek, string> = {
    MON: "Понедельник",
    TUE: "Вторник",
    WED: "Среда",
    THU: "Четверг",
    FRI: "Пятница",
    SAT: "Суббота",
    SUN: "Воскресенье"
}

export default function SchedulePage() {
    const [groupFilter, setGroupFilter] = useState("all");
    const [teacherFilter, setTeacherFilter] = useState("all");
    const [courseFilter, setCourseFilter] = useState("all");
    const [dayFilter, setDayFilter] = useState("all");
    const [currentDate, setCurrentDate] = useState(new Date("2025-09-01"));

    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);

    // Dynamic Data
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        Promise.all([
            import("@/lib/data/schedule.repo").then(m => m.scheduleRepo.getAll()),
            import("@/lib/data/groups.repo").then(m => m.groupsRepo.getAll()),
            import("@/lib/data/teachers.repo").then(m => m.teachersRepo.getAll()),
            import("@/lib/data/courses.repo").then(m => m.coursesRepo.getAll())
        ]).then(([l, g, t, c]) => {
            setLessons(l as any);
            setGroups(g);
            setTeachers(t);
            setCourses(c);
            setIsLoaded(true);
        });
    }, []);

    const filteredLessons = lessons.filter(l => {
        const matchesGroup = groupFilter === 'all' || l.groupId === groupFilter;
        const matchesTeacher = teacherFilter === 'all' || l.teacherId === teacherFilter;
        const matchesCourse = courseFilter === 'all' || l.courseId === courseFilter;
        const matchesDay = dayFilter === 'all' || l.dayOfWeek === dayFilter;
        return matchesGroup && matchesTeacher && matchesCourse && matchesDay;
    });

    if (!isLoaded) return <div className="p-8 text-zinc-500">Загрузка расписания...</div>;

    const handleLessonClick = (lesson: Lesson) => {
        setSelectedLesson(lesson);
        setEditModalOpen(true);
    };

    const handleSaveUpdate = (id: string, updates: Partial<Lesson>) => {
        alert(`Закончено редактирование занятия ${id}`);
    };

    const handleWeekChange = (direction: 'prev' | 'next' | 'today') => {
        const newDate = new Date(currentDate);
        if (direction === 'prev') {
            newDate.setDate(newDate.getDate() - 7);
        } else if (direction === 'next') {
            newDate.setDate(newDate.getDate() + 7);
        } else {
            setCurrentDate(new Date()); // Reset to actual today
            return;
        }
        setCurrentDate(newDate);
    };

    // Stats
    const total = filteredLessons.length;
    const active = filteredLessons.filter(l => l.status === 'PLANNED').length;
    const cancelled = filteredLessons.filter(l => l.status === 'CANCELLED').length;
    // Current day mock count (let's assume "today" matches the mock data context or just static WED)
    const countToday = filteredLessons.filter(l => l.dayOfWeek === "WED").length;

    // Filter displayed days based on dayFilter
    const displayedDays = dayFilter === 'all' ? DAYS : [dayFilter as DayOfWeek];

    return (
        <ModuleGuard module="schedule">
            <div className="space-y-6 h-full flex flex-col">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Расписание</h1>
                        <p className="text-zinc-400">Управление занятиями и расписанием групп</p>
                    </div>
                    <div className="flex gap-2">
                        <AddLessonModal lessons={lessons} />
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">Всего занятий</CardTitle>
                            <CalendarDays className="h-4 w-4 text-zinc-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{total}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-400">В среду</CardTitle>
                            <LayoutGrid className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{countToday}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-indigo-400">Активные</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{active}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-red-400">Отменены</CardTitle>
                            <XCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{cancelled}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="bg-zinc-950/50 p-4 border border-zinc-800 rounded-lg flex-1">
                    <ScheduleFilters
                        groups={groups}
                        teachers={teachers}
                        courses={courses}
                        groupFilter={groupFilter}
                        onGroupChange={setGroupFilter}
                        teacherFilter={teacherFilter}
                        onTeacherChange={setTeacherFilter}
                        courseFilter={courseFilter}
                        onCourseChange={setCourseFilter}
                        dayFilter={dayFilter}
                        onDayChange={setDayFilter}
                        currentDate={currentDate}
                        onWeekChange={handleWeekChange}
                    />

                    {/* Week Grid */}
                    {filteredLessons.length > 0 ? (
                        <div className={`grid gap-4 min-h-[500px] ${dayFilter === 'all' ? 'grid-cols-1 md:grid-cols-7' : 'grid-cols-1'}`}>
                            {displayedDays.map(day => {
                                const dayLessons = filteredLessons
                                    .filter(l => l.dayOfWeek === day)
                                    .sort((a, b) => a.startTime.localeCompare(b.startTime));

                                return (
                                    <div key={day} className="flex flex-col gap-2 min-w-[140px]">
                                        <div className="text-center py-2 bg-zinc-900/80 border border-zinc-800 rounded mb-2">
                                            <div className="text-sm font-bold text-zinc-200">{DayLabels[day]}</div>
                                        </div>
                                        <div className="flex flex-col gap-2 h-full bg-zinc-950/30 rounded p-1">
                                            {dayLessons.map(lesson => (
                                                <LessonCard
                                                    key={lesson.id}
                                                    lesson={lesson}
                                                    onClick={handleLessonClick}
                                                />
                                            ))}
                                            {dayLessons.length === 0 && (
                                                <div className="flex-1 flex items-center justify-center text-zinc-700 text-xs italic min-h-[100px] border-2 border-dashed border-zinc-900 rounded">
                                                    Нет занятий
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[400px] text-zinc-500">
                            <CalendarDays className="h-12 w-12 mb-4 opacity-20" />
                            <p className="text-lg font-medium">Нет занятий по выбранным фильтрам</p>
                            <p className="text-sm">Попробуйте изменить параметры поиска</p>
                        </div>
                    )}
                </div>

                <EditLessonModal
                    lesson={selectedLesson}
                    open={editModalOpen}
                    onOpenChange={setEditModalOpen}
                    onSave={handleSaveUpdate}
                />
            </div>
        </ModuleGuard>
    );
}
