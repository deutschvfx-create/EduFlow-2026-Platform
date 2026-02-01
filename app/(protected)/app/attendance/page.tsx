'use client';

import { useState, useMemo, useEffect } from "react";
import { MOCK_STUDENTS } from "@/lib/mock/students";
import { MOCK_ATTENDANCE } from "@/lib/mock/attendance";
import { MOCK_GROUPS_FULL } from "@/lib/mock/groups";
import { AttendanceStatusBadge } from "@/components/attendance/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon, Loader2, Check, X, Clock, FileText, Save, Users, UserCheck, UserX, Clock4 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AttendanceRecord, AttendanceStatus } from "@/lib/types/attendance";
// import { toast } from "sonner"; // Removed missing dependency
const toast = { success: (m: string) => alert(m), error: (m: string) => alert(m) };
import { MOCK_COURSES } from "@/lib/mock/courses";
import { Lesson } from "@/lib/types/schedule";
import { ModuleGuard } from "@/components/system/module-guard";
import { useOrganization } from "@/hooks/use-organization";
import { useRole } from "@/hooks/use-role";
import { useAuth } from "@/components/auth/auth-provider";
import { attendanceRepo } from "@/lib/data/attendance.repo";

type LocalAttendanceMap = Record<string, AttendanceRecord>;

