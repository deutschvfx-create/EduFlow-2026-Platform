'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MOCK_GROUPS_FULL } from "@/lib/mock/groups";
import { MOCK_TEACHERS } from "@/lib/mock/teachers";
import { MOCK_COURSES } from "@/lib/mock/courses";
import { DayOfWeek, Lesson } from "@/lib/types/schedule";

export function AddLessonModal({ lessons }: { lessons: Lesson[] }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [groupId, setGroupId] = useState("");
    const [courseId, setCourseId] = useState("");
    const [teacherId, setTeacherId] = useState("");
    const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek | "">("");
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("10:30");
    const [room, setRoom] = useState("");

    const handleSubmit = async () => {
        if (!groupId || !courseId || !teacherId || !dayOfWeek || !startTime || !endTime) {
            alert("Все поля кроме аудитории обязательны");
            return;
        }

        if (endTime <= startTime) {
            alert("Время окончания должно быть позже времени начала");
            return;
        }

        // Simple validation overlap check
        const hasOverlap = lessons.some(l =>
            l.dayOfWeek === dayOfWeek &&
            l.groupId === groupId &&
            l.status !== 'CANCELLED' &&
            ((startTime >= l.startTime && startTime < l.endTime) || (endTime > l.startTime && endTime <= l.endTime))
        );

        if (hasOverlap) {
            alert("В это время у группы уже есть занятие!");
            return;
        }

        // Check teacher overlap
        const teacherOverlap = lessons.some(l =>
            l.dayOfWeek === dayOfWeek &&
            l.teacherId === teacherId &&
            l.status !== 'CANCELLED' &&
            ((startTime >= l.startTime && startTime < l.endTime) || (endTime > l.startTime && endTime <= l.endTime))
        );

        if (teacherOverlap) {
            alert("В это время преподаватель уже занят!");
            return;
        }


        setLoading(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1000));
        setLoading(false);
        setOpen(false);
        alert(`Занятие успешно добавлено (Mock)`);

        // Reset form
        setRoom("");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                    <Plus className="h-4 w-4" />
                    Добавить занятие
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-zinc-900 border-zinc-800 text-zinc-100">
                <DialogHeader>
                    <DialogTitle>Добавление занятия</DialogTitle>
                    <DialogDescription>Запланируйте новый урок в расписании</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Группа *</Label>
                            <Select value={groupId} onValueChange={setGroupId}>
                                <SelectTrigger className="bg-zinc-950 border-zinc-800">
                                    <SelectValue placeholder="Выберите группу" />
                                </SelectTrigger>
                                <SelectContent>
                                    {MOCK_GROUPS_FULL.map(g => (
                                        <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Предмет *</Label>
                            <Select value={courseId} onValueChange={setCourseId}>
                                <SelectTrigger className="bg-zinc-950 border-zinc-800">
                                    <SelectValue placeholder="Выберите предмет" />
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
                            <Label>Преподаватель *</Label>
                            <Select value={teacherId} onValueChange={setTeacherId}>
                                <SelectTrigger className="bg-zinc-950 border-zinc-800">
                                    <SelectValue placeholder="Преподаватель" />
                                </SelectTrigger>
                                <SelectContent>
                                    {MOCK_TEACHERS.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>День недели *</Label>
                            <Select value={dayOfWeek} onValueChange={(d) => setDayOfWeek(d as DayOfWeek)}>
                                <SelectTrigger className="bg-zinc-950 border-zinc-800">
                                    <SelectValue placeholder="День" />
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

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Начало</Label>
                            <Select value={startTime} onValueChange={setStartTime}>
                                <SelectTrigger className="bg-zinc-950 border-zinc-800">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                    {["08:00", "09:00", "09:30", "11:00", "12:30", "14:00", "15:30", "17:00", "18:30"].map(t => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Конец</Label>
                            <Select value={endTime} onValueChange={setEndTime}>
                                <SelectTrigger className="bg-zinc-950 border-zinc-800">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                    {["09:30", "10:30", "11:00", "12:30", "14:00", "15:30", "17:00", "18:30", "20:00"].map(t => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Аудитория</Label>
                            <Input
                                placeholder="101"
                                className="bg-zinc-950 border-zinc-800"
                                value={room}
                                onChange={(e) => setRoom(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setOpen(false)}>Отмена</Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Создать
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
