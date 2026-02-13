'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, GraduationCap, Calendar, AlertTriangle, Award, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CourseAnalyticsProps {
    courseId: string;
}

export function CourseAnalytics({ courseId }: CourseAnalyticsProps) {
    // Mock data - in production, fetch from Firestore/API
    const analytics = {
        averageGrade: 7.8,
        gradeChange: +0.3,
        attendanceRate: 87,
        attendanceChange: -2,
        totalStudents: 124,
        activeStudents: 118,
        failureRate: 8.5,
        passRate: 91.5,
        teacherLoad: {
            primary: { name: "Иванов И.И.", hours: 42, load: "Высокая" },
            assistants: 2,
            totalHours: 56
        },
        recentExams: [
            { title: "Промежуточный экзамен", date: "2026-01-15", avgScore: 8.2, passRate: 94 },
            { title: "Контрольная работа №2", date: "2026-01-08", avgScore: 7.5, passRate: 89 },
            { title: "Контрольная работа №1", date: "2025-12-20", avgScore: 7.9, passRate: 92 }
        ],
        gradeDistribution: [
            { grade: "10", count: 8, percentage: 6.5 },
            { grade: "9", count: 15, percentage: 12.1 },
            { grade: "8", count: 32, percentage: 25.8 },
            { grade: "7", count: 28, percentage: 22.6 },
            { grade: "6", count: 20, percentage: 16.1 },
            { grade: "5", count: 11, percentage: 8.9 },
            { grade: "<5", count: 10, percentage: 8.1 }
        ]
    };

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Average Grade */}
                <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-primary/20">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-primary/20 rounded-lg">
                                <Award className="h-5 w-5 text-primary" />
                            </div>
                            <Badge variant="outline" className={`${analytics.gradeChange >= 0 ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                                {analytics.gradeChange >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                {analytics.gradeChange >= 0 ? '+' : ''}{analytics.gradeChange}
                            </Badge>
                        </div>
                        <div className="text-3xl font-bold text-foreground mb-1">{analytics.averageGrade}</div>
                        <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Средний балл</div>
                    </CardContent>
                </Card>

                {/* Attendance */}
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Calendar className="h-5 w-5 text-blue-400" />
                            </div>
                            <Badge variant="outline" className={`${analytics.attendanceChange >= 0 ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
                                {analytics.attendanceChange >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                {analytics.attendanceChange >= 0 ? '+' : ''}{analytics.attendanceChange}%
                            </Badge>
                        </div>
                        <div className="text-3xl font-bold text-foreground mb-1">{analytics.attendanceRate}%</div>
                        <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Посещаемость</div>
                    </CardContent>
                </Card>

                {/* Students */}
                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <Users className="h-5 w-5 text-purple-400" />
                            </div>
                            <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                {analytics.activeStudents} активных
                            </Badge>
                        </div>
                        <div className="text-3xl font-bold text-foreground mb-1">{analytics.totalStudents}</div>
                        <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Студентов</div>
                    </CardContent>
                </Card>

                {/* Pass Rate */}
                <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <GraduationCap className="h-5 w-5 text-green-400" />
                            </div>
                            <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/30">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {analytics.failureRate}% неуд.
                            </Badge>
                        </div>
                        <div className="text-3xl font-bold text-foreground mb-1">{analytics.passRate}%</div>
                        <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Успеваемость</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Grade Distribution */}
                <Card className="bg-card/30 border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg text-foreground">Распределение оценок</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {analytics.gradeDistribution.map((item) => (
                                <div key={item.grade} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground font-medium">Оценка {item.grade}</span>
                                        <span className="text-foreground">{item.count} студентов ({item.percentage}%)</span>
                                    </div>
                                    <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full transition-all duration-500"
                                            style={{ width: `${item.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Exams */}
                <Card className="bg-card/30 border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg text-foreground">Последние экзамены</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {analytics.recentExams.map((exam, idx) => (
                                <div key={idx} className="p-3 bg-secondary/30 rounded-lg border border-border/50">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="font-medium text-foreground text-sm">{exam.title}</div>
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                {new Date(exam.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 text-xs">
                                            {exam.avgScore}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span>Успеваемость: <span className="text-foreground font-medium">{exam.passRate}%</span></span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Teacher Workload */}
            <Card className="bg-card/30 border-border/50">
                <CardHeader>
                    <CardTitle className="text-lg text-foreground">Нагрузка преподавателей</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-secondary/30 rounded-lg border border-border/50">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-primary/20 rounded-lg">
                                    <GraduationCap className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-foreground">{analytics.teacherLoad.primary.name}</div>
                                    <div className="text-xs text-muted-foreground">Основной преподаватель</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-2xl font-bold text-foreground">{analytics.teacherLoad.primary.hours}ч</div>
                                <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {analytics.teacherLoad.primary.load}
                                </Badge>
                            </div>
                        </div>

                        <div className="p-4 bg-secondary/30 rounded-lg border border-border/50">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Users className="h-5 w-5 text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-foreground">Ассистенты</div>
                                    <div className="text-xs text-muted-foreground">Вспомогательные преподаватели</div>
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-foreground">{analytics.teacherLoad.assistants}</div>
                        </div>

                        <div className="p-4 bg-secondary/30 rounded-lg border border-border/50">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                    <Clock className="h-5 w-5 text-purple-400" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-foreground">Всего часов</div>
                                    <div className="text-xs text-muted-foreground">Общая нагрузка по курсу</div>
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-foreground">{analytics.teacherLoad.totalHours}ч</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Empty State Notice */}
            <div className="text-center py-8 text-muted-foreground text-sm">
                <p>📊 Данные обновляются автоматически на основе оценок и посещаемости</p>
                <p className="text-xs text-muted-foreground mt-1">Для полной аналитики требуется интеграция с модулями Grades и Attendance</p>
            </div>
        </div>
    );
}
