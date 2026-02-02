"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function MagicLogin() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setErrorMsg("Токен не найден. Сканируйте QR-код заново.");
            return;
        }

        const login = async () => {
            try {
                await signInWithCustomToken(auth, token);
                setStatus('success');
                setTimeout(() => {
                    router.push("/app/dashboard");
                }, 1500);
            } catch (err: any) {
                console.error("Magic Login failed", err);
                setStatus('error');
                setErrorMsg("Срок действия ссылки истёк или она неверна.");
            }
        };

        login();
    }, [token, router]);

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
            {status === 'loading' && (
                <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                    <div className="h-16 w-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto ring-1 ring-indigo-500/30">
                        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Входим в систему...</h2>
                    <p className="text-zinc-500 text-sm">Проверка безопасности</p>
                </div>
            )}

            {status === 'success' && (
                <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                    <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto ring-1 ring-emerald-500/30">
                        <CheckCircle className="h-8 w-8 text-emerald-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Успешно!</h2>
                    <p className="text-zinc-500 text-sm">Перенаправляем на дашборд...</p>
                </div>
            )}

            {status === 'error' && (
                <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                    <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto ring-1 ring-red-500/30">
                        <AlertCircle className="h-8 w-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Ошибка входа</h2>
                    <p className="text-red-400 text-sm max-w-xs mx-auto">{errorMsg}</p>
                    <button
                        onClick={() => router.push("/login")}
                        className="text-indigo-400 hover:text-indigo-300 text-sm font-medium mt-4"
                    >
                        Войти вручную
                    </button>
                </div>
            )}
        </div>
    );
}
