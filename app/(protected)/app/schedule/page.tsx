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
import { useAuth } from "@/components/auth/auth-provider";

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

    // Role based filtering
    useEffect(() => {
        if (!userData) return;

        if (userData.role === 'TEACHER') {
            setTeacherFilter(userData.uid);
        }
        // TODO: For students we need their groupId. 
        // For now we just restrict editing.
    }, [userData]);

    const handleSaveUpdate = async (id: string, updates: Partial<Lesson>) => {
        // Here we would call the API
        console.log("Saving updates", id, updates);
        setEditModalOpen(false);
    };

    const filteredLessons = lessons.filter(l => {
        const matchesGroup = groupFilter === 'all' || l.groupId === groupFilter;
        const matchesTeacher = teacherFilter === 'all' || l.teacherId === teacherFilter;
        const matchesCourse = courseFilter === 'all' || l.courseId === courseFilter;
        const matchesDay = dayFilter === 'all' || l.dayOfWeek === dayFilter;
        return matchesGroup && matchesTeacher && matchesCourse && matchesDay;
    });

    if (!isLoaded) return <div className="p-8 text-zinc-500">Загрузка расписания...</div>;

    const { userData } = useAuth();
    const canEdit = userData?.role === 'OWNER' || userData?.role === 'DIRECTOR';

    // ... (keep existing handleLessonClick but add check)
    const handleLessonClick = (lesson: Lesson) => {
        if (!canEdit) return; // Read-only for others
        setSelectedLesson(lesson);
        setEditModalOpen(true);
    };

    // ...

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
                        <div className="flex flex-col items-center justify-center h-[300px] text-zinc-600">
                            <h3 className="font-medium text-zinc-400 mb-1">На этот день занятий нет</h3>
                            <p className="text-xs">Попробуйте выбрать другую дату</p>
                        </div>
                    )}
                </div>

                {/* Floating Action Button - Only for Admins */}
                {canEdit && (
                    <div className="fixed bottom-6 right-4 md:bottom-8 md:right-8 z-40">
                        <AddLessonModal lessons={lessons}>
                            <Button size="icon" className="h-14 w-14 rounded-full bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-900/40 border border-white/10">
                                <Plus className="h-6 w-6" />
                            </Button>
                        </AddLessonModal>
                    </div>
                )}

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
