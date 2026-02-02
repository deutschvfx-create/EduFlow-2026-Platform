
"use client";

import React, { useState } from 'react';
import { useConnectivity } from '@/lib/connectivity-context';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Globe, Zap, Clock, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuth } from '@/components/auth/auth-provider';

export function ConnectivityHub() {
    const { isOnline, latency, lastSync, downlink } = useConnectivity();
    const { user, isMirrored, timeLeft, stopMirroring } = useAuth();
    const isLive = isMirrored;
    const [isHovered, setIsHovered] = useState(false);

    const getStatusColor = () => {
        if (isLive) return 'bg-rose-500';
        if (!isOnline) return 'bg-red-500';
        if (latency && latency > 1000) return 'bg-yellow-500';
        return 'bg-emerald-500';
    };

    const getLatencyText = () => {
        if (!latency) return '-- ms';
        return `${latency} ms`;
    };

    const formatTimeLeft = (ms: number) => {
        const totalSec = Math.floor(ms / 1000);
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div
            className="fixed top-3 right-4 z-[100] flex flex-col items-end"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <motion.div
                layout
                className={`
                    flex items-center gap-3 px-3 py-1.5 rounded-2xl 
                    bg-zinc-900/60 backdrop-blur-md border border-white/10
                    shadow-2xl cursor-default select-none
                    ${isLive ? 'border-rose-500/40 bg-rose-950/30' : ''}
                `}
            >
                {!isLive && (
                    <div className="relative">
                        <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor()} animate-pulse`} />
                        <div className={`absolute inset-0 h-2.5 w-2.5 rounded-full ${getStatusColor()} blur-sm opacity-50`} />
                    </div>
                )}

                <div className="flex items-center gap-2 text-[10px] font-medium tracking-tight text-zinc-400">
                    {isLive ? (
                        <div className="flex flex-col items-start leading-none">
                            <span className="flex items-center gap-1.5 text-rose-400 font-bold uppercase tracking-widest animate-pulse mb-0.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                                </span>
                                В эфире
                            </span>
                            {timeLeft !== undefined && timeLeft > 0 && (
                                <span className="text-[8px] font-mono text-rose-400/60 ml-3.5">
                                    До конца: {formatTimeLeft(timeLeft)}
                                </span>
                            )}
                        </div>
                    ) : (
                        <span className="flex items-center gap-1">
                            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3 text-red-400" />}
                            {isOnline ? 'Онлайн' : 'Оффлайн'}
                        </span>
                    )}

                    {!isLive && isOnline && (
                        <>
                            <span className="h-3 w-px bg-white/10" />
                            <span className="flex items-center gap-1">
                                <Zap className="h-3 w-3 text-emerald-400/70" />
                                {getLatencyText()}
                            </span>
                        </>
                    )}

                    {isLive && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                stopMirroring();
                            }}
                            className="ml-1 p-1 hover:bg-rose-500/20 rounded-lg text-rose-400 transition-colors"
                            title="Остановить эфир"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </motion.div>

            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 5, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="w-48 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl overflow-hidden"
                    >
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Детали сети</span>
                                <Globe className="h-3 w-3 text-zinc-600" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-zinc-400">Синхронизация</span>
                                    <span className="text-zinc-200 font-mono text-[11px]">{getLatencyText()}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-zinc-400">Скорость</span>
                                    <span className="text-zinc-200 font-mono text-[11px]">{downlink ? `${downlink} Mbps` : '--'}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs border-t border-white/5 pt-2 mt-1">
                                    <div className="flex items-center gap-1 text-zinc-400">
                                        <Clock className="h-3 w-3" />
                                        <span>Синхронизировано</span>
                                    </div>
                                    <span className="text-zinc-300 text-[10px]">
                                        {lastSync ? formatDistanceToNow(lastSync, { addSuffix: true, locale: ru }) : 'Никогда'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -bottom-12 -right-12 h-24 w-24 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
