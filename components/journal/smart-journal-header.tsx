'use client';

import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeft, ChevronRight, Settings, BookOpen, Users, Clock } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import Link from "next/link";

interface SmartJournalHeaderProps {
    courseName: string;
    courseId: string;
    groupName: string;
    groupId: string;
    date: Date;
    onDateChange: (date: Date | undefined) => void;
    lessonTime?: string;
    teacherName?: string;
}

export function SmartJournalHeader({
    courseName,
    courseId,
    groupName,
    groupId,
    date,
    onDateChange,
    lessonTime = "08:05–09:35",
    teacherName = "Преподаватель не назначен"
}: SmartJournalHeaderProps) {
    return (
        <header className="h-16 border-b border-[hsl(var(--border))] bg-white flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm">
            {/* Context Left */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <Link href={`/app/courses/${courseId}`} className="flex items-center gap-2 text-[hsl(var(--foreground))] hover:text-primary transition-colors group">
                        <div className="p-1.5 bg-cyan-50 rounded-lg group-hover:bg-cyan-100 transition-colors">
                            <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-semibold text-sm">{courseName}</span>
                    </Link>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <Link href={`/app/groups/${groupId}`} className="flex items-center gap-2 text-[hsl(var(--foreground))] hover:text-primary transition-colors group">
                        <div className="p-1.5 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                            <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-semibold text-sm">{groupName}</span>
                    </Link>
                </div>

                <div className="h-6 w-px bg-[hsl(var(--border))]" />

                {/* Date Picker */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" className="h-9 gap-2 px-3 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] font-medium text-sm">
                            <CalendarIcon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                            {format(date, "d MMMM", { locale: ru })}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white border-[hsl(var(--border))]" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(d) => d && onDateChange(d)}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Context Right */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-[hsl(var(--muted-foreground))]">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium text-[hsl(var(--foreground))]">{lessonTime}</span>
                    </div>
                    <div className="h-4 w-px bg-[hsl(var(--border))]" />
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                            {teacherName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-[hsl(var(--foreground))] font-medium">{teacherName}</span>
                    </div>
                </div>

                <Button variant="ghost" size="icon" className="h-9 w-9 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]">
                    <Settings className="h-5 w-5" />
                </Button>
            </div>
        </header>
    );
}
