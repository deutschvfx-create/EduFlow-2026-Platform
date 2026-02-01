'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, QrCode, GraduationCap, Loader2 } from "lucide-react"
import QRCode from "react-qr-code"
import { useState, useEffect } from "react"
import Link from "next/link";
import { Lesson } from "@/lib/types/schedule"
import { AttendanceRecord } from "@/lib/types/attendance"
import { attendanceRepo } from "@/lib/data/attendance.repo"
import { AttendanceStatusBadge } from "@/components/attendance/status-badge"
import { useAuth } from "@/components/auth/auth-provider";
import { useOrganization } from "@/hooks/use-organization";
import { Student } from "@/lib/types/student";

export default function StudentDashboard() {
    const { userData } = useAuth();
    const { currentOrganizationId } = useOrganization();

    const [student, setStudent] = useState<Student | null>(null);
    const [schedule, setSchedule] = useState<Lesson[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentOrganizationId && userData?.uid) {
            const loadData = async () => {
                const { studentsRepo } = await import("@/lib/data/students.repo");
                const studentData = await studentsRepo.getById(currentOrganizationId, userData.uid);
                setStudent(studentData);

                if (studentData) {
                    const { scheduleRepo } = await import("@/lib/data/schedule.repo");
                    const allLessons = await scheduleRepo.getAll(currentOrganizationId);
                    setSchedule(allLessons);

                    // Real-time Attendance
                    attendanceRepo.getAll(currentOrganizationId, (records) => {
                        const myAttendance = records.filter(r => r.studentId === userData.uid);
                        setAttendance(myAttendance);
                    }, { studentId: userData.uid });
                }
                setLoading(false);
            };
            loadData();
        }
    }, [currentOrganizationId, userData?.uid]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen text-zinc-500 gap-4">
            <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
            <p className="text-sm font-medium uppercase tracking-widest">Загрузка данных...</p>
        </div>
    );

    if (!student) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="text-2xl font-bold text-zinc-100 uppercase tracking-widest">Профиль не найден</div>
                <p className="text-zinc-500 text-sm">Пожалуйста, обратитесь к администратору.</p>
            </div>
        );
    }

    const todayLessons = student.groupIds?.[0]
        ? schedule.filter(l => l.groupId === student.groupIds[0]).slice(0, 3)
        : [];

    const getAttendanceStatus = (lessonId: string) => {
        const record = attendance.find(r => r.scheduleId === lessonId);
        return record?.status;
    };

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 min-h-[calc(100vh-4rem)] max-w-md mx-auto w-full">

            {/* 1. Header Logic: Profile & Status */}
            <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-indigo-500/20">
                    {student.firstName?.[0]}{student.lastName?.[0]}
                </div>
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-white leading-tight">
                        {student.firstName} {student.lastName}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-xs px-2 py-0.5 h-auto">
                            Студент
                        </Badge>
                        <Badge className={`${student.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'} border-none text-xs px-2 py-0.5 h-auto`}>
                            {student.status === 'ACTIVE' ? 'Активен' : 'Заблокирован'}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* 2. Central QR Card (Pass) */}
            <Card className="bg-gradient-to-b from-zinc-900 to-zinc-950 border-zinc-800 shadow-xl overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                <CardContent className="p-8 flex flex-col items-center justify-center gap-6">
                    <div className="bg-white p-4 rounded-2xl shadow-inner">
                        <QRCode
                            value={`student:${student.id}`}
                            size={180}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            viewBox={`0 0 256 256`}
                            fgColor="#000000"
                            bgColor="#ffffff"
                        />
                    </div>
                    <div className="text-center space-y-1">
                        <div className="text-zinc-500 text-[10px] uppercase tracking-widest font-black">Ваш ID</div>
                        <div className="font-mono text-xl text-zinc-300 tracking-wider font-bold">{student.id.toUpperCase()}</div>
                    </div>
                    <p className="text-[10px] text-zinc-600 text-center max-w-[200px] font-bold uppercase tracking-tight">
                        Покажите этот код преподавателю для отметки посещаемости
                    </p>
                </CardContent>
            </Card>

            <Link href="/student/grades">
                <Button variant="outline" className="w-full bg-zinc-900 border-zinc-800 text-zinc-300 gap-2 h-12 rounded-xl hover:bg-zinc-800 transition-all font-bold uppercase tracking-widest text-[10px]">
                    <GraduationCap className="h-4 w-4 text-indigo-400" />
                    Мои оценки
                </Button>
            </Link>

            {/* 3. Schedule List */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest">
                        <Calendar className="h-4 w-4 text-indigo-400" />
                        Сегодня в расписании
                    </h2>
                    <Button variant="ghost" size="sm" className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest h-8 hover:text-white">
                        Все
                    </Button>
                </div>

                <div className="space-y-3">
                    {todayLessons.length > 0 ? todayLessons.map((lesson) => (
                        <Card key={lesson.id} className="bg-zinc-900/50 border-zinc-800/50 active:scale-[0.98] transition-transform rounded-xl">
                            <CardContent className="p-4 flex gap-4 items-center">
                                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-zinc-800 text-zinc-300 font-black border border-zinc-700/50 text-xs">
                                    <span>{lesson.startTime}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-zinc-200 truncate text-sm">Предмет ID: {lesson.courseId.substring(0, 8)}</h3>
                                    <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-500 font-bold uppercase tracking-tight">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {lesson.room || '—'}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {lesson.duration || 90} мин
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    {getAttendanceStatus(lesson.id) ? (
                                        <AttendanceStatusBadge status={getAttendanceStatus(lesson.id)!} />
                                    ) : (
                                        <div className="h-2 w-2 rounded-full bg-zinc-700" />
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )) : (
                        <div className="text-center py-12 text-zinc-600 bg-zinc-900/10 rounded-2xl border border-dashed border-zinc-800">
                            <Calendar className="h-8 w-8 mx-auto mb-3 opacity-20" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Нет занятий на сегодня</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Spacer for Mobile Nav */}
            <div className="h-20" />
        </div >
    )
}
