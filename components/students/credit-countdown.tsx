'use client';

import { useState, useEffect } from "react";
import { Timer, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CreditCountdownProps {
    paidUntil?: string;
}

export function CreditCountdown({ paidUntil }: CreditCountdownProps) {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        isExpired: boolean;
        isUrgent: boolean;
    } | null>(null);

    useEffect(() => {
        if (!paidUntil) return;

        const calculateTimeLeft = () => {
            const difference = +new Date(paidUntil) - +new Date();

            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                    isExpired: false,
                    isUrgent: difference < (1000 * 60 * 60 * 24 * 3), // Urgent if < 3 days
                };
            } else {
                return {
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    isExpired: true,
                    isUrgent: true,
                };
            }
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [paidUntil]);

    if (!paidUntil || !timeLeft) return <span className="text-zinc-700 font-black text-[10px]">—</span>;

    if (timeLeft.isExpired) {
        return (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 w-fit">
                <AlertCircle className="h-2.5 w-2.5 text-rose-500" />
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Доступ закрыт</span>
            </div>
        );
    }

    return (
        <div className={`flex flex-col gap-0.5 min-w-[100px]`}>
            <div className="flex items-center gap-1.5">
                <div className={`h-1 w-1 rounded-full ${timeLeft.isUrgent ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                <span className={`text-[10px] font-black tracking-widest uppercase ${timeLeft.isUrgent ? 'text-amber-500' : 'text-zinc-500'}`}>
                    {timeLeft.isUrgent ? 'Истекает' : 'Осталось'}
                </span>
            </div>

            <div className="flex items-baseline gap-1 font-mono">
                {timeLeft.days > 0 && (
                    <div className="flex items-baseline">
                        <span className="text-sm font-black text-white">{timeLeft.days}</span>
                        <span className="text-[9px] font-bold text-zinc-600 ml-0.5">д</span>
                    </div>
                )}
                <div className="flex items-baseline">
                    <span className="text-sm font-black text-white">{timeLeft.hours.toString().padStart(2, '0')}</span>
                    <span className="text-[9px] font-bold text-zinc-600 ml-0.5">ч</span>
                </div>
                <div className="flex items-baseline">
                    <span className="text-sm font-black text-white">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                    <span className="text-[9px] font-bold text-zinc-600 ml-0.5">м</span>
                </div>
                <motion.div
                    key={timeLeft.seconds}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    className="flex items-baseline"
                >
                    <span className={`text-[11px] font-bold ${timeLeft.isUrgent ? 'text-rose-400' : 'text-zinc-500'}`}>
                        {timeLeft.seconds.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[8px] font-bold text-zinc-700 ml-0.5">с</span>
                </motion.div>
            </div>

            {timeLeft.isUrgent && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-0.5 w-full bg-zinc-800 rounded-full mt-1 overflow-hidden"
                >
                    <motion.div
                        animate={{
                            width: ["0%", "100%"],
                            opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="h-full bg-amber-500/50"
                    />
                </motion.div>
            )}
        </div>
    );
}
