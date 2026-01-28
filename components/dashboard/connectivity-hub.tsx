
"use client";

import React, { useState } from 'react';
import { useConnectivity } from '@/lib/connectivity-context';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Globe, Zap, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

export function ConnectivityHub() {
    const { isOnline, latency, lastSync, downlink } = useConnectivity();
    const [isHovered, setIsHovered] = useState(false);

    const getStatusColor = () => {
        if (!isOnline) return 'bg-red-500';
        if (latency && latency > 1000) return 'bg-yellow-500';
        return 'bg-emerald-500';
    };

    const getLatencyText = () => {
        if (!latency) return '-- ms';
        return `${latency} ms`;
    };

    return (
        <div
            className="fixed top-6 right-6 z-[100] flex flex-col items-end"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <motion.div
                layout
                className={`
                    flex items-center gap-3 px-3 py-1.5 rounded-full 
                    bg-zinc-900/40 backdrop-blur-md border border-white/5
                    shadow-2xl cursor-default select-none
                `}
            >
                <div className="relative">
                    <div className={`h-2 w-2 rounded-full ${getStatusColor()} animate-pulse`} />
                    <div className={`absolute inset-0 h-2 w-2 rounded-full ${getStatusColor()} blur-sm opacity-50`} />
                </div>

                <div className="flex items-center gap-2 text-[10px] font-medium tracking-tight text-zinc-400">
                    <span className="flex items-center gap-1">
                        {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3 text-red-400" />}
                        {isOnline ? 'Онлайн' : 'Оффлайн'}
                    </span>

                    {isOnline && (
                        <>
                            <span className="h-3 w-px bg-white/10" />
                            <span className="flex items-center gap-1">
                                <Zap className="h-3 w-3 text-emerald-400/70" />
                                {getLatencyText()}
                            </span>
                        </>
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
