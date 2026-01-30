'use client';

import { useState, useEffect } from "react";
// import { MOCK_SCHEDULE } from "@/lib/mock/schedule";
import { ScheduleFilters } from "@/components/schedule/schedule-filters";
import { AddLessonModal } from "@/components/schedule/add-lesson-modal";
import { EditLessonModal } from "@/components/schedule/edit-lesson-modal";
import { LessonCard } from "@/components/schedule/lesson-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileDateStrip } from "@/components/schedule/mobile-date-strip";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
            <div className="space-y-4 laptop:space-y-6 h-full flex flex-col">
                {/* Header Actions */}
                <div className="flex items-center justify-between px-1">
                    <h1 className="text-xl font-bold text-white">Расписание</h1>
                    <div className="flex gap-2">
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
                        />
                    </div>
                </div>

                {/* Mobile Calendar Strip */}
                <div className="-mx-4 md:mx-0 sticky top-0 z-30">
                    <MobileDateStrip
                        currentDate={currentDate}
                        onDateSelect={setCurrentDate}
                    />
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto min-h-[400px] pb-20">
                    {/* Summary Line */}
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4 px-1">
                        <span className="font-medium text-zinc-300">{filteredLessons.length} занятий</span>
                        <span>•</span>
                        <span>{filteredLessons.filter(l => l.status === 'PLANNED').length} активных</span>
                    </div>

                    {filteredLessons.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                            {filteredLessons
                                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                                .map(lesson => (
                                    <LessonCard
                                        key={lesson.id}
                                        lesson={lesson}
                                        onClick={handleLessonClick}
                                    />
                                ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[300px] text-zinc-500 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                            <h3 className="font-medium text-zinc-400 mb-1">Нет занятий</h3>
                            <p className="text-xs">На этот день ничего не запланировано</p>
                        </div>
                    )}
                </div>

                {/* Floating Action Button */}
                <div className="fixed bottom-6 right-4 md:bottom-8 md:right-8 z-40">
                    <AddLessonModal lessons={lessons}>
                        <Button size="icon" className="h-14 w-14 rounded-full bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-900/40 border border-white/10">
                            <Plus className="h-6 w-6" />
                        </Button>
                    </AddLessonModal>
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
