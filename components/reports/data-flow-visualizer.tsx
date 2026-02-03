"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Users, GraduationCap, Calendar, BarChart3, Database } from "lucide-react";
import React, { useEffect, useState } from "react";

interface NodeProps {
    id: string;
    label: string;
    icon: React.ElementType;
    x: number;
    y: number;
    isActive?: boolean;
}

const NODES: NodeProps[] = [
    { id: "identity", label: "Identity", icon: Users, x: 200, y: 50 },
    { id: "logistics", label: "Logistics", icon: Calendar, x: 350, y: 150 },
    { id: "results", label: "Results", icon: BarChart3, x: 200, y: 250 },
    { id: "content", label: "Content", icon: GraduationCap, x: 50, y: 150 },
];

export function DataFlowVisualizer({ activePulse }: { activePulse?: string }) {
    const [pulses, setPulses] = useState<{ id: number; nodeId: string }[]>([]);
    const coreX = 200;
    const coreY = 150;

    useEffect(() => {
        if (activePulse) {
            const id = Date.now();
            setPulses((prev) => [...prev, { id, nodeId: activePulse }]);
            setTimeout(() => {
                setPulses((prev) => prev.filter((p) => p.id !== id));
            }, 2000);
        }
    }, [activePulse]);

    return (
        <div className="relative w-full h-[320px] bg-zinc-950/50 rounded-2xl border border-white/5 overflow-hidden backdrop-blur-sm mb-6">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
                {/* Connections */}
                {NODES.map((node) => (
                    <g key={`path-${node.id}`}>
                        <motion.path
                            d={`M ${coreX} ${coreY} L ${node.x} ${node.y}`}
                            stroke="rgba(99, 102, 241, 0.2)"
                            strokeWidth="2"
                            fill="none"
                            strokeDasharray="4 4"
                        />
                        {/* Real-time Pulses */}
                        <AnimatePresence>
                            {pulses
                                .filter((p) => p.nodeId === node.id)
                                .map((pulse) => (
                                    <motion.circle
                                        key={pulse.id}
                                        r="3"
                                        fill="#6366f1"
                                        initial={{ offsetDistance: "0%" }}
                                        animate={{ offsetDistance: "100%" }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 1.5, ease: "easeInOut" }}
                                        style={{
                                            offsetPath: `path('M ${coreX} ${coreY} L ${node.x} ${node.y}')`,
                                        }}
                                    >
                                        <animate attributeName="r" values="2;4;2" dur="0.5s" repeatCount="indefinite" />
                                    </motion.circle>
                                ))}
                        </AnimatePresence>
                    </g>
                ))}

                {/* Core Node */}
                <motion.g
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ repeat: Infinity, duration: 3, repeatType: "reverse" }}
                >
                    <circle cx={coreX} cy={coreY} r="25" className="fill-indigo-600/20 stroke-indigo-500 shadow-2xl" strokeWidth="2" />
                    <Database className="text-indigo-400" x={coreX - 10} y={coreY - 10} width={20} height={20} />
                </motion.g>

                {/* Orbit Nodes */}
                {NODES.map((node) => (
                    <motion.g
                        key={node.id}
                        whileHover={{ scale: 1.1 }}
                        className="cursor-help"
                    >
                        <circle
                            cx={node.x}
                            cy={node.y}
                            r="18"
                            className={activePulse === node.id ? "fill-indigo-500/40 stroke-indigo-400" : "fill-zinc-900/80 stroke-zinc-700"}
                            strokeWidth="1.5"
                        />
                        <node.icon
                            className={activePulse === node.id ? "text-white" : "text-zinc-500"}
                            x={node.x - 8}
                            y={node.y - 8}
                            width={16}
                            height={16}
                        />
                        <text
                            x={node.x}
                            y={node.y + 30}
                            textAnchor="middle"
                            className="text-[8px] font-bold fill-zinc-500 uppercase tracking-widest"
                        >
                            {node.label}
                        </text>
                    </motion.g>
                ))}
            </svg>

            <div className="absolute top-4 left-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">Live Telemetry</span>
                </div>
            </div>
        </div>
    );
}
