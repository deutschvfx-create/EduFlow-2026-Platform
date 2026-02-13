"use client";

import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Users, GraduationCap, Calendar, BarChart3, Database, Zap } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";

interface NodeProps {
    id: string;
    label: string;
    icon: React.ElementType;
    x: number;
    y: number;
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

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (activePulse) {
            const id = Date.now();
            setPulses((prev) => [...prev, { id, nodeId: activePulse }]);
            setTimeout(() => {
                setPulses((prev) => prev.filter((p) => p.id !== id));
            }, 2500);
        }
    }, [activePulse]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    };

    const handleMouseLeave = () => {
        mouseX.set(200);
        mouseY.set(150);
    };

    // Cubic Bezier Path helper
    const getBezierPath = (x1: number, y1: number, x2: number, y2: number) => {
        const cx1 = x1 + (x2 - x1) * 0.5;
        const cy1 = y1;
        const cx2 = x1 + (x2 - x1) * 0.5;
        const cy2 = y2;
        return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full h-[400px] bg-background/80 rounded-[2rem] border border-border overflow-hidden backdrop-blur-xl mb-6 shadow-2xl shadow-cyan-500/10 group"
        >
            {/* Atmosphere Background */}
            <div className="absolute inset-0 opacity-50 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent" />
                {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-white w-[1px] h-[1px]"
                        initial={{
                            x: Math.random() * 400,
                            y: Math.random() * 400,
                            opacity: Math.random()
                        }}
                        animate={{
                            y: [null, Math.random() * 400],
                            opacity: [0, 1, 0]
                        }}
                        transition={{
                            duration: 5 + Math.random() * 10,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{ left: `${(i * 5)}%`, top: `${(i * 5)}%` }}
                    />
                ))}
            </div>

            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
                <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <radialGradient id="coreGrad">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#0891b2" stopOpacity="0.2" />
                    </radialGradient>
                </defs>

                {/* Connections */}
                {NODES.map((node) => {
                    const path = getBezierPath(coreX, coreY, node.x, node.y);
                    return (
                        <g key={`path-${node.id}`}>
                            <motion.path
                                d={path}
                                stroke="rgba(6, 182, 212, 0.15)"
                                strokeWidth="1.5"
                                fill="none"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 2, ease: "easeInOut" }}
                            />

                            {/* Real-time Bezier Pulses */}
                            <AnimatePresence>
                                {pulses
                                    .filter((p) => p.nodeId === node.id)
                                    .map((pulse) => (
                                        <motion.g key={pulse.id}>
                                            <motion.circle
                                                r="2.5"
                                                fill="#22d3ee"
                                                filter="url(#glow)"
                                                initial={{ offsetDistance: "0%" }}
                                                animate={{ offsetDistance: "100%" }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 2, ease: "circIn" }}
                                                style={{ offsetPath: `path('${path}')` }}
                                            />
                                            {/* Trail effect */}
                                            <motion.path
                                                d={path}
                                                stroke="#22d3ee"
                                                strokeWidth="1.5"
                                                fill="none"
                                                initial={{ pathLength: 0, opacity: 0.5 }}
                                                animate={{ pathLength: 1, opacity: 0 }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                            />
                                        </motion.g>
                                    ))}
                            </AnimatePresence>
                        </g>
                    );
                })}

                {/* Core Node with Suspension */}
                <SuspendedNode x={coreX} y={coreY} isCore>
                    <circle r="22" className="fill-cyan-600/10 stroke-cyan-500/40" strokeWidth="1" />
                    <circle r="16" className="fill-cyan-500/20 stroke-cyan-400/80" strokeWidth="1.5" filter="url(#glow)" />
                    <Database className="text-foreground" x={-10} y={-10} width={20} height={20} />
                </SuspendedNode>

                {/* Orbit Nodes */}
                {NODES.map((node) => (
                    <SuspendedNode key={node.id} x={node.x} y={node.y} mouseX={springX} mouseY={springY}>
                        <circle
                            r="18"
                            className={activePulse === node.id ? "fill-cyan-400 stroke-white scale-110" : "fill-zinc-900/90 stroke-zinc-700"}
                            strokeWidth="1.5"
                            style={{ transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
                        />
                        <node.icon
                            className={activePulse === node.id ? "text-zinc-900" : "text-muted-foreground"}
                            x={-8} y={-8} width={16} height={16}
                        />
                        <motion.text
                            y={30}
                            textAnchor="middle"
                            className="text-[10px] font-black fill-zinc-500 uppercase tracking-[0.3em]"
                            animate={{ opacity: [0.4, 0.7, 0.4] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            {node.label}
                        </motion.text>
                    </SuspendedNode>
                ))}
            </svg>

            <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <div className="relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping absolute inset-0" />
                    <div className="w-2.5 h-2.5 rounded-full bg-primary relative" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-foreground uppercase tracking-widest leading-none">Anti-Gravity Map</span>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tighter mt-1">Live Subsystem Feed</span>
                </div>
            </div>

            <div className="absolute top-6 right-6">
                <Zap className="w-4 h-4 text-primary/50" />
            </div>
        </div>
    );
}

interface SuspendedNodeProps {
    children: React.ReactNode;
    x: number;
    y: number;
    isCore?: boolean;
    mouseX?: any;
    mouseY?: any;
}

function SuspendedNode({ children, x, y, isCore = false, mouseX, mouseY }: SuspendedNodeProps) {
    // Anti-gravity floating animation
    const floatX = [0, Math.random() * 10 - 5, 0];
    const floatY = [0, Math.random() * 10 - 5, 0];

    // Magnetic reaction
    const nodeX = useTransform(mouseX || useMotionValue(x), (value) => {
        const mx = value as number;
        if (isCore) return x;
        const dx = mx - x;
        return x + (Math.abs(dx) < 80 ? dx * 0.1 : 0);
    });
    const nodeY = useTransform(mouseY || useMotionValue(y), (value) => {
        const my = value as number;
        if (isCore) return y;
        const dy = my - y;
        return y + (Math.abs(dy) < 80 ? dy * 0.1 : 0);
    });

    return (
        <motion.g
            style={{ x: nodeX, y: nodeY }}
            animate={{
                x: isCore ? x : undefined,
                y: isCore ? y : undefined,
                translateY: floatY,
                translateX: floatX
            }}
            transition={{
                translateY: { duration: 4 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" },
                translateX: { duration: 5 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }
            }}
        >
            {children}
        </motion.g>
    );
}
