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

const TEACHER_COLORS = [
    { bg: "bg-blue-900/80", border: "border-blue-700/50", text: "text-blue-100", ghost: "border-blue-400/50 bg-blue-400/10" },
    { bg: "bg-indigo-900/80", border: "border-indigo-700/50", text: "text-indigo-100", ghost: "border-indigo-400/50 bg-indigo-400/10" },
    { bg: "bg-emerald-900/80", border: "border-emerald-700/50", text: "text-emerald-100", ghost: "border-emerald-400/50 bg-emerald-400/10" },
    { bg: "bg-rose-900/80", border: "border-rose-700/50", text: "text-rose-100", ghost: "border-rose-400/50 bg-rose-400/10" },
    { bg: "bg-amber-900/80", border: "border-amber-700/50", text: "text-amber-100", ghost: "border-amber-400/50 bg-amber-400/10" },
    { bg: "bg-violet-900/80", border: "border-violet-700/50", text: "text-violet-100", ghost: "border-violet-400/50 bg-violet-400/10" },
    { bg: "bg-teal-900/80", border: "border-teal-700/50", text: "text-teal-100", ghost: "border-teal-400/50 bg-teal-400/10" },
];

const getTeacherColor = (teacherId: string) => {
    const hash = teacherId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return TEACHER_COLORS[hash % TEACHER_COLORS.length];
};

