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
import { IntelligenceMatrix } from "@/components/reports/intelligence-matrix";
import { LiveLedger, LedgerEvent } from "@/components/reports/live-ledger";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, BarChart, TrendingUp, CalendarDays, Activity, Globe, Database, Zap } from "lucide-react";
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

    // Derived Intelligence Matrix Data
    const matrixData = useMemo(() => {
        return attendanceReportData.map(att => {
            const gradeInfo = gradesReportData.find(g => g.student.id === att.student.id);
            return {
                id: att.student.id,
                student: att.student,
                attendance: att.presentPercentage,
                grade: gradeInfo?.averageScore || 0
            };
        });
    }, [attendanceReportData, gradesReportData]);

    // Derived Ledger Events
    const ledgerEvents = useMemo(() => {
        const events: LedgerEvent[] = [];

        attendance.slice(-10).forEach(record => {
            const student = students.find(s => s.id === record.studentId);
            if (!student) return;
            events.push({
                id: 'att-' + record.id,
                type: 'attendance',
                timestamp: new Date(record.date || Date.now()),
                title: 'Attendance Mark',
                description: `${student.lastName} marked as ${record.status}`,
                status: record.status === 'PRESENT' ? 'success' : record.status === 'ABSENT' ? 'danger' : 'warning'
            });
        });

        grades.slice(-10).forEach(record => {
            const student = students.find(s => s.id === record.studentId);
            if (!student) return;
            events.push({
                id: 'grd-' + record.id,
                type: 'grade',
                timestamp: new Date(record.date || Date.now()),
                title: 'New Grade Entry',
                description: `${student.lastName} received ${record.score}%`,
                status: (record.score || 0) > 70 ? 'success' : (record.score || 0) < 50 ? 'danger' : 'warning'
            });
        });

        return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 15);
    }, [attendance, grades, students]);


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
            <div className="space-y-6 max-w-[1600px] mx-auto p-4 laptop:p-6 pb-32">
                <div className="flex flex-col laptop:flex-row laptop:items-end justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Activity className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">System Analytics</span>
                        </div>
                        <h1 className="text-3xl laptop:text-4xl font-black tracking-tighter text-foreground">Отчёты</h1>
                        <p className="text-sm text-muted-foreground font-medium">Мониторинг образовательной экосистемы в реальном времени</p>
                    </div>

                    <div className="flex items-center gap-4 bg-background/80 border border-border px-4 py-2.5 rounded-2xl backdrop-blur-md shadow-2xl shadow-cyan-500/5">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Status</span>
                            <span className="text-xs font-black text-emerald-400 uppercase tracking-tighter">Connected</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <Globe className="h-5 w-5 text-emerald-500 animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Main Intelligence Grid */}
                <div className="grid grid-cols-1 tablet:grid-cols-12 gap-6 laptop:gap-8">
                    {/* Left Column: Visualizer & Matrix */}
                    <div className="tablet:col-span-6 laptop:col-span-5 space-y-6 laptop:space-y-8 order-2 tablet:order-1">
                        <div className="h-[300px] tablet:h-[350px] laptop:h-[400px]">
                            <DataFlowVisualizer activePulse={activePulse} />
                        </div>
                        <IntelligenceMatrix data={matrixData} />
                    </div>

                    {/* Right Column: KPIs & Ledger */}
                    <div className="tablet:col-span-6 laptop:col-span-7 flex flex-col gap-6 laptop:gap-8 order-1 tablet:order-2">
                        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
                            {[
                                { label: "Студенты", val: totalStudentsCount, icon: Users, color: "cyan", sub: "Активно: " + activeStudentsCount },
                                { label: "Посещаемость", val: avgAttendance + "%", icon: CalendarDays, color: "violet", sub: "Глобальный тренд" },
                                { label: "Успеваемость", val: avgGrade, icon: TrendingUp, color: "emerald", sub: "Средний балл" },
                                { label: "Телеметрия", val: attendance.length + grades.length, icon: Database, color: "rose", sub: "Записей в БД" }
                            ].map((kpi, idx) => (
                                <Card key={idx} className={cn(
                                    "bg-card/10 border-border backdrop-blur-3xl relative overflow-hidden group hover:border-border transition-all duration-700 h-[190px] rounded-[2.5rem]",
                                    activePulse === (kpi.color === 'cyan' ? 'identity' : kpi.color === 'violet' ? 'logistics' : kpi.color === 'emerald' ? 'results' : 'content') && "ring-2 ring-cyan-500/50 scale-[1.02] shadow-[0_0_50px_rgba(34,211,238,0.1)]"
                                )}>
                                    <div className={cn(
                                        "absolute top-0 right-0 w-64 h-64 blur-[120px] -mr-32 -mt-32 opacity-40 pointer-events-none transition-opacity duration-1000 group-hover:opacity-60",
                                        kpi.color === 'cyan' ? "bg-primary" :
                                            kpi.color === 'violet' ? "bg-violet-500" :
                                                kpi.color === 'emerald' ? "bg-emerald-500" : "bg-rose-500"
                                    )} />
                                    <CardHeader className="p-8 pb-0">
                                        <div className="flex items-center justify-between">
                                            <div className={cn("p-3 rounded-2xl border border-border bg-white/[0.03] shadow-inner",
                                                kpi.color === 'cyan' ? "text-primary" :
                                                    kpi.color === 'violet' ? "text-violet-400" :
                                                        kpi.color === 'emerald' ? "text-emerald-400" : "text-rose-400"
                                            )}>
                                                <kpi.icon className="h-5 w-5" />
                                            </div>
                                            {/* Sparkline Visual */}
                                            <div className="flex items-end gap-[2px] h-4 opacity-50 group-hover:opacity-50 transition-opacity">
                                                {Array.from({ length: 12 }).map((_, i) => (
                                                    <div key={i} className="w-[3px] bg-white rounded-full" style={{ height: `${20 + Math.random() * 80}%` }} />
                                                ))}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-8 pt-2">
                                        <div className="text-4xl font-black text-foreground tracking-tighter group-hover:translate-x-1 transition-transform duration-500">{kpi.val}</div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground leading-none">{kpi.label}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <LiveLedger events={ledgerEvents} />
                    </div>
                </div>

                <div className="grid grid-cols-1 tablet:grid-cols-12 gap-8 items-start">
                    <div className="tablet:col-span-4 laptop:col-span-3">
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
                    <div className="tablet:col-span-8 laptop:col-span-9 space-y-8">
                        <div className="grid grid-cols-1 laptop:grid-cols-2 gap-8">
                            <AttendanceReportTable data={attendanceReportData} />
                            <GradesReportTable data={gradesReportData} />
                        </div>
                    </div>
                </div>
            </div>
        </ModuleGuard>
    );
}
