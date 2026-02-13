'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GraduationCap, Award, Star, TrendingUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { GradeRecord, GradeType } from "@/lib/types/grades";
import { gradesRepo } from "@/lib/data/grades.repo";
import { useOrganization } from "@/hooks/use-organization";

interface LessonGradesProps {
    lessonId: string;
    studentId: string;
    courseId: string;
    groupId: string;
    studentName: string;
}

export function LessonGrades({
    lessonId,
    studentId,
    courseId,
    groupId,
    studentName
}: LessonGradesProps) {
    const { currentOrganizationId } = useOrganization();
    const [score, setScore] = useState<string>("");
    const [gradeType, setGradeType] = useState<GradeType>("PARTICIPATION");
    const [isSaving, setIsSaving] = useState(false);
    const [existingGrade, setExistingGrade] = useState<GradeRecord | null>(null);

    // Load existing grade for this student/lesson if any
    useEffect(() => {
        if (!currentOrganizationId) return;

        const loadGrade = async () => {
            const allGrades = await gradesRepo.getAll(currentOrganizationId, undefined, { studentId, courseId });
            // Filter locally for simplicity in this version, though repo should ideally handle it
            const lessonGrade = allGrades.find(g => g.comment?.includes(`[Lesson:${lessonId}]`));
            if (lessonGrade) {
                setExistingGrade(lessonGrade);
                setScore(lessonGrade.score?.toString() || "");
                setGradeType(lessonGrade.type);
            }
        };

        loadGrade();
    }, [currentOrganizationId, studentId, courseId, lessonId]);

    const handleSave = async () => {
        if (!currentOrganizationId || !score) return;
        setIsSaving(true);

        const scoreNum = parseInt(score);
        if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
            setIsSaving(false);
            return;
        }

        const grade: GradeRecord = {
            id: existingGrade?.id || `new-${Date.now()}`,
            organizationId: currentOrganizationId,
            studentId,
            courseId,
            groupId,
            type: gradeType,
            score: scoreNum,
            date: new Date().toISOString().split('T')[0],
            comment: existingGrade?.comment || `Grade for lesson [Lesson:${lessonId}]`,
            updatedAt: new Date().toISOString()
        };

        try {
            await gradesRepo.save(currentOrganizationId, grade);
            setExistingGrade(grade);
        } catch (error) {
            console.error("Failed to save grade:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const quickScores = [5, 10, 20, 50, 100];

    return (
        <Card className="bg-white border-[hsl(var(--border))] shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-cyan-50 rounded-xl">
                        <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-[hsl(var(--foreground))]">Оценка за урок: {studentName}</h4>
                        <p className="text-[10px] text-[hsl(var(--muted-foreground))] font-medium uppercase tracking-wider">Академическая активность</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Score Input */}
                    <div className="flex items-end gap-4">
                        <div className="flex-1 space-y-2">
                            <label className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider ml-1">Баллы (0-100)</label>
                            <Input
                                type="number"
                                value={score}
                                onChange={(e) => setScore(e.target.value)}
                                placeholder="85"
                                className="h-12 text-lg font-black bg-[hsl(var(--secondary))] border-none focus-visible:ring-cyan-500 rounded-xl"
                            />
                        </div>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving || !score}
                            className="h-12 px-8 bg-primary hover:bg-primary/90 text-foreground font-bold rounded-xl shadow-sm transition-all"
                        >
                            {isSaving ? "..." : "Оценить"}
                        </Button>
                    </div>

                    {/* Quick Selection */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider ml-1">Быстрые оценки</p>
                        <div className="flex flex-wrap gap-2">
                            {quickScores.map(s => (
                                <button
                                    key={s}
                                    onClick={() => setScore(s.toString())}
                                    className={cn(
                                        "h-10 w-14 rounded-xl border-2 font-black text-xs transition-all",
                                        score === s.toString()
                                            ? "border-primary bg-cyan-50 text-cyan-700"
                                            : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-cyan-200"
                                    )}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Grade Type */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setGradeType("PARTICIPATION")}
                            className={cn(
                                "p-3 rounded-xl border-2 flex flex-col gap-1 items-start transition-all",
                                gradeType === "PARTICIPATION" ? "border-primary bg-cyan-50" : "border-[hsl(var(--border))]"
                            )}
                        >
                            <Star className={cn("h-4 w-4", gradeType === "PARTICIPATION" ? "text-primary" : "text-muted-foreground")} />
                            <span className={cn("text-[10px] font-bold uppercase", gradeType === "PARTICIPATION" ? "text-cyan-700" : "text-[hsl(var(--muted-foreground))]")}>
                                Активность
                            </span>
                        </button>
                        <button
                            onClick={() => setGradeType("QUIZ")}
                            className={cn(
                                "p-3 rounded-xl border-2 flex flex-col gap-1 items-start transition-all",
                                gradeType === "QUIZ" ? "border-primary bg-cyan-50" : "border-[hsl(var(--border))]"
                            )}
                        >
                            <Award className={cn("h-4 w-4", gradeType === "QUIZ" ? "text-primary" : "text-muted-foreground")} />
                            <span className={cn("text-[10px] font-bold uppercase", gradeType === "QUIZ" ? "text-cyan-700" : "text-[hsl(var(--muted-foreground))]")}>
                                Тест
                            </span>
                        </button>
                    </div>

                    {/* Info Card */}
                    <div className="p-4 bg-cyan-50/50 rounded-2xl flex gap-3 border border-cyan-100">
                        <Info className="h-4 w-4 text-primary shrink-0" />
                        <p className="text-[10px] text-cyan-700 font-medium leading-relaxed">
                            Оценки, выставленные в журнале, автоматически попадают в ведомость успеваемости студента и влияют на его итоговый балл.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