export function DesktopWeekGrid({ lessons, currentDate, onLessonClick, onLessonAdd }: DesktopWeekGridProps) {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    // Interaction State
    const [editorOpen, setEditorOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ day: DayOfWeek, time: string } | null>(null);
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
    const [dragType, setDragType] = useState<'move' | 'resize-top' | 'resize-bottom' | null>(null);
    const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
    const [dragPreview, setDragPreview] = useState<{
        day: DayOfWeek,
        startTime: string,
        endTime: string,
        top: number,
        height: number,
        conflict?: string,
        color: any
    } | null>(null);

    const [initialGrab, setInitialGrab] = useState<{ x: number, y: number, dayIdx: number, startMin: number, durationMin: number } | null>(null);

    // --- Creation Handler ---
    const handleSlotClick = (day: DayOfWeek, hour: number) => {
        if (isDragging) return;
        const time = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:30`;
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
            startTime: formData.startTime,
            endTime: formData.endTime,
            room: "101"
        };
        if (onLessonAdd) onLessonAdd(newLesson);
        setEditorOpen(false);
    };

    // --- Drag & Drop Logic ---
    const minutesToTime = (mins: number) => {
        const totalMin = Math.max(0, Math.min(15 * 60, mins)) + (8 * 60);
        const h = Math.floor(totalMin / 60);
        const m = totalMin % 60;
        const snappedM = Math.round(m / 5) * 5; // Snap to 5 min for precision
        const finalH = h + Math.floor(snappedM / 60);
        const finalM = snappedM % 60;
        return `${Math.min(22, finalH).toString().padStart(2, '0')}:${finalM.toString().padStart(2, '0')}`;
    };

    const checkConflict = (lessonId: string, day: DayOfWeek, start: string, end: string, teacherId: string) => {
        return lessons.some(l =>
            l.id !== lessonId &&
            l.status !== 'CANCELLED' &&
            l.dayOfWeek === day &&
            l.teacherId === teacherId &&
            ((start >= l.startTime && start < l.endTime) || (end > l.startTime && end <= l.endTime) || (start <= l.startTime && end >= l.endTime))
        );
    };

    const handleDragStart = (e: React.MouseEvent, lesson: Lesson, type: 'move' | 'resize-top' | 'resize-bottom') => {
        e.preventDefault();
        e.stopPropagation();

        const [h, m] = lesson.startTime.split(':').map(Number);
        const [eh, em] = lesson.endTime.split(':').map(Number);
        const startMin = (h - 8) * 60 + m;
        const endMin = (eh - 8) * 60 + em;

        setIsDragging(true);
        setDragType(type);
        setActiveLessonId(lesson.id);

        setInitialGrab({
            x: e.clientX,
            y: e.clientY,
            dayIdx: DAYS.indexOf(lesson.dayOfWeek),
            startMin,
            durationMin: endMin - startMin
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !initialGrab || !activeLessonId) return;

        const gridContainer = document.getElementById('schedule-grid-container');
        if (!gridContainer) return;
        const gridRect = gridContainer.getBoundingClientRect();

        const deltaY = e.clientY - initialGrab.y;
        const deltaX = e.clientX - initialGrab.x;

        // Calculate New Day
        const colWidth = (gridRect.width - 56) / 7; // Subtract TimeCol width
        const colDelta = Math.round(deltaX / colWidth);
        let newDayIdx = Math.max(0, Math.min(6, initialGrab.dayIdx + colDelta));

        // Calculate New Time (1px = 1min because 60px = 60min)
        const deltaMin = Math.round(deltaY / 5) * 5; // Snap to 5m increments

        let newStartMin = initialGrab.startMin;
        let newDuration = initialGrab.durationMin;

        if (dragType === 'move') {
            newStartMin = Math.max(0, Math.min(15 * 60 - initialGrab.durationMin, initialGrab.startMin + deltaMin));
        } else if (dragType === 'resize-top') {
            const potentialStart = Math.max(0, initialGrab.startMin + deltaMin);
            const potentialEnd = initialGrab.startMin + initialGrab.durationMin;
            if (potentialEnd - potentialStart >= 15) {
                newStartMin = potentialStart;
                newDuration = potentialEnd - potentialStart;
            } else {
                newStartMin = potentialEnd - 15;
                newDuration = 15;
            }
        } else if (dragType === 'resize-bottom') {
            newDuration = Math.max(15, Math.min(15 * 60 - initialGrab.startMin, initialGrab.durationMin + deltaMin));
        }

        const formattedStart = minutesToTime(newStartMin);
        const formattedEnd = minutesToTime(newStartMin + newDuration);
        const currentLesson = lessons.find(l => l.id === activeLessonId)!;

        const conflict = checkConflict(activeLessonId, DAYS[newDayIdx], formattedStart, formattedEnd, currentLesson.teacherId)
            ? "Конфликт в расписании у преподавателя"
            : undefined;

        setDragPreview({
            day: DAYS[newDayIdx],
            startTime: formattedStart,
            endTime: formattedEnd,
            top: (newStartMin / (15 * 60)) * 100,
            height: (newDuration / (15 * 60)) * 100,
            conflict,
            color: getTeacherColor(currentLesson.teacherId)
        });
    };

    const handleMouseUp = () => {
        if (isDragging && activeLessonId && dragPreview && !dragPreview.conflict) {
            console.log("Committed Lesson Change:", activeLessonId, dragPreview);
            // props.onLessonUpdate(activeLessonId, { ... })
        }
        setIsDragging(false);
        setDragType(null);
        setActiveLessonId(null);
        setDragPreview(null);
    };


    // Helper to calculate grid position & Overlaps
    const getLayoutStyles = (lesson: Lesson, dayLessons: Lesson[]) => {
        if (lesson.id === activeLessonId && dragType === 'move') {
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

        const overlaps = dayLessons.filter(l => l.id !== lesson.id && l.status !== 'CANCELLED' && l.startTime < lesson.endTime && l.endTime > lesson.startTime);
        let width = "calc(100% - 4px)";
        let left = "2px";
        if (overlaps.length > 0) {
            const cluster = [lesson, ...overlaps].sort((a, b) => a.id.localeCompare(b.id));
            const count = cluster.length;
            const index = cluster.findIndex(l => l.id === lesson.id);
            width = `calc(${Math.floor(100 / count)}% - 4px)`;
            left = `calc(${(index * (100 / count))}% + 2px)`;
        }

        const color = getTeacherColor(lesson.teacherId);

        return {
            top: `${topPercent}%`,
            height: `${heightPercent}%`,
            width,
            left,
            colorClasses: cn(color.bg, color.border, color.text)
        };
    };

    return (
        <div
            id="schedule-grid-container"
            className="flex h-full flex-col bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl shadow-black/50 select-none relative"
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
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1.5 flex flex-col items-center">
                                                            <Label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Начало</Label>
                                                            <IOSStyleTimePicker
                                                                value={formData.startTime}
                                                                onChange={(v) => setFormData(prev => ({ ...prev, startTime: v }))}
                                                                className="w-full h-24 border-zinc-800/50 bg-black/40"
                                                                minuteStep={5}
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5 flex flex-col items-center">
                                                            <Label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Конец</Label>
                                                            <IOSStyleTimePicker
                                                                value={formData.endTime}
                                                                onChange={(v) => setFormData(prev => ({ ...prev, endTime: v }))}
                                                                className="w-full h-24 border-zinc-800/50 bg-black/40"
                                                                minuteStep={5}
                                                            />
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

                                {isDragging && dragPreview && dragPreview.day === day && (
                                    <div
                                        className={cn(
                                            "absolute w-[calc(100%-4px)] left-[2px] rounded border-2 border-dashed z-50 pointer-events-none flex flex-col justify-center items-center text-xs font-bold shadow-xl backdrop-blur-sm transition-all duration-75",
                                            dragPreview.conflict ? "border-red-500 bg-red-500/20 text-red-200" : dragPreview.color.ghost
                                        )}
                                        style={{ top: `${dragPreview.top}%`, height: `${dragPreview.height}%` }}
                                    >
                                        <div className="flex flex-col items-center gap-0.5">
                                            <span className="bg-black/40 px-2 py-0.5 rounded-full">{dragPreview.startTime} — {dragPreview.endTime}</span>
                                            {dragPreview.conflict && (
                                                <span className="text-[10px] text-red-400 font-medium px-2 text-center uppercase tracking-tight">{dragPreview.conflict}</span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Lessons Layer */}
                                {dayLessons.map(lesson => {
                                    const style = getLayoutStyles(lesson, dayLessons);
                                    if ((style as any).display === 'none') return null;

                                    return (
                                        <div
                                            key={lesson.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onLessonClick(lesson);
                                            }}
                                            style={{
                                                top: (style as any).top,
                                                height: (style as any).height,
                                                width: (style as any).width,
                                                left: (style as any).left
                                            }}
                                            className={cn(
                                                "absolute rounded border shadow-sm transition-all duration-500 ease-out hover:z-40 hover:shadow-lg flex flex-col overflow-hidden group/card animate-in fade-in zoom-in-95 slide-in-from-top-2 cursor-grab active:cursor-grabbing",
                                                lesson.status === 'CANCELLED'
                                                    ? "bg-red-950/80 border-red-900/50 text-red-200"
                                                    : (style as any).colorClasses
                                            )}
                                        >
                                            {/* Top Resize Handle */}
                                            <div
                                                className="absolute top-0 inset-x-0 h-2 cursor-ns-resize hover:bg-white/20 active:bg-white/40 z-50 transition-colors"
                                                onMouseDown={(e) => handleDragStart(e, lesson, 'resize-top')}
                                            />

                                            <div
                                                className="px-1.5 py-1 text-[10px] font-bold leading-tight truncate"
                                                onMouseDown={(e) => handleDragStart(e, lesson, 'move')}
                                            >
                                                {lesson.courseName}
                                            </div>
                                            <div className="px-1.5 pb-1 flex flex-col gap-0.5 opacity-90 pointer-events-none">
                                                <div className="flex items-center gap-1 text-[9px] truncate">
                                                    <Users className="h-2.5 w-2.5" />
                                                    <span>{lesson.groupName}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-[9px] truncate text-white/80 font-semibold">
                                                    <Clock className="h-2.5 w-2.5" />
                                                    <span>{lesson.startTime} - {lesson.endTime}</span>
                                                </div>
                                            </div>

                                            {/* Bottom Resize Handle */}
                                            <div
                                                className="absolute bottom-0 inset-x-0 h-2 cursor-ns-resize hover:bg-white/20 active:bg-white/40 z-50 transition-colors"
                                                onMouseDown={(e) => handleDragStart(e, lesson, 'resize-bottom')}
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
