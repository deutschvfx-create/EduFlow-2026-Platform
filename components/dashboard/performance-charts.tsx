
"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, Target, Activity } from "lucide-react";

export function AttendanceTrend() {
    // Mock data for the curve
    const points = "0,80 40,60 80,75 120,40 160,50 200,20 240,45 280,10";

    return (
        <div className="relative h-64 w-full bg-zinc-950/20 rounded-xl border border-zinc-800/50 p-4 overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-500" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Attendance Pulse</span>
                </div>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6, 7].map(i => (
                        <div key={i} className={`h-1 w-3 rounded-full ${i > 5 ? 'bg-zinc-800' : 'bg-emerald-500/50'}`} />
                    ))}
                </div>
            </div>

            <div className="relative h-32 w-full mt-4">
                <svg viewBox="0 0 280 100" className="w-full h-full">
                    {/* Grid Lines */}
                    <line x1="0" y1="20" x2="280" y2="20" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" />
                    <line x1="0" y1="50" x2="280" y2="50" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" />
                    <line x1="0" y1="80" x2="280" y2="80" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" />

                    {/* Area fill */}
                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        d={`M 0 100 L ${points} L 280 100 Z`}
                        fill="url(#gradient-emerald)"
                        className="opacity-20"
                    />

                    {/* Main Line */}
                    <motion.polyline
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        points={points}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    />

                    {/* Gradient Defs */}
                    <defs>
                        <linearGradient id="gradient-emerald" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-6">
                <MiniStat label="Avg" value="92%" />
                <MiniStat label="Peak" value="98%" />
                <MiniStat label="Low" value="84%" />
                <MiniStat label="Target" value="95%" />
            </div>
        </div>
    );
}

function MiniStat({ label, value }: { label: string, value: string }) {
    return (
        <div className="text-center p-2 rounded-lg bg-zinc-900/50 border border-zinc-800/30">
            <div className="text-[9px] text-zinc-500 uppercase font-bold">{label}</div>
            <div className="text-xs font-black text-emerald-400 mt-0.5">{value}</div>
        </div>
    );
}

export function EnrollmentFunnel() {
    return (
        <div className="h-64 w-full bg-zinc-950/20 rounded-xl border border-zinc-800/50 p-4 flex flex-col group">
            <div className="flex items-center gap-2 mb-6">
                <Target className="h-4 w-4 text-indigo-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Enrollment Funnel</span>
            </div>

            <div className="flex-1 space-y-3 px-4">
                <FunnelStep label="Leads" value="124" width="w-full" color="bg-indigo-500" />
                <FunnelStep label="Trials" value="48" width="w-[60%]" color="bg-indigo-400" />
                <FunnelStep label="Paid" value="12" width="w-[20%]" color="bg-emerald-400" />
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-800/50 flex justify-between items-center px-1">
                <div className="text-xs text-zinc-500">Conv. Rate</div>
                <div className="text-sm font-black text-white">9.6% <span className="text-emerald-500 text-[10px]">↑ 2%</span></div>
            </div>
        </div>
    );
}

function FunnelStep({ label, value, width, color }: any) {
    return (
        <div className="relative h-10 w-full flex items-center justify-between px-3">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                className={`absolute left-0 inset-y-0 rounded-lg opacity-10 ${color}`}
            />
            <div className="flex items-center gap-2 z-10 transition-transform group-hover:translate-x-1">
                <div className={`h-1.5 w-1.5 rounded-full ${color}`} />
                <span className="text-[11px] font-bold text-zinc-300">{label}</span>
            </div>
            <div className="text-xs font-black text-white z-10">{value}</div>
            <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                className={`absolute bottom-0 left-0 h-[2px] ${color} opacity-30 origin-left`}
                style={{ width: width === 'w-full' ? '100%' : width.replace('w-[', '').replace(']', '') }}
            />
        </div>
    );
}

export function RevenueRadial() {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const progress = 78; // 78% of target
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="h-64 w-full bg-zinc-950/20 rounded-xl border border-zinc-800/50 p-4 flex flex-col items-center justify-center group">
            <div className="flex items-center gap-2 w-full mb-2">
                <TrendingUp className="h-4 w-4 text-purple-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Target Achievement</span>
            </div>

            <div className="relative h-32 w-32 mt-2">
                <svg className="h-full w-full rotate-[-90deg]">
                    <circle
                        cx="64"
                        cy="64"
                        r={radius}
                        fill="none"
                        stroke="rgba(168, 85, 247, 0.1)"
                        strokeWidth="8"
                    />
                    <motion.circle
                        cx="64"
                        cy="64"
                        r={radius}
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: strokeDashoffset }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        strokeLinecap="round"
                        className="drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-2xl font-black text-white">{progress}%</div>
                    <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest text-center">of Monthly<br />Goal</div>
                </div>
            </div>

            <div className="mt-4 w-full space-y-2">
                <div className="flex justify-between text-[10px]">
                    <span className="text-zinc-500">Target</span>
                    <span className="text-white font-bold">$16,000</span>
                </div>
                <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "78%" }}
                        className="h-full bg-purple-500"
                    />
                </div>
            </div>
        </div>
    );
}
