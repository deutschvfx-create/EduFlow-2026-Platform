import { Course } from "@/lib/types/course";
import { cn } from "@/lib/utils";
import { GraduationCap, Users } from "lucide-react";

interface CourseIDCardProps {
    course: Course | null;
}

export function CourseIDCard({ course }: CourseIDCardProps) {
    if (!course) return (
        <div className="w-full bg-white/60 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40 h-[160px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-slate-400">
                <GraduationCap className="h-7 w-7 opacity-30" />
                <p className="text-[13px] font-medium tracking-tight">Select a course to view details</p>
            </div>
        </div>
    );

    return (
        <div className="w-full bg-white border-b border-slate-200">
            <div className="max-w-[1280px] mx-auto px-6 py-2">
                <div className="flex items-start gap-6">
                    {/* CARD PREVIEW */}
                    <div className="shrink-0 w-[286px] h-[176px]">
                        <div className="scale-[0.55] origin-top-left cursor-default">
                            <div className="relative w-[520px] h-[320px] rounded-[14px] bg-white overflow-hidden border border-slate-200 flex flex-col shadow-[0_4px_12px_rgba(15,23,42,0.06)]">
                                {/* HEADER */}
                                <div className="h-[46px] bg-[#0F3D4C] shrink-0 flex flex-col items-center justify-center px-6">
                                    <span className="text-[10px] font-black text-white tracking-[0.3em] uppercase leading-tight">EDUFLOW LANGUAGE SCHOOL</span>
                                    <span className="text-[7px] font-bold text-white/80 tracking-[0.25em] uppercase mt-0.5">OFFICIAL COURSE CARD</span>
                                </div>

                                <div className="flex-1 px-6 pt-6 pb-8 flex gap-6">
                                    {/* LEFT: Icon/Logo */}
                                    <div className="w-[165px] h-[230px] rounded-[7px] bg-slate-100 p-[1px] shrink-0 border border-slate-200 self-start mb-5 shadow-sm">
                                        <div className="w-full h-full rounded-[6px] overflow-hidden bg-white flex items-center justify-center">
                                            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center">
                                                <GraduationCap className="h-10 w-10 text-slate-400" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* RIGHT: Info */}
                                    <div className="flex-1 flex flex-col gap-0.5 min-w-0 py-1">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[9px] text-[#94A3B8] font-normal font-inter uppercase tracking-[0.08em] leading-tight">НАЗВАНИЕ КУРСА</span>
                                            <span className="text-[17px] text-[#0F172A] font-bold font-inter leading-tight uppercase tracking-wide">
                                                {course.name}
                                            </span>
                                        </div>

                                        <div className="flex flex-col gap-0.5 mt-2">
                                            <span className="text-[9px] text-[#94A3B8] font-normal font-inter uppercase tracking-[0.08em] leading-tight">CODE</span>
                                            <span className="text-[15px] text-[#0F172A] font-semibold font-mono leading-tight">
                                                {course.code}
                                            </span>
                                        </div>

                                        <div className="flex items-start gap-8 mt-4">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[9px] text-[#94A3B8] font-normal font-inter uppercase tracking-[0.08em] leading-tight">УРОВЕНЬ</span>
                                                <span className="text-[15px] text-[#0F172A] font-semibold font-inter leading-tight">
                                                    {course.level || "—"}
                                                </span>
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[9px] text-[#94A3B8] font-normal font-inter uppercase tracking-[0.08em] leading-tight">ФОРМАТ</span>
                                                <span className="text-[15px] text-[#0F172A] font-semibold font-inter leading-tight">
                                                    {course.format || "—"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className={cn(
                                            "inline-flex items-center gap-2 px-4 py-2 rounded-md w-fit font-semibold text-[13px] tracking-wider uppercase shadow-sm mt-auto",
                                            course.status === 'ACTIVE' && "bg-[#22C55E] text-white",
                                            course.status === 'ARCHIVED' && "bg-[#94A3B8] text-white",
                                            course.status === 'INACTIVE' && "bg-[#EF4444] text-white"
                                        )}>
                                            <div className="w-2 h-2 rounded-full bg-white" />
                                            {course.status === 'ACTIVE' ? 'АКТИВЕН' : course.status === 'ARCHIVED' ? 'АРХИВ' : 'НЕАКТИВЕН'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
