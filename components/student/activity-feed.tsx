"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { gradesRepo } from "@/lib/data/grades.repo";
import { attendanceRepo } from "@/lib/data/attendance.repo";
import { useAuth } from "@/components/auth/auth-provider";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Award, CheckCircle, XCircle, Clock, BookOpen } from "lucide-react";

type ActivityItem = {
    id: string;
    type: 'grade' | 'attendance';
    title: string;
    subtitle: string;
    timestamp: string;
    value?: string | number;
    status?: 'success' | 'warning' | 'danger' | 'info';
};

export function ActivityFeed() {
    const { userData } = useAuth();
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userData?.uid || !userData?.organizationId) return;

        setLoading(true);

        const unsubs: (() => void)[] = [];

        // 1. Listen for Grades
        const unsubGrades = gradesRepo.getAll(
            userData.organizationId,
            (grades) => {
                const gradeActivities: ActivityItem[] = grades
                    .filter(g => g.studentId === userData.uid)
                    .map(g => ({
                        id: `grade-${g.id}`,
                        type: 'grade',
                        title: "Получена оценка",
                        subtitle: g.courseId, // ideally Course Name
                        timestamp: g.date,
                        value: g.score,
                        status: 'success'
                    }));

                updateMergedFeed(gradeActivities, 'grade');
            },
            { studentId: userData.uid }
        );

        // 2. Listen for Attendance
        const unsubAttendance = attendanceRepo.getAll(
            userData.organizationId,
            (records) => {
                const attendanceActivities: ActivityItem[] = records
                    .filter(r => r.studentId === userData.uid)
                    .map(r => ({
                        id: `att-${r.id}`,
                        type: 'attendance',
                        title: r.status === 'PRESENT' ? "Вы отмечены" : "Пропуск занятия",
                        subtitle: "Посещаемость",
                        timestamp: r.date || new Date().toISOString(),
                        value: r.status === 'PRESENT' ? 'Присутствовал' : 'Отсутствовал',
                        status: r.status === 'PRESENT' ? 'success' : 'danger'
                    }));

                updateMergedFeed(attendanceActivities, 'attendance');
            },
            { studentId: userData.uid }
        );

        const updateMergedFeed = (newItems: ActivityItem[], type: 'grade' | 'attendance') => {
            setActivities(prev => {
                const filtered = prev.filter(item => item.type !== type);
                const next = [...filtered, ...newItems].sort((a, b) =>
                    new Date(b.timestamp || "").getTime() - new Date(a.timestamp || "").getTime()
                );
                return next.slice(0, 20); // Keep last 20
            });
            setLoading(false);
        };

        return () => {
            if (userData?.organizationId) {
                gradesRepo.unsubscribe(userData.organizationId);
                attendanceRepo.unsubscribe(userData.organizationId);
            }
        };
    }, [userData?.uid, userData?.organizationId]);

    if (loading) return (
        <div className="space-y-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-20 w-full animate-pulse bg-card/50 rounded-2xl" />
            ))}
        </div>
    );

    if (activities.length === 0) return (
        <div className="text-center py-20 bg-card/10 rounded-3xl border border-dashed border-border/50">
            <Clock className="h-10 w-10 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Активности пока нет</p>
        </div>
    );

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Последние события</h3>
                <Badge variant="outline" className="text-[9px] bg-primary/5 text-primary border-primary/20">{activities.length}</Badge>
            </div>

            <div className="space-y-3">
                {activities.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card className="bg-card/50 border-border/50 hover:bg-secondary/40 transition-colors rounded-2xl overflow-hidden group">
                            <CardContent className="p-4 flex gap-4 items-center">
                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${item.type === 'grade' ? 'bg-primary/10 text-primary' :
                                    item.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                    }`}>
                                    {item.type === 'grade' ? <Award className="h-6 w-6" /> :
                                        item.status === 'success' ? <CheckCircle className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-foreground text-sm leading-tight">{item.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-muted-foreground text-[10px] font-bold uppercase truncate max-w-[120px]">
                                            {item.subtitle}
                                        </p>
                                        <span className="text-[10px] text-muted-foreground/50">•</span>
                                        <p className="text-[10px] text-muted-foreground/50 font-medium">
                                            {format(new Date(item.timestamp), "d MMM, HH:mm", { locale: ru })}
                                        </p>
                                    </div>
                                </div>

                                {item.value && (
                                    <div className="text-right shrink-0">
                                        <div className="text-lg font-black text-white">{item.value}</div>
                                        <div className="text-[8px] text-muted-foreground uppercase font-black tracking-widest">
                                            {item.type === 'grade' ? 'балл' : 'статус'}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
