"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Trash2, AlertCircle } from "lucide-react";
import { AnimatePresence } from "framer-motion";

import { useModules } from "@/hooks/use-modules";

interface DesktopWeekGridProps {
    lessons: Lesson[];
    currentDate: Date;
    onLessonClick: (lesson: Lesson) => void;
    onLessonAdd?: (lesson: any) => void;
    onLessonUpdate?: (lesson: Lesson) => void;
    onLessonDelete?: (lessonId: string) => void;
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

export function DesktopWeekGrid({ lessons: propsLessons, currentDate, onLessonClick, onLessonAdd, onLessonUpdate, onLessonDelete }: DesktopWeekGridProps) {
    const { modules } = useModules();
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    // Local State to allow immediate "Stickiness"
    const [localLessons, setLocalLessons] = useState<Lesson[]>(propsLessons);
    const lastUpdateRef = useRef<number>(0);

    // Pulse feedback state
    const [pulsingLessonId, setPulsingLessonId] = useState<string | null>(null);
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        if (pulsingLessonId) {
            const timer = setTimeout(() => setPulsingLessonId(null), 2500);
            return () => clearTimeout(timer);
        }
    }, [pulsingLessonId]);

    // Adaptive Density: Count unique teachers to decide avatar visibility
    const uniqueTeachersCount = new Set(localLessons.map(l => l.teacherId)).size;

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

    // Edit State
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

    // Sync with props if they change, but NOT if we just updated locally (avoid "snapback")
    useEffect(() => {
        const now = Date.now();
        if (now - lastUpdateRef.current > 2000 && !isDragging) {
            console.log("[Schedule] Syncing local state with props");
            setLocalLessons(propsLessons);
        }
    }, [propsLessons, isDragging]);

    // Smooth Follow State
    const [dragDelta, setDragDelta] = useState({ x: 0, y: 0 });
    const [liveDay, setLiveDay] = useState<DayOfWeek | null>(null);
    const [liveTimeRange, setLiveTimeRange] = useState<{ start: string, end: string } | null>(null);
    const [conflictError, setConflictError] = useState<string | null>(null);
    const ignoreClickRef = useRef(false);

    const [initialGrab, setInitialGrab] = useState<{
        x: number,
        y: number,
        dayIdx: number,
        startMin: number,
        durationMin: number,
        lesson: Lesson
    } | null>(null);

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
        const teacher = MOCK_TEACHERS.find(t => t.id === formData.teacherId);
        const newLesson: Lesson = {
            id: `temp-${Date.now()}`,
            organizationId: "org_1", // Mock or from context if available
            groupId: formData.groupId,
            teacherId: formData.teacherId,
            courseId: formData.courseId,
            dayOfWeek: selectedSlot?.day || 'MON',
            startTime: formData.startTime,
            endTime: formData.endTime,
            room: "101",
            status: 'SCHEDULED',
            createdAt: new Date().toISOString()
        };

        lastUpdateRef.current = Date.now();
        setLocalLessons(prev => [...prev, newLesson]);
        setPulsingLessonId(newLesson.id);
        if (onLessonAdd) onLessonAdd(newLesson);
        setEditorOpen(false);
    };

    // --- Edit Handlers ---
    const handleLessonClick = (lesson: Lesson) => {
        if (isDragging || ignoreClickRef.current) {
            ignoreClickRef.current = false;
            return;
        }
        setEditFormData({
            groupId: lesson.groupId,
            courseId: lesson.courseId,
            teacherId: lesson.teacherId,
            room: lesson.room || "101",
            startTime: lesson.startTime,
            endTime: lesson.endTime,
            dayOfWeek: lesson.dayOfWeek
        });
        setEditingLessonId(lesson.id);
    };

    const handleEditSave = () => {
        if (!editingLessonId) return;
        const teacher = MOCK_TEACHERS.find(t => t.id === editFormData.teacherId);
        const updatedLesson: Lesson = {
            ...localLessons.find(l => l.id === editingLessonId)!,
            groupId: editFormData.groupId,
            teacherId: editFormData.teacherId,
            courseId: editFormData.courseId,
            dayOfWeek: editFormData.dayOfWeek,
            startTime: editFormData.startTime,
            endTime: editFormData.endTime,
            room: editFormData.room
        };

        lastUpdateRef.current = Date.now();
        setLocalLessons(prev => prev.map(l => l.id === editingLessonId ? updatedLesson : l));
        setPulsingLessonId(editingLessonId);
        if (onLessonUpdate) onLessonUpdate(updatedLesson);
        setEditingLessonId(null);
    };

    const handleDelete = () => {
        if (!editingLessonId) return;
        const idToDelete = editingLessonId;

        // Immediate UI feedback
        setLocalLessons(prev => prev.filter(l => l.id !== idToDelete));
        if (onLessonDelete) onLessonDelete(idToDelete);

        setIsDeleteDialogOpen(false);
        setEditingLessonId(null);
    };
    const timeToMinutes = (time: string) => {
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

        console.group(`[Schedule] Drag Start: ${lesson.id}`);
        console.log("Type:", type);
        console.log("Original Day:", lesson.dayOfWeek, "Idx:", dayIdx);
        console.log("Original Time:", lesson.startTime, "-", lesson.endTime);
        console.groupEnd();

        // Initial state for potential drag
        // We will only set isDragging to true if cursor moves beyond threshold
        // setIsDragging(true); 
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

        // Use pointerId for robust capturing
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!initialGrab || !activeLessonId) return;

        const deltaY = e.clientY - initialGrab.y;
        const deltaX = e.clientX - initialGrab.x;

        // Threshold Check
        if (!isDragging && (Math.abs(deltaY) > 5 || Math.abs(deltaX) > 5)) {
            setIsDragging(true);
            ignoreClickRef.current = true;
        }

        if (!isDragging) return;

        // 1. Direct Visual Follow (Vertical Only)
        setDragDelta({ x: 0, y: deltaY });

        // 2. Time Calculation
        const deltaMin = Math.round(deltaY / 5) * 5;
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

        if (newStart !== (liveTimeRange?.start || initialGrab.lesson.startTime) || newEnd !== (liveTimeRange?.end || initialGrab.lesson.endTime)) {
            setLiveTimeRange({ start: newStart, end: newEnd });
        }

        // Quick Conflict Check for Visual Feedback (Red Ring)
        const activeDay = initialGrab.lesson.dayOfWeek;
        const activeStart = newStart;
        const activeEnd = newEnd;

        const conflict = checkConflict(activeLessonId, activeDay, activeStart, activeEnd, initialGrab.lesson.teacherId);
        setConflictError(conflict ? "Conflict" : null);
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (isDragging && activeLessonId && initialGrab && liveTimeRange && liveDay) {
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

            const conflict = checkConflict(activeLessonId, liveDay, liveTimeRange.start, liveTimeRange.end, initialGrab.lesson.teacherId);

            if (!conflict) {
                const updatedLesson = {
                    ...initialGrab.lesson,
                    dayOfWeek: liveDay,
                    startTime: liveTimeRange.start,
                    endTime: liveTimeRange.end
                };

                // We update local state. The lesson in the grid will transition to new top/height
                // thanks to the CSS transition on the motion.div.
                lastUpdateRef.current = Date.now();
                setLocalLessons(prev => prev.map(l => l.id === activeLessonId ? updatedLesson : l));
                setPulsingLessonId(activeLessonId);

                if (onLessonUpdate) onLessonUpdate(updatedLesson);
            }
        }
        setIsDragging(false);
        setDragType(null);
        setActiveLessonId(null);
        setDragDelta({ x: 0, y: 0 });
        setLiveDay(null);
        setLiveTimeRange(null);
        setConflictError(null);
    };


    // Helper to calculate grid position & Overlaps
    const getLayoutStyles = (lesson: Lesson, dayLessons: Lesson[]) => {
        const isBeingManipulated = lesson.id === activeLessonId;

        let startTime = lesson.startTime;
        let endTime = lesson.endTime;

        // For resizing, we update the logical footprint in real-time
        if (isBeingManipulated && (dragType === 'resize-top' || dragType === 'resize-bottom') && liveTimeRange) {
            startTime = liveTimeRange.start;
            endTime = liveTimeRange.end;
        }

        const [hourStr, minuteStr] = startTime.split(':');
        const startHour = parseInt(hourStr);
        const startMinute = parseInt(minuteStr);

        const [endHourStr, endMinuteStr] = endTime.split(':');
        const endHour = parseInt(endHourStr);
        const endMinute = parseInt(endMinuteStr);

        const startMinutesFrom8 = (startHour - 8) * 60 + startMinute;
        const durationMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);

        const topPercent = (startMinutesFrom8 / (15 * 60)) * 100;
        const heightPercent = (durationMinutes / (15 * 60)) * 100;

        const overlaps = dayLessons.filter(l => l.id !== lesson.id && l.status !== 'CANCELLED' && l.startTime < lesson.endTime && l.endTime > lesson.startTime);
        let width = "calc(100% - 4px)";
        let left = "2px";
        const overlapCount = overlaps.length + 1;

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
            zIndex: isBeingManipulated ? 100 : undefined,
            isBeingManipulated,
            overlapCount
        };
    };

    return (
        <div
            id="schedule-grid-container"
            className="flex h-full flex-col bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl shadow-black/50 select-none relative"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
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
                <div id="grid-columns-container" className="flex-1 grid grid-cols-7 divide-x divide-zinc-800 relative bg-zinc-950/80">
                    {/* Background Grid Lines */}
                    <div className="absolute inset-0 z-0 flex flex-col pointer-events-none">
                        {HOURS.map(hour => (
                            <div key={hour} className="h-[60px] border-b border-zinc-800/20 w-full" />
                        ))}
                    </div>

                    {DAYS.map((day, colIndex) => {
                        const dayLessons = localLessons.filter(l => {
                            const isBeingManipulated = l.id === activeLessonId;
                            if (isBeingManipulated) {
                                return liveDay === day;
                            }
                            return l.dayOfWeek === day;
                        });

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

                                {/* Placeholder Layer */}
                                {isDragging && activeLessonId && liveDay === day && dragType === 'move' && !conflictError && liveTimeRange && (
                                    <div
                                        className="absolute w-[calc(100%-4px)] left-[2px] border-2 border-dashed border-zinc-500/50 rounded bg-white/[0.03] z-20 pointer-events-none transition-all duration-150"
                                        style={{
                                            top: `${(timeToMinutes(liveTimeRange.start) / (15 * 60)) * 100}%`,
                                            height: `${((timeToMinutes(liveTimeRange.end) - timeToMinutes(liveTimeRange.start)) / (15 * 60)) * 100}%`
                                        }}
                                    />
                                )}

                                {/* Lessons Layer */}
                                <AnimatePresence>
                                    {dayLessons.map(lesson => {
                                        const style = getLayoutStyles(lesson, dayLessons);
                                        const overlapCount = (style as any).overlapCount || 1;

                                        // ADAPTIVE DENSITY RULES
                                        const showAvatar = uniqueTeachersCount <= 5 && overlapCount <= 2;
                                        const isBeingDragManipulated = isDragging && lesson.id === activeLessonId;

                                        return (
                                            <div key={lesson.id}>
                                                <motion.div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleLessonClick(lesson);
                                                    }}
                                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                                    initial={false}
                                                    animate={pulsingLessonId === lesson.id ? (
                                                        shouldReduceMotion ? {
                                                            boxShadow: [
                                                                "inset 0 0 0px rgba(34, 197, 94, 0)",
                                                                "inset 0 0 20px rgba(34, 197, 94, 0.3)",
                                                                "inset 0 0 0px rgba(34, 197, 94, 0)"
                                                            ],
                                                            transition: { duration: 1.5, ease: "easeInOut" }
                                                        } : {
                                                            scale: [1, 1.02, 1, 1.015, 1, 1.02, 1],
                                                            boxShadow: [
                                                                "0 0 0px rgba(249, 115, 22, 0)",      // Start
                                                                "0 0 12px rgba(249, 115, 22, 0.5)",   // Orange Pulse 1
                                                                "0 0 0px rgba(249, 115, 22, 0)",      // Mid
                                                                "0 0 8px rgba(249, 115, 22, 0.4)",    // Orange Pulse 2
                                                                "0 0 0px rgba(249, 115, 22, 0)",      // Mid
                                                                "0 0 15px rgba(34, 197, 94, 0.6)",    // Green Confirm
                                                                "0 0 0px rgba(34, 197, 94, 0)"       // End
                                                            ],
                                                            transition: {
                                                                duration: 2.0,
                                                                ease: "easeInOut",
                                                                times: [0, 0.15, 0.3, 0.45, 0.6, 0.8, 1]
                                                            }
                                                        }
                                                    ) : {}}
                                                    style={{
                                                        top: (style as any).top,
                                                        height: (style as any).height,
                                                        width: (style as any).width,
                                                        left: (style as any).left,
                                                        zIndex: (style as any).zIndex,
                                                        transition: 'all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)', // Smooth commit
                                                        opacity: isBeingDragManipulated ? 0.4 : 1,
                                                        touchAction: 'none',
                                                        transform: undefined
                                                    }}
                                                    className={cn(
                                                        "absolute rounded border shadow-sm hover:shadow-lg flex flex-col overflow-hidden group/card animate-in fade-in zoom-in-95 cursor-grab active:cursor-grabbing",
                                                        lesson.status === 'CANCELLED'
                                                            ? "bg-red-950/80 border-red-900/50 text-red-200"
                                                            : (style as any).colorClasses,
                                                        isBeingDragManipulated && conflictError && "ring-2 ring-red-500 ring-offset-2 ring-offset-black"
                                                    )}
                                                    onPointerDown={(e) => handleDragStart(e, lesson, 'move')}
                                                >
                                                    {/* Top Resize Handle */}
                                                    <div
                                                        className="absolute top-0 inset-x-0 h-2 cursor-ns-resize hover:bg-white/20 z-50 transition-colors"
                                                        onPointerDown={(e) => { e.stopPropagation(); handleDragStart(e, lesson, 'resize-top'); }}
                                                    />

                                                    <div className="p-2 flex flex-col h-full relative z-10 pointer-events-none">
                                                        {/* 1. Subject & 2. Time Header */}
                                                        <div className="flex flex-col mb-2">
                                                            <span className="font-bold text-[11px] leading-tight truncate text-white">
                                                                ID: {lesson.courseId}
                                                            </span>
                                                            <span className="text-[10px] font-medium text-white/80 flex items-center gap-1 mt-0.5">
                                                                <Clock className="h-3 w-3 shrink-0" />
                                                                {isDragging && (style as any).isBeingManipulated && liveTimeRange
                                                                    ? `${liveTimeRange.start} - ${liveTimeRange.end}`
                                                                    : `${lesson.startTime} - ${lesson.endTime}`
                                                                }
                                                            </span>
                                                        </div>

                                                        {/* 3, 4, 5. Meta Stack */}
                                                        <div className="flex flex-col gap-1.5 overflow-hidden">
                                                            <div className="flex items-center gap-1.5 text-[9px] text-white/90 truncate">
                                                                <Users className="h-3 w-3 shrink-0 opacity-70" />
                                                                <span className="truncate">Гр: {lesson.groupId}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-[9px] text-white/90 truncate">
                                                                <GraduationCap className="h-3 w-3 shrink-0 opacity-70" />
                                                                <span className="truncate">Пр: {lesson.teacherId}</span>
                                                            </div>
                                                            {lesson.room && modules.classrooms && (
                                                                <div className="flex items-center gap-1.5 text-[9px] text-white/90 truncate">
                                                                    <MapPin className="h-3 w-3 shrink-0 opacity-70" />
                                                                    <span className="truncate">{lesson.room} ауд.</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Bottom Resize Handle */}
                                                    <div
                                                        className="absolute bottom-0 inset-x-0 h-2 cursor-ns-resize hover:bg-white/20 z-50 transition-colors"
                                                        onPointerDown={(e) => { e.stopPropagation(); handleDragStart(e, lesson, 'resize-bottom'); }}
                                                    />
                                                </motion.div>

                                                {/* Ghost Element Layer (Only if moving) */}
                                                {isBeingDragManipulated && dragType === 'move' && (
                                                    <div
                                                        className={cn(
                                                            "absolute pointer-events-none z-50 rounded border shadow-2xl opacity-70 scale-105 transition-none",
                                                            (style as any).colorClasses
                                                        )}
                                                        style={{
                                                            top: (style as any).top,
                                                            height: (style as any).height,
                                                            width: (style as any).width,
                                                            left: (style as any).left,
                                                            transform: `translate(0, ${dragDelta.y}px)`,
                                                            boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.5)"
                                                        }}
                                                    >
                                                        <div className="p-2 flex flex-col h-full pointer-events-none">
                                                            <span className="font-bold text-[11px] leading-tight truncate text-white">ID: {lesson.courseId}</span>
                                                            <div className="mt-1 flex items-center gap-1 text-[10px] text-white/90">
                                                                <Clock className="h-3 w-3 shrink-0" />
                                                                <span>{liveTimeRange?.start || lesson.startTime} - {liveTimeRange?.end || lesson.endTime}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
            {/* Edit Lesson Dialog */}
            <Dialog open={!!editingLessonId && !isDeleteDialogOpen} onOpenChange={(open) => !open && setEditingLessonId(null)}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Clock className="h-5 w-5 text-indigo-400" />
                            Редактировать урок
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Начало</Label>
                                <IOSStyleTimePicker
                                    value={editFormData.startTime}
                                    onChange={(v) => setEditFormData(prev => ({ ...prev, startTime: v }))}
                                    className="w-full h-24 border-zinc-800/50 bg-black/40"
                                    minuteStep={5}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Конец</Label>
                                <IOSStyleTimePicker
                                    value={editFormData.endTime}
                                    onChange={(v) => setEditFormData(prev => ({ ...prev, endTime: v }))}
                                    className="w-full h-24 border-zinc-800/50 bg-black/40"
                                    minuteStep={5}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">День недели</Label>
                            <Select value={editFormData.dayOfWeek} onValueChange={(v: DayOfWeek) => setEditFormData({ ...editFormData, dayOfWeek: v })}>
                                <SelectTrigger className="h-10 bg-zinc-950 border-zinc-800"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800">
                                    {DAYS.map(day => (
                                        <SelectItem key={day} value={day}>{day}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-400">Предмет</Label>
                            <Select value={editFormData.courseId} onValueChange={(v) => setEditFormData({ ...editFormData, courseId: v })}>
                                <SelectTrigger className="h-10 bg-zinc-950 border-zinc-800"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800">
                                    {MOCK_COURSES.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label className="text-xs text-zinc-400">Группа</Label>
                                <Select value={editFormData.groupId} onValueChange={(v) => setEditFormData({ ...editFormData, groupId: v })}>
                                    <SelectTrigger className="h-10 bg-zinc-950 border-zinc-800"><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800">
                                        {MOCK_GROUPS_FULL.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-zinc-400">Учитель</Label>
                                <Select value={editFormData.teacherId} onValueChange={(v) => setEditFormData({ ...editFormData, teacherId: v })}>
                                    <SelectTrigger className="h-10 bg-zinc-950 border-zinc-800"><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800">
                                        {MOCK_TEACHERS.map(t => <SelectItem key={t.id} value={t.id}>{t.lastName}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex-row gap-2 sm:justify-between pt-4 border-t border-zinc-800">
                        <Button
                            variant="destructive"
                            size="sm"
                            className="bg-red-950/50 hover:bg-red-900 border border-red-900/50 text-red-200"
                            onClick={() => setIsDeleteDialogOpen(true)}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Удалить
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setEditingLessonId(null)}>Отмена</Button>
                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={handleEditSave}>Сохранить</Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Deletion Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-400">
                            <AlertCircle className="h-5 w-5" />
                            Подтвердите удаление
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-2 text-zinc-400 text-sm">
                        Вы уверены, что хотите удалить этот урок? Это действие необратимо.
                    </div>
                    <DialogFooter className="gap-2 sm:justify-end bg-transparent pt-4">
                        <Button variant="ghost" size="sm" onClick={() => setIsDeleteDialogOpen(false)}>Отмена</Button>
                        <Button variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>Удалить урок</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
