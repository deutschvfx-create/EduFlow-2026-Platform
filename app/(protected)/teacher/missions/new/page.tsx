"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Plus,
    Trash2,
    Save,
    ChevronLeft,
    Zap,
    Clock,
    Trophy,
    CheckCircle2,
    Layout
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/auth/auth-provider";
import { useOrganization } from "@/hooks/use-organization";
import { Mission, MissionQuestion } from "@/lib/types/missions";
import { missionsRepo } from "@/lib/data/missions.repo";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function NewMissionPage() {
    const { userData } = useAuth();
    const { currentOrganizationId } = useOrganization();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [questions, setQuestions] = useState<MissionQuestion[]>([
        {
            id: uuidv4(),
            question: "",
            options: ["", "", "", ""],
            correctAnswerIndex: 0,
            timeLimitSeconds: 20,
            points: 1000
        }
    ]);

    const handleAddQuestion = () => {
        setQuestions([
            ...questions,
            {
                id: uuidv4(),
                question: "",
                options: ["", "", "", ""],
                correctAnswerIndex: 0,
                timeLimitSeconds: 20,
                points: 1000
            }
        ]);
    };

    const handleRemoveQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleUpdateQuestion = (index: number, field: keyof MissionQuestion, value: any) => {
        const newQuestions = [...questions];
        (newQuestions[index] as any)[field] = value;
        setQuestions(newQuestions);
    };

    const handleUpdateOption = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const handleSave = async () => {
        if (!title || questions.some(q => !q.question)) {
            alert("Пожалуйста, заполните название и все вопросы.");
            return;
        }

        const mission: Mission = {
            id: uuidv4(),
            organizationId: currentOrganizationId!,
            teacherId: userData!.uid,
            title,
            description,
            type: 'QUIZ',
            questions,
            status: 'PUBLISHED',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        try {
            await missionsRepo.save(currentOrganizationId!, mission);
            router.push("/teacher");
        } catch (err) {
            console.error(err);
            alert("Ошибка при сохранении игры.");
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link href="/teacher">
                        <Button variant="ghost" className="text-muted-foreground hover:text-white gap-2">
                            <ChevronLeft className="h-4 w-4" /> Назад
                        </Button>
                    </Link>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="border-border text-muted-foreground"
                            onClick={() => router.push("/teacher")}
                        >
                            Отмена
                        </Button>
                        <Button
                            className="bg-primary hover:bg-primary text-white gap-2"
                            onClick={handleSave}
                        >
                            <Save className="h-4 w-4" /> Опубликовать игру
                        </Button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Input
                            placeholder="Название вашей игры (напр. 'Викторина по Истории')"
                            className="text-3xl font-bold bg-transparent border-none border-b border-border rounded-none px-0 h-auto focus-visible:ring-0 focus-visible:border-primary transition-colors"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <Textarea
                            placeholder="Краткое описание для учеников..."
                            className="bg-card/50 border-border text-muted-foreground italic"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-border pb-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Layout className="h-5 w-5 text-primary" />
                                Список вопросов ({questions.length})
                            </h2>
                        </div>

                        <AnimatePresence>
                            {questions.map((q, qIndex) => (
                                <motion.div
                                    key={q.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                >
                                    <Card className="bg-card border-border overflow-hidden">
                                        <CardHeader className="bg-background/50 flex flex-row items-center justify-between py-3">
                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Вопрос #{qIndex + 1}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                                onClick={() => handleRemoveQuestion(qIndex)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </CardHeader>
                                        <CardContent className="p-6 space-y-4">
                                            <Input
                                                placeholder="Введите ваш вопрос здесь..."
                                                className="bg-background border-border text-lg font-bold h-14"
                                                value={q.question}
                                                onChange={(e) => handleUpdateQuestion(qIndex, 'question', e.target.value)}
                                            />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {q.options.map((opt, oIndex) => (
                                                    <div
                                                        key={oIndex}
                                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${q.correctAnswerIndex === oIndex
                                                            ? 'bg-emerald-500/10 border-emerald-500/30'
                                                            : 'bg-background/50 border-border'
                                                            }`}
                                                    >
                                                        <div
                                                            className={`h-6 w-6 rounded-full flex items-center justify-center cursor-pointer border-2 transition-colors ${q.correctAnswerIndex === oIndex
                                                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                                                : 'border-border text-transparent'
                                                                }`}
                                                            onClick={() => handleUpdateQuestion(qIndex, 'correctAnswerIndex', oIndex)}
                                                        >
                                                            <CheckCircle2 className="h-4 w-4" />
                                                        </div>
                                                        <Input
                                                            placeholder={`Вариант ${oIndex + 1}`}
                                                            className="bg-transparent border-none focus-visible:ring-0 p-0 text-foreground"
                                                            value={opt}
                                                            onChange={(e) => handleUpdateOption(qIndex, oIndex, e.target.value)}
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex items-center gap-6 pt-4 border-t border-border/50">
                                                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                                    <Clock className="h-4 w-4" />
                                                    Таймер:
                                                    <select
                                                        className="bg-secondary border-none rounded px-2 py-1 text-foreground"
                                                        value={q.timeLimitSeconds}
                                                        onChange={(e) => handleUpdateQuestion(qIndex, 'timeLimitSeconds', parseInt(e.target.value))}
                                                    >
                                                        <option value={10}>10 сек</option>
                                                        <option value={20}>20 сек</option>
                                                        <option value={30}>30 сек</option>
                                                        <option value={60}>1 мин</option>
                                                    </select>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                                    <Trophy className="h-4 w-4" />
                                                    Баллы:
                                                    <Input
                                                        type="number"
                                                        className="w-20 bg-secondary border-none h-8 text-foreground px-2"
                                                        value={q.points}
                                                        onChange={(e) => handleUpdateQuestion(qIndex, 'points', parseInt(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        <Button
                            variant="outline"
                            className="w-full h-16 border-dashed border-border hover:border-primary/50 hover:bg-primary/20 text-muted-foreground hover:text-primary rounded-2xl gap-2 transition-all"
                            onClick={handleAddQuestion}
                        >
                            <Plus className="h-5 w-5" /> Добавить еще один вопрос
                        </Button>
                    </div>
                </div>
            </div>

            <div className="h-20" />
        </div>
    );
}
