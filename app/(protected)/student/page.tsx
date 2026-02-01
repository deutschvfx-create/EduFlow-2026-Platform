'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, QrCode } from "lucide-react"
import { MOCK_STUDENTS } from "@/lib/mock/students"
import { MOCK_SCHEDULE } from "@/lib/mock/schedule"
import QRCode from "react-qr-code"

// Mock config for current student and app settings, replacing missing "@/lib/data"
const CURRENT_STUDENT_ID = "s1";
const APP_CONFIG = { orgType: 'LanguageSchool' };

export default function StudentDashboard() {
    const rawStudent = MOCK_STUDENTS.find(s => s.id === CURRENT_STUDENT_ID) || MOCK_STUDENTS[0];

    // Extend raw student with UI helpers
    const student = {
        ...rawStudent,
        name: `${rawStudent.firstName} ${rawStudent.lastName}`,
        avatar: rawStudent.firstName[0] + rawStudent.lastName[0], // Mock avatar initials
    };

    const isLanguageSchool = APP_CONFIG.orgType === 'LanguageSchool';

    // Get Today's Schedule (Mock logic: showing all for now or filtering by "MON" to simulate today)
    const todayLessons = student.groupIds?.[0]
        ? MOCK_SCHEDULE.filter(l => l.groupId === student.groupIds[0]).slice(0, 3)
        : [];

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 min-h-[calc(100vh-4rem)] max-w-md mx-auto w-full">

            {/* 1. Header Logic: Profile & Status */}
            <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-indigo-500/20">
                    {student.avatar}
                </div>
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-white leading-tight">
                        {student.name}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-xs px-2 py-0.5 h-auto">
                            Студент
                        </Badge>
                        {isLanguageSchool && (
                            <Badge className={student.paymentStatus === 'OK' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs px-2 py-0.5 h-auto' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs px-2 py-0.5 h-auto'}>
                                {student.paymentStatus === 'OK' ? 'Оплачено' : 'Долг'}
                            </Badge>
                        )}
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
                        <div className="text-zinc-500 text-xs uppercase tracking-widest font-semibold">Ваш ID</div>
                        <div className="font-mono text-xl text-zinc-300 tracking-wider font-bold">{student.id.toUpperCase()}</div>
                    </div>
                    <p className="text-xs text-zinc-600 text-center max-w-[200px]">
                        Покажите этот код преподавателю или на ресепшн для отметки
                    </p>
                </CardContent>
            </Card>

            {/* 3. Schedule List */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-indigo-400" />
                        Расписание на сегодня
                    </h2>
                    <Button variant="ghost" size="sm" className="text-zinc-500 text-xs h-8 hover:text-white">
                        Все
                    </Button>
                </div>

                <div className="space-y-3">
                    {todayLessons.length > 0 ? todayLessons.map((lesson) => (
                        <Card key={lesson.id} className="bg-zinc-900/50 border-zinc-800/50 active:scale-[0.98] transition-transform">
                            <CardContent className="p-4 flex gap-4 items-center">
                                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-zinc-800 text-zinc-300 font-bold border border-zinc-700/50">
                                    <span className="text-sm">{lesson.startTime}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-zinc-200 truncate">Курс ID: {lesson.courseId}</h3>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {lesson.room}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            90 мин
                                        </div>
                                    </div>
                                </div>
                                <div className={`h-2 w-2 rounded-full ${lesson.status === 'PLANNED' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            </CardContent>
                        </Card>
                    )) : (
                        <div className="text-center py-8 text-zinc-500 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
                            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>Нет занятий на сегодня</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Spacer for Mobile Nav */}
            <div className="h-20" />
        </div>
    )
}
