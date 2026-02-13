"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Lesson, DayOfWeek } from "@/lib/types/schedule";
import { cn, generateId } from "@/lib/utils";
import { Clock, MapPin, Users, GraduationCap, X } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { ru } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IOSStyleTimePicker } from "@/components/ui/ios-time-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useModules } from "@/hooks/use-modules";

interface DesktopWeekGridProps {
    lessons: Lesson[];
    currentDate: Date;
    onLessonClick: (lesson: Lesson) => void;
    onLessonAdd?: (lesson: any) => void;
    onLessonUpdate?: (id: string, updates: Partial<Lesson>) => void;
    onLessonDelete?: (lessonId: string) => void;
    // Real Data Props
    groups?: any[];
    teachers?: any[];
    courses?: any[];
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 08:00 to 22:00
const DAYS: DayOfWeek[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const TEACHER_COLORS = [
    { bg: "bg-blue-900/80", border: "border-blue-700/50", text: "text-blue-100", ghost: "border-blue-400/50 bg-blue-400/10" },
    { bg: "bg-cyan-900/80", border: "border-cyan-700/50", text: "text-cyan-100", ghost: "border-primary/50 bg-primary/10" },
    { bg: "bg-emerald-900/80", border: "border-emerald-700/50", text: "text-emerald-100", ghost: "border-emerald-400/50 bg-emerald-400/10" },
    { bg: "bg-rose-900/80", border: "border-rose-700/50", text: "text-rose-100", ghost: "border-rose-400/50 bg-rose-400/10" },
    { bg: "bg-amber-900/80", border: "border-amber-700/50", text: "text-amber-100", ghost: "border-amber-400/50 bg-amber-400/10" },
    { bg: "bg-violet-900/80", border: "border-violet-700/50", text: "text-violet-100", ghost: "border-violet-400/50 bg-violet-400/10" },
    { bg: "bg-teal-900/80", border: "border-teal-700/50", text: "text-teal-100", ghost: "border-teal-400/50 bg-teal-400/10" },
];

const getTeacherColor = (teacherId: string) => {
    if (!teacherId) return TEACHER_COLORS[0];
    const hash = teacherId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return TEACHER_COLORS[hash % TEACHER_COLORS.length];
};

export function DesktopWeekGrid({
    lessons: propsLessons,
    currentDate,
    onLessonClick,
    onLessonAdd,
    onLessonUpdate,
    onLessonDelete,
    groups = [],
    teachers = [],
    courses = []
}: DesktopWeekGridProps) {
    const { modules } = useModules();
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const [localLessons, setLocalLessons] = useState<Lesson[]>(propsLessons);
    const lastUpdateRef = useRef<number>(0);
    const [pulsingLessonId, setPulsingLessonId] = useState<string | null>(null);
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        if (pulsingLessonId) {
            const timer = setTimeout(() => setPulsingLessonId(null), 2500);
            return () => clearTimeout(timer);
        }
    }, [pulsingLessonId]);

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

    const [isDragging, setIsDragging] = useState(false);
    const [dragType, setDragType] = useState<'move' | 'resize-top' | 'resize-bottom' | null>(null);
    const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

    const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({
        groupId: "",
        courseId: "",
        teacherId: "",
        room: "",
        startTime: "",
        endTime: "",
        dayOfWeek: "MON" as DayOfWeek
    });

    useEffect(() => {
        // If we get an update from server (propsLessons changed), we generally want to sync.
        // But if we just dragged locally (within last 2s), we might want to keep local state to prevent jumping
        // UNLESS the prop update is actually the result of our save (containing the new data).
        // For now, simpler logic: Always sync from props unless we are actively dragging 
        // OR we just did a local update in the last 2 seconds.
        const now = Date.now();
        if (!isDragging && (now - lastUpdateRef.current > 2000)) {
            setLocalLessons(propsLessons);
        }
    }, [propsLessons, isDragging]);

    const [dragDelta, setDragDelta] = useState({ x: 0, y: 0 });
    const [liveDay, setLiveDay] = useState<DayOfWeek | null>(null);
    const [liveTimeRange, setLiveTimeRange] = useState<{ start: string, end: string } | null>(null);
    const [conflictError, setConflictError] = useState<string | null>(null);
    const ignoreClickRef = useRef(false);
    const gridRef = useRef<HTMLDivElement>(null);

