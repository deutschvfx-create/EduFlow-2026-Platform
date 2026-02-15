"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2, PartyPopper, ArrowRight } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';

export default function OnboardingCompletePage() {
    const router = useRouter();
    const { userData } = useAuth();

    const handleGoToDashboard = () => {
        const target = userData?.role === 'student' ? '/student' : '/app/dashboard';
        router.push(target);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center p-6 text-[#0F3D4C]">
            <div className="max-w-md w-full bg-white rounded-[32px] p-10 shadow-xl shadow-[#0F3D4C]/5 border border-[#DDE7EA] text-center space-y-8">
                <div className="space-y-6">
                    <div className="h-24 w-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500 animate-bounce">
                        <CheckCircle2 className="h-12 w-12" />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Успешно!</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight">Система готова</h1>
                        <p className="text-xs text-[#0F3D4C]/40 font-bold uppercase tracking-widest leading-relaxed">
                            Ваша школа настроена. Теперь вы можете добавлять студентов, составлять расписание и управлять обучением.
                        </p>
                    </div>
                </div>

                <div className="p-6 bg-[#F8FAFB] rounded-[24px] border border-[#DDE7EA] flex items-center gap-4 text-left">
                    <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <PartyPopper className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-[#0F3D4C]/40">Ваша роль</div>
                        <div className="font-bold text-sm uppercase">Администратор / Директор</div>
                    </div>
                </div>

                <Button
                    onClick={handleGoToDashboard}
                    className="w-full h-14 bg-[#0F3D4C] hover:bg-[#1A5D70] rounded-[20px] font-black uppercase tracking-widest text-[11px] shadow-xl shadow-[#0F3D4C]/10"
                >
                    Перейти в панель управления
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
