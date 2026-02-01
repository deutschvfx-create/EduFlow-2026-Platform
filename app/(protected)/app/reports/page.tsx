'use client';

import { useState, useMemo } from "react";
import { MOCK_STUDENTS } from "@/lib/mock/students";
import { MOCK_TEACHERS } from "@/lib/mock/teachers";
import { MOCK_GROUPS_FULL } from "@/lib/mock/groups";
import { MOCK_COURSES } from "@/lib/mock/courses";
import { MOCK_ATTENDANCE } from "@/lib/mock/attendance";
import { MOCK_GRADES } from "@/lib/mock/grades";
import { MOCK_SCHEDULE } from "@/lib/mock/schedule";

import { ReportsFilters } from "@/components/reports/reports-filters";
import { AttendanceReportTable } from "@/components/reports/attendance-report-table";
import { GradesReportTable } from "@/components/reports/grades-report-table";
import { TeacherLoadTable } from "@/components/reports/teacher-load-table";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, BarChart, TrendingUp, CalendarDays } from "lucide-react";
import { ModuleGuard } from "@/components/system/module-guard";

export default function ReportsPage() {
    // Filters State
    const [groupId, setGroupId] = useState("all");
    const [courseId, setCourseId] = useState("all");
    const [teacherId, setTeacherId] = useState("all");
    const [dateRange, setDateRange] = useState("week");

    // 1. Attendance Report Logic
    const attendanceReportData = useMemo(() => {
        // Filter students by group
        const filteredStudents = MOCK_STUDENTS.filter(s => groupId === 'all' || s.groupIds?.includes(groupId));

        return filteredStudents.map(student => {
            // Get records for student
            const records = MOCK_ATTENDANCE.filter(r => r.studentId === student.id);
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
    }, [groupId]);

    // 2. Grades Report Logic
    const gradesReportData = useMemo(() => {
        const filteredStudents = MOCK_STUDENTS.filter(s => groupId === 'all' || s.groupIds?.includes(groupId));

        return filteredStudents.map(student => {
            const grades = MOCK_GRADES.filter(g => g.studentId === student.id && (courseId === 'all' || g.courseId === courseId));
            const count = grades.length;
            const avg = count > 0 ? Math.round(grades.reduce((acc, curr) => acc + (curr.score || 0), 0) / count) : 0;
            const lastDate = count > 0 ? grades.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date : null;

            return {
                student,
                averageScore: avg,
                lastGradeDate: lastDate,
                gradesCount: count
            }
        });
    }, [groupId, courseId]);

    // 3. Teacher Load Logic
    const teacherLoadData = useMemo(() => {
        const filteredTeachers = MOCK_TEACHERS.filter(t => teacherId === 'all' || t.id === teacherId);

        return filteredTeachers.map(teacher => {
            // Calculate groups from courses
            const courses = MOCK_COURSES.filter(c => c.teacherIds.includes(teacher.id));
            const groupsCount = new Set(courses.flatMap(c => c.groupIds)).size;
            // Mock hours per week based on schedule
            const lessons = MOCK_SCHEDULE.filter(l => l.teacherId === teacher.id);
            // Assume each lesson is 1.5h
            const hours = lessons.length * 1.5;

            return {
                teacher,
                groupsCount,
                coursesCount: courses.length,
                hoursPerWeek: hours
            }
        });
    }, [teacherId]);


    // KPI Stats (Global or Filtered?) -> Let's do Global + Filter Context mix
    const totalStudents = MOCK_STUDENTS.length;
    const activeStudents = MOCK_STUDENTS.filter(s => s.status === 'ACTIVE').length;

    // Avg Attendance Global (Mock)
    const avgAttendance = 88; // Placeholder

    // Avg Grade Global (Mock)
    const avgGrade = 82; // Placeholder

    return (
        <ModuleGuard module="reports">
            <div className="space-y-6">
                <div className="hidden laptop:flex flex-col gap-2" data-help-id="reports-header">
                    <h1 className="text-3xl font-bold tracking-tight text-white">Отчёты</h1>
                    <p className="text-zinc-400">Аналитика по студентам, группам и преподавателям</p>
                </div>

                {/* KPI Cards */}
                <div className="grid gap-4 md:grid-cols-2 laptop:grid-cols-4">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">Всего студентов</CardTitle>
                            <Users className="h-4 w-4 text-zinc-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{totalStudents}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-400">Активные</CardTitle>
                            <UserCheck className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{activeStudents}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-indigo-400">Ср. Посещаемость</CardTitle>
                            <CalendarDays className="h-4 w-4 text-indigo-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{avgAttendance}%</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-amber-400">Ср. Балл</CardTitle>
                            <TrendingUp className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{avgGrade}</div>
                        </CardContent>
                    </Card>
                </div>

                <ReportsFilters
                    groupId={groupId}
                    onGroupChange={setGroupId}
                    courseId={courseId}
                    onCourseChange={setCourseId}
                    teacherId={teacherId}
                    onTeacherChange={setTeacherId}
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                />

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
            </div>
        </ModuleGuard>
    );
}