    const [initialGrab, setInitialGrab] = useState<{
        x: number,
        y: number,
        dayIdx: number,
        startMin: number,
        durationMin: number,
        lesson: Lesson
    } | null>(null);

    const handleSlotClick = (day: DayOfWeek, hour: number) => {
        if (isDragging) return;
        const time = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:30`;

        if (onLessonAdd) {
            onLessonAdd({
                dayOfWeek: day,
                startTime: time,
                endTime: endTime,
                groupId: "",
                courseId: "",
                teacherId: "",
                room: ""
            });
        }
    };

    const timeToMinutes = (time: string) => {
        if (!time) return 0;
        const [h, m] = time.split(':').map(Number);
        return (h - 8) * 60 + m;
    };

    const minutesToTime = (mins: number) => {
        const totalMin = Math.max(0, Math.min(15 * 60, mins)) + (8 * 60);
        const h = Math.floor(totalMin / 60);
        const m = totalMin % 60;
        const snappedM = Math.round(m / 5) * 5;
        const finalH = h + Math.floor(snappedM / 60);
        const finalM = snappedM % 60;
        return `${Math.min(22, finalH).toString().padStart(2, '0')}:${finalM.toString().padStart(2, '0')}`;
    };

    const checkConflict = (lessonId: string, day: DayOfWeek, start: string, end: string, teacherId: string) => {
        return localLessons.some(l =>
            l.id !== lessonId &&
            l.status !== 'CANCELLED' &&
            l.dayOfWeek === day &&
            l.teacherId === teacherId &&
            ((start >= l.startTime && start < l.endTime) || (end > l.startTime && end <= l.endTime) || (start <= l.startTime && end >= l.endTime))
        );
    };

    const handleDragStart = (e: React.PointerEvent, lesson: Lesson, type: 'move' | 'resize-top' | 'resize-bottom') => {
        e.preventDefault();
        e.stopPropagation();

        const startMin = timeToMinutes(lesson.startTime);
        const endMin = timeToMinutes(lesson.endTime);
        const dayIdx = DAYS.indexOf(lesson.dayOfWeek);

        setDragType(type);
        ignoreClickRef.current = type !== 'move';
        setActiveLessonId(lesson.id);
        setDragDelta({ x: 0, y: 0 });
        setLiveDay(lesson.dayOfWeek);
        setLiveTimeRange({ start: lesson.startTime, end: lesson.endTime });

        setInitialGrab({
            x: e.clientX,
            y: e.clientY,
            dayIdx: dayIdx >= 0 ? dayIdx : 0,
            startMin,
            durationMin: endMin - startMin,
            lesson
        });

        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!initialGrab || !activeLessonId) return;
        const deltaY = e.clientY - initialGrab.y;
        const deltaX = e.clientX - initialGrab.x;

        if (!isDragging && (Math.abs(deltaY) > 5 || Math.abs(deltaX) > 5)) {
            setIsDragging(true);
            ignoreClickRef.current = true;
        }

        if (!isDragging) return;

        // Update drag visuals smoothly
        setDragDelta({ x: deltaX, y: deltaY });

        requestAnimationFrame(() => {
            if (!gridRef.current) return;
            const rect = gridRef.current.getBoundingClientRect();
            const colWidth = rect.width / 7;
            const relativeX = e.clientX - rect.left;
            const targetDayIdx = Math.max(0, Math.min(6, Math.floor(relativeX / colWidth)));
            const targetDay = DAYS[targetDayIdx];

            if (dragType === 'move' && targetDay !== liveDay) {
                setLiveDay(targetDay);
            }

            const deltaMin = Math.round(deltaY / 5) * 5; // Use Y delta for time
            let newStartMin = initialGrab.startMin;
            let newDuration = initialGrab.durationMin;

            if (dragType === 'move') {
                newStartMin = Math.max(0, Math.min(15 * 60 - initialGrab.durationMin, initialGrab.startMin + deltaMin));
            } else if (dragType === 'resize-top') {
                newStartMin = Math.max(0, Math.min(initialGrab.startMin + initialGrab.durationMin - 15, initialGrab.startMin + deltaMin));
                newDuration = (initialGrab.startMin + initialGrab.durationMin) - newStartMin;
            } else if (dragType === 'resize-bottom') {
                newDuration = Math.max(15, Math.min(15 * 60 - initialGrab.startMin, initialGrab.durationMin + deltaMin));
            }

            const newStart = minutesToTime(newStartMin);
            const newEnd = minutesToTime(newStartMin + newDuration);

            if (liveTimeRange && (liveTimeRange.start !== newStart || liveTimeRange.end !== newEnd)) {
                setLiveTimeRange({ start: newStart, end: newEnd });

                const activeDay = dragType === 'move' ? targetDay : initialGrab.lesson.dayOfWeek;
                const conflict = checkConflict(activeLessonId, activeDay, newStart, newEnd, initialGrab.lesson.teacherId);
                const conflictStr = conflict ? "Conflict" : null;
                if (conflictStr !== conflictError) {
                    setConflictError(conflictStr);
                }
            } else if (!liveTimeRange) {
                setLiveTimeRange({ start: newStart, end: newEnd });
            }
        });
    };

    const [isSettling, setIsSettling] = useState(false);

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!activeLessonId || !initialGrab) {
            setIsDragging(false);
            setDragType(null);
            setActiveLessonId(null);
            return;
        }

        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

        if (isDragging && liveTimeRange && liveDay) {
            const conflict = checkConflict(activeLessonId, liveDay, liveTimeRange.start, liveTimeRange.end, initialGrab.lesson.teacherId);

            if (!conflict) {
                const updatedLesson = {
                    ...initialGrab.lesson,
                    dayOfWeek: liveDay,
                    startTime: liveTimeRange.start,
                    endTime: liveTimeRange.end
                };

                // CRITICAL: Update local state immediately to B position
                lastUpdateRef.current = Date.now();
                setLocalLessons(prev => prev.map(l => l.id === activeLessonId ? updatedLesson : l));
                setPulsingLessonId(activeLessonId);

                // Notify parent
                if (onLessonUpdate) {
                    onLessonUpdate(activeLessonId, {
                        dayOfWeek: liveDay,
                        startTime: liveTimeRange.start,
                        endTime: liveTimeRange.end
                    });
                }

                // Briefly enter "settle" mode to prevent flicker
                setIsSettling(true);
                setTimeout(() => {
                    setIsSettling(false);
                    setIsDragging(false);
                    setDragType(null);
                    setActiveLessonId(null);
                    setDragDelta({ x: 0, y: 0 });
                    setLiveDay(null);
                    setLiveTimeRange(null);
                    setConflictError(null);
                }, 150); // Short lock to bridge the handoff
                return;
            }
        }

        // Cleanup if no move or conflict
        setIsDragging(false);
        setDragType(null);
        setActiveLessonId(null);
        setDragDelta({ x: 0, y: 0 });
        setLiveDay(null);
        setLiveTimeRange(null);
        setConflictError(null);
    };

    const getLayoutStyles = (lesson: Lesson, dayLessons: Lesson[]) => {
        const isBeingManipulated = lesson.id === activeLessonId;
        const isCurrentlyDragged = isBeingManipulated && isDragging;
        const isResizing = isCurrentlyDragged && (dragType === 'resize-top' || dragType === 'resize-bottom');
        const isSettlingThis = isBeingManipulated && isSettling;

        let startTime = lesson.startTime;
        let endTime = lesson.endTime;

        // While resizing OR in the brief settling gap, use the live data for layout positioning
        if ((isResizing || isSettlingThis) && liveTimeRange) {
            startTime = liveTimeRange.start;
            endTime = liveTimeRange.end;
        }

        const startMinutesFrom8 = timeToMinutes(startTime);
        const durationMinutes = timeToMinutes(endTime) - timeToMinutes(startTime);

        const topPercent = (startMinutesFrom8 / (15 * 60)) * 100;
        const heightPercent = (durationMinutes / (15 * 60)) * 100;

        // Use the actual startTime/endTime for overlap calculations to avoid "jumping" neighbors
        const overlaps = dayLessons.filter(l =>
            l.id !== lesson.id &&
            l.status !== 'CANCELLED' &&
            l.startTime < endTime &&
            l.endTime > startTime
        );
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
            colorClasses: cn(color.bg, color.border, color.text),
            zIndex: isBeingManipulated ? 100 : 10,
        };
    };

    return (
        <div
            id="schedule-grid-container"
            className="flex h-full flex-col bg-background border border-border rounded-xl overflow-hidden shadow-2xl shadow-black/50 select-none relative"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
        >
            <div className="flex border-b border-border bg-card/50 backdrop-blur-sm">
                <div className="w-14 border-r border-border shrink-0" />
                <div className="flex-1 grid grid-cols-7 divide-x divide-zinc-800">
                    {weekDays.map((date, i) => {
                        const isToday = isSameDay(date, new Date());
                        return (
                            <div key={i} className={cn("py-3 text-center border-border", isToday && "bg-violet-900/10")}>
                                <div className={cn("text-[10px] font-bold uppercase mb-0.5 tracking-wider", isToday ? "text-violet-400" : "text-muted-foreground")}>
                                    {format(date, 'EEE', { locale: ru })}
                                </div>
                                <div className={cn("text-xl font-bold leading-none", isToday ? "text-violet-100" : "text-foreground")}>
                                    {format(date, 'd')}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex-1 flex overflow-y-auto relative min-h-[600px] select-none">
                <div className="w-14 border-r border-border bg-card/30 shrink-0 flex flex-col text-[10px] text-muted-foreground font-medium pt-2">
                    {HOURS.map(hour => (
                        <div key={hour} className="h-[60px] border-b border-border/30 flex items-start justify-center relative">
                            {hour}:00
                        </div>
                    ))}
                </div>

                <div ref={gridRef} id="grid-columns-container" className="flex-1 grid grid-cols-7 divide-x divide-zinc-800 relative bg-background/80">
                    <div className="absolute inset-0 z-0 flex flex-col pointer-events-none">
                        {HOURS.map(hour => (
                            <div key={hour} className="h-[60px] border-b border-border/20 w-full" />
                        ))}
                    </div>

                    {DAYS.map((day) => {
                        const dayLessons = localLessons.filter(l => l.dayOfWeek === day);
                        const isActiveDay = isDragging && initialGrab?.lesson.dayOfWeek === day;

                        return (
                            <div key={day} className={cn("relative h-[900px] border-border/40 border-r last:border-r-0 group", isActiveDay ? "z-50" : "z-10")}>
                                <div className="absolute inset-0 z-0">
                                    {HOURS.map(hour => (
                                        <div
                                            key={hour}
                                            className="h-[60px] w-full border-b border-border/20 hover:bg-white/[0.02] active:bg-violet-500/10 transition-colors cursor-cell"
                                            onClick={() => handleSlotClick(day, hour)}
                                        />
                                    ))}
                                </div>

                                <div className="absolute inset-0 pointer-events-none z-10 h-full">
                                    <AnimatePresence>
                                        {dayLessons.map(lesson => {
                                            const style = getLayoutStyles(lesson, dayLessons);
                                            const isBeingDragManipulated = activeLessonId === lesson.id && (dragType === 'move');
                                            const isSettlingThis = activeLessonId === lesson.id && isSettling;

                                            // Use pixel transforms during drag for maximum smoothness
                                            const dragTransform = isBeingDragManipulated && dragType === 'move'
                                                ? `translate3d(${dragDelta.x}px, ${dragDelta.y}px, 0)`
                                                : undefined;

                                            const teacher = teachers.find(t => t.id === lesson.teacherId);
                                            const group = groups.find(g => g.id === lesson.groupId);
                                            const course = courses.find(c => c.id === lesson.courseId);

                                            return (
                                                <div key={lesson.id}>
                                                    <motion.div
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (ignoreClickRef.current) return;
                                                            onLessonClick(lesson);
                                                        }}
                                                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                                                        style={{
                                                            top: (style as any).top,
                                                            height: (style as any).height,
                                                            width: (style as any).width,
                                                            left: (style as any).left,
                                                            zIndex: (style as any).zIndex,
                                                            transform: dragTransform,
                                                            transition: (isBeingDragManipulated || isSettlingThis) ? 'none' : 'all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                                            opacity: (isDragging && lesson.id !== activeLessonId) ? 0.4 : ((isBeingDragManipulated || isSettlingThis) ? 0.9 : 1),
                                                            touchAction: 'none',
                                                        }}
                                                        className={cn(
                                                            "absolute rounded-lg border shadow-sm hover:shadow-xl flex flex-col overflow-hidden group/card animate-in fade-in zoom-in-95 cursor-grab active:cursor-grabbing pointer-events-auto",
                                                            lesson.status === 'CANCELLED'
                                                                ? "bg-red-950/80 border-red-900/50 text-red-200"
                                                                : (style as any).colorClasses,
                                                            isBeingDragManipulated && conflictError && "ring-2 ring-red-500 ring-offset-2 ring-offset-black",
                                                            isBeingDragManipulated && "shadow-2xl scale-[1.03]"
                                                        )}
                                                        onPointerDown={(e) => handleDragStart(e, lesson, 'move')}
                                                    >
                                                        {/* Top Resize Handle */}
                                                        <div
                                                            className="absolute top-0 inset-x-0 h-4 cursor-ns-resize hover:bg-white/10 z-50 rounded-t-lg transition-colors flex items-center justify-center group-hover/card:opacity-100 opacity-0"
                                                            onPointerDown={(e) => { e.stopPropagation(); handleDragStart(e, lesson, 'resize-top'); }}
                                                        >
                                                            <div className="w-8 h-1 bg-white/40 rounded-full" />
                                                        </div>

                                                        <div className="p-2.5 flex flex-col h-full relative z-10 pointer-events-none">
                                                            <div className="flex flex-col mb-2">
                                                                <span className="font-black text-[11px] leading-tight tracking-tight uppercase text-foreground drop-shadow-sm truncate">
                                                                    {course?.name || lesson.courseId}
                                                                </span>
                                                                <span className="text-[10px] font-bold text-foreground/90 flex items-center gap-1.5 mt-1 bg-black/20 self-start px-1.5 py-0.5 rounded-full">
                                                                    <Clock className="h-3 w-3 shrink-0 opacity-80" />
                                                                    {isDragging && lesson.id === activeLessonId && liveTimeRange
                                                                        ? `${liveTimeRange.start} — ${liveTimeRange.end}`
                                                                        : `${lesson.startTime} — ${lesson.endTime}`
                                                                    }
                                                                </span>
                                                            </div>

                                                            <div className="mt-auto space-y-1.5 overflow-hidden">
                                                                <div className="flex items-center gap-1.5 text-[10px] font-medium text-foreground/95 truncate">
                                                                    <div className="h-4 w-4 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                                                        <Users className="h-2.5 w-2.5" />
                                                                    </div>
                                                                    <span className="truncate">{group?.name || lesson.groupId}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 text-[10px] font-medium text-foreground/95 truncate">
                                                                    <div className="h-4 w-4 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                                                        <GraduationCap className="h-2.5 w-2.5" />
                                                                    </div>
                                                                    <span className="truncate">
                                                                        {teacher ? `${teacher.lastName} ${teacher.firstName?.charAt(0)}.` : lesson.teacherId}
                                                                    </span>
                                                                </div>
                                                                {lesson.room && (
                                                                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-foreground/95 truncate">
                                                                        <div className="h-4 w-4 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                                                            <MapPin className="h-2.5 w-2.5" />
                                                                        </div>
                                                                        <span className="truncate">{lesson.room} ауд.</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Bottom Resize Handle */}
                                                        <div
                                                            className="absolute bottom-0 inset-x-0 h-4 cursor-ns-resize hover:bg-white/10 z-50 rounded-b-lg transition-colors flex items-center justify-center group-hover/card:opacity-100 opacity-0"
                                                            onPointerDown={(e) => { e.stopPropagation(); handleDragStart(e, lesson, 'resize-bottom'); }}
                                                        >
                                                            <div className="w-8 h-1 bg-white/40 rounded-full" />
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
