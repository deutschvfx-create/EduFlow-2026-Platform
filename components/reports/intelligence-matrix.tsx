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
        <div className="bg-zinc-950/40 border border-white/5 rounded-[2rem] p-6 backdrop-blur-3xl relative overflow-hidden h-[400px] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Intelligence Matrix</span>
                    <span className="text-[8px] font-medium text-zinc-600 uppercase tracking-tighter mt-0.5">Performance Cluster Analysis</span>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                        <span className="text-[8px] font-bold text-zinc-500 uppercase">Growth</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500/50" />
                        <span className="text-[8px] font-bold text-zinc-500 uppercase">Risk</span>
                    </div>
                </div>
            </div>

            <div className="relative flex-1 mt-4 border-l border-b border-white/5">
                {/* Grid Lines */}
                <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-5 pointer-events-none">
                    {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className="border-t border-r border-white" />
                    ))}
                </div>

                {/* Axis Labels */}
                <div className="absolute -left-8 top-1/2 -rotate-90 text-[8px] font-black uppercase tracking-widest text-zinc-700">Attendance</div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-widest text-zinc-700">Performance</div>

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
                                "w-2.5 h-2.5 rounded-full border-2 border-zinc-950 shadow-lg cursor-help transition-all duration-500",
                                point.grade > 70 && point.attendance > 70 ? "bg-emerald-500 shadow-emerald-500/20" :
                                    point.grade < 50 || point.attendance < 50 ? "bg-rose-500 shadow-rose-500/20" :
                                        "bg-indigo-500 shadow-indigo-500/20"
                            )} />

                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-zinc-900 border border-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 min-w-[120px] backdrop-blur-xl shadow-2xl">
                                <p className="text-[9px] font-black text-white uppercase truncate">{point.student.lastName} {point.student.firstName}</p>
                                <div className="flex justify-between mt-1 pt-1 border-t border-white/5">
                                    <span className="text-[7px] font-bold text-zinc-500 uppercase">Grade</span>
                                    <span className="text-[8px] font-black text-indigo-400">{point.grade}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[7px] font-bold text-zinc-500 uppercase">Attend</span>
                                    <span className="text-[8px] font-black text-indigo-400">{point.attendance}%</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Zone Overlays (Subtle) */}
                <div className="absolute right-0 top-0 w-1/3 h-1/3 bg-emerald-500/5 rounded-bl-[4rem]" />
                <div className="absolute left-0 bottom-0 w-1/4 h-1/4 bg-rose-500/5 rounded-tr-[4rem]" />
            </div>

            <div className="mt-8 flex justify-between">
                <div className="flex flex-col">
                    <span className="text-[12px] font-black text-white tracking-tighter">{data.length}</span>
                    <span className="text-[7px] font-bold text-zinc-600 uppercase">Tracked Entities</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[12px] font-black text-emerald-400 tracking-tighter">
                        {Math.round((data.filter(d => d.grade > 70 && d.attendance > 70).length / (data.length || 1)) * 100)}%
                    </span>
                    <span className="text-[7px] font-bold text-zinc-600 uppercase">Growth Cluster</span>
                </div>
            </div>
        </div>
    );
}
