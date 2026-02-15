"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { sendEmailVerification, reload } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle2, Loader2, RefreshCw, LogOut } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';

export default function VerifyEmailPage() {
    const { user, userData } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        // If user is already verified in hook, transition handled by AuthProvider
        // but we can also handle it here for faster feedback
        if (user?.emailVerified || userData?.emailVerified) {
            router.push('/onboarding/organization');
        }
    }, [user?.emailVerified, userData?.emailVerified, router]);

    const handleCheckVerification = async () => {
        if (!auth.currentUser) return;
        setLoading(true);
        setError(null);
        try {
            await reload(auth.currentUser);
            if (auth.currentUser.emailVerified) {
                // Update Firestore profile
                const userRef = doc(db, "users", auth.currentUser.uid);
                await updateDoc(userRef, {
                    emailVerified: true,
                    onboardingStep: 'organization'
                });
                router.push('/onboarding/organization');
            } else {
                setError("Почта еще не подтверждена. Пожалуйста, проверьте ваш почтовый ящик.");
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Ошибка проверки");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!auth.currentUser) return;
        setResending(true);
        setError(null);
        setSuccess(null);
        try {
            await sendEmailVerification(auth.currentUser);
            setSuccess("Контрольное письмо отправлено повторно!");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Ошибка отправки");
        } finally {
            setResending(false);
        }
    };

    const handleSignOut = () => {
        auth.signOut().then(() => router.push('/login'));
    };

    return (
        <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-[32px] p-10 shadow-xl shadow-[#0F3D4C]/5 border border-[#DDE7EA] space-y-8">
                <div className="text-center space-y-4">
                    <div className="h-20 w-20 bg-[#0F3D4C]/5 rounded-full flex items-center justify-center mx-auto text-[#0F3D4C]">
                        <Mail className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-black text-[#0F3D4C] tracking-tight text-center">Подтвердите почту</h1>
                        <p className="text-xs text-[#0F3D4C]/40 font-bold uppercase tracking-widest leading-relaxed">
                            Мы отправили письмо на <span className="text-[#0F3D4C]">{user?.email}</span>. Пожалуйста, подтвердите его, чтобы продолжить.
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <Button
                        onClick={handleCheckVerification}
                        disabled={loading}
                        className="w-full h-14 bg-[#0F3D4C] hover:bg-[#1A5D70] rounded-[20px] font-black uppercase tracking-widest text-[11px] shadow-lg shadow-[#0F3D4C]/10"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Я подтвердил почту"}
                    </Button>

                    <Button
                        onClick={handleResend}
                        disabled={resending}
                        variant="outline"
                        className="w-full h-14 border-2 border-[#DDE7EA] hover:bg-[#F8FAFB] rounded-[20px] font-black uppercase tracking-widest text-[11px] transition-all"
                    >
                        {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Отправить еще раз
                            </>
                        )}
                    </Button>
                </div>

                {error && (
                    <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-600 text-[10px] font-black uppercase text-center animate-shake">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase text-center">
                        {success}
                    </div>
                )}

                <div className="pt-4 border-t border-[#F1F5F9]">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0F3D4C]/30 hover:text-[#0F3D4C] mx-auto transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Использовать другой аккаунт
                    </button>
                </div>
            </div>
        </div>
    );
}
