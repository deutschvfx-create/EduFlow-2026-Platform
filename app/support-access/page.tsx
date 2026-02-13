"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signInWithCustomToken } from 'firebase/auth';
import { Shield, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

function SupportAccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setErrorMsg("Токен доступа не найден. Ссылка повреждена.");
            return;
        }

        const login = async () => {
            try {
                console.log("🚀 [SupportAccess] Starting login with token:", token?.substring(0, 10) + "...");
                // Wait a bit for effect
                await new Promise(r => setTimeout(r, 1000));

                await signInWithCustomToken(auth, token);
                setStatus('success');

                setTimeout(() => {
                    router.push("/app/dashboard");
                }, 1500);
            } catch (err: any) {
                console.error("Support Login failed", err);
                setStatus('error');
                setErrorMsg("Срок действия гостевой ссылки истёк или она аннулирована.");
            }
        };

        login();
    }, [token, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 font-sans">
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-md w-full bg-card/50 backdrop-blur-xl rounded-3xl p-8 border border-border shadow-2xl text-center relative z-10">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-primary/20">
                    <Shield className="w-8 h-8 text-primary" />
                </div>

                {status === 'loading' && (
                    <>
                        <h1 className="text-2xl font-bold mb-3 tracking-tight">Гостевой доступ</h1>
                        <p className="text-muted-foreground text-sm mb-8 px-4">
                            Проверяем ключ безопасности и настраиваем временную среду...
                        </p>
                        <div className="flex items-center justify-center gap-3 bg-white/5 py-3 px-6 rounded-2xl w-fit mx-auto border border-border">
                            <Loader2 className="w-4 h-4 text-primary animate-spin" />
                            <span className="text-xs font-medium text-foreground uppercase tracking-widest">Авторизация</span>
                        </div>
                    </>
                )}

                {status === 'success' && (
                    <div className="animate-in fade-in zoom-in duration-500">
                        <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold mb-3 text-emerald-400">Доступ разрешен</h1>
                        <p className="text-muted-foreground text-sm">
                            Временная сессия активирована. <br />
                            Перенаправляем в систему...
                        </p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold mb-3 text-red-400">Ошибка доступа</h1>
                        <p className="text-muted-foreground text-sm mb-8">{errorMsg}</p>
                        <button
                            onClick={() => router.push('/login')}
                            className="w-full py-4 bg-secondary hover:bg-secondary rounded-2xl font-semibold transition-all active:scale-[0.98] border border-border"
                        >
                            Вернуться на главную
                        </button>
                    </div>
                )}
            </div>

            <p className="mt-8 text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-medium">
                EduFlow Security Protocol v2.0
            </p>
        </div>
    );
}

export default function SupportAccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        }>
            <SupportAccessContent />
        </Suspense>
    );
}
