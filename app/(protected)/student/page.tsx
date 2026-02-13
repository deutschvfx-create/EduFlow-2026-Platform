"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, QrCode, GraduationCap, Loader2, Bell, Search, User, Play, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/auth/auth-provider";
import { useOrganization } from "@/hooks/use-organization";
import { StoriesBar } from "@/components/student/stories-bar";
import { ActivityFeed } from "@/components/student/activity-feed";

export default function StudentDashboard() {
    const { userData } = useAuth();
    const { currentOrganizationId } = useOrganization();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading for smooth animation entry
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-muted-foreground gap-4">
            <div className="relative">
                <Loader2 className="animate-spin h-10 w-10 text-primary" />
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-primary animate-pulse" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Entering SuperApp...</p>
        </div>
    );

    return (
        <div className="flex flex-col gap-6 max-w-md mx-auto w-full pb-20">

            {/* 1. Top Bar (App-style) */}
            <div className="flex items-center justify-between px-1 pt-2">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-cyan-600 flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="text-white font-black text-lg">{userData?.firstName?.[0]}</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-white tracking-tight leading-none italic">
                            {userData?.firstName || "Student"}
                        </h1>
                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-1">
                            {userData?.currentOrganizationId ? "Active School" : "Discovery Mode"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full bg-card/50 border border-border/50 h-9 w-9">
                        <Search className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full bg-card/50 border border-border/50 h-9 w-9 relative">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                        <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-background" />
                    </Button>
                </div>
            </div>

            {/* 2. Instagram-style Stories (Announcements) */}
            <section className="space-y-3">
                <StoriesBar />
            </section>

            {/* 3. Telegram-style Pinned/Next Action */}
            <motion.section
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border-primary/20 shadow-2xl shadow-primary/5 rounded-[2rem] overflow-hidden group">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <Badge className="bg-primary/20 text-primary border-primary/30 uppercase text-[9px] font-black tracking-widest">
                                Следующее занятие
                            </Badge>
                            <div className="flex items-center gap-1.5 text-primary">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                <span className="text-[10px] font-black uppercase">LIVE</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-primary flex flex-col items-center justify-center text-white shrink-0 shadow-xl shadow-primary/20">
                                <span className="text-lg font-black leading-tight">14</span>
                                <span className="text-[10px] font-bold uppercase">Фев</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold text-white truncate truncate tracking-tight">Английский Язык</h3>
                                <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground font-bold uppercase">
                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 15:30</span>
                                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> каб. 302</span>
                                </div>
                            </div>
                            <Button size="icon" className="h-10 w-10 rounded-full bg-white text-black hover:bg-white/90 shadow-xl">
                                <Play className="h-5 w-5 fill-current" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.section>

            {/* 4. WhatsApp-style Activity Feed (Grades, Attendance, Updates) */}
            <section className="flex-1">
                <ActivityFeed />
            </section>

            {/* 5. Quick Actions Grid (Floating Cards) */}
            <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-24 bg-card/40 border-border/50 rounded-3xl flex flex-col gap-2 hover:bg-secondary/40 transition-all group">
                    <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <GraduationCap className="h-5 w-5 text-cyan-500" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Мои оценки</span>
                </Button>
                <Button variant="outline" className="h-24 bg-card/40 border-border/50 rounded-3xl flex flex-col gap-2 hover:bg-secondary/40 transition-all group">
                    <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <QrCode className="h-5 w-5 text-orange-500" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Мой ID</span>
                </Button>
            </div>

        </div>
    )
}
