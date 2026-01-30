"use client";

import { useState } from "react";
import { Lesson, DayOfWeek } from "@/lib/types/schedule";
import { cn } from "@/lib/utils";
import { Clock, MapPin, Users, GraduationCap, X, Plus } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { ru } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MOCK_GROUPS_FULL } from "@/lib/mock/groups";
import { MOCK_TEACHERS } from "@/lib/mock/teachers";
import { MOCK_COURSES } from "@/lib/mock/courses";
import { IOSStyleTimePicker } from "@/components/ui/ios-time-picker";

interface DesktopWeekGridProps {
    lessons: Lesson[];
    currentDate: Date;
    onLessonClick: (lesson: Lesson) => void;
    onLessonAdd?: (lesson: any) => void;
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 08:00 to 22:00
const DAYS: DayOfWeek[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export function DesktopWeekGrid({ lessons, currentDate, onLessonClick, onLessonAdd }: DesktopWeekGridProps) {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    // Interaction State
    const [editorOpen, setEditorOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ day: DayOfWeek, time: string } | null>(null);    // Form State for Inline Editor
    const [formData, setFormData] = useState({
        groupId: "",
        courseId: "",
        teacherId: "",
        room: "",
        startTime: "",
        endTime: ""
    });

    // Drag & Resize State
    const [isDragging, setIsDragging] = useState(false);
    const [dragType, setDragType] = useState<'move' | 'resize' | null>(null);
    const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
    const [dragPreview, setDragPreview] = useState<{
        day: DayOfWeek,
        startTime: string,
        endTime: string,
        top: number,
        height: number,
        conflict?: string
    } | null>(null);

    // Initial Drag State
    const [initialGrab, setInitialGrab] = useState<{ x: number, y: number, dayIdx: number, startMin: number, durationMin: number } | null>(null);


    // --- Creation Handler ---
    const handleSlotClick = (day: DayOfWeek, hour: number) => {
        if (isDragging) return; // Ignore if dropping
        const time = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:30`; // Default +1.5h
        setSelectedSlot({ day, time });
        setFormData({
            groupId: "",
            courseId: "",
            teacherId: "",
            room: "",
            startTime: time,
            endTime: endTime
        });
        setEditorOpen(true);
    };

    const handleQuickSave = () => {
        if (!formData.groupId || !formData.teacherId || !formData.courseId) return;
        const newLesson = {
            groupId: formData.groupId,
            teacherId: formData.teacherId,
            courseId: formData.courseId,
            dayOfWeek: selectedSlot?.day,
            startTime: formData.startTime, // Use user selected time
            endTime: formData.endTime,     // Use user selected time
            room: "101"
        };
        if (onLessonAdd) onLessonAdd(newLesson);
        setEditorOpen(false);
    };

    // --- Drag & Drop Logic ---

    // Convert Y px to Minutes from 08:00
    // Grid height = 15 hours * 60px = 900px
    const pxToMinutes = (px: number) => Math.round((px / 60) * 60); // 60px = 60min
    const minutesToTime = (mins: number) => {
        const totalMin = mins + (8 * 60); // Start at 8:00
        const h = Math.floor(totalMin / 60);
        const m = totalMin % 60;
        // Snap to 15 min
        const snappedM = Math.round(m / 15) * 15;
        const finalH = h + Math.floor(snappedM / 60);
        const finalM = snappedM % 60;
        return `${finalH.toString().padStart(2, '0')}:${finalM.toString().padStart(2, '0')}`;
    };

    const handleDragStart = (e: React.MouseEvent, lesson: Lesson, type: 'move' | 'resize') => {
        e.preventDefault();
        e.stopPropagation();

        const [h, m] = lesson.startTime.split(':').map(Number);
        const [eh, em] = lesson.endTime.split(':').map(Number);
        const startMin = (h - 8) * 60 + m;
        const endMin = (eh - 8) * 60 + em;

        setIsDragging(true);
        setDragType(type);
        setActiveLessonId(lesson.id);

        // Find current day index
        const dayIdx = DAYS.indexOf(lesson.dayOfWeek);

        setInitialGrab({
            x: e.clientX,
            y: e.clientY,
            dayIdx,
            startMin,
            durationMin: endMin - startMin
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !initialGrab || !activeLessonId) return;

        const gridRect = e.currentTarget.getBoundingClientRect(); // Grid container
        // Calculate Relative Mouse Pos
        // We need column width to know day.
        const colWidth = gridRect.width / 7; // Time col is separate? No, in this component grid-cols-7 is for content. But there's a time col.
        // Wait, the structure is: [TimeCol] [GridCols7]
        // We should attach listener to the [GridCols7] container ideally or calculate offset.

        // Simplified approach: Track Delta
        const deltaY = e.clientY - initialGrab.y;
        const deltaX = e.clientX - initialGrab.x;

        // 1. Calculate New Day (Only for Move)
        let newDayIdx = initialGrab.dayIdx;
        if (dragType === 'move') {
            // Approximate column shift (assuming ~150px col width, better to measure)
            // We can use visual approximation or just rely on mouse being over a specific column if we used distinct event handlers.
            // For simplicity, let's assume standard width derived from drag.
            // Actually, simplest is: snap X movement to colWidth
            // Let's just update Time for now, Day dragging requires accurate Col hit testing.

            // ... Skipping Day change for MVP stability, focusing on Time ...
            // Update: Let's try to infer Day from cursor position if possible, but requires ref ref.
        }

        // 2. Calculate New Time
        // 60px = 60min => 1px = 1min
        const deltaMin = Math.round(deltaY / 60 * 60 / 15) * 15; // Snap to 15m steps

        let newStartMin = initialGrab.startMin;
        let newDuration = initialGrab.durationMin;

        if (dragType === 'move') {
            newStartMin = Math.max(0, initialGrab.startMin + deltaMin);
        } else {
            // Resize: Start stays, duration changes
            newDuration = Math.max(15, initialGrab.durationMin + deltaMin);
        }

        const formattedStart = minutesToTime(newStartMin);
        const formattedEnd = minutesToTime(newStartMin + newDuration);

        // Visual Params
        const topPx = (newStartMin / 60) * 60; // 1min = 1px visual in this 60px/h grid?
        // Wait, getLayoutStyles uses %:  (startMinutesFrom8 / (15 * 60)) * 100
        const topPercent = (newStartMin / (15 * 60)) * 100;
        const heightPercent = (newDuration / (15 * 60)) * 100;

        setDragPreview({
            day: DAYS[newDayIdx],
            startTime: formattedStart,
            endTime: formattedEnd,
            top: topPercent,
            height: heightPercent
        });
    };

    const handleMouseUp = () => {
        if (isDragging && activeLessonId && dragPreview) {
            // Commit changes
            // Here we would call an onUpdate(lessonId, { startTime, endTime, day })
            // For now, we just mock alert or log
            console.log("Updated Lesson:", activeLessonId, dragPreview.startTime, dragPreview.endTime);
            // In real app: props.onLessonUpdate(...)
        }
        setIsDragging(false);
        setDragType(null);
        setActiveLessonId(null);
        setDragPreview(null);
    };


    // Helper to calculate grid position & Overlaps
    const getLayoutStyles = (lesson: Lesson, dayLessons: Lesson[]) => {
        if (lesson.id === activeLessonId && dragType === 'move') {
            // hide original while dragging? Or show ghost?
            // usually we show original with low opacity
            return { display: 'none' };
        }

        const [hourStr, minuteStr] = lesson.startTime.split(':');
        const startHour = parseInt(hourStr);
        const startMinute = parseInt(minuteStr);

        const [endHourStr, endMinuteStr] = lesson.endTime.split(':');
        const endHour = parseInt(endHourStr);
        const endMinute = parseInt(endMinuteStr);

        const startMinutesFrom8 = (startHour - 8) * 60 + startMinute;
        const durationMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);

        const topPercent = (startMinutesFrom8 / (15 * 60)) * 100;
        const heightPercent = (durationMinutes / (15 * 60)) * 100;

        // Overlap Logic (Simplified for brevity)
        const overlaps = dayLessons.filter(l => l.id !== lesson.id && l.status !== 'CANCELLED' && l.startTime < lesson.endTime && l.endTime > lesson.startTime);
        let width = "96%";
        let left = "2%";
        if (overlaps.length > 0) {
            const cluster = [lesson, ...overlaps].sort((a, b) => a.id.localeCompare(b.id));
            const count = cluster.length;
            const index = cluster.findIndex(l => l.id === lesson.id);
            width = `${Math.floor(96 / count)}%`;
            left = `${2 + (index * (100 / count))}%`;
        }

        return { top: `${topPercent}%`, height: `${heightPercent}%`, width, left };
    };

    return (
        <div
            className="flex h-full flex-col bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl shadow-black/50 select-none"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Header: Days */}
            <div className="flex border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
                <div className="w-14 border-r border-zinc-800 shrink-0" />
                <div className="flex-1 grid grid-cols-7 divide-x divide-zinc-800">
                    {weekDays.map((date, i) => {
                        const isToday = isSameDay(date, new Date());
                        return (
                            <div key={i} className={cn("py-3 text-center border-zinc-800", isToday && "bg-violet-900/10")}>
                                <div className={cn("text-[10px] font-bold uppercase mb-0.5 tracking-wider", isToday ? "text-violet-400" : "text-zinc-500")}>
                                    {format(date, 'EEE', { locale: ru })}
                                </div>
                                <div className={cn("text-xl font-bold leading-none", isToday ? "text-violet-100" : "text-zinc-300")}>
                                    {format(date, 'd')}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Grid Body */}
            <div className="flex-1 flex overflow-y-auto relative min-h-[600px] select-none">
                {/* Time Ruler */}
                <div className="w-14 border-r border-zinc-800 bg-zinc-900/30 shrink-0 flex flex-col text-[10px] text-zinc-500 font-medium pt-2">
                    {HOURS.map(hour => (
                        <div key={hour} className="h-[60px] border-b border-zinc-800/30 flex items-start justify-center relative">
                            {hour}:00
                        </div>
                    ))}
                </div>

                {/* Columns */}
                <div className="flex-1 grid grid-cols-7 divide-x divide-zinc-800 relative bg-zinc-950/80">
                    {/* Background Grid Lines */}
                    <div className="absolute inset-0 z-0 flex flex-col pointer-events-none">
                        {HOURS.map(hour => (
                            <div key={hour} className="h-[60px] border-b border-zinc-800/20 w-full" />
                        ))}
                    </div>

                    {DAYS.map((day, colIndex) => {
                        const dayLessons = lessons.filter(l => l.dayOfWeek === day);

                        return (
                            <div key={day} className="relative z-10 h-[900px] group">
                                {/* Interactive Slots */}
                                <div className="absolute inset-0 z-0 flex flex-col">
                                    {HOURS.map(hour => (
                                        <Popover
                                            key={hour}
                                            open={editorOpen && selectedSlot?.day === day && selectedSlot?.time === `${hour.toString().padStart(2, '0')}:00`}
                                            onOpenChange={(op) => !op && setEditorOpen(false)}
                                        >
                                            <PopoverTrigger asChild>
                                                <div
                                                    className="h-[60px] w-full hover:bg-white/[0.02] active:bg-violet-500/10 transition-colors cursor-cell border-b border-transparent hover:border-zinc-800/50"
                                                    onClick={() => handleSlotClick(day, hour)}
                                                />
                                            </PopoverTrigger>
                                            <PopoverContent className="w-80 bg-zinc-900 border-zinc-800 p-0 shadow-2xl shadow-black/80">
                                                {/* Popover Content */}
                                                <div className="p-3 border-b border-zinc-800 text-sm font-semibold text-white flex justify-between items-center">
                                                    <span>Новый урок</span>
                                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditorOpen(false)}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="p-4 space-y-3">

                                                    {/* Time Selector Row */}
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="space-y-1">
                                                            <Label className="text-xs text-zinc-400">Начало</Label>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        className="w-full h-8 text-xs bg-zinc-950 border-zinc-800 font-mono justify-start px-2"
                                                                    >
                                                                        {formData.startTime}
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-0 border-none bg-transparent shadow-none" side="bottom" align="start">
                                                                    <IOSStyleTimePicker
                                                                        value={formData.startTime}
                                                                        onChange={(v) => setFormData(prev => ({ ...prev, startTime: v }))}
                                                                    />
                                                                </PopoverContent>
                                                            </Popover>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-xs text-zinc-400">Конец</Label>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        className="w-full h-8 text-xs bg-zinc-950 border-zinc-800 font-mono justify-start px-2"
                                                                    >
                                                                        {formData.endTime}
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-0 border-none bg-transparent shadow-none" side="bottom" align="end">
                                                                    <IOSStyleTimePicker
                                                                        value={formData.endTime}
                                                                        onChange={(v) => setFormData(prev => ({ ...prev, endTime: v }))}
                                                                    />
                                                                </PopoverContent>
                                                            </Popover>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-zinc-400">Предмет</Label>
                                                        <Select onValueChange={(v) => setFormData({ ...formData, courseId: v })}>
                                                            <SelectTrigger className="h-8 text-xs bg-zinc-950 border-zinc-800"><SelectValue placeholder="Предмет" /></SelectTrigger>
                                                            <SelectContent>{MOCK_COURSES.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="space-y-1">
                                                            <Label className="text-xs text-zinc-400">Группа</Label>
                                                            <Select onValueChange={(v) => setFormData({ ...formData, groupId: v })}>
                                                                <SelectTrigger className="h-8 text-xs bg-zinc-950 border-zinc-800"><SelectValue placeholder="Группа" /></SelectTrigger>
                                                                <SelectContent>{MOCK_GROUPS_FULL.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-xs text-zinc-400">Учитель</Label>
                                                            <Select onValueChange={(v) => setFormData({ ...formData, teacherId: v })}>
                                                                <SelectTrigger className="h-8 text-xs bg-zinc-950 border-zinc-800"><SelectValue placeholder="Учитель" /></SelectTrigger>
                                                                <SelectContent>{MOCK_TEACHERS.map(t => <SelectItem key={t.id} value={t.id}>{t.lastName}</SelectItem>)}</SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                    <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-8 text-xs" onClick={handleQuickSave}>
                                                        Создать урок
                                                    </Button>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    ))}
                                </div>

                                {/* Drag Preview (Ghost) */}
                                {isDragging && dragPreview && dragPreview.day === day && (
                                    <div
                                        className="absolute w-[96%] left-[2%] rounded border-2 border-dashed border-white/50 bg-white/10 z-50 pointer-events-none flex flex-col justify-center items-center text-xs font-bold text-white shadow-xl backdrop-blur-sm"
                                        style={{ top: `${dragPreview.top}%`, height: `${dragPreview.height}%` }}
                                    >
                                        <span>{dragPreview.startTime} - {dragPreview.endTime}</span>
                                    </div>
                                )}

                                {/* Lessons Layer */}
                                {dayLessons.map(lesson => {
                                    const style = getLayoutStyles(lesson, dayLessons);
                                    if (style.display === 'none') return null; // Logic moved here to avoid type error with void return

                                    return (
                                        <div
                                            key={lesson.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onLessonClick(lesson);
                                            }}
                                            onMouseDown={(e) => handleDragStart(e, lesson, 'move')}
                                            style={style}
                                            className={cn(
                                                "absolute rounded border shadow-sm transition-all duration-500 ease-out hover:z-40 hover:shadow-lg flex flex-col overflow-hidden group/card animate-in fade-in zoom-in-95 slide-in-from-top-2",
                                                lesson.status === 'CANCELLED'
                                                    ? "bg-red-950/80 border-red-900/50 text-red-200"
                                                    : "bg-indigo-900/80 border-indigo-700/50 text-indigo-100"
                                            )}
                                        >
                                            <div className="px-1.5 py-1 text-[10px] font-bold leading-tight truncate cursor-grab active:cursor-grabbing">
                                                {lesson.courseName}
                                            </div>
                                            <div className="px-1.5 pb-1 flex flex-col gap-0.5 opacity-90 pointer-events-none">
                                                <div className="flex items-center gap-1 text-[9px] truncate">
                                                    <Users className="h-2.5 w-2.5" />
                                                    <span>{lesson.groupName}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-[9px] truncate">
                                                    <Clock className="h-2.5 w-2.5" />
                                                    <span>{lesson.startTime} - {lesson.endTime}</span>
                                                </div>
                                            </div>

                                            {/* Resize Handle */}
                                            <div
                                                className="absolute bottom-0 inset-x-0 h-1.5 cursor-ns-resize hover:bg-white/20 active:bg-violet-500 z-50"
                                                onMouseDown={(e) => handleDragStart(e, lesson, 'resize')}
                                            />
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
