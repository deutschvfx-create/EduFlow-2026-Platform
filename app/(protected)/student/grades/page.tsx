'use client';

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, BookOpen, Calendar, TrendingUp, Search } from "lucide-react";
import { gradesRepo } from "@/lib/data/grades.repo";
import { GradeRecord, GradeType } from "@/lib/types/grades";
import { useAuth } from "@/components/auth/auth-provider";
import { useOrganization } from "@/hooks/use-organization";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { coursesRepo } from "@/lib/data/courses.repo";
import { Course } from "@/lib/types/course";

const GRADE_TYPE_LABELS: Record<GradeType, string> = {
    HOMEWORK: "Домашнее задание",
    QUIZ: "Тест",
    EXAM: "Экзамен",
    PROJECT: "Проект",
    PARTICIPATION: "Работа в классе"
};

const GRADE_TYPE_COLORS: Record<GradeType, string> = {
    HOMEWORK: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    QUIZ: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    EXAM: "bg-red-500/10 text-red-400 border-red-500/20",
    PROJECT: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    PARTICIPATION: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
};

export default function StudentGradesPage() {
    const { userData } = useAuth();
    const { currentOrganizationId } = useOrganization();
    const [grades, setGrades] = useState<GradeRecord[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!currentOrganizationId || !userData?.uid) return;

        setIsLoaded(false);
        let active = true;

        const loadCourses = async () => {
            const data = await coursesRepo.getAll(currentOrganizationId);
            if (active) setCourses(data);
        };

        loadCourses();

        const unsubscribe = gradesRepo.getAll(
            currentOrganizationId,
            (updated) => {
                if (active) {
                    setGrades(updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                    setIsLoaded(true);
                }
            },
            { studentId: userData.uid }
        );

        return () => {
            active = false;
            gradesRepo.unsubscribe(currentOrganizationId);
        };
    }, [currentOrganizationId, userData?.uid]);

    const filteredGrades = useMemo(() => {
        return grades.filter(g => {
            const courseName = courses.find(c => c.id === g.courseId)?.name || g.courseId;
            return courseName.toLowerCase().includes(search.toLowerCase()) ||
                GRADE_TYPE_LABELS[g.type].toLowerCase().includes(search.toLowerCase());
        });
    }, [grades, search, courses]);

    const stats = useMemo(() => {
        if (grades.length === 0) return { avg: 0, total: 0, exams: 0 };
        const graded = grades.filter(g => g.score !== undefined);
        const sum = graded.reduce((acc, g) => acc + (g.score || 0), 0);
        return {
            avg: graded.length > 0 ? Math.round(sum / graded.length) : 0,
            total: grades.length,
            exams: grades.filter(g => g.type === 'EXAM').length
        };
    }, [grades]);

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
                Загрузка оценок...
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 max-w-2xl mx-auto w-full pb-24">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <GraduationCap className="h-6 w-6 text-primary" />
                    Мои оценки
                </h1>
                <p className="text-muted-foreground text-sm">Ваша успеваемость в режиме реального времени</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                <Card className="bg-card border-border">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <TrendingUp className="h-4 w-4 text-emerald-400 mb-1" />
                        <div className="text-xl font-bold text-white">{stats.avg}</div>
                        <div className="text-[10px] text-muted-foreground uppercase font-medium">Ср. балл</div>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <BookOpen className="h-4 w-4 text-primary mb-1" />
                        <div className="text-xl font-bold text-white">{stats.total}</div>
                        <div className="text-[10px] text-muted-foreground uppercase font-medium">Всего</div>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <Calendar className="h-4 w-4 text-red-400 mb-1" />
                        <div className="text-xl font-bold text-white">{stats.exams}</div>
                        <div className="text-[10px] text-muted-foreground uppercase font-medium">Экзамены</div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Поиск по предмету или типу..."
                    className="bg-card border-border pl-10 h-11 text-foreground"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* List */}
            <div className="space-y-3">
                {filteredGrades.length > 0 ? (
                    filteredGrades.map((grade) => (
                        <Card key={grade.id} className="bg-card/50 border-border/50 overflow-hidden">
                            <CardContent className="p-4 flex gap-4 items-center">
                                <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-secondary border border-border/50 relative">
                                    <span className="text-xl font-bold text-white">{grade.score ?? '-'}</span>
                                    <span className="text-[8px] text-muted-foreground uppercase font-bold absolute bottom-2">балл</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-auto ${GRADE_TYPE_COLORS[grade.type]}`}>
                                            {GRADE_TYPE_LABELS[grade.type]}
                                        </Badge>
                                        <span className="text-[10px] text-muted-foreground">
                                            {format(new Date(grade.date), "d MMM yyyy", { locale: ru })}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-foreground truncate">
                                        {courses.find(c => c.id === grade.courseId)?.name || grade.courseId}
                                    </h3>
                                    {grade.comment && (
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">
                                            "{grade.comment}"
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12 text-muted-foreground bg-card/20 rounded-2xl border border-dashed border-border">
                        <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">Оценок пока нет</p>
                    </div>
                )}
            </div>

            {/* Bottom Spacer */}
            <div className="h-12" />
        </div>
    );
}
