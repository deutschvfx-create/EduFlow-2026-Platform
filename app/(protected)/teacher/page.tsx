'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Check, X, Clock, AlertCircle, ArrowRight, Loader2, Scan, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { APP_CONFIG } from "@/lib/data"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useState, useEffect } from "react";

import { CreateGroupDialog } from "@/components/create-group-dialog"
import { useAuth } from "@/components/auth/auth-provider";
import { useOrganization } from "@/hooks/use-organization";
import { Group } from "@/lib/types/group";

function MyGroupsList() {
    const { userData } = useAuth();
    const { currentOrganizationId } = useOrganization();
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentOrganizationId && userData?.uid) {
            import("@/lib/data/groups.repo").then(async ({ groupsRepo }) => {
                const allGroups = await groupsRepo.getAll(currentOrganizationId);
                // Filter groups where this teacher is a curator
                const myGroups = allGroups.filter(g => g.curatorTeacherId === userData.uid);
                setGroups(myGroups);
                setLoading(false);
            });
        }
    }, [currentOrganizationId, userData?.uid]);

    if (loading) return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="animate-spin h-4 w-4" /> Загрузка групп...</div>

    if (!groups?.length) return <div className="text-muted-foreground">У вас пока нет активных групп.</div>

    return (
        <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
                {groups.map((g: any) => (
                    <Link key={g.id} href={`/app/groups/${g.id}`}>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border hover:border-primary/50 hover:bg-card transition-all cursor-pointer group">
                            <div>
                                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">{g.name}</h3>
                                <p className="text-xs text-muted-foreground">{g.code}</p>
                            </div>
                            <Button size="icon" variant="ghost" className="text-muted-foreground group-hover:text-primary">
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </Link>
                ))}
            </div>
        </ScrollArea>
    )
}

export default function TeacherDashboard() {
    const isUniversity = APP_CONFIG.orgType === 'University';

    return (
        <div className="p-6 md:p-8 space-y-6 bg-background min-h-screen text-foreground">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">
                        {isUniversity ? 'Преподавательская (Кафедра)' : 'Рабочее место учителя'}
                    </h1>
                    <p className="text-muted-foreground">
                        {isUniversity ? 'Журнал посещаемости и ведомости.' : 'Управляйте занятиями и заданиями.'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/teacher/scanner">
                        <Button variant="outline" className="gap-2 border-dashed">
                            <Scan className="h-4 w-4" />
                            <span className="hidden sm:inline">Сканер</span>
                        </Button>
                    </Link>
                    <CreateGroupDialog />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-card border-border md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-foreground">Мои Группы</CardTitle>
                        <CardDescription>Управление студентами и успеваемостью</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MyGroupsList />
                    </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-40 group-hover:opacity-50 transition-opacity">
                        <Zap className="h-20 w-20 text-primary" />
                    </div>
                    <CardHeader className="flex flex-row justify-between items-center relative z-10">
                        <div>
                            <CardTitle className="text-foreground flex items-center gap-2">
                                <Zap className="h-5 w-5 text-yellow-500 animate-pulse" />
                                EduMissions
                            </CardTitle>
                            <CardDescription>Создавайте квизы и игры типа Kahoot</CardDescription>
                        </div>
                        <Link href="/teacher/missions/new">
                            <Button size="sm" className="bg-primary hover:bg-primary text-white font-bold uppercase tracking-widest text-[10px]">
                                <Plus className="h-4 w-4 mr-1" /> Создать игру
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center min-h-[300px] border-t border-border/50 relative z-10">
                        <div className="relative mb-6">
                            <div className="bg-primary/20 w-48 h-32 rounded-2xl rotate-3 border border-primary/30 flex items-center justify-center shadow-2xl shadow-cyan-500/10">
                                <div className="bg-background/80 w-40 h-24 rounded-xl -rotate-6 border border-border flex items-center justify-center p-4 text-center">
                                    <span className="text-primary text-[10px] font-black uppercase tracking-tighter">Вопрос: Какой столица Германии?</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-muted-foreground text-sm font-medium">У вас пока нет активных миссий</p>
                        <p className="text-muted-foreground text-[10px] mt-1 uppercase tracking-widest font-bold">Начните с первого квиза</p>
                    </CardContent>
                </Card>
            </div>
        </div >
    )
}
