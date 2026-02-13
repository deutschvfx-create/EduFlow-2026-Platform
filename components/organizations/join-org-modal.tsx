"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { GraduationCap, Users, MessageSquare, Loader2, Sparkles, Send, UserCheck } from "lucide-react";
import { OrganizationService, UserRole } from "@/lib/services/firestore";
import { useAuth } from "@/components/auth/auth-provider";
import { motion, AnimatePresence } from "framer-motion";
import { StudentAuthOnboarding } from "@/components/auth/student-auth-onboarding";

interface JoinOrgModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    organizationId: string;
    organizationName: string;
}

export function JoinOrgModal({ open, onOpenChange, organizationId, organizationName }: JoinOrgModalProps) {
    const { user, userData, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState<UserRole>("student");
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);

    // Track if user just completed onboarding to auto-submit or show form
    const [onboarded, setOnboarded] = useState(false);

    const handleSend = async () => {
        if (!user || !organizationId) return;
        setLoading(true);
        try {
            await OrganizationService.sendJoinRequest({
                userId: user.uid,
                userName: userData?.name || user.displayName || "Unknown User",
                userEmail: user.email || "",
                organizationId,
                organizationName,
                role,
                message
            });
            setSuccess(true);
            setTimeout(() => {
                onOpenChange(false);
                setSuccess(false);
                setMessage("");
                setOnboarded(false);
            }, 2000);
        } catch (error) {
            console.error("Failed to send join request:", error);
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        if (success) {
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="p-12 text-center space-y-4"
                >
                    <div className="h-20 w-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-primary">
                        <Sparkles className="h-10 w-10 animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-black text-[#0F3D4C]">Запрос отправлен!</h3>
                    <p className="text-[#0F3D4C]/60 font-medium">
                        Владелец школы получит уведомление и рассмотрит вашу заявку.
                    </p>
                </motion.div>
            );
        }

        if (!user && !authLoading) {
            return (
                <div className="p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <DialogTitle className="text-2xl font-black text-[#0F3D4C] tracking-tight">
                            Почти готово!
                        </DialogTitle>
                        <DialogDescription className="text-[#0F3D4C]/40 text-[10px] font-black uppercase tracking-widest">
                            Чтобы вступить в {organizationName}, создайте профиль
                        </DialogDescription>
                    </div>
                    <StudentAuthOnboarding onComplete={() => setOnboarded(true)} />
                </div>
            );
        }

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative p-8 space-y-8"
            >
                <DialogHeader>
                    <DialogTitle className="text-3xl font-black text-[#0F3D4C] tracking-tight">
                        Присоединиться к <span className="text-primary italic">{organizationName}</span>
                    </DialogTitle>
                    <DialogDescription className="text-[#0F3D4C]/60 text-base pt-2">
                        Выберите вашу роль и напишите короткое сообщение для администрации.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0F3D4C]/40 ml-1">
                            Я хочу вступить как
                        </Label>
                        <Select value={role} onValueChange={(v: any) => setRole(v)}>
                            <SelectTrigger className="h-14 bg-white/50 border-[#DDE7EA] focus:border-primary focus:ring-primary/20 rounded-2xl font-bold text-[#0F3D4C]">
                                <SelectValue placeholder="Выберите роль" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-[#DDE7EA] rounded-2xl shadow-xl p-2">
                                <SelectItem value="student" className="rounded-xl py-3">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-primary" />
                                        <span className="font-bold">Ученик</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="teacher" className="rounded-xl py-3">
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4 text-primary" />
                                        <span className="font-bold">Преподаватель</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0F3D4C]/40 ml-1">
                            Сообщение (необязательно)
                        </Label>
                        <div className="relative">
                            <MessageSquare className="absolute left-4 top-4 h-5 w-5 text-[#0F3D4C]/30" />
                            <Textarea
                                placeholder="Напр: Здравствуйте, хочу записаться в группу подготовки к TOEFL..."
                                className="min-h-[120px] pl-12 pt-4 bg-white/50 border-[#DDE7EA] focus:border-primary focus:ring-primary/20 rounded-2xl font-bold text-[#0F3D4C] resize-none transition-all"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="pt-4">
                    <Button
                        className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-primary/20 transition-all group"
                        onClick={handleSend}
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <div className="flex items-center gap-2">
                                <span>Отправить запрос</span>
                                <Send className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </div>
                        )}
                    </Button>
                </DialogFooter>
            </motion.div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            onOpenChange(val);
            if (!val) setOnboarded(false);
        }}>
            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-white/80 backdrop-blur-2xl border-white/20 rounded-[32px] shadow-2xl">
                <AnimatePresence mode="wait">
                    {renderContent()}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
