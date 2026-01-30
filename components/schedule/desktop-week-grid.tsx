import { Lesson, DayOfWeek } from "@/lib/types/schedule";
import { cn } from "@/lib/utils";
import { Clock, MapPin, Users, GraduationCap } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { ru } from "date-fns/locale";

interface DesktopWeekGridProps {
    lessons: Lesson[];
    currentDate: Date;
    onLessonClick: (lesson: Lesson) => void;
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 08:00 to 22:00
const DAYS: DayOfWeek[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export function DesktopWeekGrid({ lessons, currentDate, onLessonClick }: DesktopWeekGridProps) {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    // Inline Editor State
    const [editorOpen, setEditorOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ day: DayOfWeek, time: string } | null>(null);

    // Form State for Inline Editor
    const [formData, setFormData] = useState({
        groupId: "",
        courseId: "",
        teacherId: "",
        room: ""
    });

    const handleSlotClick = (day: DayOfWeek, hour: number) => {
        const time = `${hour.toString().padStart(2, '0')}:00`;
        setSelectedSlot({ day, time });
        setFormData({ groupId: "", courseId: "", teacherId: "", room: "" }); // Reset
        setEditorOpen(true);
    };

    const handleQuickSave = () => {
        if (!formData.groupId || !formData.teacherId || !formData.courseId) {
            alert("Заполните обязательные поля");
            return;
        }
        alert(`Урок создан: ${formData.courseId} для ${formData.groupId}`);
        setEditorOpen(false);
    };


    // Helper to calculate grid position & Overlaps
    const getLayoutStyles = (lesson: Lesson, dayLessons: Lesson[]) => {
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

        // Overlap Detection
        // Find all lessons that overlap with THIS lesson
        const overlaps = dayLessons.filter(l =>
            l.id !== lesson.id &&
            l.status !== 'CANCELLED' &&
            l.startTime < lesson.endTime &&
            l.endTime > lesson.startTime
        );

        // Simple tiling: If overlaps exist, shrink width and shift
        // This is a naive implementation. For true "Masonry" we need a complete algo.
        // For now: If 1 overlap, width 50%. If 2, 33%.

        let width = "96%"; // Default full width (with some margin)
        let left = "2%";

        if (overlaps.length > 0) {
            // Sort by creation or ID to ensure consistent order
            const cluster = [lesson, ...overlaps].sort((a, b) => a.id.localeCompare(b.id));
            const index = cluster.findIndex(l => l.id === lesson.id);
            const count = cluster.length;

            width = `${Math.floor(96 / count)}%`;
            left = `${2 + (index * (100 / count))}%`;
        }

        return { top: `${topPercent}%`, height: `${heightPercent}%`, width, left };
    };

    return (
        <div className="flex h-full flex-col bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl shadow-black/50">
            {/* Header: Days */}
            <div className="flex border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
                <div className="w-14 border-r border-zinc-800 shrink-0" /> {/* Time column spacer */}
                <div className="flex-1 grid grid-cols-7 divide-x divide-zinc-800">
                    {weekDays.map((date, i) => {
                        const isToday = isSameDay(date, new Date());
                        return (
                            <div key={i} className={cn(
                                "py-3 text-center border-zinc-800",
                                isToday && "bg-violet-900/10"
                            )}>
                                <div className={cn(
                                    "text-[10px] font-bold uppercase mb-0.5 tracking-wider",
                                    isToday ? "text-violet-400" : "text-zinc-500"
                                )}>
                                    {format(date, 'EEE', { locale: ru })}
                                </div>
                                <div className={cn(
                                    "text-xl font-bold leading-none",
                                    isToday ? "text-violet-100" : "text-zinc-300"
                                )}>
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
                <div className="w-14 border-r border-zinc-800 bg-zinc-900/30 shrink-0 flex flex-col text-[10px] text-zinc-500 font-medium">
                    {HOURS.map(hour => (
                        <div key={hour} className="h-[60px] border-b border-zinc-800/30 flex items-start justify-center pt-2 relative">
                            {hour}:00
                        </div>
                    ))}
                </div>

                {/* Columns */}
                <div className="flex-1 grid grid-cols-7 divide-x divide-zinc-800 relative bg-zinc-950/80">
                    {/* Background Grid Lines & Click Area */}
                    <div className="absolute inset-0 z-0 flex flex-col pointer-events-none">
                        {HOURS.map(hour => (
                            <div key={hour} className="h-[60px] border-b border-zinc-800/20 w-full" />
                        ))}
                    </div>

                    {DAYS.map((day, colIndex) => {
                        const dayLessons = lessons.filter(l => l.dayOfWeek === day);

                        return (
                            <div key={day} className="relative z-10 h-[900px] group">
                                {/* Interactive Slots Layer */}
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
                                                <div className="p-3 border-b border-zinc-800 text-sm font-semibold text-white flex justify-between items-center">
                                                    <span>Новый урок ({selectedSlot?.time})</span>
                                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditorOpen(false)}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="p-4 space-y-3">
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

                                {/* Lessons Layer */}
                                {dayLessons.map(lesson => {
                                    const style = getLayoutStyles(lesson, dayLessons);

                                    return (
                                        <div
                                            key={lesson.id}
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent slot click
                                                onLessonClick(lesson);
                                            }}
                                            style={style}
                                            className={cn(
                                                "absolute rounded border shadow-sm transition-all hover:z-50 hover:shadow-lg cursor-pointer flex flex-col overflow-hidden",
                                                lesson.status === 'CANCELLED'
                                                    ? "bg-red-950/80 border-red-900/50 text-red-200"
                                                    : "bg-indigo-900/80 border-indigo-700/50 text-indigo-100 hover:bg-indigo-800"
                                            )}
                                        >
                                            <div className="px-1.5 py-1 text-[10px] font-bold leading-tight truncate">
                                                {lesson.courseName}
                                            </div>
                                            <div className="px-1.5 pb-1 flex flex-col gap-0.5 opacity-90">
                                                <div className="flex items-center gap-1 text-[9px] truncate">
                                                    <Users className="h-2.5 w-2.5" />
                                                    <span>{lesson.groupName}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-[9px] truncate">
                                                    <Clock className="h-2.5 w-2.5" />
                                                    <span>{lesson.startTime} - {lesson.endTime}</span>
                                                </div>
                                            </div>
                                            {lesson.room && (
                                                <div className="absolute top-1 right-1 px-1 rounded bg-black/40 text-[9px] font-mono">
                                                    {lesson.room}
                                                </div>
                                            )}
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
