'use client';

import { Group } from "@/lib/types/group";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Users, BookOpen, Layers } from "lucide-react";

interface CompactGroupCardProps {
    group: Group;
    isActive: boolean;
    onClick: () => void;
}

export function CompactGroupCard({ group, isActive, onClick }: CompactGroupCardProps) {
    return (
        <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={cn(
                "group relative p-3 rounded-[12px] cursor-pointer transition-all duration-200 border border-transparent select-none mx-2",
                isActive
                    ? "bg-[#2563EB]/5 border-[#2563EB]/20 shadow-sm"
                    : "hover:bg-[#F5F6F8] active:scale-[0.98]"
            )}
        >
            <div className="flex items-center gap-3">
                {/* 1. Icon / Avatar (Matches Course Style) */}
                <div className="relative shrink-0">
                    <div className={cn(
                        "h-11 w-11 rounded-[10px] border flex items-center justify-center transition-all duration-300",
                        isActive ? "border-[#2563EB] shadow-md bg-white" : "border-[#E5E7EB] bg-white"
                    )}>
                        {group.level ? (
                            <span className={cn(
                                "text-[12px] font-black tracking-tight",
                                isActive ? "text-[#2563EB]" : "text-[#64748B]"
                            )}>
                                {group.level}
                            </span>
                        ) : (
                            <Layers className={cn("h-5 w-5", isActive ? "text-[#2563EB]" : "text-[#94A3B8]")} />
                        )}
                    </div>
                </div>

                {/* 2. Text Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h3 className={cn(
                            "text-[14px] font-black tracking-tight truncate font-inter",
                            isActive ? "text-[#2563EB]" : "text-[#0F172A]"
                        )}>
                            {group.name}
                        </h3>
                        <div className={cn(
                            "h-1.5 w-1.5 rounded-full shrink-0",
                            group.status === 'ACTIVE' ? "bg-[#22C55E]" : "bg-[#64748B]"
                        )} />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest font-inter truncate">
                            {group.paymentType === 'PAID' ? 'Контракт' : 'Бюджет'}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-[#E5E7EB]" />
                        <span className="text-[11px] font-medium text-[#64748B] font-mono opacity-60">
                            #{group.code}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-[#E5E7EB]" />
                        <span className="flex items-center gap-1 text-[11px] font-black text-[#2563EB]">
                            <Users className="h-2.5 w-2.5" />
                            {group.studentsCount || 0}/{group.maxStudents}
                        </span>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="mt-2.5">
                        <div className="h-1.5 w-full bg-[#F1F5F9] rounded-full overflow-hidden border border-[#E2E8F0]/30">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(((group.studentsCount || 0) / group.maxStudents) * 100, 100)}%` }}
                                transition={{ duration: 1, ease: "circOut" }}
                                className={cn(
                                    "h-full rounded-full transition-all duration-500",
                                    (group.studentsCount || 0) >= group.maxStudents
                                        ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]"
                                        : "bg-[#2563EB] shadow-[0_0_8px_rgba(37,99,235,0.3)]"
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Left Selection Indicator */}
                {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#2563EB] rounded-r-full shadow-[2px_0_8px_rgba(37,99,235,0.3)]" />
                )}
            </div>
        </motion.div>
    );
}
