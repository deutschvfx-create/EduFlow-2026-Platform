"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TimePickerProps {
    value: string; // "HH:MM"
    onChange: (value: string) => void;
    minHour?: number;
    maxHour?: number;
    minuteStep?: number;
}

export function IOSStyleTimePicker({
    value,
    onChange,
    minHour = 8,
    maxHour = 22,
    minuteStep = 15,
    className
}: TimePickerProps & { className?: string }) {
    const [selectedHour, setSelectedHour] = React.useState<number>(parseInt(value.split(':')[0]) || 9);
    const [selectedMinute, setSelectedMinute] = React.useState<number>(parseInt(value.split(':')[1]) || 0);

    const hours = Array.from({ length: maxHour - minHour + 1 }, (_, i) => i + minHour);
    const minutes = Array.from({ length: Math.floor(60 / minuteStep) }, (_, i) => i * minuteStep);

    const hourRef = React.useRef<HTMLDivElement>(null);
    const minuteRef = React.useRef<HTMLDivElement>(null);

    // Physics state
    const isDragging = React.useRef(false);
    const activeRef = React.useRef<React.RefObject<HTMLDivElement | null> | null>(null);
    const startY = React.useRef(0);
    const startScrollTop = React.useRef(0);
    const lastY = React.useRef(0);
    const velocity = React.useRef(0);
    const lastTimestamp = React.useRef(0);
    const animationFrame = React.useRef<number | null>(null);

    // Initial and External Sync
    React.useEffect(() => {
        if (isDragging.current || animationFrame.current) return;

        const [h, m] = value.split(':').map(Number);
        const timer = setTimeout(() => {
            if (!isNaN(h) && hourRef.current) {
                setSelectedHour(h);
                const hIndex = hours.indexOf(h);
                if (hIndex !== -1) {
                    hourRef.current.scrollTop = hIndex * 40;
                    hourRef.current.style.setProperty('--scroll-top', `${hIndex * 40}px`);
                }
            }
            if (!isNaN(m) && minuteRef.current) {
                setSelectedMinute(m);
                const mIndex = minutes.indexOf(m);
                if (mIndex !== -1) {
                    minuteRef.current.scrollTop = mIndex * 40;
                    minuteRef.current.style.setProperty('--scroll-top', `${mIndex * 40}px`);
                }
            }
        }, 50);
        return () => clearTimeout(timer);
    }, [value, hours, minutes]);

    const stopAnimation = () => {
        if (animationFrame.current) {
            cancelAnimationFrame(animationFrame.current);
            animationFrame.current = null;
        }
    };

    const startInertia = (ref: HTMLDivElement, type: 'hour' | 'minute') => {
        let currentVelocity = velocity.current;
        const friction = 0.96;
        const itemHeight = 40;

        const step = () => {
            if (Math.abs(currentVelocity) < 0.2) {
                // Snap to nearest
                const targetScrollTop = Math.round(ref.scrollTop / itemHeight) * itemHeight;
                ref.scrollTo({ top: targetScrollTop, behavior: 'smooth' });

                // Final update
                const index = Math.round(targetScrollTop / itemHeight);
                if (type === 'hour') {
                    const h = hours[Math.max(0, Math.min(hours.length - 1, index))];
                    setSelectedHour(h);
                    onChange(`${h.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`);
                } else {
                    const m = minutes[Math.max(0, Math.min(minutes.length - 1, index))];
                    setSelectedMinute(m);
                    onChange(`${selectedHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
                }
                animationFrame.current = null;
                return;
            }

            ref.scrollTop -= currentVelocity;
            ref.style.setProperty('--scroll-top', `${ref.scrollTop}px`);
            currentVelocity *= friction;
            animationFrame.current = requestAnimationFrame(step);
        };
        animationFrame.current = requestAnimationFrame(step);
    };

    // Global drag handlers
    React.useEffect(() => {
        const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
            if (!isDragging.current || !activeRef.current?.current) return;

            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            const now = performance.now();
            const dt = now - lastTimestamp.current;

            if (dt > 1) { // Avoid division by zero and micro-stutters
                const instantVelocity = (lastY.current - clientY);
                velocity.current = velocity.current * 0.7 + instantVelocity * 0.3; // Low-pass filter for smoothness
            }

            const deltaY = clientY - startY.current;
            const nextScrollTop = startScrollTop.current - deltaY;

            const ref = activeRef.current.current;
            ref.scrollTop = nextScrollTop;
            ref.style.setProperty('--scroll-top', `${nextScrollTop}px`);

            lastY.current = clientY;
            lastTimestamp.current = now;

            if (e.cancelable) e.preventDefault();
        };

        const handleGlobalUp = () => {
            if (!isDragging.current || !activeRef.current?.current) return;

            const ref = activeRef.current.current;
            const type = activeRef.current === hourRef ? 'hour' : 'minute';
            isDragging.current = false;
            ref.style.cursor = 'grab';
            document.body.style.userSelect = 'auto';

            startInertia(ref, type);
            activeRef.current = null;
        };

        window.addEventListener('mousemove', handleGlobalMove, { passive: false });
        window.addEventListener('mouseup', handleGlobalUp);
        window.addEventListener('touchmove', handleGlobalMove, { passive: false });
        window.addEventListener('touchend', handleGlobalUp);

        return () => {
            window.removeEventListener('mousemove', handleGlobalMove);
            window.removeEventListener('mouseup', handleGlobalUp);
            window.removeEventListener('touchmove', handleGlobalMove);
            window.removeEventListener('touchend', handleGlobalUp);
            stopAnimation();
        };
    }, [selectedHour, selectedMinute, hours, minutes]);

    const startDrag = (clientY: number, ref: React.RefObject<HTMLDivElement | null>) => {
        stopAnimation();
        if (!ref.current) return;
        isDragging.current = true;
        activeRef.current = ref;
        startY.current = clientY;
        lastY.current = clientY;
        lastTimestamp.current = performance.now();
        velocity.current = 0;
        startScrollTop.current = ref.current.scrollTop;
        ref.current.style.cursor = 'grabbing';
        ref.current.style.scrollSnapType = 'none';
        document.body.style.userSelect = 'none';
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (!isDragging.current) {
            e.currentTarget.style.setProperty('--scroll-top', `${e.currentTarget.scrollTop}px`);
        }
    };

    return (
        <div className={cn("flex bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl w-48 h-40 select-none relative group touch-none", className)}>
            <div className="absolute inset-x-0 top-[60px] h-10 border-y border-white/10 bg-white/5 pointer-events-none z-20" />
            <div className="absolute inset-0 pointer-events-none z-30">
                <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-zinc-950 via-zinc-950/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
            </div>

            {/* Hours */}
            <div
                ref={hourRef}
                className="flex-1 overflow-y-auto no-scrollbar relative cursor-grab active:cursor-grabbing [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                onMouseDown={(e) => startDrag(e.clientY, hourRef)}
                onTouchStart={(e) => startDrag(e.touches[0].clientY, hourRef)}
                onScroll={handleScroll}
                style={{ perspective: '500px', scrollSnapType: 'y mandatory' }}
            >
                <div className="h-[60px] pointer-events-none" />
                {hours.map((h, i) => (
                    <div
                        key={h}
                        className={cn(
                            "h-10 flex items-center justify-center text-sm transition-all duration-150 preserve-3d py-0 scroll-snap-align-center",
                            selectedHour === h ? "text-white font-bold text-lg scale-110" : "text-zinc-600 grayscale opacity-40 scale-90"
                        )}
                        style={{
                            transform: `rotateX(calc((${i} * 40px - var(--scroll-top, ${hours.indexOf(selectedHour) * 40}px)) * -0.9deg)) translateZ(20px)`,
                        }}
                    >
                        {h.toString().padStart(2, '0')}
                    </div>
                ))}
                <div className="h-[60px] pointer-events-none" />
            </div>

            <div className="flex items-center justify-center text-zinc-600 font-bold bg-zinc-900/50 z-20 pb-0.5 px-0.5">:</div>

            {/* Minutes */}
            <div
                ref={minuteRef}
                className="flex-1 overflow-y-auto no-scrollbar relative cursor-grab active:cursor-grabbing [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                onMouseDown={(e) => startDrag(e.clientY, minuteRef)}
                onTouchStart={(e) => startDrag(e.touches[0].clientY, minuteRef)}
                onScroll={handleScroll}
                style={{ perspective: '500px', scrollSnapType: 'y mandatory' }}
            >
                <div className="h-[60px] pointer-events-none" />
                {minutes.map((m, i) => (
                    <div
                        key={m}
                        className={cn(
                            "h-10 flex items-center justify-center text-sm transition-all duration-150 preserve-3d py-0 scroll-snap-align-center",
                            selectedMinute === m ? "text-white font-bold text-lg scale-110" : "text-zinc-600 grayscale opacity-40 scale-90"
                        )}
                        style={{
                            transform: `rotateX(calc((${i} * 40px - var(--scroll-top, ${minutes.indexOf(selectedMinute) * 40}px)) * -0.9deg)) translateZ(20px)`,
                        }}
                    >
                        {m.toString().padStart(2, '0')}
                    </div>
                ))}
                <div className="h-[60px] pointer-events-none" />
            </div>
        </div>
    );
}