export default function AttendancePage() {
    // Filters
    const [date, setDate] = useState<Date | undefined>(new Date("2025-09-01")); // start with mock date
    const [groupId, setGroupId] = useState("all");
    const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

    // Data State (Simulate DB)
    const [attendanceData, setAttendanceData] = useState<LocalAttendanceMap>({});
    const [schedule, setSchedule] = useState<Lesson[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const { currentOrganizationId } = useOrganization();
    const { isTeacher, isOwner } = useRole();
    const { userData } = useAuth();

    // Load Metadata (Static-ish)
    useEffect(() => {
        if (!currentOrganizationId) return;

        setIsLoaded(false);
        Promise.all([
            import("@/lib/data/schedule.repo").then(m =>
                m.scheduleRepo.getAll(currentOrganizationId!, undefined, isTeacher ? { teacherId: userData?.uid } : {})
            ),
            import("@/lib/data/students.repo").then(m =>
                m.studentsRepo.getAll(currentOrganizationId!, isTeacher ? { groupIds: (userData as any)?.groupIds } : {})
            ),
            import("@/lib/data/groups.repo").then(m =>
                m.groupsRepo.getAll(currentOrganizationId!, isTeacher ? { groupIds: (userData as any)?.groupIds } : {})
            )
        ]).then(([sch, stu, grps]) => {
            const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
            const mappedSchedule: Lesson[] = sch.map((item: any) => ({
                ...item,
                dayOfWeek: typeof item.dayOfWeek === 'number' ? days[item.dayOfWeek] || 'MON' : item.dayOfWeek,
                status: 'PLANNED',
                createdAt: new Date().toISOString()
            } as Lesson));

            setSchedule(mappedSchedule);
            setStudents(stu);
            setGroups(grps);
            setIsLoaded(true);
        });
    }, [currentOrganizationId, isTeacher, userData?.uid]);

    // Real-time Attendance Listener (Scoped)
    useEffect(() => {
        if (!currentOrganizationId || !isLoaded) return;

        const scheduleIds = isTeacher
            ? schedule.map(l => l.id)
            : undefined;

        attendanceRepo.getAll(
            currentOrganizationId,
            (records) => {
                const map: LocalAttendanceMap = {};
                records.forEach(r => {
                    const key = `${r.scheduleId}-${r.studentId}`;
                    map[key] = { ...r, status: r.status as AttendanceStatus };
                });
                setAttendanceData(map);
            },
            scheduleIds ? { scheduleIds } : {}
        );

        return () => {
            attendanceRepo.unsubscribe(currentOrganizationId);
        };
    }, [currentOrganizationId, isLoaded, schedule, isTeacher]);

    // Derived State: Lessons for the day
    const lessonsForDate = useMemo(() => {
        if (!date) return [];
        const dayOfWeekIndex = date.getDay(); // 0 = Sun, 1 = Mon...
        const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
        const dayString = days[dayOfWeekIndex];

        return schedule.filter(l =>
            l.dayOfWeek === dayString &&
            (groupId === 'all' || l.groupId === groupId) &&
            l.status !== 'CANCELLED' // hide cancelled?
        ).sort((a, b) => a.startTime.localeCompare(b.startTime));
    }, [date, groupId, schedule]);

    // Auto-select first lesson if available and none selected
    useEffect(() => {
        if (lessonsForDate.length > 0 && !selectedLessonId) {
            setSelectedLessonId(lessonsForDate[0].id);
        } else if (lessonsForDate.length === 0) {
            setSelectedLessonId(null);
        }
    }, [lessonsForDate]);

    const currentLesson = lessonsForDate.find(l => l.id === selectedLessonId);

    // Derived State: Students for selected lesson (by group)
    const studentsInLesson = useMemo(() => {
        if (!currentLesson) return [];
        // Find students in group
        return students.filter(s => s.groupIds?.includes(currentLesson.groupId));
    }, [currentLesson, students]);

    const handleStatusChange = async (studentId: string, status: AttendanceStatus) => {
        if (!selectedLessonId || !currentLesson || !currentOrganizationId) return;

        const key = `${selectedLessonId}-${studentId}`;
        const existing = attendanceData[key];

        const record: AttendanceRecord = {
            id: existing?.id || `new-${Date.now()}-${studentId}`,
            organizationId: currentOrganizationId,
            scheduleId: selectedLessonId,
            studentId: studentId,
            date: date?.toISOString() || new Date().toISOString(),
            status,
            note: existing?.note || "",
            updatedAt: new Date().toISOString()
        };

        try {
            await attendanceRepo.save(currentOrganizationId, record);
            // Optimistic update locally for immediate UX if needed, 
            // but onSnapshot will handle it.
        } catch (error) {
            console.error("Attendance save error:", error);
            toast.error("Ошибка при сохранении");
        }
    };

    const handleBulkStatus = async (status: AttendanceStatus) => {
        if (!selectedLessonId || !currentLesson || !currentOrganizationId) return;

        try {
            const promises = studentsInLesson.map(s => {
                const key = `${selectedLessonId}-${s.id}`;
                const existing = attendanceData[key];
                const record: AttendanceRecord = {
                    id: existing?.id || `new-${Date.now()}-${s.id}`,
                    organizationId: currentOrganizationId,
                    scheduleId: selectedLessonId,
                    studentId: s.id,
                    date: date?.toISOString() || new Date().toISOString(),
                    status,
                    note: existing?.note || "",
                };
                return attendanceRepo.save(currentOrganizationId, record);
            });
            await Promise.all(promises);
            toast.success(`Все отмечены как ${status}`);
        } catch (error) {
            console.error("Bulk attendance error:", error);
            toast.error("Ошика при массовом обновлении");
        }
    };

    const getStatus = (studentId: string): AttendanceStatus => {
        if (!selectedLessonId) return "UNKNOWN"; // Default
        // Logic for "UNKNOWN" vs undefined? 
        // If undefined, return UNKNOWN (gray)
        return attendanceData[`${selectedLessonId}-${studentId}`]?.status || "UNKNOWN";
    }

    const getNote = (studentId: string): string => {
        // if (!selectedLessonId) return "";
        // return attendanceData[`${selectedLessonId}-${studentId}`]?.note || "";
        return "";
    }

    const setNote = (studentId: string, note: string) => {
        // Mock note
    };

    // Stats for Top Cards (Mock based on selected date or total DB?)
    // Let's compute statistics for the CURRENTLY selected date across ALL lessons (or filtered ones).
    const stats = useMemo(() => {
        let totalScheduled = 0;
        let present = 0;
        let absent = 0;
        let late = 0;

        // Iterate over filtered lessons for the day
        lessonsForDate.forEach(l => {
            // For simplicity, find mock students for this lesson's group
            const studs = students.filter(s => s.groupIds?.includes(l.groupId));
            totalScheduled += studs.length;

            studs.forEach(s => {
                const key = `${l.id}-${s.id}`;
                const r = attendanceData[key];
                if (r) {
                    if (r.status === 'PRESENT') present++;
                    if (r.status === 'ABSENT') absent++;
                    if (r.status === 'LATE') late++;
                    if (r.status === 'EXCUSED') absent++; // Count excused as absent or separate? Let's assume filtered.
                }
            });
        });

        // "Unmarked" are totalScheduled - (records count)
        // But `attendanceData` might be sparse.
        // Simple logic for UI:
        return { totalScheduled, present, absent, late };
    }, [lessonsForDate, attendanceData, students]);


    return (
        <ModuleGuard module="attendance">
            <div className="space-y-6 flex flex-col h-full">
                <div className="hidden laptop:flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-white">Посещаемость</h1>
                    <p className="text-zinc-400">Отметки посещения по занятиям и группам</p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 laptop:grid-cols-4">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">Ожидается (на дату)</CardTitle>
                            <Users className="h-4 w-4 text-zinc-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stats.totalScheduled}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-400">Присутствуют</CardTitle>
                            <UserCheck className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stats.present}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-red-400">Отсутствуют</CardTitle>
                            <UserX className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stats.absent}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-amber-400">Опоздали</CardTitle>
                            <Clock4 className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stats.late}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 bg-zinc-950/50 p-4 rounded-lg border border-zinc-900">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[240px] justify-start text-left font-normal bg-zinc-900 border-zinc-800",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP", { locale: ru }) : <span>Выберите дату</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-800" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>

                    <Select value={groupId} onValueChange={setGroupId}>
                        <SelectTrigger className="w-[200px] bg-zinc-900 border-zinc-800">
                            <SelectValue placeholder="Группа" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Все группы</SelectItem>
                            {groups.map((g: any) => (
                                <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid md:grid-cols-4 gap-6 flex-1 min-h-[500px]">
                    {/* Left Panel: Filtered Lessons */}
                    <div className="md:col-span-1 flex flex-col gap-3">
                        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Занятия</h3>
                        <div className="flex flex-col gap-2">
                            {lessonsForDate.length > 0 ? (
                                lessonsForDate.map(lesson => (
                                    <div
                                        key={lesson.id}
                                        onClick={() => setSelectedLessonId(lesson.id)}
                                        className={cn(
                                            "p-3 rounded-lg border cursor-pointer transition-all",
                                            selectedLessonId === lesson.id
                                                ? "bg-indigo-900/30 border-indigo-500 ring-1 ring-indigo-500/50"
                                                : "bg-zinc-900 border-zinc-800 hover:bg-zinc-800"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-zinc-200">{lesson.startTime}</span>
                                            <Badge variant="secondary" className="text-[10px] h-5 bg-zinc-800 text-zinc-400">{lesson.room || 'online'}</Badge>
                                        </div>
                                        <div className="text-sm font-medium text-indigo-300 mb-0.5">Гр: {lesson.groupId}</div>
                                        <div className="text-xs text-zinc-500 truncate">Курс: {lesson.courseId}</div>
                                        <div className="text-xs text-zinc-600 mt-2 flex items-center gap-1">
                                            <Users className="h-3 w-3" /> Пр: {lesson.teacherId}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-zinc-500 border border-zinc-800 border-dashed rounded-lg">
                                    Нет занятий на эту дату
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Attendance Table */}
                    <div className="md:col-span-3 flex flex-col h-full bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                        {currentLesson ? (
                            <>
                                <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                                    <div>
                                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                            Группа {currentLesson.groupId}
                                            <span className="text-zinc-500 font-normal text-sm">| Курс {currentLesson.courseId}</span>
                                        </h2>
                                        <p className="text-sm text-zinc-400">
                                            {format(date!, "d MMMM yyyy", { locale: ru })} • {currentLesson.startTime} - {currentLesson.endTime}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="border-zinc-700 hover:bg-zinc-800" onClick={() => handleBulkStatus("PRESENT")}>
                                            <Check className="mr-2 h-4 w-4 text-green-500" /> Все пришли
                                        </Button>
                                        <Button variant="outline" size="sm" className="border-zinc-700 hover:bg-zinc-800" onClick={() => handleBulkStatus("UNKNOWN")}>
                                            Сбросить
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-auto">
                                    <Table>
                                        <TableHeader className="bg-zinc-950/50">
                                            <TableRow className="border-zinc-800 hover:bg-zinc-900">
                                                <TableHead className="w-[30%]">Студент</TableHead>
                                                <TableHead className="text-center">Статус</TableHead>
                                                <TableHead>Комментарий</TableHead>
                                                <TableHead className="text-right">Быстрые действия</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {studentsInLesson.length > 0 ? (
                                                studentsInLesson.map(student => {
                                                    const status = getStatus(student.id);
                                                    return (
                                                        <TableRow key={student.id} className="border-zinc-800 hover:bg-zinc-800/50">
                                                            <TableCell className="font-medium text-zinc-200">
                                                                {student.lastName} {student.firstName}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <AttendanceStatusBadge status={status} />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    placeholder="..."
                                                                    className="h-8 bg-transparent border-transparent hover:border-zinc-700 focus:border-indigo-500 focus:bg-zinc-950 text-zinc-300 w-full"
                                                                    value={getNote(student.id)}
                                                                    onChange={(e) => setNote(student.id, e.target.value)}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex justify-end gap-1">
                                                                    <Button
                                                                        variant="ghost" size="icon"
                                                                        className={cn("h-8 w-8", status === 'PRESENT' ? "bg-green-500/20 text-green-500" : "text-zinc-500 hover:text-green-500 hover:bg-green-500/10")}
                                                                        onClick={() => handleStatusChange(student.id, "PRESENT")}
                                                                        title="Присутствует"
                                                                    >
                                                                        <Check className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost" size="icon"
                                                                        className={cn("h-8 w-8", status === 'ABSENT' ? "bg-red-500/20 text-red-500" : "text-zinc-500 hover:text-red-500 hover:bg-red-500/10")}
                                                                        onClick={() => handleStatusChange(student.id, "ABSENT")}
                                                                        title="Отсутствует"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost" size="icon"
                                                                        className={cn("h-8 w-8", status === 'LATE' ? "bg-amber-500/20 text-amber-500" : "text-zinc-500 hover:text-amber-500 hover:bg-amber-500/10")}
                                                                        onClick={() => handleStatusChange(student.id, "LATE")}
                                                                        title="Опоздал"
                                                                    >
                                                                        <Clock className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost" size="icon"
                                                                        className={cn("h-8 w-8", status === 'EXCUSED' ? "bg-blue-500/20 text-blue-500" : "text-zinc-500 hover:text-blue-500 hover:bg-blue-500/10")}
                                                                        onClick={() => handleStatusChange(student.id, "EXCUSED")}
                                                                        title="Уважительная причина"
                                                                    >
                                                                        <FileText className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                })
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-8 text-zinc-500">
                                                        В этой группе нет студентов
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                                <Users className="h-12 w-12 mb-4 opacity-20" />
                                <p className="text-lg font-medium">Выберите занятие</p>
                                <p className="text-sm">Чтобы отметить посещаемость, выберите урок из списка слева</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ModuleGuard>
    );
}
