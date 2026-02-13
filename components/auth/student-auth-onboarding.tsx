"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock, User as UserIcon, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { UserService } from "@/lib/services/firestore";
import { sendVerificationCodeAction } from "@/lib/actions/email.actions";

interface StudentAuthOnboardingProps {
    onComplete: (uid: string) => void;
    initialEmail?: string;
}

export function StudentAuthOnboarding({ onComplete, initialEmail = "" }: StudentAuthOnboardingProps) {
    const [step, setStep] = useState<'auth' | 'verify' | 'profile' | 'success'>('auth');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoginMode, setIsLoginMode] = useState(false);

    // Form State
    const [email, setEmail] = useState(initialEmail);
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [generatedCode, setGeneratedCode] = useState("");

    const handleAuth = async () => {
        if (!email || password.length < 4) {
            setError("Введите корректный email и пароль (мин. 4 символа)");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (isLoginMode) {
                const cred = await signInWithEmailAndPassword(auth, email, password);
                onComplete(cred.user.uid);
            } else {
                // Try to create account
                try {
                    // Optimized Flow: Send code first
                    const code = Math.floor(1000 + Math.random() * 9000).toString();
                    setGeneratedCode(code);
                    await sendVerificationCodeAction(email, code, "Uni Prime");
                    setStep('verify');
                } catch (err: any) {
                    if (err.message?.includes('already-in-use') || err.code === 'auth/email-already-in-use') {
                        setIsLoginMode(true);
                        setError("Этот email уже занят. Пожалуйста, введите пароль для входа.");
                    } else {
                        throw err;
                    }
                }
            }
        } catch (err: any) {
            setError(err.message || "Ошибка авторизации");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = () => {
        if (verificationCode === generatedCode) {
            setStep('profile');
        } else {
            setError("Неверный код");
        }
    };

    const handleProfile = async () => {
        if (!firstName || !lastName) {
            setError("Пожалуйста, введите имя и фамилию");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            const uid = cred.user.uid;

            // Atomic Profile Creation
            await UserService.registerStudent(uid, {
                email,
                firstName,
                lastName,
                name: `${firstName} ${lastName}`,
            });

            setStep('success');
            // Give Firebase/Firestore a moment to propagate
            setTimeout(() => onComplete(uid), 1500);
        } catch (err: any) {
            console.error("Profile creation failed:", err);
            setError(err.message || "Ошибка создания профиля");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm mx-auto relative">
            <AnimatePresence mode="wait">
                {step === 'auth' && (
                    <motion.div
                        key="auth"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-[#0F3D4C]/40 ml-1">Email</Label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0F3D4C]/30 group-focus-within:text-primary transition-colors" />
                                <Input
                                    type="email"
                                    placeholder="your@email.com"
                                    className="h-12 pl-12 bg-white border-[#DDE7EA] rounded-xl font-bold transition-all focus:ring-4 focus:ring-primary/5"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-[#0F3D4C]/40 ml-1">Password</Label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0F3D4C]/30 group-focus-within:text-primary transition-colors" />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-12 pl-12 bg-white border-[#DDE7EA] rounded-xl font-bold transition-all focus:ring-4 focus:ring-primary/5"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500 text-[10px] font-black uppercase text-center animate-in shake-in duration-300">
                                {error}
                            </div>
                        )}

                        <Button
                            onClick={handleAuth}
                            className="w-full h-12 bg-[#0F3D4C] hover:bg-[#1A5D70] text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#0F3D4C]/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                isLoginMode ? "Войти в аккаунт" : "Продолжить"
                            )}
                        </Button>

                        <button
                            onClick={() => {
                                setIsLoginMode(!isLoginMode);
                                setError(null);
                            }}
                            className="w-full text-[10px] font-black uppercase text-[#0F3D4C]/40 hover:text-primary transition-colors py-2"
                        >
                            {isLoginMode ? "Нет аккаунта? Регистрация" : "Уже есть аккаунт? Войти"}
                        </button>
                    </motion.div>
                )}

                {step === 'verify' && (
                    <motion.div
                        key="verify"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="text-center space-y-2">
                            <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Mail className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-bold text-[#0F3D4C]">Подтверждение почты</h3>
                            <p className="text-[10px] text-[#0F3D4C]/40 uppercase font-black tracking-widest">Код отправлен на {email}</p>
                        </div>
                        <Input
                            placeholder="0000"
                            maxLength={4}
                            className="h-20 text-center text-4xl font-black tracking-[0.2em] bg-white border-[#DDE7EA] rounded-2xl focus:ring-4 focus:ring-primary/5 transition-all"
                            value={verificationCode}
                            onChange={(e) => {
                                setVerificationCode(e.target.value);
                                if (e.target.value.length === 4 && e.target.value === generatedCode) {
                                    setStep('profile');
                                    setError(null);
                                }
                            }}
                        />
                        {error && <p className="text-red-500 text-[10px] font-black uppercase text-center">{error}</p>}
                        <Button
                            onClick={handleVerify}
                            className="w-full h-12 bg-[#0F3D4C] text-white rounded-xl font-black uppercase tracking-widest text-[10px]"
                        >
                            Подтвердить
                        </Button>
                        <button onClick={() => setStep('auth')} className="w-full text-[10px] font-black uppercase text-[#0F3D4C]/30 hover:text-primary">Назад</button>
                    </motion.div>
                )}

                {step === 'profile' && (
                    <motion.div
                        key="profile"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-5"
                    >
                        <div className="text-center space-y-2 mb-2">
                            <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <UserIcon className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-bold text-[#0F3D4C]">Ваш профиль</h3>
                            <p className="text-[10px] text-[#0F3D4C]/40 uppercase font-black tracking-widest">Как вас называть?</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-[#0F3D4C]/40 ml-1">Имя</Label>
                                <Input
                                    placeholder="Иван"
                                    className="h-12 bg-white border-[#DDE7EA] rounded-xl font-bold focus:ring-4 focus:ring-primary/5 transition-all"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-[#0F3D4C]/40 ml-1">Фамилия</Label>
                                <Input
                                    placeholder="Иванов"
                                    className="h-12 bg-white border-[#DDE7EA] rounded-xl font-bold focus:ring-4 focus:ring-primary/5 transition-all"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-[10px] font-black uppercase text-center">{error}</p>}
                        <Button
                            onClick={handleProfile}
                            className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Завершить и вступить"}
                        </Button>
                        <button onClick={() => setStep('auth')} className="w-full text-[10px] font-black uppercase text-[#0F3D4C]/30 hover:text-primary">Назад к входу</button>
                    </motion.div>
                )}

                {step === 'success' && (
                    <motion.div
                        key="success"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center py-6 space-y-4"
                    >
                        <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#0F3D4C]">Добро пожаловать!</h3>
                            <p className="text-[10px] text-[#0F3D4C]/40 uppercase font-black tracking-widest">Профиль успешно создан</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
