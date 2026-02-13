"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Student } from "@/lib/types/student";
import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

interface MatrixPoint {
    student: Student;
    attendance: number;
    grade: number;
    id: string;
}

interface IntelligenceMatrixProps {
    data: MatrixPoint[];
}

export function IntelligenceMatrix({ data }: IntelligenceMatrixProps) {
    return (
        <div className="bg-background/40 border border-border rounded-[2rem] p-6 backdrop-blur-3xl relative overflow-hidden h-[400px] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Intelligence Matrix</span>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tighter mt-0.5">Performance Cluster Analysis</span>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Growth</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500/50" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Risk</span>
                    </div>
                </div>
            </div>

            <div className="relative flex-1 mt-4 border-l border-b border-border">
                {/* Grid Lines */}
                <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-5 pointer-events-none">
                    {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className="border-t border-r border-white" />
                    ))}
                </div>

                {/* Axis Labels */}
                <div className="absolute -left-8 top-1/2 -rotate-90 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Attendance</div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Performance</div>

                {/* Data Points */}
                <div className="absolute inset-0">
                    {data.map((point) => (
                        <motion.div
                            key={point.id}
                            className="absolute group"
                            style={{
                                left: `${point.grade}%`,
                                bottom: `${point.attendance}%`,
                            }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        >
                            <div className={cn(
                                "w-2.5 h-2.5 rounded-full border-2 border-border shadow-lg cursor-help transition-all duration-500",
                                point.grade > 70 && point.attendance > 70 ? "bg-emerald-500 shadow-emerald-500/20" :
                                    point.grade < 50 || point.attendance < 50 ? "bg-rose-500 shadow-rose-500/20" :
                                        "bg-primary shadow-cyan-500/20"
                            )} />

                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-card border border-border rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 min-w-[120px] backdrop-blur-xl shadow-2xl">
                                <p className="text-[9px] font-black text-foreground uppercase truncate">{point.student.lastName} {point.student.firstName}</p>
                                <div className="flex justify-between mt-1 pt-1 border-t border-border">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Grade</span>
                                    <span className="text-[10px] font-black text-primary">{point.grade}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Attend</span>
                                    <span className="text-[10px] font-black text-primary">{point.attendance}%</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Zone Overlays (Subtle) */}
                <div className="absolute right-0 top-0 w-1/3 h-1/3 bg-emerald-500/20 rounded-bl-[4rem]" />
                <div className="absolute left-0 bottom-0 w-1/4 h-1/4 bg-rose-500/20 rounded-tr-[4rem]" />
            </div>

            <div className="mt-8 flex justify-between">
                <div className="flex flex-col">
                    <span className="text-[12px] font-black text-foreground tracking-tighter">{data.length}</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Tracked Entities</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[12px] font-black text-emerald-400 tracking-tighter">
                        {Math.round((data.filter(d => d.grade > 70 && d.attendance > 70).length / (data.length || 1)) * 100)}%
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Growth Cluster</span>
                </div>
            </div>
        </div>
    );
}
