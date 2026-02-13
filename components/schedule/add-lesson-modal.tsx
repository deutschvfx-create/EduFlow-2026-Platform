'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DayOfWeek, Lesson } from "@/lib/types/schedule";
import { useModules } from "@/hooks/use-modules";
import { useOrganization } from "@/hooks/use-organization";
import { Classroom } from "@/lib/data/classrooms.repo";

export function AddLessonModal({
    lessons,
    groups = [],
    teachers = [],
    courses = [],
    onSave,
    children
}: {
    lessons: Lesson[],
    groups?: any[],
    teachers?: any[],
    courses?: any[],
    onSave?: (lesson: any) => Promise<void>,
    children?: React.ReactNode
}) {
    const [open, setOpen] = useState(false);
    const { modules } = useModules();
    const { currentOrganizationId } = useOrganization();
    const [loading, setLoading] = useState(false);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);

    // Form State
    const [groupId, setGroupId] = useState("");
    const [courseId, setCourseId] = useState("");
    const [teacherId, setTeacherId] = useState("");
    const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek | "">("");
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("10:30");
    const [room, setRoom] = useState("");

    // Conflict State
    const [conflicts, setConflicts] = useState<{
        teacher?: string;
        group?: string;
        room?: string;
    }>({});

    useEffect(() => {
        if (open && currentOrganizationId && modules.classrooms) {
            import("@/lib/data/classrooms.repo").then(async ({ classroomsRepo }) => {
                const data = await classroomsRepo.getAll(currentOrganizationId);
                setClassrooms(data);
            });
        }
    }, [open, currentOrganizationId, modules.classrooms]);

    // Helper: Check for overlaps
    const checkConflicts = () => {
        if (!dayOfWeek || !startTime || !endTime) {
            setConflicts({});
            return;
        }

        const newConflicts: typeof conflicts = {};

        lessons.forEach(l => {
            if (l.status === 'CANCELLED') return;
            if (l.dayOfWeek !== dayOfWeek) return;

            // Check Time Overlap
            // (StartA < EndB) and (EndA > StartB)
            const overlap = (startTime < l.endTime) && (endTime > l.startTime);

            if (overlap) {
                // 1. Teacher Conflict
                if (teacherId && l.teacherId === teacherId) {
                    newConflicts.teacher = `Преподаватель занят: Группа ${l.groupId} (${l.startTime}-${l.endTime})`;
                }
                // 2. Group Conflict
                if (groupId && l.groupId === groupId) {
                    newConflicts.group = `У группы уже есть урок: Предмет ${l.courseId} (${l.startTime}-${l.endTime})`;
                }
                // 3. Room Conflict
                if (room && l.room === room && modules.classrooms) {
                    newConflicts.room = `Аудитория занята: Группа ${l.groupId} (${l.startTime}-${l.endTime})`;
                }
            }
        });

        setConflicts(newConflicts);
    };

    // Real-time check effect
    useEffect(() => {
        checkConflicts();
    }, [groupId, teacherId, room, dayOfWeek, startTime, endTime]);


    const handleSubmit = async () => {
        if (!groupId || !courseId || !teacherId || !dayOfWeek || !startTime || !endTime) {
            alert("Заполните обязательные поля");
            return;
        }

        if (endTime <= startTime) {
            alert("Время окончания должно быть позже времени начала");
            return;
        }

        if (Object.keys(conflicts).length > 0) {
            alert("Есть конфликты в расписании! Исправьте их перед созданием.");
            return;
        }

        setLoading(true);
        try {
            if (onSave) {
                // Construct lesson data compatible with SchedulePage
                const lessonData = {
                    groupId,
                    courseId,
                    teacherId,
                    dayOfWeek,
                    startTime,
                    endTime,
                    room: room === "__none__" ? "" : (room || "")
                };
                await onSave(lessonData);
                setOpen(false);
                // Reset form
                setGroupId("");
                setCourseId("");
                setTeacherId("");
                setDayOfWeek("");
                setRoom("");
            }
        } catch (error) {
            console.error("Modal save error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children ? children : (
                    <Button className="bg-primary hover:bg-primary/90 text-foreground gap-2">
                        <Plus className="h-4 w-4" />
                        Добавить занятие
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-card border-border text-foreground">
                <DialogHeader>
                    <DialogTitle>Добавление занятия</DialogTitle>
                    <DialogDescription>Система автоматически проверяет конфликты.</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* ROW 1: Group & Course */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className={conflicts.group ? "text-red-400" : ""}>
                                Группа {conflicts.group && "*"}
                            </Label>
                            <Select value={groupId} onValueChange={setGroupId}>
                                <SelectTrigger className={conflicts.group ? "border-red-500 bg-red-950/10" : "bg-background border-border"}>
                                    <SelectValue placeholder="Выберите группу" />
                                </SelectTrigger>
                                <SelectContent>
                                    {groups.map(g => (
                                        <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {conflicts.group && (
                                <p className="text-[10px] text-red-400 font-medium">{conflicts.group}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Предмет *</Label>
                            <Select value={courseId} onValueChange={setCourseId}>
                                <SelectTrigger className="bg-background border-border">
                                    <SelectValue placeholder="Выберите предмет" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* ROW 2: Teacher & Day */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className={conflicts.teacher ? "text-red-400" : ""}>
                                Преподаватель {conflicts.teacher && "*"}
                            </Label>
                            <Select value={teacherId} onValueChange={setTeacherId}>
                                <SelectTrigger className={conflicts.teacher ? "border-red-500 bg-red-950/10" : "bg-background border-border"}>
                                    <SelectValue placeholder="Преподаватель" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teachers.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.firstName || t.name} {t.lastName || ""}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {conflicts.teacher && (
                                <p className="text-[10px] text-red-400 font-medium">{conflicts.teacher}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>День недели *</Label>
                            <Select value={dayOfWeek} onValueChange={(d) => setDayOfWeek(d as DayOfWeek)}>
                                <SelectTrigger className="bg-background border-border">
                                    <SelectValue placeholder="День" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[
                                        { v: "MON", l: "Понедельник" },
                                        { v: "TUE", l: "Вторник" },
                                        { v: "WED", l: "Среда" },
                                        { v: "THU", l: "Четверг" },
                                        { v: "FRI", l: "Пятница" },
                                        { v: "SAT", l: "Суббота" },
                                        { v: "SUN", l: "Воскресенье" }
                                    ].map(d => (
                                        <SelectItem key={d.v} value={d.v}>{d.l}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* ROW 3: Time & Room */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Начало</Label>
                            <Select value={startTime} onValueChange={setStartTime}>
                                <SelectTrigger className="bg-background border-border">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                    {["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"].map(t => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Конец</Label>
                            <Select value={endTime} onValueChange={setEndTime}>
                                <SelectTrigger className="bg-background border-border">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                    {["08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"].map(t => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {modules.classrooms && (
                            <div className="space-y-2">
                                <Label className={conflicts.room ? "text-red-400" : ""}>
                                    Аудитория {conflicts.room && "*"}
                                </Label>
                                <Select value={room} onValueChange={setRoom}>
                                    <SelectTrigger className={conflicts.room ? "border-red-500 bg-red-950/10 text-red-100" : "bg-background border-border"}>
                                        <SelectValue placeholder="Не выбрана" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__none__">Не выбрана</SelectItem>
                                        {classrooms.map(cls => (
                                            <SelectItem key={cls.id} value={cls.name}>
                                                <div className="flex items-center gap-2">
                                                    <span>{cls.name}</span>
                                                    {cls.type === 'ONLINE' && (
                                                        <span className="text-[10px] text-primary">Онлайн</span>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {conflicts.room && (
                                    <p className="text-[10px] text-red-400 font-medium absolute">{conflicts.room}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-border">
                    <Button variant="ghost" onClick={() => setOpen(false)}>Отмена</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || Object.keys(conflicts).length > 0}
                        className={Object.keys(conflicts).length > 0 ? "bg-red-900/50 text-red-400 border border-red-900 cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-white"}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {Object.keys(conflicts).length > 0 ? "Исправьте конфликты" : "Создать"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
