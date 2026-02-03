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
import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useOrganization } from "@/hooks/use-organization";

export default function DashboardPage() {
    const [stats, setStats] = useState({
        students: 0,
        teachers: 0,
        groups: 0,
        subjects: 0
    });

    const [user, setUser] = useState<any>(null);

    const { currentOrganizationId } = useOrganization();

    useEffect(() => {
        async function fetchStats() {
            if (!currentOrganizationId) return;
            const data = await DashboardService.getStats(currentOrganizationId);
            setStats(data);
        }
        fetchStats();
        setUser(getStoredUser());
    }, [currentOrganizationId]);

    const isOwner = user ? (user.role === 'OWNER' || user.role === 'DIRECTOR') : false;

    return (
        <div className="max-w-[1600px] mx-auto space-y-4 laptop:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 laptop:gap-6 pb-2 border-b border-zinc-900" data-help-id="dashboard-header">
                <div className="space-y-1 hidden laptop:block">
                    <div className="hidden laptop:flex items-center gap-2 text-indigo-400 font-bold tracking-widest text-[9px] uppercase">
                        <Activity className="h-2.5 w-2.5" />
                        Live Monitor
                    </div>
                    <h1 className="text-2xl laptop:text-4xl font-extrabold tracking-tight text-white">
                        Дашборд
                    </h1>
                    <p className="text-zinc-500 text-xs laptop:text-sm hidden laptop:block">
                        {isOwner ? 'Обзор ключевых показателей вашей школы' : 'Ваш персональный центр управления'}
                    </p>
                </div>

                <div className="hidden tablet:flex flex-1 max-w-sm laptop:max-w-md relative group" data-help-id="dashboard-search">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                    <Input
                        placeholder="Быстрый поиск по школе..."
                        className="h-9 pl-10 bg-zinc-950/50 border-zinc-800 focus:border-indigo-500/50 focus:ring-indigo-500/20 rounded-lg text-xs placeholder:text-zinc-700"
                    />
                </div>

                <div className="hidden laptop:flex items-center gap-2">
                    {isOwner && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 px-3 gap-2 border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all rounded-lg shadow-lg"
                                >
                                    <Download className="h-4 w-4" />
                                    <span className="text-xs">Экспорт</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-900 p-0 overflow-hidden">
                                <FeaturePlaceholder
                                    featureName="Продвинутая Финансовая Отчетность"
                                    plannedFeatures={[
                                        "Генерация детализированных PDF отчетов о доходах",
                                        "Автоматическая рассылка бухгалтеру по расписанию",
                                        "Экспорт данных в Excel и 1C",
                                        "Графики прибыли с учетом операционных расходов",
                                        "Прогноз кассовых разрывов на базе AI"
                                    ]}
                                    benefits={[
                                        "Сокращение времени на подготовку отчетов",
                                        "Исключение ошибок человеческого фактора",
                                        "Данные для принятия стратегических решений всегда под рукой"
                                    ]}
                                />
                            </DialogContent>
                        </Dialog>
                    )}
                    <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-indigo-400 cursor-pointer transition-colors shadow-lg">
                        <CalendarIcon className="h-4 w-4" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 tablet:grid-cols-12 gap-6 laptop:gap-8">
                {/* Left Area (70%) */}
                <div className="tablet:col-span-8 space-y-6 laptop:space-y-8">
                    {/* Stats Grid - 2 columns on mobile, 3 on tablet, 4 on laptop+ */}
                    <div className="grid grid-cols-2 tablet:grid-cols-3 laptop:grid-cols-4 gap-3 laptop:gap-4" data-help-id="dashboard-stats">
                        <KPICard
                            title="Студентов"
                            value={stats.students}
                            trend="+4.5%"
                            isUp={true}
                            icon={Users}
                            color="indigo"
                            helpId="dashboard-stat-students"
                        />
                        <KPICard
                            title="Преподавателей"
                            value={stats.teachers}
                            trend="+1"
                            isUp={true}
                            icon={GraduationCap}
                            color="purple"
                            helpId="dashboard-stat-teachers"
                        />
                        <KPICard
                            title="Группы"
                            value={stats.groups}
                            trend="24 активных"
                            isUp={true}
                            icon={Layers}
                            color="cyan"
                            helpId="dashboard-stat-groups"
                        />
                        {isOwner ? (
                            <KPICard
                                title="Выручка"
                                value={isOwner ? 12450 : 0}
                                trend="+12%"
                                isUp={true}
                                icon={DollarSign}
                                color="emerald"
                                helpId="dashboard-stat-revenue"
                            />
                        ) : (
                            <KPICard
                                title="Предметы"
                                value={stats.subjects}
                                trend="Без изменений"
                                isUp={true}
                                icon={BookOpen}
                                color="emerald"
                                helpId="dashboard-stat-revenue"
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
                <div className="tablet:col-span-4 space-y-8">
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

function KPICard({ title, value, trend, isUp, icon: Icon, color, helpId }: any) {
    const colors: any = {
        indigo: 'from-indigo-500/10 to-transparent border-indigo-500/20 text-indigo-400 bg-indigo-500/5',
        purple: 'from-purple-500/10 to-transparent border-purple-500/20 text-purple-400 bg-purple-500/5',
        cyan: 'from-cyan-500/10 to-transparent border-cyan-500/20 text-cyan-400 bg-cyan-500/5',
        emerald: 'from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-400 bg-emerald-500/5'
    };

    return (
        <Card
            className={`relative overflow-hidden bg-zinc-900/60 border-zinc-800 rounded-2xl group transition-all hover:bg-zinc-900/80 hover:border-zinc-700/50 shadow-2xl ring-1 ring-white/5 h-[130px]`}
            data-help-id={helpId}
        >
            {/* Dynamic Background Glow */}
            <div className={`absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br ${colors[color]} blur-3xl opacity-10 group-hover:opacity-25 transition-all duration-700`} />

            <div className="relative z-10 p-4 flex flex-col h-full justify-between">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 group-hover:text-zinc-400 transition-colors">
                            {title}
                        </h3>
                        <div className="text-2xl font-black text-white tracking-tighter flex items-baseline gap-1">
                            {title === 'Выручка' && <span className="text-lg font-bold text-zinc-500">$</span>}
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </div>
                    </div>
                    <div className={`p-2 rounded-xl border border-white/5 ${colors[color]} shadow-inner`}>
                        <Icon className="h-4 w-4" />
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4 mt-auto">
                    <div className="flex flex-col gap-1">
                        <div className={`flex items-center gap-1 text-[10px] font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {trend}
                            <span className="text-[9px] text-zinc-600 font-medium ml-1">vs MoM</span>
                        </div>
                        <div className="h-1 w-24 bg-zinc-950 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: isUp ? "70%" : "30%" }}
                                className={`h-full ${isUp ? 'bg-emerald-500/40' : 'bg-rose-500/40'}`}
                            />
                        </div>
                    </div>

                    {/* Integrated Sparkline */}
                    <div className="h-10 w-24 relative opacity-50 group-hover:opacity-100 transition-opacity">
                        <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                            <motion.path
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                d={isUp ? "M0,35 Q20,35 30,20 T60,15 T100,0" : "M0,5 Q20,5 30,20 T60,25 T100,40"}
                                fill="none"
                                stroke={isUp ? "#10b981" : "#f43f5e"}
                                strokeWidth="2"
                                strokeLinecap="round"
                                className="drop-shadow-[0_0_5px_currentColor]"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </Card>
    );
}
