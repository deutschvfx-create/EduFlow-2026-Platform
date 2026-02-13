'use client';

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Activity, Globe, Shield } from "lucide-react";

interface SplashScreenProps {
    finishLoading: () => void;
}

export function SplashScreen({ finishLoading }: SplashScreenProps) {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState("Инициализация систем...");

    useEffect(() => {
        const statuses = [
            "Инициализация систем...",
            "Подключение к защищенному каналу...",
            "Синхронизация образовательной экосистемы...",
            "Проверка прав доступа...",
            "Загрузка интерфейса..."
        ];

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(finishLoading, 500);
                    return 100;
                }

                // Dynamic status updates based on progress
                const nextProgress = prev + Math.random() * 15;
                const statusIndex = Math.min(
                    Math.floor((nextProgress / 100) * statuses.length),
                    statuses.length - 1
                );
                setStatus(statuses[statusIndex]);

                return nextProgress;
            });
        }, 300);

        return () => clearInterval(interval);
    }, [finishLoading]);

    return (
        <div className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center overflow-hidden">
            {/* Background Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full animate-pulse" />

            <div className="relative flex flex-col items-center space-y-12">
                {/* Logo Section */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative"
                >
                    <div className="h-24 w-24 rounded-3xl bg-card border border-border/50 flex items-center justify-center shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 opacity-50" />
                        <Activity className="h-10 w-10 text-primary relative z-10 animate-pulse" />

                        {/* Scanning Effect */}
                        <motion.div
                            animate={{ top: ["-100%", "200%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute left-0 right-0 h-1/2 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent z-20"
                        />
                    </div>

                    {/* Corner Ornaments */}
                    <div className="absolute -top-4 -left-4 h-8 w-8 border-t-2 border-l-2 border-primary/30 rounded-tl-xl" />
                    <div className="absolute -bottom-4 -right-4 h-8 w-8 border-b-2 border-r-2 border-blue-500/30 rounded-br-xl" />
                </motion.div>

                {/* Progress Content */}
                <div className="w-64 space-y-4 text-center">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black text-foreground tracking-[0.2em] uppercase">UNI PRIME</h1>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Quantum Edition 2026</p>
                    </div>

                    <div className="relative h-1 w-full bg-secondary rounded-full overflow-hidden border border-border/20">
                        <motion.div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-600 to-blue-600 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.p
                            key={status}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest min-h-[1em]"
                        >
                            {status}
                        </motion.p>
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer Status */}
            <div className="absolute bottom-12 flex items-center gap-8 opacity-60">
                <div className="flex items-center gap-2">
                    <Shield className="h-3 w-3 text-emerald-500" />
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">SSL Secure</span>
                </div>
                <div className="flex items-center gap-2">
                    <Globe className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Global Node</span>
                </div>
            </div>
        </div>
    );
}
