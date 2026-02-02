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
            <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800 text-zinc-100 p-0 overflow-hidden shadow-2xl shadow-black/80">
                <div className="px-6 py-6 border-b border-zinc-800 bg-zinc-900/50">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            Редактирование занятия
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Измените время, место или участников занятия.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-6">
                    {/* Time Selection */}
                    <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50 space-y-4">
                        <div className="flex items-center justify-between text-sm font-medium text-zinc-400 uppercase tracking-wide">
                            <span>Время проведения</span>
                            <span className="text-zinc-500">{dayOfWeek && ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].includes(dayOfWeek) ?
                                ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"][["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].indexOf(dayOfWeek)] : dayOfWeek}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 space-y-2">
                                <Label className="text-xs text-zinc-500">Начало</Label>
                                <div className="flex items-center gap-1.5">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full border border-zinc-800" onClick={() => setStartTime(t => addMinutes(t, -15))}><Minus className="h-3 w-3" /></Button>
                                    <Select value={startTime} onValueChange={setStartTime}>
                                        <SelectTrigger className="h-9 bg-black border-zinc-800 font-mono text-center"><SelectValue /></SelectTrigger>
                                        <SelectContent className="max-h-[200px] text-center">
                                            {Array.from({ length: 29 }, (_, i) => {
                                                const h = Math.floor(i / 2) + 8;
                                                const m = (i % 2) * 30;
                                                return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                                            }).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full border border-zinc-800" onClick={() => setStartTime(t => addMinutes(t, 15))}><Plus className="h-3 w-3" /></Button>
                                </div>
                            </div>
                            <div className="w-4 h-[1px] bg-zinc-700 mt-6" />
                            <div className="flex-1 space-y-2">
                                <Label className="text-xs text-zinc-500">Конец</Label>
                                <div className="flex items-center gap-1.5">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full border border-zinc-800" onClick={() => setEndTime(t => addMinutes(t, -15))}><Minus className="h-3 w-3" /></Button>
                                    <Select value={endTime} onValueChange={setEndTime}>
                                        <SelectTrigger className="h-9 bg-black border-zinc-800 font-mono text-center"><SelectValue /></SelectTrigger>
                                        <SelectContent className="max-h-[200px] text-center">
                                            {Array.from({ length: 29 }, (_, i) => {
                                                const h = Math.floor(i / 2) + 8;
                                                const m = (i % 2) * 30;
                                                return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                                            }).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full border border-zinc-800" onClick={() => setEndTime(t => addMinutes(t, 15))}><Plus className="h-3 w-3" /></Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label className="text-zinc-400">Группа</Label>
                            <Select value={groupId} onValueChange={setGroupId}>
                                <SelectTrigger className="bg-zinc-900 border-zinc-800 h-10"><SelectValue placeholder="Выберите группу" /></SelectTrigger>
                                <SelectContent>
                                    {groups.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-400">Предмет</Label>
                            <Select value={courseId} onValueChange={setCourseId}>
                                <SelectTrigger className="bg-zinc-900 border-zinc-800 h-10"><SelectValue placeholder="Выберите предмет" /></SelectTrigger>
                                <SelectContent>
                                    {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-400">Преподаватель</Label>
                            <Select value={teacherId} onValueChange={setTeacherId}>
                                <SelectTrigger className="bg-zinc-900 border-zinc-800 h-10"><SelectValue placeholder="Выберите преподавателя" /></SelectTrigger>
                                <SelectContent>
                                    {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        {modules.classrooms && (
                            <div className="space-y-2">
                                <Label className="text-zinc-400">Аудитория</Label>
                                <Select value={room || "__none__"} onValueChange={setRoom}>
                                    <SelectTrigger className="bg-zinc-900 border-zinc-800 h-10"><SelectValue placeholder="Аудитория" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__none__">Нет</SelectItem>
                                        {classrooms.map(cls => (
                                            <SelectItem key={cls.id} value={cls.name}>{cls.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 bg-zinc-900/50 border-t border-zinc-800 flex items-center justify-between sm:justify-between w-full">
                    <div className="flex items-center gap-2">
                        {onDelete && (
                            <Button
                                type="button"
                                variant="ghost"
                                className="text-red-500 hover:text-red-400 hover:bg-red-950/30"
                                onClick={() => onDelete(lesson.id)}
                            >
                                <Trash2 className="h-4 w-4 mr-2" /> Удалить
                            </Button>
                        )}
                        {status === 'CANCELLED' ? (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                onClick={() => setStatus('PLANNED')}
                            >
                                Восстановить обьявление
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-zinc-500 hover:text-zinc-300"
                                onClick={() => setStatus('CANCELLED')}
                            >
                                Отменить проведение
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={() => onOpenChange(false)}>Зарыть</Button>
                        <Button onClick={handleSubmit} disabled={loading} className="bg-violet-600 hover:bg-violet-700 text-white min-w-[100px]">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Сохранить
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
