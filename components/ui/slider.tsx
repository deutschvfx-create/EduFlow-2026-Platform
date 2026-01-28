"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
    value: number[];
    onValueChange: (value: number[]) => void;
    min?: number;
    max?: number;
    step?: number;
    className?: string;
}

export function Slider({
    value,
    onValueChange,
    min = 0,
    max = 100,
    step = 1,
    className
}: SliderProps) {
    const [isDragging, setIsDragging] = React.useState(false);
    const sliderRef = React.useRef<HTMLDivElement>(null);

    const handleMove = (clientX: number) => {
        if (!sliderRef.current) return;

        const rect = sliderRef.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const rawValue = min + percent * (max - min);
        const steppedValue = Math.round(rawValue / step) * step;
        const clampedValue = Math.max(min, Math.min(max, steppedValue));

        onValueChange([clampedValue]);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        handleMove(e.clientX);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            handleMove(e.clientX);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    React.useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging]);

    const percent = ((value[0] - min) / (max - min)) * 100;

    return (
        <div
            ref={sliderRef}
            className={cn("relative flex w-full touch-none select-none items-center cursor-pointer", className)}
            onMouseDown={handleMouseDown}
        >
            <div className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-zinc-800">
                <div
                    className="absolute h-full bg-indigo-500 transition-all"
                    style={{ width: `${percent}%` }}
                />
            </div>
            <div
                className="absolute block h-4 w-4 rounded-full border border-indigo-500 bg-white shadow transition-all"
                style={{ left: `calc(${percent}% - 8px)` }}
            />
        </div>
    );
}
