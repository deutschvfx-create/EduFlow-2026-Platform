'use client';

import { AttendanceStatus } from "@/lib/types/attendance";
import { cn } from "@/lib/utils";
import { Check, X, Clock, HelpCircle, Star } from "lucide-react";

interface StudentJournalCardProps {
    studentName: string;
    studentAvatar?: string;
    studentId: string;
    status: AttendanceStatus;
    onStatusChange: (status: AttendanceStatus) => void;
    onClick?: () => void;
    onReward?: () => void;
    isSelected?: boolean;
    isLastAction?: boolean;
    hasNote?: boolean;
    streak?: number;
}

export function StudentJournalCard({
    studentName,
    studentAvatar,
    studentId,
    status,
    onStatusChange,
    onClick,
    onReward,
    isSelected = false,
    isLastAction = false,
    hasNote = false,
    streak = 0
}: StudentJournalCardProps) {
    const initials = studentName.split(' ').map(n => n[0]).join('');

    const statusConfigs = [
        {
            value: "PRESENT" as AttendanceStatus,
            label: "Присутствует",
            icon: Check,
            activeClass: "bg-[#22C55E] text-white border-[#22C55E]",
            inactiveClass: "text-[#22C55E] hover:bg-[#22C55E]/10 border-border"
        },
        {
            value: "ABSENT" as AttendanceStatus,
            label: "Отсутствует",
            icon: X,
            activeClass: "bg-[#EF4444] text-white border-[#EF4444]",
            inactiveClass: "text-[#EF4444] hover:bg-[#EF4444]/10 border-border"
        },
        {
            value: "LATE" as AttendanceStatus,
            label: "Опоздал",
            icon: Clock,
            activeClass: "bg-[#F59E0B] text-white border-[#F59E0B]",
            inactiveClass: "text-[#F59E0B] hover:bg-[#F59E0B]/10 border-border"
        },
        {
            value: "UNKNOWN" as AttendanceStatus,
            label: "Не отмечен",
            icon: HelpCircle,
            activeClass: "bg-[#CBD5E1] text-white border-[#CBD5E1]",
            inactiveClass: "text-muted-foreground hover:bg-muted border-border"
        }
    ];

    return (
        <div
            onClick={onClick}
            className={cn(
                "p-3 rounded-2xl bg-white border transition-all duration-200 flex flex-col gap-3 cursor-pointer relative",
                isSelected ? "ring-2 ring-cyan-500 border-primary shadow-md" :
                    isLastAction ? "ring-2 ring-cyan-500/20 border-primary/30" : "border-border shadow-sm hover:shadow-md"
            )}
        >
            <div className="flex items-center gap-4">
                {hasNote && (
                    <div className="absolute top-2 right-2 h-4 w-4 bg-amber-100 rounded-full flex items-center justify-center border border-amber-200 shadow-sm animate-pulse">
                        <div className="h-1.5 w-1.5 bg-amber-600 rounded-full" />
                    </div>
                )}

                {/* Avatar */}
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground font-bold text-sm shrink-0">
                    {studentAvatar ? (
                        <img src={studentAvatar} alt={studentName} className="h-full w-full object-cover rounded-xl" />
                    ) : (
                        initials
                    )}
                </div>

                {/* Name & Streak */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="text-foreground font-bold text-sm truncate">{studentName}</h4>
                        {streak > 2 && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-orange-50 text-orange-600 rounded-md border border-orange-100">
                                <span className="text-[10px] font-black">🔥 {streak}</span>
                            </div>
                        )}
                    </div>
                    <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider mt-0.5">Студент</p>
                </div>

                {/* Reward Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onReward?.();
                    }}
                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-cyan-50 text-primary hover:bg-primary hover:text-foreground transition-all shadow-sm"
                    title="Наградить за активность"
                >
                    <Star className="h-5 w-5" />
                </button>
            </div>

            {/* Status Buttons */}
            <div className="flex gap-2">
                {statusConfigs.map((config) => {
                    const isActive = status === config.value;
                    const Icon = config.icon;

                    return (
                        <button
                            key={config.value}
                            onClick={(e) => {
                                e.stopPropagation();
                                onStatusChange(config.value);
                            }}
                            className={cn(
                                "flex-1 h-11 px-3 rounded-xl border-2 font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5",
                                isActive ? config.activeClass : config.inactiveClass
                            )}
                            title={config.label}
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span className={cn(isActive ? "inline" : "hidden laptop:inline")}>{config.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
