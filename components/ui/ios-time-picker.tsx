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

    // Sync with external value changes
    React.useEffect(() => {
        const [h, m] = value.split(':').map(Number);
        if (!isNaN(h)) setSelectedHour(h);
        if (!isNaN(m)) setSelectedMinute(m);
    }, [value]);

    const handleHourClick = (h: number) => {
        setSelectedHour(h);
        onChange(`${h.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`);
    };

    const handleMinuteClick = (m: number) => {
        setSelectedMinute(m);
        onChange(`${selectedHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    };

    return (
        <div className={cn("flex bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl w-48 h-40 select-none relative", className)}>
            <div className="absolute top-1/2 left-0 right-0 h-10 -mt-5 bg-white/5 pointer-events-none z-10 border-y border-white/10" />

            <div className="flex-1 overflow-y-auto no-scrollbar snap-y snap-mandatory py-[60px] relative scroll-smooth">
                <style jsx>{`
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}</style>
                {hours.map((h) => (
                    <div
                        key={h}
                        className={cn(
                            "h-10 flex items-center justify-center snap-center text-sm transition-colors cursor-pointer",
                            selectedHour === h ? "text-white font-bold text-lg" : "text-zinc-600 hover:text-zinc-400"
                        )}
                        onClick={() => handleHourClick(h)}
                        ref={el => {
                            if (selectedHour === h && el) {
                                // Optional logic to center on mount, but CSS snap usually handles user interaction
                                // el.scrollIntoView({ block: 'center' }); // Can be jarring if auto-triggered
                            }
                        }}
                    >
                        {h.toString().padStart(2, '0')}
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-center text-zinc-600 font-bold bg-zinc-900/50 z-20">:</div>

            <div className="flex-1 overflow-y-auto no-scrollbar snap-y snap-mandatory py-[60px] relative scroll-smooth">
                {minutes.map((m) => (
                    <div
                        key={m}
                        className={cn(
                            "h-10 flex items-center justify-center snap-center text-sm transition-colors cursor-pointer",
                            selectedMinute === m ? "text-white font-bold text-lg" : "text-zinc-600 hover:text-zinc-400"
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
