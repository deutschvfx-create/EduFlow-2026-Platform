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
import { DesktopWeekGrid } from "@/components/schedule/desktop-week-grid";
import { useOrganization } from "@/hooks/use-organization";
import { useRole } from "@/hooks/use-role";

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
    const { userData } = useAuth();
    const { isOwner, isTeacher, isStudent } = useRole();
    const { currentOrganizationId } = useOrganization();
    const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

    // Auto-switch view mode on desktop/mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) { // laptop breakpoint
                setViewMode('week');
            } else {
                setViewMode('day');
            }
        };
        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
        // Guard: do not subscribe until we have an organizationId
        if (!currentOrganizationId) {
            setIsLoaded(true); // Clear loading state if no organization is defined (prevents deadlock)
            return;
        }

        // Reset loading state for the current organization context
        setIsLoaded(false);
        let active = true;

        const initializeRealtime = async () => {
            try {
                // Dynamic imports for repositories
                const [schM, grpM, teaM, couM] = await Promise.all([
                    import("@/lib/data/schedule.repo"),
                    import("@/lib/data/groups.repo"),
                    import("@/lib/data/teachers.repo"),
                    import("@/lib/data/courses.repo")
                ]);

                if (!active) return;

                // Start realtime subscription and load metadata
                const [l, g, t, c] = await Promise.all([
                    schM.scheduleRepo.getAll(
                        currentOrganizationId,
                        (updated) => {
                            if (active) setLessons(updated);
                        },
                        isTeacher ? { teacherId: userData?.uid } : {}
                    ),
                    grpM.groupsRepo.getAll(
                        currentOrganizationId,
                        isTeacher ? { groupIds: (userData as any)?.groupIds } : {}
                    ),
                    teaM.teachersRepo.getAll(currentOrganizationId),
                    couM.coursesRepo.getAll(currentOrganizationId)
                ]);

                if (active) {
                    setLessons(l);
                    setGroups(g);
                    setTeachers(t);
                    setCourses(c);
                    setIsLoaded(true); // Data loaded successfully
                }
            } catch (error) {
                console.error("Schedule initialization error:", error);
                if (active) setIsLoaded(true); // Clear loading state even on failure to avoid infinite spinner
            }
        };

        initializeRealtime();

        return () => {
            active = false;
            // Clean up subscription
            import("@/lib/data/schedule.repo").then(m => {
                m.scheduleRepo.unsubscribe(currentOrganizationId);
            });
        };
    }, [currentOrganizationId]);

    // Role based filtering
    useEffect(() => {
        if (!userData) return;

        if (userData.role === 'teacher') {
            setTeacherFilter(userData.uid);
        }
        // TODO: For students we need their groupId. 
        // For now we just restrict editing.
    }, [userData]);

    const handleSaveUpdate = async (id: string, updates: Partial<Lesson>) => {
        if (!currentOrganizationId) return;
        try {
            const { scheduleRepo } = await import("@/lib/data/schedule.repo");
            const lessonToUpdate = lessons.find(l => l.id === id);
            if (!lessonToUpdate) return;

            await scheduleRepo.update(currentOrganizationId, {
                ...lessonToUpdate,
                ...updates
            } as Lesson);
            setEditModalOpen(false);
        } catch (error) {
            console.error("Failed to update lesson:", error);
            alert("Ошибка при сохранении изменений");
        }
    };

    const handleLessonDelete = async (id: string) => {
        if (!currentOrganizationId) return;
        if (!confirm("Вы уверены, что хотите удалить это занятие?")) return;

        try {
            const { scheduleRepo } = await import("@/lib/data/schedule.repo");
            await scheduleRepo.delete(currentOrganizationId, id);
            setEditModalOpen(false);
        } catch (error) {
            console.error("Failed to delete lesson:", error);
            alert("Ошибка при удалении занятия");
        }
    };

    const filteredLessons = lessons.filter(l => {
        const matchesGroup = groupFilter === 'all' || l.groupId === groupFilter;
        const matchesTeacher = teacherFilter === 'all' || l.teacherId === teacherFilter;
        const matchesCourse = courseFilter === 'all' || l.courseId === courseFilter;
        const matchesDay = dayFilter === 'all' || l.dayOfWeek === dayFilter;
        return matchesGroup && matchesTeacher && matchesCourse && matchesDay;
    });

    if (!isLoaded) return <div className="p-8 text-zinc-500">Загрузка расписания...</div>;

    const handleLessonClick = (lesson: Lesson) => {
        if (!isOwner && !isTeacher) return; // Read-only for others (students)
        setSelectedLesson(lesson);
        setEditModalOpen(true);
    };

    const handleLessonAdd = async (newLessonData: any) => {
        if (!currentOrganizationId) {
            console.error("handleLessonAdd: No organization ID");
            return;
        }

        console.log("Creating lesson for org:", currentOrganizationId, newLessonData);

        try {
            const { scheduleRepo } = await import("@/lib/data/schedule.repo");
            const newLesson: Omit<Lesson, 'id'> = {
                organizationId: currentOrganizationId,
                status: 'PLANNED',
                createdAt: new Date().toISOString(),
                groupId: newLessonData.groupId,
                teacherId: newLessonData.teacherId,
                courseId: newLessonData.courseId,
                dayOfWeek: newLessonData.dayOfWeek,
                startTime: newLessonData.startTime,
                endTime: newLessonData.endTime,
                room: newLessonData.room
            };

            await scheduleRepo.add(currentOrganizationId, newLesson as Lesson);
            console.log("Lesson created successfully");
        } catch (error: any) {
            console.error("Failed to add lesson:", error);
            console.error("Error code:", error.code);
            console.error("Error message:", error.message);
            alert(`Ошибка при создании занятия: ${error.message}`);
        }
    };

    return (
        <ModuleGuard module="schedule">
            <div className="space-y-4 laptop:space-y-6 h-full flex flex-col">
                {/* Header Actions */}
                <div className="flex items-center justify-between px-1">
                    <h1 className="text-xl font-bold text-white">Расписание</h1>
                    <div className="flex items-center gap-3">
                        {/* View Mode Toggle - Visible on Tablets+ */}
                        <div className="hidden md:flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                            <Button
                                variant={viewMode === 'day' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => setViewMode('day')}
                            >
                                День
                            </Button>
                            <Button
                                variant={viewMode === 'week' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => setViewMode('week')}
                            >
                                Неделя
                            </Button>
                        </div>

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

                {viewMode === 'week' ? (
                    /* DESKTOP WEEK VIEW */
                    /* DESKTOP WEEK VIEW */
                    <div className="flex-1 overflow-x-auto overflow-y-hidden">
                        <div className="min-w-[1024px] h-full">
                            <DesktopWeekGrid
                                lessons={filteredLessons}
                                currentDate={currentDate}
                                onLessonClick={handleLessonClick}
                                onLessonAdd={handleLessonAdd}
                            />
                        </div>
                    </div>
                ) : (
                    /* MOBILE DAY VIEW */
                    <>
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
                    </>
                )}


                {/* Floating Action Button - Only for Owners/Teachers (if allowed) */}
                {isOwner && (
                    <div className="fixed bottom-6 right-4 md:bottom-8 md:right-8 z-40">
                        <AddLessonModal
                            lessons={lessons}
                            groups={groups}
                            teachers={teachers}
                            courses={courses}
                            onSave={handleLessonAdd}
                        >
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
                    onDelete={handleLessonDelete}
                    groups={groups}
                    teachers={teachers}
                    courses={courses}
                />
            </div>
        </ModuleGuard>
    );
}
