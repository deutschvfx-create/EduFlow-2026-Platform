'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
// import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, XCircle, Minus, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DayOfWeek, Lesson, LessonStatus } from "@/lib/types/schedule";
import { useModules } from "@/hooks/use-modules";
import { useOrganization } from "@/hooks/use-organization";
import { Classroom } from "@/lib/data/classrooms.repo";
import { IOSStyleTimePicker } from "@/components/ui/ios-time-picker";

// Helper to add minutes to "HH:MM"
const addMinutes = (time: string, minutes: number) => {
    if (!time) return "09:00";
    const [h, m] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m);
    date.setMinutes(date.getMinutes() + minutes);
    return date.toTimeString().slice(0, 5);
};

interface LessonModalProps {
    lesson: Lesson | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: any) => void;
    onDelete?: (id: string) => void;
    groups?: any[];
    teachers?: any[];
    courses?: any[];
    initialData?: Partial<Lesson>;
}

export function LessonModal({
    lesson,
    open,
    onOpenChange,
    onSave,
    onDelete,
    groups = [],
    teachers = [],
    courses = [],
    initialData
}: LessonModalProps) {
    const [loading, setLoading] = useState(false);
    const { modules } = useModules();
    const { currentOrganizationId } = useOrganization();
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);

    // Form State
    const [groupId, setGroupId] = useState("");
    const [courseId, setCourseId] = useState("");
    const [teacherId, setTeacherId] = useState("");
    const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>("MON");
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("10:30");
    const [room, setRoom] = useState("");
    const [status, setStatus] = useState<LessonStatus>("PLANNED");

    useEffect(() => {
        if (open) {
            if (lesson) {
                setGroupId(lesson.groupId);
                setCourseId(lesson.courseId);
                setTeacherId(lesson.teacherId);
                setDayOfWeek(lesson.dayOfWeek);
                setStartTime(lesson.startTime);
                setEndTime(lesson.endTime);
                setRoom(lesson.room || "");
                setStatus(lesson.status);
            } else if (initialData) {
                setGroupId(initialData.groupId || "");
                setCourseId(initialData.courseId || "");
                setTeacherId(initialData.teacherId || "");
                setDayOfWeek(initialData.dayOfWeek || "MON");
                setStartTime(initialData.startTime || "09:00");
                setEndTime(initialData.endTime || "10:30");
                setRoom(initialData.room || "");
                setStatus("PLANNED");
            } else {
                // Reset for clean create
                setGroupId("");
                setCourseId("");
                setTeacherId("");
                setDayOfWeek("MON");
                setStartTime("09:00");
                setEndTime("10:30");
                setRoom("");
                setStatus("PLANNED");
            }
        }

        if (open && currentOrganizationId && modules.classrooms) {
            import("@/lib/data/classrooms.repo").then(async ({ classroomsRepo }) => {
                const data = await classroomsRepo.getAll(currentOrganizationId);
                setClassrooms(data);
            });
        }
    }, [lesson, open, initialData, currentOrganizationId, modules.classrooms]);

    const handleSubmit = async () => {
        setLoading(true);
        // Simulate minor UX delay for premium feel
        await new Promise(r => setTimeout(r, 400));

        const data = {
            id: lesson?.id, // Unified: if id exists, it's an update
            groupId,
            courseId,
            teacherId,
            dayOfWeek: dayOfWeek as DayOfWeek,
            startTime,
            endTime,
            room: room === "__none__" ? "" : room,
            status,
        };

        onSave(data);
        setLoading(false);
        onOpenChange(false);
    };

    const isEdit = !!lesson;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-80 bg-card border-border p-0 shadow-2xl shadow-black/80 gap-0 border-border outline-none overflow-hidden">
                <div className="p-3 border-b border-border text-sm font-semibold text-foreground flex justify-between items-center bg-card/50">
                    <span className="flex items-center gap-2">
                        {isEdit ? "Редактирование" : "Новое занятие"}
                        {isEdit && status === 'CANCELLED' && (
                            <span className="text-[10px] bg-red-900/50 text-red-200 px-1.5 py-0.5 rounded border border-red-500/20">Отменен</span>
                        )}
                    </span>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-white/5" onClick={() => onOpenChange(false)}>
                        <XCircle className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-4 space-y-3">
                    <div className="flex gap-3">
                        <div className="flex-1 space-y-1.5 flex flex-col items-center">
                            <Label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Начало</Label>
                            <IOSStyleTimePicker
                                value={startTime}
                                onChange={setStartTime}
                                className="w-full h-24 border-border/50 bg-black/40"
                                minuteStep={5}
                            />
                        </div>
                        <div className="flex-1 space-y-1.5 flex flex-col items-center">
                            <Label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Конец</Label>
                            <IOSStyleTimePicker
                                value={endTime}
                                onChange={setEndTime}
                                className="w-full h-24 border-border/50 bg-black/40"
                                minuteStep={5}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground uppercase font-bold px-0.5">Предмет</Label>
                        <Select value={courseId} onValueChange={setCourseId}>
                            <SelectTrigger className="h-9 text-xs bg-background border-border focus:ring-1 focus:ring-cyan-500 transition-all">
                                <SelectValue placeholder="Выберите предмет" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                                {courses.map(c => <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground uppercase font-bold px-0.5">Группа</Label>
                            <Select value={groupId} onValueChange={setGroupId}>
                                <SelectTrigger className="h-9 text-xs bg-background border-border focus:ring-1 focus:ring-cyan-500 transition-all">
                                    <SelectValue placeholder="Группа" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    {groups.map(g => <SelectItem key={g.id} value={g.id} className="text-xs">{g.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground uppercase font-bold px-0.5">День</Label>
                            <Select value={dayOfWeek} onValueChange={(v) => setDayOfWeek(v as DayOfWeek)}>
                                <SelectTrigger className="h-9 text-xs bg-background border-border">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    <SelectItem value="MON" className="text-xs">Пнд</SelectItem>
                                    <SelectItem value="TUE" className="text-xs">Втр</SelectItem>
                                    <SelectItem value="WED" className="text-xs">Срд</SelectItem>
                                    <SelectItem value="THU" className="text-xs">Чтв</SelectItem>
                                    <SelectItem value="FRI" className="text-xs">Птн</SelectItem>
                                    <SelectItem value="SAT" className="text-xs">Сбт</SelectItem>
                                    <SelectItem value="SUN" className="text-xs">Вск</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground uppercase font-bold px-0.5">Преподаватель</Label>
                        <Select value={teacherId} onValueChange={setTeacherId}>
                            <SelectTrigger className="h-9 text-xs bg-background border-border focus:ring-1 focus:ring-cyan-500 transition-all">
                                <SelectValue placeholder="Выберите учителя" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                                {teachers.map(t => (
                                    <SelectItem key={t.id} value={t.id} className="text-xs">
                                        {t.lastName} {t.firstName?.charAt(0)}.
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {modules.classrooms && (
                        <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground uppercase font-bold px-0.5">Аудитория</Label>
                            <Select value={room || "__none__"} onValueChange={setRoom}>
                                <SelectTrigger className="h-9 text-xs bg-background border-border focus:ring-1 focus:ring-cyan-500 transition-all">
                                    <SelectValue placeholder="Аудитория" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    <SelectItem value="__none__" className="text-xs">Не выбрана</SelectItem>
                                    {classrooms.map(cls => (
                                        <SelectItem key={cls.id} value={cls.name} className="text-xs">{cls.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="pt-3 flex gap-2">
                        <Button
                            onClick={handleSubmit}
                            disabled={loading || !courseId || !groupId || !teacherId}
                            className="flex-1 bg-primary hover:bg-primary/90 text-foreground h-9 text-xs font-semibold shadow-lg shadow-cyan-950/40 border border-border active:scale-[0.98] transition-all"
                        >
                            {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                            {isEdit ? "Сохранить" : "Создать занятие"}
                        </Button>

                        {isEdit && (
                            <div className="flex gap-1.5">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "h-9 w-9 border border-border",
                                        status === 'CANCELLED'
                                            ? "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30"
                                            : "text-muted-foreground hover:text-red-400 hover:bg-red-950/30"
                                    )}
                                    onClick={() => setStatus(status === 'CANCELLED' ? 'PLANNED' : 'CANCELLED')}
                                >
                                    {status === 'CANCELLED' ? <Loader2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                </Button>

                                {onDelete && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 text-muted-foreground hover:text-red-500 hover:bg-red-950/30 border border-border"
                                        onClick={() => onDelete(lesson.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    );
}
