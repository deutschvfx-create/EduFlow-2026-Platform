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
import { Loader2, Search, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { FeaturePlaceholder } from "@/components/shared/feature-placeholder";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useOrganization } from "@/hooks/use-organization";
import { useRole } from "@/hooks/use-role";
import { JoinRequestsManager } from "@/components/organizations/join-requests-manager";
import { OrganizationSelectionScreen } from "@/components/dashboard/organization-selection-screen";
import { useAuth } from "@/components/auth/auth-provider";

export default function DashboardPage() {
    const { userData } = useAuth();

    // Show org selection if user has no organization
    if (userData && !userData.organizationId) {
        return <OrganizationSelectionScreen />;
    }

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

    const { isOwner } = useRole();

    return (
        <div className="space-y-6 laptop:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#DDE7EA]" data-help-id="dashboard-header">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-[9px] uppercase mb-1">
                        <Activity className="h-2.5 w-2.5" />
                        Live Monitor
                    </div>
                    <h1 className="text-[28px] font-bold tracking-tight text-[#0F3D4C]">
                        Дашборд
                    </h1>
                    <p className="text-[#0F3D4C]/70 text-sm">
                        {isOwner ? 'Обзор ключевых показателей вашей школы' : 'Ваш персональный центр управления'}
                    </p>
                </div>

                <div className="flex-1 max-w-sm relative group" data-help-id="dashboard-search">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Быстрый поиск по школе..."
                        className="h-10 pl-10 bg-white border-[#DDE7EA] focus:border-primary/50 focus:ring-primary/20 rounded-lg text-sm placeholder:text-[#0F3D4C]/40"
                    />
                </div>

                <div className="flex items-center gap-3">
                    {isOwner && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-10 px-4 gap-2 border-[#DDE7EA] bg-white text-[#0F3D4C]/70 hover:text-[#0F3D4C] hover:bg-[#FAFAF2] transition-all rounded-lg shadow-sm"
                                >
                                    <Download className="h-4 w-4" />
                                    <span className="text-sm font-semibold">Экспорт</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl bg-white border-[#DDE7EA] p-0 overflow-hidden rounded-[16px]">
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
                    <div className="h-10 w-10 rounded-lg bg-white border border-[#DDE7EA] flex items-center justify-center text-[#0F3D4C]/60 hover:text-primary cursor-pointer transition-colors shadow-sm">
                        <CalendarIcon className="h-5 w-5" />
                    </div>
                </div>
            </div>

            {/* 12-Column Grid */}
            <div className="grid grid-cols-12 gap-6 laptop:gap-6">
                {/* Left Area (8 columns) */}
                <div className="col-span-8 space-y-6 laptop:space-y-6">
                    {/* Stats Grid - Fixed 4 columns on desktop */}
                    <div className="grid grid-cols-4 gap-6" data-help-id="dashboard-stats">
                        <KPICard
                            title="Студентов"
                            value={stats.students}
                            trend="+4.5%"
                            isUp={true}
                            icon={Users}
                            color="cyan"
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

                    {isOwner && currentOrganizationId && (
                        <JoinRequestsManager organizationId={currentOrganizationId} />
                    )}

                    <div className="space-y-4">
                        <QuickActions />
                    </div>

                    {/* Performance Section */}
                    <div className="grid grid-cols-2 gap-6">
                        <Card className="bg-white border-[#DDE7EA] rounded-[16px] shadow-md overflow-hidden">
                            <CardHeader className="p-6 pb-2">
                                <CardTitle className="text-sm font-bold text-[#0F3D4C] uppercase tracking-widest flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4 text-[#2EC4C6]" />
                                    Динамика посещаемости
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center h-[260px] p-6">
                                <div className="text-[#0F3D4C]/60 text-sm font-medium bg-[#FAFAF2] px-6 py-3 rounded-full border border-[#DDE7EA]">
                                    Анализ активности...
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-[#DDE7EA] rounded-[16px] shadow-md overflow-hidden">
                            <CardHeader className="p-6 pb-2">
                                <CardTitle className="text-sm font-bold text-[#0F3D4C] uppercase tracking-widest flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-[#2EC4C6]" />
                                    Успеваемость
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center h-[260px] p-6">
                                <div className="text-[#0F3D4C]/60 text-sm font-medium bg-[#FAFAF2] px-6 py-3 rounded-full border border-[#DDE7EA]">
                                    Загрузка данных...
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right Area (4 columns) */}
                <div className="col-span-4 space-y-6">
                    <Card className="bg-white border-[#DDE7EA] rounded-[16px] p-6 shadow-md">
                        <TodaySchedule />
                    </Card>

                    <Card className="bg-white border-[#DDE7EA] rounded-[16px] p-6 shadow-md">
                        <ActivityFeed />
                    </Card>

                    {/* System Health / Connectivity Promo */}
                    <div className="p-6 rounded-[16px] bg-white border border-[#DDE7EA] shadow-md">
                        <div className="flex items-center gap-3 mb-3 text-[#2EC4C6]">
                            <Activity className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wider text-[#0F3D4C]">System Status</span>
                        </div>
                        <p className="text-sm text-[#0F3D4C]/60 leading-relaxed font-medium">
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
        purple: 'text-[#8B5CF6] bg-[#8B5CF6]/15',
        cyan: 'text-[#2EC4C6] bg-[#2EC4C6]/15',
        emerald: 'text-[#10B981] bg-[#10B981]/15'
    };

    return (
        <Card
            className="relative overflow-hidden bg-white border-[#DDE7EA] rounded-[14px] p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.05)] h-[120px] group transition-all"
            data-help-id={helpId}
        >
            <div className="flex flex-col h-full justify-between relative z-10">
                <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F3D4C]/60">
                            {title}
                        </h3>
                        <div className="text-2xl font-bold text-[#0F3D4C] tracking-tight">
                            {title === 'Выручка' && <span className="text-lg font-semibold mr-0.5">$</span>}
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </div>
                    </div>
                    <div className={`h-10 w-10 rounded-xl ${colors[color]} flex items-center justify-center shrink-0`}>
                        <Icon className="h-5 w-5" />
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div className={`flex items-center gap-1 text-[10px] font-bold ${isUp ? 'text-[#10B981]' : 'text-rose-500'}`}>
                        {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {trend}
                    </div>

                    <div className="h-8 w-20 relative opacity-[0.08]">
                        <svg viewBox="0 0 100 40" className="w-full h-full">
                            <path
                                d={isUp ? "M0,35 Q20,35 30,20 T60,15 T100,0" : "M0,5 Q20,5 30,20 T60,25 T100,40"}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                className={isUp ? "text-[#10B981]" : "text-rose-500"}
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </Card>
    );
}
