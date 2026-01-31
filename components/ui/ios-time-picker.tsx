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
    const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep);

    const hourRef = React.useRef<HTMLDivElement>(null);
    const minuteRef = React.useRef<HTMLDivElement>(null);
    const isDragging = React.useRef(false);
    const startY = React.useRef(0);
    const startScrollTop = React.useRef(0);

    React.useEffect(() => {
        const [h, m] = value.split(':').map(Number);
        if (!isNaN(h) && h !== selectedHour) setSelectedHour(h);
        if (!isNaN(m) && m !== selectedMinute) setSelectedMinute(m);
    }, [value, selectedHour, selectedMinute]);

    const handleMouseDown = (e: React.MouseEvent, ref: React.RefObject<HTMLDivElement | null>) => {
        if (!ref.current) return;
        isDragging.current = true;
        startY.current = e.clientY;
        startScrollTop.current = ref.current.scrollTop;
        ref.current.style.cursor = 'grabbing';
        ref.current.style.scrollSnapType = 'none';
        document.body.style.userSelect = 'none';
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
        ref.current.style.scrollSnapType = 'y mandatory';
        document.body.style.userSelect = 'auto';
    };

    const handleMouseLeave = (ref: React.RefObject<HTMLDivElement | null>) => {
        if (isDragging.current) handleMouseUp(ref);
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>, type: 'hour' | 'minute') => {
        const container = e.currentTarget;
        const itemHeight = 40;
        const scrollTop = container.scrollTop;
        const index = Math.round(scrollTop / itemHeight);

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
            <div className="absolute top-1/2 left-0 right-0 h-10 -mt-5 bg-white/5 pointer-events-none z-10 border-y border-white/10" />

            <div
                ref={hourRef}
                className="flex-1 overflow-y-auto snap-y snap-mandatory relative scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing"
                onMouseDown={(e) => handleMouseDown(e, hourRef)}
                onMouseMove={(e) => handleMouseMove(e, hourRef)}
                onMouseUp={() => handleMouseUp(hourRef)}
                onMouseLeave={() => handleMouseLeave(hourRef)}
                onScroll={(e) => handleScroll(e, 'hour')}
                style={{ paddingBlock: 'calc(50% - 20px)' }}
            >
                {hours.map((h) => (
                    <div
                        key={h}
                        className={cn(
                            "h-10 flex items-center justify-center snap-center text-sm transition-all duration-200",
                            selectedHour === h ? "text-white font-bold text-lg scale-110" : "text-zinc-600 hover:text-zinc-400"
                        )}
                        onClick={() => {
                            setSelectedHour(h);
                            onChange(`${h.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`);
                            if (hourRef.current) hourRef.current.scrollTop = hours.indexOf(h) * 40;
                        }}
                    >
                        {h.toString().padStart(2, '0')}
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-center text-zinc-600 font-bold bg-zinc-900/50 z-20 pb-0.5">:</div>

            <div
                ref={minuteRef}
                className="flex-1 overflow-y-auto snap-y snap-mandatory relative scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing"
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
                        onClick={() => {
                            setSelectedMinute(m);
                            onChange(`${selectedHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
                            if (minuteRef.current) minuteRef.current.scrollTop = minutes.indexOf(m) * 40;
                        }}
                    >
                        {m.toString().padStart(2, '0')}
                    </div>
                ))}
            </div>
        </div>
    );
}
