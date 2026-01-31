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
    const minutes = Array.from({ length: 60 / minuteStep }, (_, i) => i * minuteStep);

    const hourRef = React.useRef<HTMLDivElement>(null);
    const minuteRef = React.useRef<HTMLDivElement>(null);
    const isDragging = React.useRef(false);
    const startY = React.useRef(0);
    const startScrollTop = React.useRef(0);

    // Sync with external value changes
    React.useEffect(() => {
        const [h, m] = value.split(':').map(Number);
        if (!isNaN(h)) setSelectedHour(h);
        if (!isNaN(m)) setSelectedMinute(m);

        // Auto-scroll to selected on mount/change (optional, good for UX)
        // This needs careful handling to not fight user scroll. 
        // We'll skip auto-scroll for now to respect user position, or add it only on value prop change from outside.
    }, [value]);

    // Drag Handlers
    const handleMouseDown = (e: React.MouseEvent, ref: React.RefObject<HTMLDivElement | null>) => {
        if (!ref.current) return;
        isDragging.current = true;
        startY.current = e.clientY;
        startScrollTop.current = ref.current.scrollTop;
        ref.current.style.cursor = 'grabbing';
        ref.current.style.scrollSnapType = 'none'; // Disable snap while dragging
    };

    const handleMouseMove = (e: React.MouseEvent, ref: React.RefObject<HTMLDivElement | null>) => {
        if (!isDragging.current || !ref.current) return;
        e.preventDefault();
        const deltaY = e.clientY - startY.current;
        ref.current.scrollTop = startScrollTop.current - deltaY;
    };

    const handleMouseUp = (ref: React.RefObject<HTMLDivElement | null>) => {
        if (!isDragging.current || !ref.current) return;
        isDragging.current = false;
        ref.current.style.cursor = 'grab';
        ref.current.style.scrollSnapType = 'y mandatory'; // Re-enable snap
        // Optional: Smoothly snap to nearest after release if momentum didn't do it
    };

    const handleMouseLeave = (ref: React.RefObject<HTMLDivElement | null>) => {
        if (isDragging.current) handleMouseUp(ref);
    };

    // Click handlers remain for direct selection
    const handleHourClick = (h: number) => {
        setSelectedHour(h);
        onChange(`${h.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`);
        // Scroll to item
        // Not implementing auto-scroll on click to keep it simple, changing value is enough as user will likely scroll
    };

    const handleMinuteClick = (m: number) => {
        setSelectedMinute(m);
        onChange(`${selectedHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    };

    // Scroll Handlers
    const handleScroll = (e: React.UIEvent<HTMLDivElement>, type: 'hour' | 'minute') => {
        const container = e.currentTarget;
        const itemHeight = 40;
        const scrollTop = container.scrollTop;
        const index = Math.round(scrollTop / itemHeight);

        if (type === 'hour') {
            const newHour = minHour + index;
            const clampedHour = Math.max(minHour, Math.min(maxHour, newHour));
            if (clampedHour !== selectedHour) {
                setSelectedHour(clampedHour);
                onChange(`${clampedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`);
            }
        } else {
            const safeIndex = Math.max(0, Math.min(minutes.length - 1, index));
            const safeMinute = minutes[safeIndex];

            if (safeMinute !== selectedMinute) {
                setSelectedMinute(safeMinute);
                onChange(`${selectedHour.toString().padStart(2, '0')}:${safeMinute.toString().padStart(2, '0')}`);
            }
        }
    };

    return (
        <div className={cn("flex bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl w-48 h-40 select-none relative group", className)}>
            <div className="absolute top-1/2 left-0 right-0 h-10 -mt-5 bg-white/5 pointer-events-none z-10 border-y border-white/10" />

            <div
                ref={hourRef}
                className="flex-1 overflow-y-auto snap-y snap-mandatory relative scroll-smooth cursor-grab active:cursor-grabbing [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                onMouseDown={(e) => handleMouseDown(e, hourRef)}
                onMouseMove={(e) => handleMouseMove(e, hourRef)}
                onMouseUp={() => handleMouseUp(hourRef)}
                onMouseLeave={() => handleMouseLeave(hourRef)}
                onScroll={(e) => handleScroll(e, 'hour')}
                style={{ paddingBlock: 'calc(50% - 20px)' }}
            >
                <style jsx>{`
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}</style>
                {hours.map((h) => (
                    <div
                        key={h}
                        className={cn(
                            "h-10 flex items-center justify-center snap-center text-sm transition-all duration-200",
                            selectedHour === h ? "text-white font-bold text-lg scale-110" : "text-zinc-600 hover:text-zinc-400"
                        )}
                        onClick={() => handleHourClick(h)}
                    >
                        {h.toString().padStart(2, '0')}
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-center text-zinc-600 font-bold bg-zinc-900/50 z-20 pb-0.5">:</div>

            <div
                ref={minuteRef}
                className="flex-1 overflow-y-auto snap-y snap-mandatory relative scroll-smooth cursor-grab active:cursor-grabbing [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                onMouseDown={(e) => handleMouseDown(e, minuteRef)}
                onMouseMove={(e) => handleMouseMove(e, minuteRef)}
                onMouseUp={() => handleMouseUp(minuteRef)}
                onMouseLeave={() => handleMouseLeave(minuteRef)}
                onScroll={(e) => handleScroll(e, 'minute')}
                style={{ paddingBlock: 'calc(50% - 20px)' }}
            >
                {minutes.map((m) => (
                    <div
                        key={m}
                        className={cn(
                            "h-10 flex items-center justify-center snap-center text-sm transition-all duration-200",
                            selectedMinute === m ? "text-white font-bold text-lg scale-110" : "text-zinc-600 hover:text-zinc-400"
                        )}
                        onClick={() => handleMinuteClick(m)}
                    >
                        {m.toString().padStart(2, '0')}
                    </div>
                ))}
            </div>
        </div>
    );
}
