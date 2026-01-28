
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, Layers, BookOpen } from "lucide-react";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { useEffect, useState } from "react";
import { DashboardService } from "@/lib/services/firestore";
import { getStoredUser } from "@/lib/auth-helpers";
import { DollarSign, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
    const [stats, setStats] = useState({
        students: 0,
        teachers: 0,
        groups: 0,
        subjects: 0
    });

    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        async function fetchStats() {
            const data = await DashboardService.getStats();
            setStats(data);
        }
        fetchStats();
        setUser(getStoredUser());
    }, []);

    const isOwner = user?.role === 'OWNER' || user?.role === 'DIRECTOR';

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                    Дашборд
                </h1>
                <p className="text-zinc-400">Обзор ключевых показателей {isOwner ? 'вашей школы' : 'университета'}</p>
            </div>

            {isOwner && (
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800">
                        <Download className="h-4 w-4" />
                        Экспорт отчета
                    </Button>
                </div>
            )}

            <QuickActions />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Всего студентов</CardTitle>
                        <Users className="h-4 w-4 text-indigo-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.students}</div>
                        <p className="text-xs text-zinc-500 mt-1">Активных учащихся</p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Преподавателей</CardTitle>
                        <GraduationCap className="h-4 w-4 text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.teachers}</div>
                        <p className="text-xs text-zinc-500 mt-1">Штатных сотрудников</p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Групп</CardTitle>
                        <Layers className="h-4 w-4 text-cyan-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.groups}</div>
                        <p className="text-xs text-zinc-500 mt-1">Учебных потоков</p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Предметов</CardTitle>
                        <BookOpen className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.subjects}</div>
                        <p className="text-xs text-zinc-500 mt-1">Активных курсов</p>
                    </CardContent>
                </Card>

                {isOwner && (
                    <Card className="bg-zinc-900 border-zinc-800 border-l-emerald-500/30">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-400">Выручка (USD)</CardTitle>
                            <DollarSign className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-400">$12,450</div>
                            <p className="text-xs text-zinc-500 mt-1">+15% к плану</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Placeholder Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-zinc-900 border-zinc-800 h-96">
                    <CardHeader>
                        <CardTitle className="text-lg text-white">Динамика посещаемости</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center h-full pb-12">
                        <div className="text-zinc-500 text-sm border border-dashed border-zinc-700 rounded-lg p-8">
                            График будет доступен после начала учебного процесса
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800 h-96">
                    <CardHeader>
                        <CardTitle className="text-lg text-white">Успеваемость по факультетам</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center h-full pb-12">
                        <div className="text-zinc-500 text-sm border border-dashed border-zinc-700 rounded-lg p-8">
                            Нет данных для отображения
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
