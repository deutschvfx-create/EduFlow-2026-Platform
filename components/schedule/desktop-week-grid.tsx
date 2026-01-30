import { Lesson, DayOfWeek } from "@/lib/types/schedule";
import { cn } from "@/lib/utils";
import { Clock, MapPin, Users, GraduationCap } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { ru } from "date-fns/locale";

interface DesktopWeekGridProps {
    lessons: Lesson[];
    currentDate: Date;
    onLessonClick: (lesson: Lesson) => void;
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 08:00 to 22:00
const DAYS: DayOfWeek[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export function DesktopWeekGrid({ lessons, currentDate, onLessonClick }: DesktopWeekGridProps) {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    // Helper to calculate grid position
    const getGridPosition = (lesson: Lesson) => {
        const [hourStr, minuteStr] = lesson.startTime.split(':');
        const startHour = parseInt(hourStr);
        const startMinute = parseInt(minuteStr);

        const [endHourStr, endMinuteStr] = lesson.endTime.split(':');
        const endHour = parseInt(endHourStr);
        const endMinute = parseInt(endMinuteStr);

        // Grid starts at 8:00. Each hour is 60px height (or whatever unit). 
        // Better: Use CSS Grid rows where 1 row = 15 mins or 30 mins (simplest is 60 mins for row track)
        // Let's rely on absolute positioning within day columns for more flexibility?
        // Or refined grid: 1 hour = 2 rows (30 min steps) or 4 rows (15 min steps)
        // Let's use % from top for absolute positioning inside the column.

        const startMinutesFrom8 = (startHour - 8) * 60 + startMinute;
        const durationMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);

        const topPercent = (startMinutesFrom8 / (15 * 60)) * 100; // 15 hours total (8-23)
        const heightPercent = (durationMinutes / (15 * 60)) * 100;

        return { top: `${topPercent}%`, height: `${heightPercent}%` };
    };

    return (
        <div className="flex h-full flex-col bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            {/* Header: Days */}
            <div className="flex border-b border-zinc-800 bg-zinc-900/50">
                <div className="w-16 border-r border-zinc-800 shrink-0" /> {/* Time column spacer */}
                <div className="flex-1 grid grid-cols-7 divide-x divide-zinc-800">
                    {weekDays.map((date, i) => {
                        const isToday = isSameDay(date, new Date());
                        return (
                            <div key={i} className={cn(
                                "py-3 text-center border-zinc-800",
                                isToday && "bg-violet-900/10"
                            )}>
                                <div className={cn(
                                    "text-xs font-medium uppercase mb-1",
                                    isToday ? "text-violet-400" : "text-zinc-500"
                                )}>
                                    {format(date, 'EEE', { locale: ru })}
                                </div>
                                <div className={cn(
                                    "text-lg font-bold leading-none",
                                    isToday ? "text-violet-100" : "text-zinc-300"
                                )}>
                                    {format(date, 'd')}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Grid Body */}
            <div className="flex-1 flex overflow-y-auto relative min-h-[600px]">
                {/* Time Ruler */}
                <div className="w-16 border-r border-zinc-800 bg-zinc-900/30 shrink-0 flex flex-col text-xs text-zinc-500 font-medium">
                    {HOURS.map(hour => (
                        <div key={hour} className="h-[60px] border-b border-zinc-800/50 flex items-start justify-center pt-2 relative">
                            {hour}:00
                        </div>
                    ))}
                </div>

                {/* Columns */}
                <div className="flex-1 grid grid-cols-7 divide-x divide-zinc-800 relative bg-zinc-950/50">
                    {/* Background Grid Lines for Hours */}
                    <div className="absolute inset-0 z-0 flex flex-col pointer-events-none">
                        {HOURS.map(hour => (
                            <div key={hour} className="h-[60px] border-b border-zinc-800/30 w-full" />
                        ))}
                    </div>

                    {DAYS.map((day, colIndex) => {
                        // Filter lessons for this day
                        const dayLessons = lessons.filter(l => l.dayOfWeek === day);

                        return (
                            <div key={day} className="relative z-10 h-[900px]"> {/* 15 hours * 60px = 900px */}
                                {dayLessons.map(lesson => {
                                    const style = getGridPosition(lesson);

                                    return (
                                        <div
                                            key={lesson.id}
                                            onClick={() => onLessonClick(lesson)}
                                            style={style}
                                            className={cn(
                                                "absolute inset-x-1 rounded-md p-2 text-[10px] leading-tight border transition-all hover:brightness-110 cursor-pointer overflow-hidden",
                                                lesson.status === 'CANCELLED'
                                                    ? "bg-red-950/40 border-red-900/50 text-red-200"
                                                    : "bg-indigo-900/40 border-indigo-700/50 text-indigo-100"
                                            )}
                                        >
                                            <div className="font-semibold truncate mb-0.5">{lesson.courseName}</div>
                                            <div className="flex items-center gap-1 opacity-70 mb-0.5">
                                                <Clock className="h-3 w-3" />
                                                <span>{lesson.startTime}</span>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-70 truncate">
                                                <Users className="h-3 w-3" />
                                                <span>{lesson.groupName}</span>
                                            </div>
                                            {lesson.room && (
                                                <div className="absolute bottom-1 right-1 opacity-60 bg-black/30 px-1 rounded text-[9px]">
                                                    {lesson.room}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
