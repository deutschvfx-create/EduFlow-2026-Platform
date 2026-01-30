'use client';

import { useRef, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { format, isSameDay, addDays, startOfWeek } from "date-fns";
import { ru } from "date-fns/locale";

interface MobileDateStripProps {
    currentDate: Date;
    onDateSelect: (date: Date) => void;
}

export function MobileDateStrip({ currentDate, onDateSelect }: MobileDateStripProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Generate 14 days covering current week and next
    // We anchor to the start of the current week to keep it stable
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const days = Array.from({ length: 14 }, (_, i) => addDays(weekStart, i - 2)); // Start slightly before

    const scrollToCurrent = () => {
        if (scrollRef.current) {
            const selected = scrollRef.current.querySelector('[data-selected="true"]');
            if (selected) {
                selected.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        }
    };

    useEffect(() => {
        scrollToCurrent();
    }, [currentDate]);

    return (
        <div className="w-full bg-zinc-950 border-b border-zinc-800 sticky top-0 z-10">
            <div
                ref={scrollRef}
                className="flex overflow-x-auto py-2 px-2 gap-2 no-scrollbar snap-x"
                style={{ scrollbarWidth: 'none' }}
            >
                {days.map((date) => {
                    const isSelected = isSameDay(date, currentDate);
                    const isToday = isSameDay(date, new Date());

                    return (
                        <button
                            key={date.toString()}
                            data-selected={isSelected}
                            onClick={() => onDateSelect(date)}
                            className={cn(
                                "flex flex-col items-center justify-center min-w-[50px] h-[64px] rounded-2xl snap-center transition-all duration-200 border",
                                isSelected
                                    ? "bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/20 scale-105"
                                    : "bg-zinc-900/50 border-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                            )}
                        >
                            <span className="text-[10px] font-medium uppercase tracking-wider opacity-80">
                                {format(date, 'EEE', { locale: ru })}
                            </span>
                            <span className={cn(
                                "text-xl font-bold leading-none mt-1",
                                isToday && !isSelected && "text-violet-400"
                            )}>
                                {format(date, 'd')}
                            </span>
                            {isToday && (
                                <span className={cn(
                                    "w-1 h-1 rounded-full mt-1",
                                    isSelected ? "bg-white/50" : "bg-violet-500"
                                )} />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
