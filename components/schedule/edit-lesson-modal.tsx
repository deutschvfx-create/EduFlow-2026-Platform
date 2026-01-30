'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, XCircle, Minus, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MOCK_GROUPS_FULL } from "@/lib/mock/groups";
import { MOCK_TEACHERS } from "@/lib/mock/teachers";
import { MOCK_COURSES } from "@/lib/mock/courses";
import { DayOfWeek, Lesson, LessonStatus } from "@/lib/types/schedule";

// Helper to add minutes to "HH:MM"
const addMinutes = (time: string, minutes: number) => {
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
}

export function EditLessonModal({ lesson, open, onOpenChange, onSave }: EditLessonModalProps) {
    const [loading, setLoading] = useState(false);

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
    }, [lesson]);

    const handleSubmit = async () => {
        if (!lesson) return;
        setLoading(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 600));

        onSave(lesson.id, {
            groupId,
            courseId,
            teacherId,
            dayOfWeek: dayOfWeek as DayOfWeek,
            startTime,
            endTime,
            room,
            status,
            // Update denormalized names
            groupName: MOCK_GROUPS_FULL.find(g => g.id === groupId)?.name || lesson.groupName,
            courseName: MOCK_COURSES.find(c => c.id === courseId)?.name || lesson.courseName,
            teacherName: MOCK_TEACHERS.find(t => t.id === teacherId)?.lastName || lesson.teacherName, // Using LastName for brevity if needed, but keeping consistent with mock
        });

        setLoading(false);
        onOpenChange(false);
    };

    if (!lesson) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-zinc-900 border-zinc-800 text-zinc-100">
                <DialogHeader>
                    <DialogTitle>Редактирование занятия</DialogTitle>
                    <DialogDescription>Изменение параметров урока</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Группа</Label>
                            <Select value={groupId} onValueChange={setGroupId}>
                                <SelectTrigger className="bg-zinc-950 border-zinc-800">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {MOCK_GROUPS_FULL.map(g => (
                                        <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Предмет</Label>
                            <Select value={courseId} onValueChange={setCourseId}>
                                <SelectTrigger className="bg-zinc-950 border-zinc-800">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {MOCK_COURSES.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Преподаватель</Label>
                            <Select value={teacherId} onValueChange={setTeacherId}>
                                <SelectTrigger className="bg-zinc-950 border-zinc-800">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {MOCK_TEACHERS.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>День недели</Label>
                            <Select value={dayOfWeek} onValueChange={(d) => setDayOfWeek(d as DayOfWeek)}>
                                <SelectTrigger className="bg-zinc-950 border-zinc-800">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MON">Понедельник</SelectItem>
                                    <SelectItem value="TUE">Вторник</SelectItem>
                                    <SelectItem value="WED">Среда</SelectItem>
                                    <SelectItem value="THU">Четверг</SelectItem>
                                    <SelectItem value="FRI">Пятница</SelectItem>
                                    <SelectItem value="SAT">Суббота</SelectItem>
                                    <SelectItem value="SUN">Воскресенье</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* ROW 3: Time Controls */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Начало</Label>
                            <div className="flex items-center gap-1">
                                <Button
                                    size="icon" variant="outline" className="h-9 w-9 shrink-0 border-zinc-700 bg-zinc-900"
                                    onClick={() => setStartTime(t => addMinutes(t, -15))}
                                >
                                    <Minus className="h-3 w-3" />
                                </Button>
                                <Select value={startTime} onValueChange={setStartTime}>
                                    <SelectTrigger className="bg-zinc-950 border-zinc-800 text-center font-mono">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[200px]">
                                        {["08:00", "09:00", "09:30", "11:00", "12:30", "14:00", "15:30", "17:00", "18:30"].map(t => (
                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    size="icon" variant="outline" className="h-9 w-9 shrink-0 border-zinc-700 bg-zinc-900"
                                    onClick={() => setStartTime(t => addMinutes(t, 15))}
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Конец</Label>
                            <div className="flex items-center gap-1">
                                <Button
                                    size="icon" variant="outline" className="h-9 w-9 shrink-0 border-zinc-700 bg-zinc-900"
                                    onClick={() => setEndTime(t => addMinutes(t, -15))}
                                >
                                    <Minus className="h-3 w-3" />
                                </Button>
                                <Select value={endTime} onValueChange={setEndTime}>
                                    <SelectTrigger className="bg-zinc-950 border-zinc-800 text-center font-mono">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[200px]">
                                        {["09:30", "10:30", "11:00", "12:30", "14:00", "15:30", "17:00", "18:30", "20:00"].map(t => (
                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    size="icon" variant="outline" className="h-9 w-9 shrink-0 border-zinc-700 bg-zinc-900"
                                    onClick={() => setEndTime(t => addMinutes(t, 15))}
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </div>    <div className="space-y-2">
                        <Label>Аудитория</Label>
                        <Input
                            className="bg-zinc-950 border-zinc-800"
                            value={room}
                            onChange={(e) => setRoom(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-800">
                    <div className="text-zinc-400 text-sm mb-2">Действия</div>
                    <div className="flex gap-4">
                        {status !== 'CANCELLED' ? (
                            <Button
                                type="button"
                                variant="destructive"
                                className="w-full bg-red-900/30 hover:bg-red-900/50 text-red-500 border border-red-900"
                                onClick={() => setStatus('CANCELLED')}
                            >
                                <XCircle className="mr-2 h-4 w-4" /> Отменить занятие
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                onClick={() => setStatus('PLANNED')}
                            >
                                <Loader2 className="mr-2 h-4 w-4" /> Восстановить занятие
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <DialogFooter>
                <Button variant="ghost" onClick={() => onOpenChange(false)}>Отмена</Button>
                <Button onClick={handleSubmit} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Сохранить
                </Button>
            </DialogFooter>
        </DialogContent>
        </Dialog >
    );
}
