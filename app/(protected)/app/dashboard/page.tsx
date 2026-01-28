
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
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { AttendanceTrend, EnrollmentFunnel, RevenueRadial } from "@/components/dashboard/performance-charts";
import { StudentRetentionMatrix } from "@/components/dashboard/detailed-metrics";

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
                    <div className="flex items-center gap-2 text-indigo-400 font-bold tracking-widest text-[9px] uppercase">
                        <Activity className="h-2.5 w-2.5" />
                        Live Monitor
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white">
                        Дашборд
                    </h1>
                    <p className="text-zinc-500 text-sm">
                        {isOwner ? 'Обзор ключевых показателей вашей школы' : 'Ваш персональный центр управления'}
                    </p>
                </div>

                <div className="flex flex-1 max-w-md relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                    <Input
                        placeholder="Быстрый поиск по школе..."
                        className="h-9 pl-10 bg-zinc-950/50 border-zinc-800 focus:border-indigo-500/50 focus:ring-indigo-500/20 rounded-lg text-xs placeholder:text-zinc-700"
                    />
                </div>

                <div className="flex items-center gap-2">
                    {isOwner && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const toast = document.getElementById('dashboard-toast');
                                if (toast) {
                                    toast.classList.remove('hidden');
                                    setTimeout(() => toast.classList.add('hidden'), 3000);
                                }
                            }}
                            className="h-9 px-3 gap-2 border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all rounded-lg shadow-lg"
                        >
                            <Download className="h-4 w-4" />
                            <span className="text-xs">Экспорт</span>
                        </Button>
                    )}
                    <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-indigo-400 cursor-pointer transition-colors shadow-lg">
                        <CalendarIcon className="h-4 w-4" />
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

                    {/* Performance Section - Restored to simple style but nicer than before */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-zinc-900/40 border-zinc-800/50 backdrop-blur-sm rounded-2xl overflow-hidden ring-1 ring-white/5">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Динамика посещаемости</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center h-48">
                                <div className="text-zinc-600 text-xs font-medium bg-zinc-950/20 px-6 py-3 rounded-full border border-zinc-900/50">
                                    Анализ активности...
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900/40 border-zinc-800/50 backdrop-blur-sm rounded-2xl overflow-hidden ring-1 ring-white/5">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Успеваемость</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center h-48">
                                <div className="text-zinc-600 text-xs font-medium bg-zinc-950/20 px-6 py-3 rounded-full border border-zinc-900/50">
                                    Загрузка данных...
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

            {/* Hidden Toast Container */}
            <div id="dashboard-toast" className="hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-5">
                <div className="bg-zinc-800 text-white px-6 py-3 rounded-full shadow-2xl border border-zinc-700 flex items-center gap-4">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                        <Loader2 className="h-3 w-3 animate-spin" />
                    </div>
                    <span className="font-medium text-sm">Подготовка отчета PDF...</span>
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
        <Card className={`relative overflow-hidden bg-zinc-900/60 border-zinc-800 rounded-xl group transition-all hover:bg-zinc-900 hover:border-zinc-700/50 shadow-xl ring-1 ring-white/5 h-32`}>
            {/* Background Glow */}
            <div className={`absolute -right-2 -top-2 h-16 w-16 rounded-full bg-gradient-to-br ${colors[color]} blur-2xl opacity-10 group-hover:opacity-30 transition-opacity`} />

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-400 transition-colors">{title}</CardTitle>
                <div className={`p-1.5 rounded-lg border border-zinc-800/50 ${colors[color]} group-hover:scale-110 transition-transform shadow-lg shadow-black/40`}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>

            <CardContent className="px-4 pb-3">
                <div className="flex items-end justify-between gap-4">
                    <div className="space-y-1">
                        <div className="text-2xl font-black text-white tracking-tight leading-none">
                            {title === 'Выручка' ? '$' : ''}{value.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className={`flex items-center gap-0.5 text-[10px] font-bold ${isUp ? 'text-emerald-500' : 'text-red-500'} bg-zinc-950/50 px-1.5 py-0.5 rounded-md border border-zinc-800/50`}>
                                {isUp ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                                {trend}
                            </span>
                            <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">MoM Growth</span>
                        </div>
                    </div>

                    {/* Sparkline Visualization */}
                    <div className="h-10 w-20 relative overflow-hidden flex items-end">
                        <svg viewBox="0 0 100 40" className="w-full h-full opacity-40 group-hover:opacity-80 transition-opacity">
                            <motion.path
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.5, delay: 0.5 }}
                                d={isUp ? "M0,35 L20,30 L40,32 L60,20 L80,25 L100,5" : "M0,5 L20,15 L40,10 L60,25 L80,20 L100,35"}
                                fill="none"
                                stroke={isUp ? "#10b981" : "#ef4444"}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <defs>
                                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="2" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                            </defs>
                        </svg>
                    </div>
                </div>

                {/* Progress Bar - Tiny Detail */}
                <div className="mt-2 h-1 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/30">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: isUp ? "75%" : "30%" }}
                        className={`h-full ${isUp ? 'bg-emerald-500/40' : 'bg-red-500/40'}`}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
