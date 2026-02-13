'use client';

import { useState, useMemo, useEffect, useCallback } from "react";
import { SmartJournalHeader } from "@/components/journal/smart-journal-header";
import { StudentJournalCard } from "@/components/journal/student-journal-card";
import { LessonActionsPanel } from "@/components/journal/lesson-actions-panel";
import { SmartJournalQuickActions } from "@/components/journal/quick-actions";
import { AttendanceRecord, AttendanceStatus } from "@/lib/types/attendance";
import { Lesson } from "@/lib/types/schedule";
import { ModuleGuard } from "@/components/system/module-guard";
import { useOrganization } from "@/hooks/use-organization";
import { useRole } from "@/hooks/use-role";
import { useAuth } from "@/components/auth/auth-provider";
import { attendanceRepo } from "@/lib/data/attendance.repo";
import { cn } from "@/lib/utils";
import { Loader2, Search, Filter, History } from "lucide-react";
import { Input } from "@/components/ui/input";

type LocalAttendanceMap = Record<string, AttendanceRecord>;

export default function AttendancePage() {
    // Filters & Selection
    const [date, setDate] = useState<Date>(new Date());
    const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

    // Data State
    const [attendanceData, setAttendanceData] = useState<LocalAttendanceMap>({});
    const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);
    const [schedule, setSchedule] = useState<Lesson[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // History for Undo
    const [actionHistory, setActionHistory] = useState<any[]>([]);

    const { currentOrganizationId } = useOrganization();
    const { isTeacher } = useRole();
    const { userData } = useAuth();

    // 1. Initial Data Fetch (Metadata)
    useEffect(() => {
        if (!currentOrganizationId) return;

        const fetchData = async () => {
            setIsLoaded(false);
            try {
                const [schRepo, stuRepo, grpRepo] = await Promise.all([
                    import("@/lib/data/schedule.repo"),
                    import("@/lib/data/students.repo"),
                    import("@/lib/data/groups.repo")
                ]);

                const [sch, stu, grps] = await Promise.all([
                    schRepo.scheduleRepo.getAll(currentOrganizationId!, undefined, isTeacher ? { teacherId: userData?.uid } : {}),
                    stuRepo.studentsRepo.getAll(currentOrganizationId!, isTeacher ? { groupIds: (userData as any)?.groupIds } : {}),
                    grpRepo.groupsRepo.getAll(currentOrganizationId!, isTeacher ? { groupIds: (userData as any)?.groupIds } : {})
                ]);

                setSchedule(sch as Lesson[]);
                setStudents(stu);
                setGroups(grps);
                setIsLoaded(true);
            } catch (error) {
                console.error("Metadata fetch error:", error);
            }
        };

        fetchData();
    }, [currentOrganizationId, isTeacher, userData?.uid]);

    // 2. Real-time Attendance Sync
    useEffect(() => {
        if (!currentOrganizationId || !isLoaded) return;

        const scheduleIds = isTeacher ? schedule.map(l => l.id) : undefined;

        attendanceRepo.getAll(
            currentOrganizationId,
            (records) => {
                setAllAttendance(records);
                const map: LocalAttendanceMap = {};
                records.forEach(r => {
                    const key = `${r.scheduleId}-${r.studentId}`;
                    map[key] = { ...r, status: r.status as AttendanceStatus };
                });
                setAttendanceData(map);
            },
            scheduleIds ? { scheduleIds } : {}
        );

        return () => attendanceRepo.unsubscribe(currentOrganizationId);
    }, [currentOrganizationId, isLoaded, schedule, isTeacher]);

    // 3. Derived State: Lessons for Today
    const lessonsForDate = useMemo(() => {
        const dayOfWeekIndex = date.getDay();
        const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
        const dayString = days[dayOfWeekIndex];

        return schedule
            .filter(l => l.dayOfWeek === dayString && l.status !== 'CANCELLED')
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    }, [date, schedule]);

    // Auto-select first lesson
    useEffect(() => {
        if (lessonsForDate.length > 0 && !selectedLessonId) {
            setSelectedLessonId(lessonsForDate[0].id);
        } else if (lessonsForDate.length === 0) {
            setSelectedLessonId(null);
        }
    }, [lessonsForDate, selectedLessonId]);

    const currentLesson = useMemo(() =>
        lessonsForDate.find(l => l.id === selectedLessonId),
        [lessonsForDate, selectedLessonId]);

    const currentGroup = useMemo(() =>
        groups.find(g => g.id === currentLesson?.groupId),
        [groups, currentLesson]);

    const currentCourse = useMemo(() => ({
        id: currentLesson?.courseId || "unknown",
        name: currentLesson?.courseId || "Предмет"
    }), [currentLesson]);

    // Streak Calculation
    const getStudentStreak = useCallback((studentId: string) => {
        const studentAttendance = allAttendance
            .filter(r => r.studentId === studentId)
            .sort((a, b) => {
                const dateA = a.date ? new Date(a.date).getTime() : 0;
                const dateB = b.date ? new Date(b.date).getTime() : 0;
                return dateB - dateA;
            });

        let streak = 0;
        for (const record of studentAttendance) {
            if (record.status === "PRESENT") {
                streak++;
            } else if (record.status === "ABSENT") {
                break;
            }
        }
        return streak;
    }, [allAttendance]);

    // Selection Derived State
    const selectedStudent = useMemo(() => {
        if (!selectedStudentId || !selectedLessonId) return null;
        const student = students.find(s => s.id === selectedStudentId);
        const key = `${selectedLessonId}-${selectedStudentId}`;
        const attendance = attendanceData[key];
        return student ? {
            id: student.id,
            name: `${student.lastName} ${student.firstName}`,
            note: attendance?.note
        } : null;
    }, [selectedStudentId, students, attendanceData, selectedLessonId]);

    // 4. Students Filter & Sort
    const studentsInLesson = useMemo(() => {
        if (!currentLesson) return [];
        return students
            .filter(s => s.groupIds?.includes(currentLesson.groupId))
            .filter(s => {
                const fullName = `${s.lastName} ${s.firstName}`.toLowerCase();
                return fullName.includes(searchQuery.toLowerCase());
            })
            .sort((a, b) => a.lastName.localeCompare(b.lastName));
    }, [currentLesson, students, searchQuery]);

    // 5. Handlers (Real-time autosave)
    const handleStatusChange = useCallback(async (studentId: string, status: AttendanceStatus) => {
        if (!selectedLessonId || !currentOrganizationId) return;

        const key = `${selectedLessonId}-${studentId}`;
        const existing = attendanceData[key];

        // Save to history for undo
        setActionHistory(prev => [{
            studentId,
            previousStatus: existing?.status || "UNKNOWN",
            timestamp: Date.now()
        }, ...prev].slice(0, 10));

        const record: AttendanceRecord = {
            id: existing?.id || `new-${Date.now()}-${studentId}`,
            organizationId: currentOrganizationId,
            scheduleId: selectedLessonId,
            studentId: studentId,
            date: date.toISOString(),
            status,
            note: existing?.note || "",
            updatedAt: new Date().toISOString()
        };

        try {
            await attendanceRepo.save(currentOrganizationId, record);
        } catch (error) {
            console.error("Autosave failed:", error);
        }
    }, [selectedLessonId, currentOrganizationId, attendanceData, date]);

    const handleReward = async (studentId: string) => {
        if (!currentOrganizationId || !selectedLessonId) return;

        try {
            const { gradesRepo } = await import("@/lib/data/grades.repo");
            const rewardGrade = {
                id: `reward-${Date.now()}-${studentId}`,
                organizationId: currentOrganizationId,
                studentId,
                courseId: currentCourse.id,
                groupId: currentGroup?.id || "",
                type: "PARTICIPATION" as any,
                score: 10,
                date: new Date().toISOString().split('T')[0],
                comment: `Bonus reward for active participation in lesson [Lesson:${selectedLessonId}]`,
                updatedAt: new Date().toISOString()
            };
            await gradesRepo.save(currentOrganizationId, rewardGrade);
            alert(`Студент получил +10 бонусных баллов!`);
        } catch (error) {
            console.error("Reward failed:", error);
        }
    };

    const handleBulkStatus = async (status: AttendanceStatus) => {
        if (!selectedLessonId || !currentOrganizationId) return;

        const promises = studentsInLesson.map(s => {
            const key = `${selectedLessonId}-${s.id}`;
            const existing = attendanceData[key];
            const record: AttendanceRecord = {
                id: existing?.id || `new-${Date.now()}-${s.id}`,
                organizationId: currentOrganizationId,
                scheduleId: selectedLessonId,
                studentId: s.id,
                date: date.toISOString(),
                status,
                note: existing?.note || "",
            };
            return attendanceRepo.save(currentOrganizationId, record);
        });

        try {
            await Promise.all(promises);
        } catch (error) {
            console.error("Bulk save failed:", error);
        }
    };

    const handleUndo = useCallback(async () => {
        if (actionHistory.length === 0 || !selectedLessonId || !currentOrganizationId) return;

        const lastAction = actionHistory[0];
        const key = `${selectedLessonId}-${lastAction.studentId}`;
        const existing = attendanceData[key];

        if (existing) {
            try {
                await attendanceRepo.save(currentOrganizationId, {
                    ...existing,
                    status: lastAction.previousStatus,
                    updatedAt: new Date().toISOString()
                });
                setActionHistory(prev => prev.slice(1));
            } catch (error) {
                console.error("Undo failed:", error);
            }
        }
    }, [actionHistory, selectedLessonId, currentOrganizationId, attendanceData]);

    if (!isLoaded) {
        return (
            <div className="flex h-screen items-center justify-center bg-[hsl(var(--secondary))]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <ModuleGuard module="attendance">
            <div className="flex flex-col h-screen bg-[hsl(var(--secondary))] overflow-hidden">
                <SmartJournalHeader
                    courseName={currentCourse.name}
                    courseId={currentCourse.id}
                    groupName={currentGroup?.name || "Группа"}
                    groupId={currentGroup?.id || "unknown"}
                    date={date}
                    onDateChange={(d) => d && setDate(d)}
                    lessonTime={currentLesson ? `${currentLesson.startTime}–${currentLesson.endTime}` : "Нет уроков"}
                    teacherName={userData?.name || "Я"}
                />

                <main className="flex-1 flex overflow-hidden">
                    {/* Left Column: Students (40%) */}
                    <div className="w-[40%] flex flex-col border-r border-[hsl(var(--border))] bg-white">
                        <div className="p-4 border-b border-[hsl(var(--border))] flex items-center justify-between">
                            <SmartJournalQuickActions
                                onMarkAllPresent={() => handleBulkStatus("PRESENT")}
                                onReset={() => handleBulkStatus("UNKNOWN")}
                                onUndo={handleUndo}
                            />
                        </div>

                        <div className="p-4 bg-[hsl(var(--secondary))]/50 flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                                <Input
                                    placeholder="Поиск студента..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 h-10 bg-white border-[hsl(var(--border))] focus:ring-cyan-500 rounded-xl text-sm"
                                />
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                                <History className="h-3.5 w-3.5" />
                                {studentsInLesson.length} Студентов
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto p-4 space-y-3">
                            {studentsInLesson.length > 0 ? (
                                studentsInLesson.map(student => (
                                    <StudentJournalCard
                                        key={student.id}
                                        studentId={student.id}
                                        studentName={`${student.lastName} ${student.firstName}`}
                                        status={attendanceData[`${selectedLessonId}-${student.id}`]?.status || "UNKNOWN"}
                                        hasNote={!!attendanceData[`${selectedLessonId}-${student.id}`]?.note}
                                        streak={getStudentStreak(student.id)}
                                        onStatusChange={(status) => handleStatusChange(student.id, status)}
                                        onClick={() => setSelectedStudentId(student.id)}
                                        onReward={() => handleReward(student.id)}
                                        isSelected={selectedStudentId === student.id}
                                        isLastAction={actionHistory[0]?.studentId === student.id}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-20">
                                    <p className="text-[hsl(var(--muted-foreground))] text-sm italic">
                                        {currentLesson ? "Студенты не найдены" : "Выберите урок"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Lesson Actions (60%) */}
                    <div className="w-[60%] flex flex-col bg-[hsl(var(--secondary))]">
                        <div className="flex-1 overflow-hidden">
                            {selectedLessonId ? (
                                <LessonActionsPanel
                                    lessonId={selectedLessonId}
                                    selectedStudent={selectedStudent}
                                    courseId={currentCourse.id}
                                    groupId={currentGroup?.id}
                                />
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                                    <div className="h-20 w-20 bg-white rounded-3xl shadow-sm border border-[hsl(var(--border))] flex items-center justify-center mb-6">
                                        <Filter className="h-10 w-10 text-cyan-200" />
                                    </div>
                                    <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-2">Выберите занятие</h3>
                                    <p className="text-[hsl(var(--muted-foreground))] max-w-xs mx-auto text-sm">
                                        Выберите урок из списка или другого дня, чтобы увидеть детали и управлять материалами.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Bottom Bar: Lesson Picker */}
                        <div className="h-20 border-t border-[hsl(var(--border))] bg-white px-6 flex items-center gap-3 overflow-x-auto no-scrollbar">
                            {lessonsForDate.map((lesson) => (
                                <button
                                    key={lesson.id}
                                    onClick={() => setSelectedLessonId(lesson.id)}
                                    className={cn(
                                        "h-12 px-5 rounded-xl border-2 transition-all shrink-0 flex items-center gap-3",
                                        selectedLessonId === lesson.id
                                            ? "border-primary bg-cyan-50 text-cyan-700"
                                            : "border-[hsl(var(--border))] bg-white text-[hsl(var(--muted-foreground))] hover:border-cyan-200"
                                    )}
                                >
                                    <span className="font-bold text-sm tracking-tight">{lesson.startTime}</span>
                                    <div className="h-4 w-px bg-current opacity-50" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{lesson.room || 'Room'}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </ModuleGuard>
    );
}
