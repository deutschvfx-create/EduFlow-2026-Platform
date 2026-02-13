"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

export interface LedgerEvent {
    id: string;
    type: "attendance" | "grade";
    timestamp: Date;
    title: string;
    description: string;
    status?: "success" | "warning" | "danger" | "info";
}

interface LiveLedgerProps {
    events: LedgerEvent[];
}

export function LiveLedger({ events }: LiveLedgerProps) {
    return (
        <div className="bg-background/40 border border-border rounded-[2rem] p-6 backdrop-blur-3xl relative overflow-hidden h-[400px] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-2 h-2 rounded-full bg-primary animate-ping absolute inset-0" />
                        <div className="w-2 h-2 rounded-full bg-primary relative" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Live Ledger</span>
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tighter">Real-time Activity Stream</span>
                    </div>
                </div>
                <Zap className="w-3 h-3 text-primary/50" />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-hide">
                <AnimatePresence initial={false}>
                    {events.length === 0 ? (
                        <div className="text-center py-10 opacity-50 flex flex-col items-center">
                            <Clock className="w-8 h-8 mb-2" />
                            <span className="text-[10px] uppercase font-black tracking-widest">Waiting for events...</span>
                        </div>
                    ) : (
                        events.map((event) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: -20, height: 0 }}
                                animate={{ opacity: 1, x: 0, height: "auto" }}
                                exit={{ opacity: 0, x: 20 }}
                                className="group relative pl-4 border-l border-border py-1"
                            >
                                <div className={cn(
                                    "absolute left-[-3px] top-2 w-1.5 h-1.5 rounded-full",
                                    event.status === 'success' ? "bg-emerald-500" :
                                        event.status === 'warning' ? "bg-amber-500" :
                                            event.status === 'danger' ? "bg-rose-500" : "bg-primary"
                                )} />

                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-black text-foreground uppercase tracking-tight group-hover:text-foreground transition-colors">
                                        {event.title}
                                    </span>
                                    <span className="text-[10px] font-medium text-muted-foreground uppercase tabular-nums">
                                        {event.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-[9px] text-muted-foreground font-medium group-hover:text-muted-foreground transition-colors mt-0.5">
                                    {event.description}
                                </p>

                                <div className="absolute inset-0 bg-white/[0.01] rounded-lg -m-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">System Operational</span>
                </div>
                <span className="text-[10px] font-black text-zinc-800 uppercase tabular-nums">SYNC: 100%</span>
            </div>
        </div>
    );
}
