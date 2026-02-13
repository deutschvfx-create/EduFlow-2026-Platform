"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useOrganization } from "@/hooks/use-organization";
import { Mission, MissionQuestion, GameSession } from "@/lib/types/missions";
import { missionsRepo } from "@/lib/data/missions.repo";
import { gameSessionsRepo } from "@/lib/data/game-sessions.repo";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Zap,
    Clock,
    CheckCircle2,
    XCircle,
    Trophy,
    ChevronRight,
    Loader2,
    Crown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default async function GameEnginePage({ params }: { params: Promise<{ missionId: string }> }) {
    const { missionId } = await params;
    const { userData } = useAuth();
    const { currentOrganizationId } = useOrganization();
    const router = useRouter();

    const [mission, setMission] = useState<Mission | null>(null);
    const [loading, setLoading] = useState(true);
    const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'SUMMARY'>('START');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(20);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
    const [sessionAnswers, setSessionAnswers] = useState<any[]>([]);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (currentOrganizationId && missionId) {
            missionsRepo.getById(currentOrganizationId, missionId).then(m => {
                setMission(m);
                setLoading(false);
            });
        }
    }, [currentOrganizationId, missionId]);

    const startTimer = (seconds: number) => {
        setTimeLeft(seconds);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleAnswer(-1); // Time out
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleStart = () => {
        setGameState('PLAYING');
        setCurrentQuestionIndex(0);
        setScore(0);
        setSessionAnswers([]);
        startTimer(mission!.questions[0].timeLimitSeconds);
    };

    const handleAnswer = (index: number) => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (selectedOption !== null) return; // Prevent double clicks

        const question = mission!.questions[currentQuestionIndex];
        const isCorrect = index === question.correctAnswerIndex;
        const timeTaken = question.timeLimitSeconds - timeLeft;

        setSelectedOption(index);
        setIsAnswerCorrect(isCorrect);

        let pointsEarned = 0;
        if (isCorrect) {
            // Speed bonus: max points if answered in first 10% of time
            const speedMultiplier = timeLeft / question.timeLimitSeconds;
            pointsEarned = Math.round(question.points * (0.5 + 0.5 * speedMultiplier));
            setScore(prev => prev + pointsEarned);
        }

        setSessionAnswers(prev => [...prev, {
            questionId: question.id,
            selectedOptionIndex: index,
            isCorrect,
            timeTakenMs: timeTaken * 1000
        }]);

        // Small delay before next question
        setTimeout(() => {
            if (currentQuestionIndex < mission!.questions.length - 1) {
                const nextIdx = currentQuestionIndex + 1;
                setCurrentQuestionIndex(nextIdx);
                setSelectedOption(null);
                setIsAnswerCorrect(null);
                startTimer(mission!.questions[nextIdx].timeLimitSeconds);
            } else {
                handleFinish();
            }
        }, 1500);
    };

    const handleFinish = async () => {
        setGameState('SUMMARY');
        const session: GameSession = {
            id: uuidv4(),
            missionId: mission!.id,
            studentId: userData!.uid,
            organizationId: currentOrganizationId!,
            score,
            totalPossibleScore: mission!.questions.reduce((acc, q) => acc + q.points, 0),
            answers: sessionAnswers,
            completedAt: new Date().toISOString()
        };
        await gameSessionsRepo.save(currentOrganizationId!, session);
    };

    if (loading) return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-background gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-muted-foreground animate-pulse font-black uppercase tracking-widest text-xs">Подготовка арены...</p>
        </div>
    );

    if (gameState === 'START') {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full text-center space-y-8"
                >
                    <div className="h-24 w-24 mx-auto rounded-3xl bg-primary flex items-center justify-center shadow-2xl shadow-cyan-600/30">
                        <Zap className="h-12 w-12 text-white animate-bounce" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">{mission!.title}</h1>
                        <p className="text-muted-foreground">{mission!.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-card/50 p-4 rounded-2xl border border-border">
                            <Clock className="h-5 w-5 text-primary mx-auto mb-1" />
                            <p className="text-[10px] text-muted-foreground font-black uppercase">Быстрая игра</p>
                        </div>
                        <div className="bg-card/50 p-4 rounded-2xl border border-border">
                            <Trophy className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                            <p className="text-[10px] text-muted-foreground font-black uppercase">Мах баллы</p>
                        </div>
                    </div>

                    <Button
                        onClick={handleStart}
                        className="w-full h-16 bg-white hover:bg-secondary text-black font-black uppercase tracking-[0.3em] text-lg rounded-2xl shadow-2xl transition-all"
                    >
                        Начать Миссию
                    </Button>
                </motion.div>
            </div>
        );
    }

    if (gameState === 'SUMMARY') {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-6 overflow-hidden relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-[120px] rounded-full animate-pulse" />
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full text-center space-y-8 relative z-10"
                >
                    <div className="h-32 w-32 mx-auto rounded-full bg-emerald-500/10 border-4 border-emerald-500/50 flex items-center justify-center relative">
                        <Crown className="h-16 w-16 text-emerald-500" />
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 border-4 border-emerald-500 rounded-full opacity-50"
                        />
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em]">Миссия Выполнена</h2>
                        <h1 className="text-6xl font-black text-white italic tracking-tighter">+{score}</h1>
                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-2">{mission!.title}</p>
                    </div>

                    <div className="h-1 bg-card rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1.5 }}
                            className="h-full bg-emerald-500"
                        />
                    </div>

                    <Button
                        onClick={() => router.push("/student/games")}
                        className="w-full h-16 bg-card hover:bg-secondary text-white font-black uppercase tracking-[0.2em] rounded-2xl border border-border transition-all"
                    >
                        В Главное Меню
                    </Button>
                </motion.div>
            </div>
        );
    }

    const currentQuestion = mission!.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / mission!.questions.length) * 100;

    return (
        <div className="h-screen w-full flex flex-col bg-background p-4 md:p-8 overflow-hidden relative">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-8 z-10">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center">
                        <span className="text-xs font-black text-white">{currentQuestionIndex + 1}/{mission!.questions.length}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Текущий счет</span>
                        <span className="text-lg font-black text-emerald-400 leading-none">{score}</span>
                    </div>
                </div>

                <div className={`h-16 w-16 rounded-full border-4 flex items-center justify-center transition-colors ${timeLeft < 5 ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-primary bg-primary/10 text-white'}`}>
                    <span className="text-2xl font-black">{timeLeft}</span>
                </div>
            </div>

            <Progress value={progress} className="h-1.5 mb-12 bg-card z-10" color="bg-primary" />

            <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full z-10">
                <motion.h2
                    key={currentQuestion.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl md:text-4xl font-black text-center text-white mb-12 italic"
                >
                    {currentQuestion.question}
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQuestion.options.map((option, idx) => {
                        let bgColor = "bg-card hover:bg-secondary border-border";
                        let textColor = "text-foreground";

                        if (selectedOption !== null) {
                            if (idx === currentQuestion.correctAnswerIndex) {
                                bgColor = "bg-emerald-600 border-emerald-500 animate-pulse";
                                textColor = "text-white";
                            } else if (idx === selectedOption) {
                                bgColor = "bg-red-600 border-red-500";
                                textColor = "text-white";
                            } else {
                                bgColor = "bg-background border-border opacity-50";
                            }
                        }

                        return (
                            <motion.button
                                key={idx}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleAnswer(idx)}
                                disabled={selectedOption !== null}
                                className={`h-20 rounded-2xl border-2 flex items-center px-8 transition-all relative overflow-hidden group ${bgColor} ${textColor}`}
                            >
                                <span className="text-lg font-bold z-10">{option}</span>
                                {selectedOption !== null && idx === currentQuestion.correctAnswerIndex && (
                                    <CheckCircle2 className="absolute right-6 h-6 w-6 z-10" />
                                )}
                                {selectedOption === idx && idx !== currentQuestion.correctAnswerIndex && (
                                    <XCircle className="absolute right-6 h-6 w-6 z-10" />
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Background Decor */}
            <div className="absolute top-1/4 left-1/4 h-64 w-64 bg-primary/20 blur-[120px] -z-0" />
            <div className="absolute bottom-1/4 right-1/4 h-64 w-64 bg-purple-600/20 blur-[120px] -z-0" />
        </div>
    );
}
