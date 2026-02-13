'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Users, UserMinus, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface LessonAnalyticsProps {
    lessonId: string;
}

export function LessonAnalytics({ lessonId }: LessonAnalyticsProps) {
    // Mock analytics
    const stats = {
        presentCount: 14,
        totalCount: 18,
        absentCount: 4,
        lateCount: 2,
        attendanceRate: 78,
        habitualAbsentees: [
            { name: "Иванов Иван", count: 3 },
            { name: "Петров Петр", count: 2 }
        ]
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-[hsl(var(--foreground))] mb-4">Аналитика урока</h3>

            <div className="grid grid-cols-2 gap-4">
                <Card className="bg-white border-[hsl(var(--border))] shadow-sm rounded-2xl">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-emerald-50 rounded-lg">
                                <TrendingUp className="h-4 w-4 text-emerald-600" />
                            </div>
                            <span className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Посещаемость</span>
                        </div>
                        <div className="text-2xl font-black text-[hsl(var(--foreground))] mb-2">{stats.attendanceRate}%</div>
                        <Progress value={stats.attendanceRate} className="h-1.5 bg-[hsl(var(--secondary))]" />
                    </CardContent>
                </Card>

                <Card className="bg-white border-[hsl(var(--border))] shadow-sm rounded-2xl">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-amber-50 rounded-lg">
                                <Clock className="h-4 w-4 text-amber-600" />
                            </div>
                            <span className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Опоздания</span>
                        </div>
                        <div className="text-2xl font-black text-[hsl(var(--foreground))] mb-1">{stats.lateCount}</div>
                        <p className="text-[10px] text-[hsl(var(--muted-foreground))] font-medium">Студента сегодня</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#EF4444]">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Внимание</span>
                </div>

                <div className="space-y-2">
                    {stats.habitualAbsentees.map((absentee, i) => (
                        <div key={i} className="p-3 bg-red-50/50 border border-red-100 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-white border border-red-100 flex items-center justify-center text-[10px] font-bold text-red-600">
                                    {absentee.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <span className="text-sm font-bold text-[hsl(var(--foreground))]">{absentee.name}</span>
                            </div>
                            <div className="text-[10px] font-bold text-red-600 bg-white px-2 py-1 rounded-md border border-red-100">
                                {absentee.count} прогула подряд
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Card className="bg-[hsl(var(--secondary))] border-[hsl(var(--border))] border-dashed rounded-2xl">
                <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-[hsl(var(--foreground))]">{stats.presentCount} из {stats.totalCount} студентов</div>
                        <div className="text-[10px] text-[hsl(var(--muted-foreground))]">Отмечено на данный момент</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
