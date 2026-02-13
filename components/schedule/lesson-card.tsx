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
                "mb-2 cursor-pointer transition-all hover:bg-secondary/50 border-l-4",
                isCancelled ? "bg-red-950/20 border-l-red-500 border-border" : "bg-card border-l-cyan-500 border-border",
                "h-full"
            )}
            onClick={() => onClick(lesson)}
        >
            <CardContent className="p-3 space-y-2">
                <div className="flex justify-between items-start gap-1">
                    <div className="font-semibold text-sm line-clamp-2 text-foreground leading-tight">
                        ID: {lesson.courseId}
                    </div>
                    {isCancelled && <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                </div>

                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span className="truncate">Гр: {lesson.groupId}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <GraduationCap className="h-3 w-3" />
                        <span className="truncate">Пр: {lesson.teacherId}</span>
                    </div>
                </div>

                <div className="pt-2 border-t border-border/50 flex justify-between items-center mt-auto">
                    <div className="flex items-center gap-1 text-xs font-medium text-foreground">
                        <Clock className="h-3 w-3 text-primary" />
                        {lesson.startTime} - {lesson.endTime}
                    </div>
                    {lesson.room && (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-secondary text-muted-foreground">
                            {lesson.room}
                        </Badge>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
