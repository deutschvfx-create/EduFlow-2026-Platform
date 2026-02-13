"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useOrganization } from "@/hooks/use-organization";
import { scheduleRepo } from "@/lib/data/schedule.repo";
import { Lesson } from "@/lib/types/schedule";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Calendar as CalendarIcon, Users, ArrowRight, LayoutDashboard, Sparkles, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { QuickActions } from "@/components/dashboard/quick-actions";
import Link from "next/link";

export default function GlobalHomePage() {
    const { user, memberships, userData } = useAuth();
    const { organizations, switchOrganization } = useOrganization();
    const [globalLessons, setGlobalLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchGlobalData() {
            if (!memberships || memberships.length === 0) {
                setLoading(false);
                return;
            }

            const orgIds = memberships.map(m => m.organizationId);
            const lessons = await scheduleRepo.getGlobalSchedule(orgIds, {
                teacherId: user?.uid
            });

            // Filter only today's lessons for the summary
            // (Assuming simple logic for now, in production use date-fns)
            setGlobalLessons(lessons);
            setLoading(false);
        }

        fetchGlobalData();
    }, [memberships, user]);

    const stats = {
        totalOrgs: organizations.length,
        totalLessonsToday: globalLessons.length,
        activeRole: memberships[0]?.role || "Пользователь"
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Premium Welcome Header */}
            <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-[#0F3D4C] to-[#1A5D70] p-10 md:p-14 text-white shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-10 blur-xl pointer-events-none">
                    <Sparkles className="h-48 w-48 text-white" />
                </div>

                <div className="relative z-10 max-w-2xl space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-bold tracking-widest uppercase"
                    >
                        <LayoutDashboard className="h-3 w-3" />
                        Единый Кабинет
                    </motion.div>

                    <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                        Добро пожаловать в <span className="text-[#2EC4C6] italic">Ваш Мир</span>
                    </h1>

                    <p className="text-white/70 text-lg md:text-xl font-medium leading-relaxed">
                        Все ваши школы, ученики и уроки в одной ленте. <br className="hidden md:block" />
                        Управляйте знаниями глобально.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 min-w-[140px]">
                            <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Школ</div>
                            <div className="text-3xl font-black">{stats.totalOrgs}</div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 min-w-[140px]">
                            <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Уроков сегодня</div>
                            <div className="text-3xl font-black">{stats.totalLessonsToday}</div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 min-w-[140px]">
                            <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Ваша роль</div>
                            <div className="text-xl font-black uppercase tracking-tighter truncate max-w-[100px]">{stats.activeRole}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Unified Schedule Column */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-black text-[#0F3D4C] flex items-center gap-3">
                            <CalendarIcon className="h-6 w-6 text-primary" />
                            Глобальное Расписание
                        </h2>
                        <span className="text-[10px] bg-[#2EC4C6]/10 text-primary px-3 py-1 rounded-full font-black tracking-widest uppercase">
                            Объединенное
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {loading ? (
                            <div className="p-12 text-center text-[#0F3D4C]/40 font-bold animate-pulse">
                                Собираем данные из всех школ...
                            </div>
                        ) : globalLessons.length === 0 ? (
                            <Card className="rounded-[32px] border-dashed border-2 border-[#DDE7EA] bg-white/50 p-12 text-center">
                                <p className="text-[#0F3D4C]/40 font-bold italic">На сегодня уроков не найдено</p>
                            </Card>
                        ) : (
                            globalLessons.map((lesson) => {
                                const org = organizations.find(o => o.id === lesson.organizationId);
                                return (
                                    <motion.div
                                        key={lesson.id}
                                        whileHover={{ x: 10 }}
                                        className="group cursor-pointer"
                                        onClick={() => switchOrganization(lesson.organizationId)}
                                    >
                                        <Card className="rounded-[24px] border-[#DDE7EA] bg-white p-6 shadow-md group-hover:shadow-xl group-hover:border-primary/30 transition-all">
                                            <div className="flex items-center gap-6">
                                                <div className="flex flex-col items-center justify-center h-16 w-16 rounded-2xl bg-[#FAFAF2] font-mono shadow-inner border border-[#DDE7EA]/50">
                                                    <span className="text-primary text-xl font-black">{lesson.startTime.split(':')[0]}</span>
                                                    <span className="text-[#0F3D4C]/30 text-xs font-bold">:{lesson.startTime.split(':')[1]}</span>
                                                </div>

                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black text-[#0F3D4C]/60 uppercase tracking-tighter">
                                                            <Building2 className="h-2.5 w-2.5" />
                                                            {org?.name || "Школа"}
                                                        </div>
                                                        {(lesson as any).type && (
                                                            <span className="text-[9px] font-black text-primary uppercase">{(lesson as any).type}</span>
                                                        )}
                                                    </div>
                                                    <h3 className="text-xl font-bold text-[#0F3D4C] leading-none">{(lesson as any).courseName || "Урок"}</h3>
                                                    <div className="flex items-center gap-3 text-sm text-[#0F3D4C]/50 font-medium">
                                                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {(lesson as any).teacherName || "Преподаватель"}</span>
                                                        <span className="h-1 w-1 bg-slate-300 rounded-full" />
                                                        <span>{lesson.room || "Online"}</span>
                                                    </div>
                                                </div>

                                                <Button size="icon" variant="ghost" className="rounded-full group-hover:bg-primary group-hover:text-white transition-all">
                                                    <ArrowRight className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </Card>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Schools & Profile Column */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    <h2 className="text-2xl font-black text-[#0F3D4C] px-2">Ваши Организации</h2>
                    <div className="space-y-4">
                        {organizations.map((org) => (
                            <Card
                                key={org.id}
                                className="rounded-[24px] border-[#DDE7EA] bg-white p-5 cursor-pointer hover:shadow-lg transition-all"
                                onClick={() => switchOrganization(org.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12 rounded-xl border border-[#DDE7EA] bg-primary/5">
                                        <AvatarFallback className="text-primary font-bold text-xs">
                                            {org.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 overflow-hidden">
                                        <h4 className="font-bold text-[#0F3D4C] truncate">{org.name}</h4>
                                        <p className="text-[10px] uppercase font-black tracking-widest text-[#0F3D4C]/30 italic">
                                            {org.type || "Учебный центр"}
                                        </p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-[#0F3D4C]/20" />
                                </div>
                            </Card>
                        ))}
                    </div>

                    <Card className="rounded-[32px] bg-[#FAFAF2] border-[#DDE7EA] p-8 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-[#0F3D4C] flex items-center justify-center text-white">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-black text-[#0F3D4C]">EduFlow PRO</h4>
                                <p className="text-xs text-[#0F3D4C]/60 font-medium">Ваш статус: Провайдер</p>
                            </div>
                        </div>
                        <p className="text-[13px] text-[#0F3D4C]/70 leading-relaxed">
                            Вы успешно объединили <b>{stats.totalOrgs}</b> школы под одним аккаунтом. Используйте боковую панель для быстрого перехода.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
