"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useOrganization } from "@/hooks/use-organization";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { School, ArrowRight, Loader2, LogOut, Plus, Search, Sparkles } from "lucide-react";
import { auth } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { CreateOrgModal } from "@/components/organizations/create-org-modal";
import { JoinOrgModal } from "@/components/organizations/join-org-modal";
import { OrganizationService } from "@/lib/services/firestore";
import { Input } from "@/components/ui/input";
import { SchoolSearch } from "@/components/organizations/school-search";

export default function SelectSchoolPage() {
    const { user, memberships, loading: authLoading } = useAuth();
    const { organizations, switchOrganization } = useOrganization();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Search State
    const [selectedJoinOrg, setSelectedJoinOrg] = useState<{ id: string, name: string } | null>(null);

    const handleLogout = () => {
        auth.signOut().then(() => {
            window.location.href = '/login';
        });
    };

    if (authLoading || (user && organizations.length === 0 && memberships.length > 0)) {
        return (
            <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                    <p className="text-[#0F3D4C]/60 font-medium animate-pulse uppercase tracking-widest text-[10px]">
                        Загрузка ваших организаций...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFB] flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-5xl space-y-12 relative z-10">
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-[#DDE7EA] mb-2"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span className="text-[10px] font-black text-[#0F3D4C] uppercase tracking-[0.2em]">EduFlow Ecosystem</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-[#0F3D4C] tracking-tight"
                    >
                        Ваш мир <span className="text-primary italic">Знаний</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-[#0F3D4C]/60 text-lg max-w-lg mx-auto"
                    >
                        Выберите ваше учебное пространство или найдите новое в нашей платформе
                    </motion.p>
                </div>

                {/* Discovery & Search Section */}
                <div className="max-w-xl mx-auto w-full">
                    <SchoolSearch
                        memberships={memberships}
                        onJoinRequest={setSelectedJoinOrg}
                    />
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-[#0F3D4C] text-center">Мои текущие пространства</h2>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {organizations.map((org, index) => (
                            <Card
                                key={org.id}
                                className="group cursor-pointer hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 rounded-[32px] border-[#DDE7EA] bg-white overflow-hidden h-full"
                                onClick={() => switchOrganization(org.id)}
                            >
                                <CardContent className="p-8 flex flex-col h-full gap-4">
                                    <Avatar className="h-16 w-16 rounded-2xl border-2 border-[#DDE7EA] bg-gradient-to-br from-[#0F3D4C] to-[#1A5D70] shadow-lg group-hover:scale-110 transition-transform duration-500">
                                        <AvatarFallback className="text-white text-2xl font-black tracking-tighter bg-transparent">
                                            {org.name?.substring(0, 2).toUpperCase() || "SC"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <School className="h-3.5 w-3.5 text-primary" />
                                            <span className="text-[9px] font-black text-primary uppercase tracking-widest">{org.type || "Школа"}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-[#0F3D4C] group-hover:text-primary transition-colors truncate">
                                            {org.name}
                                        </h3>
                                        <div className="flex items-center justify-between pt-4 border-t border-[#DDE7EA]/50">
                                            <span className="text-[10px] font-bold text-[#0F3D4C]/40 uppercase tracking-widest">Перейти</span>
                                            <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-2" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Create New School Card */}
                        <Card
                            className="group cursor-pointer hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 rounded-[32px] border-dashed border-2 border-[#DDE7EA] bg-white/30 hover:bg-white hover:border-primary/50 overflow-hidden h-full min-h-[140px]"
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            <CardContent className="p-8 flex flex-col items-center justify-center text-center gap-4 h-full">
                                <div className="h-14 w-14 rounded-2xl border-2 border-dashed border-[#DDE7EA] bg-slate-50 flex items-center justify-center text-[#0F3D4C]/20 group-hover:text-primary group-hover:border-primary/50 group-hover:scale-110 transition-all duration-500">
                                    <Plus className="h-8 w-8" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-[#0F3D4C]/40 group-hover:text-primary transition-colors">
                                        Запустить свою школу
                                    </h3>
                                    <p className="text-[10px] text-[#0F3D4C]/30 font-black uppercase tracking-widest pt-1">
                                        Станьте владельцем
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col items-center gap-6 pt-8"
                >
                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#DDE7EA] to-transparent" />
                    <div className="flex items-center gap-8">
                        <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="text-[#0F3D4C]/50 hover:text-red-500 hover:bg-red-50 transition-all gap-2 font-black uppercase tracking-widest text-[10px]"
                        >
                            <LogOut className="h-4 w-4" />
                            Сменить аккаунт
                        </Button>
                        <div className="flex items-center gap-2 text-[10px] font-black text-[#0F3D4C]/30 uppercase tracking-[0.2em]">
                            <Sparkles className="h-3.5 w-3.5 fill-current" />
                            Premium EduFlow 2026
                        </div>
                    </div>
                </motion.div>
            </div>

            <CreateOrgModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
            />

            <JoinOrgModal
                open={!!selectedJoinOrg}
                onOpenChange={(open) => !open && setSelectedJoinOrg(null)}
                organizationId={selectedJoinOrg?.id || ""}
                organizationName={selectedJoinOrg?.name || ""}
            />
        </div>
    );
}
