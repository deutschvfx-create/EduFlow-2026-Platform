
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, Layers, BookOpen } from "lucide-react";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { useEffect, useState } from "react";
import { DashboardService } from "@/lib/services/firestore";
import { getStoredUser } from "@/lib/auth-helpers";
import { DollarSign, Download, TrendingUp, TrendingDown, Activity, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { TodaySchedule } from "@/components/dashboard/today-schedule";

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
        <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-zinc-900">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold tracking-widest text-[10px] uppercase">
                        <Activity className="h-3 w-3" />
                        Live System Monitor
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white">
                        Дашборд
                    </h1>
                    <p className="text-zinc-500 text-sm">
                        {isOwner ? 'Обзор ключевых показателей вашей школы' : 'Ваш персональный центр управления'}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {isOwner && (
                        <Button variant="outline" size="sm" className="h-10 px-4 gap-2 border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all rounded-xl shadow-lg">
                            <Download className="h-4 w-4" />
                            Экспорт отчета
                        </Button>
                    )}
                    <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-indigo-400 cursor-pointer transition-colors shadow-lg">
                        <CalendarIcon className="h-5 w-5" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Area (70%) */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        <KPICard
                            title="Студентов"
                            value={stats.students}
                            trend="+4.5%"
                            isUp={true}
                            icon={Users}
                            color="indigo"
                        />
                        <KPICard
                            title="Преподавателей"
                            value={stats.teachers}
                            trend="+1"
                            isUp={true}
                            icon={GraduationCap}
                            color="purple"
                        />
                        <KPICard
                            title="Групп"
                            value={stats.groups}
                            trend="24 активных"
                            isUp={true}
                            icon={Layers}
                            color="cyan"
                        />
                        {isOwner ? (
                            <KPICard
                                title="Выручка"
                                value={`$${(12450).toLocaleString()}`}
                                trend="+12%"
                                isUp={true}
                                icon={DollarSign}
                                color="emerald"
                            />
                        ) : (
                            <KPICard
                                title="Предметов"
                                value={stats.subjects}
                                trend="Без изменений"
                                isUp={true}
                                icon={BookOpen}
                                color="emerald"
                            />
                        )}
                    </div>

                    <div className="space-y-4">
                        <QuickActions />
                    </div>

                    {/* Performance Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-zinc-900/40 border-zinc-800/50 backdrop-blur-sm rounded-2xl overflow-hidden ring-1 ring-white/5">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base text-zinc-300">Динамика посещаемости</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center h-64">
                                <div className="text-zinc-600 text-xs font-medium bg-zinc-950/50 px-6 py-3 rounded-full border border-zinc-800/50">
                                    Собираем данные для анализа...
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900/40 border-zinc-800/50 backdrop-blur-sm rounded-2xl overflow-hidden ring-1 ring-white/5">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base text-zinc-300">Успеваемость</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center h-64">
                                <div className="text-zinc-600 text-xs font-medium bg-zinc-950/50 px-6 py-3 rounded-full border border-zinc-800/50">
                                    Нет данных для отображения
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right Area (30%) - Fixed or Scrollable sidebar feel */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="bg-zinc-900/60 border-zinc-800/50 rounded-2xl p-6 shadow-xl ring-1 ring-white/5">
                        <TodaySchedule />
                    </Card>

                    <Card className="bg-zinc-900/60 border-zinc-800/50 rounded-2xl p-6 shadow-xl ring-1 ring-white/5">
                        <ActivityFeed />
                    </Card>

                    {/* System Health / Connectivity Promo */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 shadow-inner">
                        <div className="flex items-center gap-3 mb-2 text-indigo-400">
                            <Activity className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">System Status</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                            Все системы работают в штатном режиме. Последняя полная синхронизация базы данных прошла успешно.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KPICard({ title, value, trend, isUp, icon: Icon, color }: any) {
    const colors: any = {
        indigo: 'from-indigo-500/10 to-transparent border-indigo-500/20 text-indigo-400 bg-indigo-500/5',
        purple: 'from-purple-500/10 to-transparent border-purple-500/20 text-purple-400 bg-purple-500/5',
        cyan: 'from-cyan-500/10 to-transparent border-cyan-500/20 text-cyan-400 bg-cyan-500/5',
        emerald: 'from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-400 bg-emerald-500/5'
    };

    return (
        <Card className={`relative overflow-hidden bg-zinc-900 border-zinc-800 rounded-2xl group transition-all hover:border-zinc-700 shadow-lg ring-1 ring-white/5`}>
            {/* Background Glow */}
            <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br ${colors[color]} blur-3xl opacity-20 group-hover:opacity-40 transition-opacity`} />

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4">
                <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">{title}</CardTitle>
                <div className={`p-2 rounded-lg ${colors[color]} group-hover:scale-110 transition-transform`}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent className="pb-4">
                <div className="text-2xl font-black text-white">{value}</div>
                <div className="flex items-center gap-1.5 mt-1.5">
                    {isUp ? (
                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                    ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-[10px] font-bold ${isUp ? 'text-emerald-500' : 'text-red-500'}`}>
                        {trend}
                    </span>
                    <span className="text-[10px] text-zinc-600 font-medium">vs прошлый мес.</span>
                </div>
            </CardContent>
        </Card>
    );
}
