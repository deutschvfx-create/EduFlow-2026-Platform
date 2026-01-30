"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Mascot } from "@/components/shared/mascot";
import { Sparkles, GripVertical } from "lucide-react";

interface FloatingBotTriggerProps {
    onClick: () => void;
    hasNewFeatures?: boolean;
}

export function FloatingBotTrigger({ onClick, hasNewFeatures }: FloatingBotTriggerProps) {
    const [isIdle, setIsIdle] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const controls = useAnimation();
    const constraintsRef = useRef(null);

    // Reset idle timer on interaction
    const resetIdle = () => {
        setIsIdle(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setIsIdle(true);
        }, 3000); // 3 seconds to idle
    };

    const [mounted, setMounted] = useState(false);
    const [initialCoords, setInitialCoords] = useState<{ x: number, y: number } | null>(null);

    useEffect(() => {
        setMounted(true);
        // Calculate initial position only on client to avoid hydration mismatch
        setInitialCoords({
            x: window.innerWidth - 80,
            y: window.innerHeight - 150
        });
        resetIdle();
        window.addEventListener('mousemove', resetIdle);
        window.addEventListener('touchstart', resetIdle);
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            window.removeEventListener('mousemove', resetIdle);
            window.removeEventListener('touchstart', resetIdle);
        };
    }, []);

    if (!mounted || !initialCoords) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[50] overflow-hidden">
            {/* Constraint Container - adjusted for safe areas */}
            <div ref={constraintsRef} className="absolute left-4 right-4 top-20 bottom-24 pointer-events-none" />

            <motion.div
                drag
                dragMomentum={false}
                dragConstraints={constraintsRef}
                dragElastic={0.1}
                onDragStart={() => {
                    setIsDragging(true);
                    resetIdle();
                }}
                onDragEnd={() => {
                    setIsDragging(false);
                    resetIdle();
                }}
                onClick={() => {
                    if (!isDragging) onClick();
                }}
                // Initial Position: Bottom Right (Safe for WebView)
                initial={initialCoords}
                animate={{
                    opacity: isIdle ? 0.35 : 1,
                    scale: isDragging ? 0.95 : 1,
                    filter: isIdle ? 'grayscale(70%)' : 'grayscale(0%)',
                }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.05, opacity: 1, filter: 'grayscale(0%)' }}
                whileTap={{ scale: 0.9 }}
                className="absolute pointer-events-auto cursor-grab active:cursor-grabbing group"
            >
                {/* Backdrop Glow */}
                <div className={`absolute inset-0 bg-indigo-500 rounded-full blur-xl transition-opacity duration-500 ${isIdle ? 'opacity-0' : 'opacity-40'}`} />

                {/* Main Bubble */}
                <div className="relative w-14 h-14 md:w-16 md:h-16 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/50 rounded-full shadow-2xl flex items-center justify-center overflow-hidden ring-1 ring-inset ring-white/10">

                    {/* Drag Handle Indicator (visible on hover) */}
                    <div className={`absolute top-1 left-1/2 -translate-x-1/2 text-zinc-600 transition-opacity duration-300 ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
                        <GripVertical className="w-3 h-3 rotate-90" />
                    </div>

                    <Mascot
                        status={hasNewFeatures ? "surprised" : "idle"}
                        className="w-10 h-10 md:w-12 md:h-12 relative z-10"
                    />

                    {/* Notification Badge */}
                    {hasNewFeatures && (
                        <div className="absolute top-0 right-0 p-1">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500 border border-zinc-900"></span>
                            </span>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
