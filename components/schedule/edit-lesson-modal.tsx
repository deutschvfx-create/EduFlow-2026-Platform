'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, XCircle, Minus, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DayOfWeek, Lesson, LessonStatus } from "@/lib/types/schedule";
import { useModules } from "@/hooks/use-modules";
import { useOrganization } from "@/hooks/use-organization";
import { Classroom } from "@/lib/data/classrooms.repo";

// Helper to add minutes to "HH:MM"
const addMinutes = (time: string, minutes: number) => {
    if (!time) return "09:00";
    const [h, m] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m);
    date.setMinutes(date.getMinutes() + minutes);
    return date.toTimeString().slice(0, 5);
};

interface EditLessonModalProps {
    lesson: Lesson | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (id: string, updates: Partial<Lesson>) => void;
    onDelete?: (id: string) => void;
    groups?: any[];
    teachers?: any[];
    courses?: any[];
}

export function EditLessonModal({
    lesson,
    open,
    onOpenChange,
    onSave,
    onDelete,
    groups = [],
    teachers = [],
    courses = []
}: EditLessonModalProps) {
    const [loading, setLoading] = useState(false);
    const { modules } = useModules();
    const { currentOrganizationId } = useOrganization();
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);

    // Form State
    const [groupId, setGroupId] = useState("");
    const [courseId, setCourseId] = useState("");
    const [teacherId, setTeacherId] = useState("");
    const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek | "">("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [room, setRoom] = useState("");
    const [status, setStatus] = useState<LessonStatus>("PLANNED");

    useEffect(() => {
        if (lesson) {
            setGroupId(lesson.groupId);
            setCourseId(lesson.courseId);
            setTeacherId(lesson.teacherId);
            setDayOfWeek(lesson.dayOfWeek);
            setStartTime(lesson.startTime);
            setEndTime(lesson.endTime);
            setRoom(lesson.room || "");
            setStatus(lesson.status);
        }

        if (open && currentOrganizationId && modules.classrooms) {
            import("@/lib/data/classrooms.repo").then(async ({ classroomsRepo }) => {
                const data = await classroomsRepo.getAll(currentOrganizationId);
                setClassrooms(data);
            });
        }
    }, [lesson, open, currentOrganizationId, modules.classrooms]);

    const handleSubmit = async () => {
        if (!lesson) return;
        setLoading(true);
        // Simulate minor UX delay
        await new Promise(r => setTimeout(r, 600));

        onSave(lesson.id, {
            groupId,
            courseId,
            teacherId,
            dayOfWeek: dayOfWeek as DayOfWeek,
            startTime,
            endTime,
            room: room === "__none__" ? "" : room,
            status,
        });

        setLoading(false);
        onOpenChange(false);
    };

    if (!lesson) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-80 bg-zinc-900 border-zinc-800 p-0 shadow-2xl shadow-black/80 gap-0">
                <div className="p-3 border-b border-zinc-800 text-sm font-semibold text-white flex justify-between items-center bg-zinc-900/50">
                    <span className="flex items-center gap-2">
                        Редактирование
                        {status === 'CANCELLED' && <span className="text-[10px] bg-red-900/50 text-red-200 px-1.5 py-0.5 rounded">Отменен</span>}
                    </span>
                    {/* Close button handled by Dialog primitive usually, but we can add explicit close or simple X */}
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-zinc-400 hover:text-white" onClick={() => onOpenChange(false)}>
                        <XCircle className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5 flex flex-col items-center">
                            <Label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Начало</Label>
                            <Select value={startTime} onValueChange={setStartTime}>
                                <SelectTrigger className="w-full h-8 bg-zinc-950 border-zinc-800 text-xs font-mono text-center"><SelectValue /></SelectTrigger>
                                <SelectContent className="h-48">
                                    {Array.from({ length: 29 }, (_, i) => {
                                        const h = Math.floor(i / 2) + 8;
                                        const m = (i % 2) * 30;
                                        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                                    }).map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5 flex flex-col items-center">
                            <Label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Конец</Label>
                            <Select value={endTime} onValueChange={setEndTime}>
                                <SelectTrigger className="w-full h-8 bg-zinc-950 border-zinc-800 text-xs font-mono text-center"><SelectValue /></SelectTrigger>
                                <SelectContent className="h-48">
                                    {Array.from({ length: 29 }, (_, i) => {
                                        const h = Math.floor(i / 2) + 8;
                                        const m = (i % 2) * 30;
                                        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                                    }).map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs text-zinc-400">Предмет</Label>
                        <Select value={courseId} onValueChange={setCourseId}>
                            <SelectTrigger className="h-8 text-xs bg-zinc-950 border-zinc-800"><SelectValue placeholder="Предмет" /></SelectTrigger>
                            <SelectContent>
                                {courses.map(c => <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <Label className="text-xs text-zinc-400">Группа</Label>
                            <Select value={groupId} onValueChange={setGroupId}>
                                <SelectTrigger className="h-8 text-xs bg-zinc-950 border-zinc-800"><SelectValue placeholder="Группа" /></SelectTrigger>
                                <SelectContent>
                                    {groups.map(g => <SelectItem key={g.id} value={g.id} className="text-xs">{g.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-zinc-400">Учитель</Label>
                            <Select value={teacherId} onValueChange={setTeacherId}>
                                <SelectTrigger className="h-8 text-xs bg-zinc-950 border-zinc-800"><SelectValue placeholder="Учитель" /></SelectTrigger>
                                <SelectContent>
                                    {teachers.map(t => <SelectItem key={t.id} value={t.id} className="text-xs">{t.firstName} {t.lastName}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {modules.classrooms && (
                        <div className="space-y-1">
                            <Label className="text-xs text-zinc-400">Аудитория</Label>
                            <Select value={room || "__none__"} onValueChange={setRoom}>
                                <SelectTrigger className="h-8 text-xs bg-zinc-950 border-zinc-800"><SelectValue placeholder="Аудитория" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__none__" className="text-xs">Нет</SelectItem>
                                    {classrooms.map(cls => (
                                        <SelectItem key={cls.id} value={cls.name} className="text-xs">{cls.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="pt-2 flex gap-2">
                        <Button onClick={handleSubmit} disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white h-8 text-xs">
                            {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                            Сохранить
                        </Button>

                        {status !== 'CANCELLED' ? (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-950/20"
                                onClick={() => setStatus('CANCELLED')}
                                title="Отменить проведение"
                            >
                                <XCircle className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-950/20"
                                onClick={() => setStatus('PLANNED')}
                                title="Восстановить"
                            >
                                <Loader2 className="h-4 w-4" />
                            </Button>
                        )}

                        {onDelete && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-zinc-600 hover:text-red-500 hover:bg-red-950/20"
                                onClick={() => onDelete(lesson.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
