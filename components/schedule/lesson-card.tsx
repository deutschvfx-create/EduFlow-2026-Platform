import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Lesson } from "@/lib/types/schedule";
import { Clock, MapPin, GraduationCap, Users, XCircle } from "lucide-react";

interface LessonCardProps {
    lesson: Lesson;
    onClick: (lesson: Lesson) => void;
}

export function LessonCard({ lesson, onClick }: LessonCardProps) {
    const isCancelled = lesson.status === 'CANCELLED';

    return (
        <Card
            className={cn(
                "mb-2 cursor-pointer transition-all hover:bg-zinc-800/50 border-l-4",
                isCancelled ? "bg-red-950/20 border-l-red-500 border-zinc-800" : "bg-zinc-900 border-l-indigo-500 border-zinc-800",
                "h-full"
            )}
            onClick={() => onClick(lesson)}
        >
            <CardContent className="p-3 space-y-2">
                <div className="flex justify-between items-start gap-1">
                    <div className="font-semibold text-sm line-clamp-2 text-zinc-100 leading-tight">
                        ID: {lesson.courseId}
                    </div>
                    {isCancelled && <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                </div>

                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <Users className="h-3 w-3" />
                        <span className="truncate">Гр: {lesson.groupId}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <GraduationCap className="h-3 w-3" />
                        <span className="truncate">Пр: {lesson.teacherId}</span>
                    </div>
                </div>

                <div className="pt-2 border-t border-zinc-800/50 flex justify-between items-center mt-auto">
                    <div className="flex items-center gap-1 text-xs font-medium text-zinc-300">
                        <Clock className="h-3 w-3 text-indigo-400" />
                        {lesson.startTime} - {lesson.endTime}
                    </div>
                    {lesson.room && (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-zinc-800 text-zinc-400">
                            {lesson.room}
                        </Badge>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
