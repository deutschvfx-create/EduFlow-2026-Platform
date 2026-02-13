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
        <div className="w-full bg-background border-b border-border sticky top-0 z-10">
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
                                "flex flex-col items-center justify-center min-w-[56px] h-[72px] rounded-2xl snap-center transition-all duration-300 relative",
                                isSelected
                                    ? "bg-violet-600 text-white shadow-md shadow-violet-900/30"
                                    : "bg-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <span className={cn(
                                "text-[11px] font-medium uppercase tracking-wider mb-0.5",
                                isSelected ? "text-violet-100" : "text-muted-foreground"
                            )}>
                                {format(date, 'EEE', { locale: ru })}
                            </span>
                            <span className={cn(
                                "text-2xl font-bold leading-none",
                                isSelected ? "text-white" : "text-muted-foreground"
                            )}>
                                {format(date, 'd')}
                            </span>
                            {isToday && !isSelected && (
                                <span className="absolute bottom-2 w-1 h-1 rounded-full bg-violet-500" />
                            )}
                        </button>
                    );
                })}
            </div>
            {/* Gradient fade for scrolling hint */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/80 to-transparent pointer-events-none" />
        </div>
    );
}
