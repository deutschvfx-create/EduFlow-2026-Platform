import { Course } from "@/lib/types/course";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CourseStatusBadge, CourseLevelBadge } from "./status-badge";
import { Users, BookOpen } from "lucide-react";

interface CourseListPanelProps {
    courses: Course[];
    selectedCourseId: string | null;
    onSelect: (course: Course) => void;
}

export function CourseListPanel({ courses, selectedCourseId, onSelect }: CourseListPanelProps) {
    if (courses.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                <p>Курсы не найдены</p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {courses.map((course) => (
                <div
                    key={course.id}
                    onClick={() => onSelect(course)}
                    className={cn(
                        "group relative p-3 rounded-[12px] cursor-pointer transition-all duration-200 border border-transparent select-none mx-2",
                        selectedCourseId === course.id
                            ? "bg-[#0F4C3D]/5 border-[#0F4C3D]/20 shadow-sm"
                            : "hover:bg-[#F5F6F8] active:scale-[0.98]"
                    )}
                >
                    <div className="flex items-center gap-3">
                        {/* Avatar / Icon Placeholder */}
                        <div className="relative shrink-0">
                            <div className={cn(
                                "h-11 w-11 rounded-[10px] border flex items-center justify-center transition-all duration-300",
                                selectedCourseId === course.id ? "border-[#0F4C3D] shadow-md bg-white" : "border-[#E5E7EB] bg-white"
                            )}>
                                {course.level ? (
                                    <span className={cn(
                                        "text-[12px] font-black tracking-tight",
                                        selectedCourseId === course.id ? "text-[#0F4C3D]" : "text-[#64748B]"
                                    )}>
                                        {course.level}
                                    </span>
                                ) : (
                                    <BookOpen className={cn("h-5 w-5", selectedCourseId === course.id ? "text-[#0F4C3D]" : "text-[#94A3B8]")} />
                                )}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                                <h3 className={cn(
                                    "text-[14px] font-black tracking-tight truncate font-inter",
                                    selectedCourseId === course.id ? "text-[#0F4C3D]" : "text-[#0F172A]"
                                )}>
                                    {course.name}
                                </h3>
                                <div className={cn(
                                    "h-1.5 w-1.5 rounded-full shrink-0",
                                    course.status === 'ACTIVE' ? "bg-[#22C55E]" : "bg-[#64748B]"
                                )} />
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest font-inter truncate max-w-[120px]">
                                    {course.format === 'ONLINE' ? 'ОНЛАЙН' : 'ОФЛАЙН'}
                                </span>
                                <div className="w-1 h-1 rounded-full bg-[#E5E7EB]" />
                                <span className="text-[11px] font-medium text-[#64748B] font-mono opacity-60">
                                    #{course.code}
                                </span>
                            </div>
                        </div>

                        {/* Left Indicator for selected */}
                        {selectedCourseId === course.id && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#0F4C3D] rounded-r-full" />
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
