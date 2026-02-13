"use client";

import { useAuth } from "@/components/auth/auth-provider";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sparkles, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

interface ActionGuardProps {
    children: React.ReactNode;
    actionLabel?: string;
    description?: string;
}

export function ActionGuard({
    children,
    actionLabel = "Чтобы выполнить это действие, нужно зарегистрироваться",
    description = "Это займет всего 30 секунд и откроет вам полный доступ ко всем функциям платформы."
}: ActionGuardProps) {
    const { isGuest } = useAuth();
    const [showPrompt, setShowPrompt] = useState(false);
    const router = useRouter();

    if (!isGuest) return <>{children}</>;

    const interceptedClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowPrompt(true);
    };

    return (
        <>
            <div onClickCapture={interceptedClick} className="contents">
                {children}
            </div>

            <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
                <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden bg-white/90 backdrop-blur-2xl border-white/20 rounded-[32px] shadow-2xl">
                    <div className="p-8 text-center space-y-6">
                        <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
                            <Sparkles className="h-8 w-8 animate-bounce" />
                        </div>

                        <div className="space-y-2">
                            <DialogTitle className="text-2xl font-black text-[#0F3D4C] tracking-tight leading-tight">
                                {actionLabel}
                            </DialogTitle>
                            <DialogDescription className="text-[#0F3D4C]/60 text-sm font-medium">
                                {description}
                            </DialogDescription>
                        </div>

                        <div className="pt-4 space-y-3">
                            <Button
                                onClick={() => router.push('/register')}
                                className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2"
                            >
                                <UserPlus className="h-4 w-4" /> Зарегистрироваться сейчас
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setShowPrompt(false)}
                                className="w-full h-12 text-[#0F3D4C]/40 font-black uppercase tracking-widest text-[10px] hover:text-[#0F3D4C]"
                            >
                                Позже
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
