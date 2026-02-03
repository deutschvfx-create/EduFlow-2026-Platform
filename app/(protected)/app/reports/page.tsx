'use client';

import { useState, useMemo, useEffect } from "react";
import { Student } from "@/lib/types/student";
import { Teacher } from "@/lib/types/teacher";
import { Group } from "@/lib/types/group";
import { Course } from "@/lib/types/course";
import { AttendanceRecord } from "@/lib/types/attendance";
import { GradeRecord } from "@/lib/types/grades";
import { Lesson } from "@/lib/types/schedule";
import { useOrganization } from "@/hooks/use-organization";

import { ReportsFilters } from "@/components/reports/reports-filters";
import { AttendanceReportTable } from "@/components/reports/attendance-report-table";
import { GradesReportTable } from "@/components/reports/grades-report-table";
import { TeacherLoadTable } from "@/components/reports/teacher-load-table";
import { DataFlowVisualizer } from "@/components/reports/data-flow-visualizer";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, BarChart, TrendingUp, CalendarDays, Activity, Globe, Database } from "lucide-react";
import { ModuleGuard } from "@/components/system/module-guard";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
    const { currentOrganizationId } = useOrganization();

    // Data State
    const [students, setStudents] = useState<Student[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [grades, setGrades] = useState<GradeRecord[]>([]);
    const [schedule, setSchedule] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);

    const [activePulse, setActivePulse] = useState<string | undefined>();

    useEffect(() => {
        if (!currentOrganizationId) return;
        setLoading(true);

        const triggerPulse = (nodeId: string) => {
            setActivePulse(nodeId);
            setTimeout(() => setActivePulse(undefined), 1000);
        };

        // Real-time Listeners
        const qStudents = query(collection(db, "users"), where("organizationId", "==", currentOrganizationId), where("role", "==", "student"));
        const qTeachers = query(collection(db, "users"), where("organizationId", "==", currentOrganizationId), where("role", "==", "teacher"));
        const qAttendance = query(collection(db, "attendance"), where("organizationId", "==", currentOrganizationId));
        const qGrades = query(collection(db, "grades"), where("organizationId", "==", currentOrganizationId));
        const qGroups = query(collection(db, "groups"), where("organizationId", "==", currentOrganizationId));
        const qCourses = query(collection(db, "courses"), where("organizationId", "==", currentOrganizationId));
        const qSchedule = query(collection(db, "schedule"), where("organizationId", "==", currentOrganizationId));

        const unsubStudents = onSnapshot(qStudents, (snap) => {
            setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() } as Student)));
            triggerPulse("identity");
            setLoading(false);
        });
        const unsubTeachers = onSnapshot(qTeachers, (snap) => {
            setTeachers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Teacher)));
            triggerPulse("identity");
        });
        const unsubAttendance = onSnapshot(qAttendance, (snap) => {
            setAttendance(snap.docs.map(d => ({ id: d.id, ...d.data() } as AttendanceRecord)));
            triggerPulse("logistics");
        });
        const unsubGrades = onSnapshot(qGrades, (snap) => {
            setGrades(snap.docs.map(d => ({ id: d.id, ...d.data() } as GradeRecord)));
            triggerPulse("results");
        });
        const unsubGroups = onSnapshot(qGroups, (snap) => {
            setGroups(snap.docs.map(d => ({ id: d.id, ...d.data() } as Group)));
            triggerPulse("content");
        });
        const unsubCourses = onSnapshot(qCourses, (snap) => {
            setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() } as Course)));
            triggerPulse("content");
        });
        const unsubSchedule = onSnapshot(qSchedule, (snap) => {
            setSchedule(snap.docs.map(d => ({ id: d.id, ...d.data() } as Lesson)));
            triggerPulse("logistics");
        });

        return () => {
            unsubStudents();
            unsubTeachers();
            unsubAttendance();
            unsubGrades();
            unsubGroups();
            unsubCourses();
            unsubSchedule();
        };
    }, [currentOrganizationId]);

    // Filters State
    const [groupId, setGroupId] = useState("all");
    const [courseId, setCourseId] = useState("all");
    const [teacherId, setTeacherId] = useState("all");
    const [dateRange, setDateRange] = useState("week");

    // 1. Attendance Report Logic
    const attendanceReportData = useMemo(() => {
        const filteredStudents = students.filter(s => groupId === 'all' || s.groupIds?.includes(groupId));

        return filteredStudents.map(student => {
            const records = attendance.filter(r => r.studentId === student.id);
            const total = records.length;
            if (total === 0) {
                return { student, presentPercentage: 0, absentCount: 0, lateCount: 0, excusedCount: 0 };
            }
            const present = records.filter(r => r.status === 'PRESENT').length;
            const absent = records.filter(r => r.status === 'ABSENT').length;
            const late = records.filter(r => r.status === 'LATE').length;
            const excused = records.filter(r => r.status === 'EXCUSED').length;

            return {
                student,
                presentPercentage: Math.round((present / total) * 100),
                absentCount: absent,
                lateCount: late,
                excusedCount: excused
            };
        });
    }, [groupId, students, attendance]);

    // 2. Grades Report Logic
    const gradesReportData = useMemo(() => {
        const filteredStudents = students.filter(s => groupId === 'all' || s.groupIds?.includes(groupId));

        return filteredStudents.map(student => {
            const studentGrades = grades.filter(g => g.studentId === student.id && (courseId === 'all' || g.courseId === courseId));
            const count = studentGrades.length;
            const avg = count > 0 ? Math.round(studentGrades.reduce((acc, curr) => acc + (curr.score || 0), 0) / count) : 0;
            const sortedGrades = [...studentGrades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const lastDate = count > 0 ? sortedGrades[0].date : null;

            return {
                student,
                averageScore: avg,
                lastGradeDate: lastDate,
                gradesCount: count
            }
        });
    }, [groupId, courseId, students, grades]);

    // 3. Teacher Load Logic
    const teacherLoadData = useMemo(() => {
        const filteredTeachers = teachers.filter(t => teacherId === 'all' || t.id === teacherId);

        return filteredTeachers.map(teacher => {
            const teacherCourses = courses.filter(c => c.teacherIds.includes(teacher.id));
            const distinctGroupsCount = new Set(teacherCourses.flatMap(c => c.groupIds)).size;
            const lessons = schedule.filter(l => l.teacherId === teacher.id);
            const hours = lessons.length * 1.5;

            return {
                teacher,
                groupsCount: distinctGroupsCount,
                coursesCount: teacherCourses.length,
                hoursPerWeek: hours
            }
        });
    }, [teacherId, teachers, courses, schedule]);


    const totalStudentsCount = students.length;
    const activeStudentsCount = students.filter(s => s.status === 'ACTIVE').length;

    const avgAttendance = useMemo(() => {
        if (attendance.length === 0) return 0;
        const present = attendance.filter(r => r.status === 'PRESENT').length;
        return Math.round((present / attendance.length) * 100);
    }, [attendance]);

    const avgGrade = useMemo(() => {
        if (grades.length === 0) return 0;
        const sum = grades.reduce((acc, curr) => acc + (curr.score || 0), 0);
        return Math.round(sum / grades.length);
    }, [grades]);

    return (
        <ModuleGuard module="reports">
            <div className="space-y-6 max-w-[1600px] mx-auto p-4 laptop:p-6 pb-20">
                <div className="flex flex-col laptop:flex-row laptop:items-end justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Activity className="h-4 w-4 text-indigo-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500/80">System Analytics</span>
                        </div>
                        <h1 className="text-3xl laptop:text-4xl font-black tracking-tighter text-white">Отчёты</h1>
                        <p className="text-sm text-zinc-500 font-medium">Мониторинг образовательной экосистемы в реальном времени</p>
                    </div>

                    <div className="flex items-center gap-4 bg-zinc-950/80 border border-white/5 px-4 py-2.5 rounded-2xl backdrop-blur-md shadow-2xl shadow-indigo-500/5">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Status</span>
                            <span className="text-xs font-black text-emerald-400 uppercase tracking-tighter">Connected</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <Globe className="h-5 w-5 text-emerald-500 animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Node visualizer & Compact KPI */}
                <div className="grid grid-cols-1 laptop:grid-cols-12 gap-6">
                    <div className="laptop:col-span-4">
                        <DataFlowVisualizer activePulse={activePulse} />
                    </div>

                    <div className="laptop:col-span-8 grid grid-cols-2 laptop:grid-cols-4 gap-4">
                        {[
                            { label: "Студенты", val: totalStudentsCount, icon: Users, color: "indigo", sub: "Активны: " + activeStudentsCount },
                            { label: "Посещаемость", val: avgAttendance + "%", icon: CalendarDays, color: "violet", sub: activePulse === 'logistics' ? "Updating..." : "Стабильно" },
                            { label: "Успеваемость", val: avgGrade, icon: TrendingUp, color: "emerald", sub: "Средний балл" },
                            { label: "Данные", val: attendance.length + grades.length, icon: Database, color: "rose", sub: "Записей в БД" }
                        ].map((kpi, idx) => (
                            <Card key={idx} className={cn(
                                "bg-zinc-900/40 border-white/5 backdrop-blur-sm relative overflow-hidden group hover:border-white/10 transition-all duration-500",
                                activePulse === (kpi.color === 'indigo' ? 'identity' : kpi.color === 'violet' ? 'logistics' : kpi.color === 'emerald' ? 'results' : 'content') && "ring-1 ring-indigo-500/50 scale-[1.02]"
                            )}>
                                <div className={cn(
                                    "absolute top-0 right-0 w-32 h-32 blur-[80px] -mr-16 -mt-16 opacity-20 pointer-events-none transition-opacity group-hover:opacity-40",
                                    kpi.color === 'indigo' ? "bg-indigo-500" :
                                        kpi.color === 'violet' ? "bg-violet-500" :
                                            kpi.color === 'emerald' ? "bg-emerald-500" : "bg-rose-500"
                                )} />
                                <CardHeader className="p-4 pb-0">
                                    <div className="flex items-center justify-between">
                                        <kpi.icon className={cn("h-4 w-4",
                                            kpi.color === 'indigo' ? "text-indigo-400" :
                                                kpi.color === 'violet' ? "text-violet-400" :
                                                    kpi.color === 'emerald' ? "text-emerald-400" : "text-rose-400"
                                        )} />
                                        <div className="h-1.5 w-1.5 rounded-full bg-white/10 group-hover:bg-white/30" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-2">{kpi.label}</p>
                                </CardHeader>
                                <CardContent className="p-4 pt-1">
                                    <div className="text-2xl font-black text-white tracking-tighter">{kpi.val}</div>
                                    <p className="text-[10px] font-medium text-zinc-600 mt-1 uppercase tracking-tighter truncate">{kpi.sub}</p>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Filters integrated into the grid for compactness */}
                        <div className="col-span-2 laptop:col-span-4 mt-2">
                            <ReportsFilters
                                groups={groups}
                                courses={courses}
                                teachers={teachers}
                                groupId={groupId}
                                onGroupChange={setGroupId}
                                courseId={courseId}
                                onCourseChange={setCourseId}
                                teacherId={teacherId}
                                onTeacherChange={setTeacherId}
                                dateRange={dateRange}
                                onDateRangeChange={setDateRange}
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-zinc-500">Загрузка аналитики...</div>
                ) : (
                    <>
                        {/* Chart Placeholders */}
                        <div className="grid md:grid-cols-1 laptop:grid-cols-2 gap-6">
                            <Card className="bg-zinc-900 border-zinc-800">
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium text-white flex gap-2 items-center">
                                        <BarChart className="h-4 w-4 text-indigo-400" /> Динамика посещаемости
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[200px] w-full flex items-end justify-between gap-2 px-2 pb-2">
                                        {[40, 60, 55, 70, 85, 80, 90, 88].map((h, i) => (
                                            <div key={i} className="w-full bg-indigo-500/20 hover:bg-indigo-500/40 rounded-t transition-all relative group" style={{ height: `${h}%` }}>
                                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">{h}%</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between text-xs text-zinc-500 px-2 mt-2">
                                        <span>Week 1</span>
                                        <span>Week 8</span>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-zinc-900 border-zinc-800">
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium text-white flex gap-2 items-center">
                                        <TrendingUp className="h-4 w-4 text-emerald-400" /> Успеваемость (Ср. балл)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[200px] w-full flex items-end justify-between gap-2 px-2 pb-2">
                                        {[75, 78, 80, 82, 81, 85, 84, 86].map((h, i) => (
                                            <div key={i} className="w-full bg-emerald-500/20 hover:bg-emerald-500/40 rounded-t transition-all relative group" style={{ height: `${h}%` }}>
                                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">{h}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between text-xs text-zinc-500 px-2 mt-2">
                                        <span>Week 1</span>
                                        <span>Week 8</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Tables Grid */}
                        <div className="grid grid-cols-1 laptop:grid-cols-2 gap-6">
                            <AttendanceReportTable data={attendanceReportData} />
                            <GradesReportTable data={gradesReportData} />
                        </div>

                        <div className="grid grid-cols-1">
                            <TeacherLoadTable data={teacherLoadData} />
                        </div>
                    </>
                )}
            </div>
        </ModuleGuard>
    );
}
