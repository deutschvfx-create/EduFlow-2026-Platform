"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signInWithCustomToken } from 'firebase/auth';

function MagicLoginContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setErrorMsg("Токен не найден. Попробуйте сканировать QR-код заново.");
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-white p-4">
            <div className="max-w-md w-full bg-neutral-800 rounded-2xl p-8 border border-neutral-700 shadow-2xl text-center">
                {status === 'loading' && (
                    <>
                        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6"></div>
                        <h1 className="text-2xl font-bold mb-2">Входим в систему...</h1>
                        <p className="text-neutral-400">Пожалуйста, подождите, магия происходит ✨</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold mb-2 text-green-400">Успешно!</h1>
                        <p className="text-neutral-400">Перенаправляем в панель управления...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold mb-2 text-red-400">Ошибка входа</h1>
                        <p className="text-neutral-400 mb-6">{errorMsg}</p>
                        <button
                            onClick={() => router.push('/login')}
                            className="px-6 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg font-medium transition-colors"
                        >
                            Вернуться на вход
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default function MagicLogin() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white">Загрузка...</div>}>
            <MagicLoginContent />
        </Suspense>
    );
}
