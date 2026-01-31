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

    // Drag and Motion State
    const isDragging = React.useRef(false);
    const activeRef = React.useRef<React.RefObject<HTMLDivElement | null> | null>(null);
    const startY = React.useRef(0);
    const startScrollTop = React.useRef(0);

    // Initial and External Sync
    React.useEffect(() => {
        // DO NOT SYNC while the user is actively dragging, it causes "jumping"
        if (isDragging.current) return;

        const [h, m] = value.split(':').map(Number);

        const timer = setTimeout(() => {
            if (!isNaN(h) && hourRef.current) {
                setSelectedHour(h);
                const hIndex = hours.indexOf(h);
                if (hIndex !== -1) {
                    hourRef.current.scrollTop = hIndex * 40;
                }
            }
            if (!isNaN(m) && minuteRef.current) {
                setSelectedMinute(m);
                const mIndex = minutes.indexOf(m);
                if (mIndex !== -1) {
                    minuteRef.current.scrollTop = mIndex * 40;
                }
            }
        }, 50);

        return () => clearTimeout(timer);
    }, [value, hours, minutes]);

    // Global drag handlers
    React.useEffect(() => {
        const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
            if (!isDragging.current || !activeRef.current?.current) return;

            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            const deltaY = clientY - startY.current;
            activeRef.current.current.scrollTop = startScrollTop.current - deltaY;

            // Prevent scrolling of parent while dragging
            if (e.cancelable) e.preventDefault();
        };

        const handleGlobalUp = () => {
            if (!isDragging.current || !activeRef.current?.current) return;

            isDragging.current = false;
            const ref = activeRef.current.current;
            ref.style.cursor = 'grab';
            ref.style.scrollSnapType = 'y mandatory';
            document.body.style.userSelect = 'auto';
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
        };
    }, []);

    const startDrag = (clientY: number, ref: React.RefObject<HTMLDivElement | null>) => {
        if (!ref.current) return;
        isDragging.current = true;
        activeRef.current = ref;
        startY.current = clientY;
        startScrollTop.current = ref.current.scrollTop;
        ref.current.style.cursor = 'grabbing';
        ref.current.style.scrollSnapType = 'none';
        document.body.style.userSelect = 'none';
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>, type: 'hour' | 'minute') => {
        const container = e.currentTarget;
        const itemHeight = 40;
        const scrollTop = container.scrollTop;
        const index = Math.round(scrollTop / itemHeight);

        // Update CSS variable for the 3D effect without triggering re-renders
        container.style.setProperty('--scroll-top', `${scrollTop}px`);

        if (type === 'hour') {
            const h = hours[Math.max(0, Math.min(hours.length - 1, index))];
            if (h !== selectedHour) {
                setSelectedHour(h);
                onChange(`${h.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`);
            }
        } else {
            const m = minutes[Math.max(0, Math.min(minutes.length - 1, index))];
            if (m !== selectedMinute) {
                setSelectedMinute(m);
                onChange(`${selectedHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
            }
        }
    };

    return (
        <div className={cn("flex bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl w-48 h-40 select-none relative group", className)}>
            {/* 3D Perspective Container */}
            <div className="absolute inset-0 pointer-events-none z-10">
                <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-zinc-950 to-transparent opacity-80" />
                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-zinc-950 to-transparent opacity-80" />
                <div className="absolute top-1/2 left-0 right-0 h-10 -mt-5 bg-white/5 border-y border-white/10" />
            </div>

            {/* Hours Column */}
            <div
                ref={hourRef}
                className="flex-1 overflow-y-auto no-scrollbar snap-y snap-mandatory relative scroll-smooth cursor-grab active:cursor-grabbing [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                onMouseDown={(e) => startDrag(e.clientY, hourRef)}
                onTouchStart={(e) => startDrag(e.touches[0].clientY, hourRef)}
                onScroll={(e) => handleScroll(e, 'hour')}
                style={{ perspective: '500px' }}
            >
                <div className="h-[calc(50%-20px)] pointer-events-none" />
                {hours.map((h, i) => (
                    <div
                        key={h}
                        className={cn(
                            "h-10 flex items-center justify-center snap-center text-sm transition-all duration-300 ease-out preserve-3d",
                            selectedHour === h ? "text-white font-bold text-lg scale-110" : "text-zinc-600 grayscale opacity-40"
                        )}
                        style={{
                            transform: `rotateX(calc((${i} * 40px - var(--scroll-top, ${selectedHour === h ? (hours.indexOf(selectedHour) * 40) : 0}px)) * -0.8deg)) translateZ(10px)`,
                        }}
                    >
                        {h.toString().padStart(2, '0')}
                    </div>
                ))}
                <div className="h-[calc(50%-20px)] pointer-events-none" />
            </div>

            {/* Separator */}
            <div className="flex items-center justify-center text-zinc-600 font-bold bg-zinc-900/50 z-20 pb-0.5 px-0.5">:</div>

            {/* Minutes Column */}
            <div
                ref={minuteRef}
                className="flex-1 overflow-y-auto no-scrollbar snap-y snap-mandatory relative scroll-smooth cursor-grab active:cursor-grabbing [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                onMouseDown={(e) => startDrag(e.clientY, minuteRef)}
                onTouchStart={(e) => startDrag(e.touches[0].clientY, minuteRef)}
                onScroll={(e) => handleScroll(e, 'minute')}
                style={{ perspective: '500px' }}
            >
                <div className="h-[calc(50%-20px)] pointer-events-none" />
                {minutes.map((m, i) => (
                    <div
                        key={m}
                        className={cn(
                            "h-10 flex items-center justify-center snap-center text-sm transition-all duration-300 ease-out preserve-3d",
                            selectedMinute === m ? "text-white font-bold text-lg scale-110" : "text-zinc-600 grayscale opacity-40"
                        )}
                        style={{
                            transform: `rotateX(calc((${i} * 40px - var(--scroll-top, ${selectedMinute === m ? (minutes.indexOf(selectedMinute) * 40) : 0}px)) * -0.8deg)) translateZ(10px)`,
                        }}
                    >
                        {m.toString().padStart(2, '0')}
                    </div>
                ))}
                <div className="h-[calc(50%-20px)] pointer-events-none" />
            </div>
        </div>
    );
}
