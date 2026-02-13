'use client';

import { useState, useEffect } from "react";
// Removed mock imports
import { ScheduleFilters } from "@/components/schedule/schedule-filters";
// import { AddLessonModal } from "@/components/schedule/add-lesson-modal";
import { LessonModal } from "@/components/schedule/edit-lesson-modal";
import { LessonCard } from "@/components/schedule/lesson-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Lesson, DayOfWeek } from "@/lib/types/schedule";
import { ModuleGuard } from "@/components/system/module-guard";
import { useAuth } from "@/components/auth/auth-provider";
import { DesktopWeekGrid } from "@/components/schedule/desktop-week-grid";
import { useOrganization } from "@/hooks/use-organization";
import { useRole } from "@/hooks/use-role";
import { generateId } from "@/lib/utils";

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
    // Removed viewMode state and auto-resize effect

    const [groupFilter, setGroupFilter] = useState("all");
    const [teacherFilter, setTeacherFilter] = useState("all");
    const [courseFilter, setCourseFilter] = useState("all");
    const [dayFilter, setDayFilter] = useState("all");
    const [currentDate, setCurrentDate] = useState(new Date("2025-09-01"));

    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [initialLessonData, setInitialLessonData] = useState<Partial<Lesson> | undefined>(undefined);
    const [modalOpen, setModalOpen] = useState(false);

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
                    grpM.groupsRepo.getAll(currentOrganizationId),
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
    }, [userData]);

    const handleSave = async (data: any) => {
        if (!currentOrganizationId) return;

        try {
            const { scheduleRepo } = await import("@/lib/data/schedule.repo");

            if (data.id) {
                // UPDATE
                const lessonToUpdate = lessons.find(l => l.id === data.id);
                if (!lessonToUpdate) return;

                await scheduleRepo.update(currentOrganizationId, {
                    ...lessonToUpdate,
                    ...data
                } as Lesson);
            } else {
                // CREATE
                const newLesson: Lesson = {
                    id: generateId(),
                    organizationId: currentOrganizationId,
                    status: 'PLANNED',
                    createdAt: new Date().toISOString(),
                    ...data
                };
                await scheduleRepo.add(currentOrganizationId, newLesson);
            }
            setModalOpen(false);
        } catch (error: any) {
            console.error("Schedule save error:", error);
            alert(`Ошибка при сохранении: ${error.message}`);
        }
    };

    const handleLessonDelete = async (id: string) => {
        if (!currentOrganizationId) return;
        if (!confirm("Вы уверены, что хотите удалить это занятие?")) return;

        try {
            const { scheduleRepo } = await import("@/lib/data/schedule.repo");
            await scheduleRepo.delete(currentOrganizationId, id);
            setModalOpen(false);
        } catch (error) {
            console.error("Failed to delete lesson:", error);
            alert("Ошибка при удалении занятия");
        }
    };

    // Filter Logic
    const filteredLessons = lessons.filter(l => {
        const matchesGroup = groupFilter === 'all' || l.groupId === groupFilter;
        const matchesTeacher = teacherFilter === 'all' || l.teacherId === teacherFilter;
        const matchesCourse = courseFilter === 'all' || l.courseId === courseFilter;
        const matchesDay = dayFilter === 'all' || l.dayOfWeek === dayFilter;
        return matchesGroup && matchesTeacher && matchesCourse && matchesDay;
    });

    if (!isLoaded) return <div className="p-8 text-muted-foreground">Загрузка расписания...</div>;

    const handleLessonClick = (lesson: Lesson) => {
        if (!isOwner && !isTeacher) return; // Read-only for others
        setInitialLessonData(undefined);
        setSelectedLesson(lesson);
        setModalOpen(true);
    };

    const handleSlotClick = (initialData: Partial<Lesson>) => {
        if (!isOwner && !isTeacher) return;
        setSelectedLesson(null);
        setInitialLessonData(initialData);
        setModalOpen(true);
    };

    return (
        <ModuleGuard module="schedule">
            <div className="space-y-4 laptop:space-y-6 h-full flex flex-col">
                <div className="flex items-center justify-between px-1">
                    <h1 className="text-xl font-bold text-foreground">Расписание</h1>
                    <div className="flex items-center gap-3">
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

                <div className="flex-1 overflow-x-auto overflow-y-hidden">
                    <div className="min-w-[1024px] h-full">
                        <DesktopWeekGrid
                            lessons={filteredLessons}
                            currentDate={currentDate}
                            onLessonClick={handleLessonClick}
                            onLessonAdd={handleSlotClick}
                            onLessonUpdate={handleSave}
                            onLessonDelete={handleLessonDelete}
                            groups={groups}
                            teachers={teachers}
                            courses={courses}
                        />
                    </div>
                </div>

                <LessonModal
                    lesson={selectedLesson}
                    initialData={initialLessonData}
                    open={modalOpen}
                    onOpenChange={setModalOpen}
                    onSave={handleSave}
                    onDelete={handleLessonDelete}
                    groups={groups}
                    teachers={teachers}
                    courses={courses}
                />
            </div>
        </ModuleGuard>
    );
}
