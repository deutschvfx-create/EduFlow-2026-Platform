"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Zap,
    Trophy,
    Play,
    Clock,
    CheckCircle2,
    Gamepad2,
    Calendar,
    ArrowRight,
    Loader2,
    Layout,
    Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { useOrganization } from "@/hooks/use-organization";
import { Mission, GameSession } from "@/lib/types/missions";
import { missionsRepo } from "@/lib/data/missions.repo";
import { gameSessionsRepo } from "@/lib/data/game-sessions.repo";
import { Badge } from "@/components/ui/badge";

export default function StudentGamesPage() {
    const { userData } = useAuth();
    const { currentOrganizationId } = useOrganization();

    const [missions, setMissions] = useState<Mission[]>([]);
    const [history, setHistory] = useState<GameSession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentOrganizationId && userData?.uid) {
            const loadData = async () => {
                const [allMissions, userHistory] = await Promise.all([
                    missionsRepo.getAll(currentOrganizationId),
                    gameSessionsRepo.getStudentHistory(currentOrganizationId, userData.uid)
                ]);
                setMissions(allMissions);
                setHistory(userHistory);
                setLoading(false);
            };
            loadData();
        }
    }, [currentOrganizationId, userData?.uid]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground gap-4">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
            <p className="text-xs font-black uppercase tracking-[0.3em]">Загрузка игровых данных...</p>
        </div>
    );

    const totalPoints = history.reduce((acc, curr) => acc + curr.score, 0);

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto pb-24">
            {/* Player Stats Profile */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-br from-cyan-900/20 to-transparent p-8 rounded-3xl border border-primary/10">
                <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/20">
                        <Trophy className="h-10 w-10 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-white tracking-widest uppercase italic">Игровой Центр</h1>
                            <Badge className="bg-amber-500/20 text-amber-500 border-none text-[10px] font-black uppercase">Level Up</Badge>
                        </div>
                        <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest mt-1">Твое приключение в учебе начинается здесь</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="bg-card/50 p-4 rounded-2xl border border-border text-center min-w-[120px]">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Всего баллов</p>
                        <p className="text-2xl font-black text-emerald-400">{totalPoints.toLocaleString()}</p>
                    </div>
                    <div className="bg-card/50 p-4 rounded-2xl border border-border text-center min-w-[120px]">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Игр сыграно</p>
                        <p className="text-2xl font-black text-white">{history.length}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Missions */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest">
                        <Gamepad2 className="h-4 w-4 text-primary" />
                        Доступные миссии
                    </h2>

                    {missions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {missions.map((mission) => {
                                const isPlayed = history.some(h => h.missionId === mission.id);
                                return (
                                    <Card key={mission.id} className="bg-background/60 border-border overflow-hidden group hover:border-primary/30 transition-all duration-300">
                                        <CardHeader className="pb-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge variant="outline" className="border-primary/20 text-primary bg-primary/20 text-[9px] font-black uppercase tracking-tighter">
                                                    {mission.type}
                                                </Badge>
                                                {isPlayed && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                                            </div>
                                            <CardTitle className="text-lg font-black text-white tracking-tight">{mission.title}</CardTitle>
                                            <CardDescription className="text-xs text-muted-foreground line-clamp-2">{mission.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-6">
                                                <div className="flex items-center gap-1.5">
                                                    <Layout className="h-3 w-3" />
                                                    {mission.questions.length} вопросов
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="h-3 w-3" />
                                                    ~{Math.ceil(mission.questions.length * 0.5)} мин
                                                </div>
                                            </div>
                                            <Link href={`/app/play/${mission.id}`}>
                                                <Button className="w-full bg-white hover:bg-secondary text-black font-black uppercase tracking-[0.2em] h-12 rounded-xl group-hover:scale-[1.02] transition-transform">
                                                    Играть <Play className="h-3 w-3 ml-2 fill-current" />
                                                </Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-card/20 rounded-3xl border-2 border-dashed border-border">
                            <Zap className="h-10 w-10 text-zinc-800 mx-auto mb-4" />
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Новых миссий пока нет</p>
                        </div>
                    )}
                </div>

                {/* History & Leaderboard */}
                <div className="space-y-6">
                    <h2 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest">
                        <Activity className="h-4 w-4 text-emerald-400" />
                        Последние победы
                    </h2>

                    <Card className="bg-background/60 border-border backdrop-blur-xl">
                        <CardContent className="p-4 space-y-4">
                            {history.length > 0 ? history.slice(0, 5).map((session) => (
                                <div key={session.id} className="flex items-center justify-between p-3 bg-card/30 rounded-xl border border-border/50 hover:bg-card/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                            <Trophy className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-white uppercase tracking-tighter">Миссия Завершена</p>
                                            <p className="text-[9px] text-muted-foreground font-bold uppercase">{new Date(session.completedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-black text-emerald-400">+{session.score}</p>
                                </div>
                            )) : (
                                <p className="text-[10px] text-muted-foreground text-center py-10 uppercase font-black italic">История пуста</p>
                            )}
                            <Button variant="ghost" className="w-full text-muted-foreground text-[10px] font-black uppercase tracking-widest hover:text-white">
                                Показать всё <ArrowRight className="h-3 w-3 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
