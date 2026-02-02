'use client';

import { Teacher } from "@/lib/types/teacher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Shield, ShieldAlert, Archive, Eye, Lock, GraduationCap, Users, Check, Briefcase } from "lucide-react";
import { TeacherStatusBadge, TeacherRoleBadge } from "./status-badge";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

interface TeacherCardProps {
    teacher: Teacher;
    onEditPermissions: (teacher: Teacher) => void;
    controlMode?: boolean;
    isSelected?: boolean;
    onToggleSelect?: () => void;
}

export function TeacherCard({
    teacher,
    onEditPermissions,
    controlMode,
    isSelected,
    onToggleSelect
}: TeacherCardProps) {
    const router = useRouter();

    const handleAction = (action: string, id: string) => {
        if (action === 'archive') {
            if (!confirm("Вы уверены, что хотите архивировать этого преподавателя?")) return;
        }
        alert(`Action ${action} triggered for teacher ${id}`);
    };

    const item = {
        hidden: { opacity: 0, scale: 0.9, y: 10 },
        show: { opacity: 1, scale: 1, y: 0 }
    };

    // Derived info
    const groupsCount = teacher.groupIds?.length || 0;

    return (
        <motion.div
            variants={item}
            whileHover={{ y: -5 }}
            className={cn(
                "group relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 hover:shadow-[0_0_25px_rgba(99,102,241,0.2)] transition-all duration-300 cursor-pointer aspect-[3/4.5] flex flex-col",
                isSelected && controlMode && "border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)] ring-1 ring-indigo-500"
            )}
            onClick={() => router.push(`/app/teachers/${teacher.id}`)}
        >
            {/* Action / Selection Overlay */}
            {controlMode && (
                <div className="absolute top-2 left-2 z-30">
                    <div
                        className={cn(
                            "h-5 w-5 rounded border border-zinc-700 flex items-center justify-center cursor-pointer transition-all",
                            isSelected ? "bg-indigo-600 border-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]" : "bg-zinc-950/80 backdrop-blur-sm hover:border-zinc-500"
                        )}
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleSelect?.();
                        }}
                    >
                        {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                    </div>
                </div>
            )}

            {/* Premium Header Gradient */}
            <div className="h-14 bg-gradient-to-br from-indigo-500/30 via-emerald-500/10 to-transparent relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(99,102,241,0.2),transparent)]" />

                {/* Dropdown in Header */}
                <div className="absolute top-1 right-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-7 w-7 p-0 text-zinc-400 hover:text-white bg-zinc-950/50 backdrop-blur-md rounded-full border border-white/10" onClick={(e) => e.stopPropagation()}>
                                <MoreHorizontal className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200">
                            <DropdownMenuLabel className="text-[10px] uppercase font-black text-zinc-500">Действия</DropdownMenuLabel>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/app/teachers/${teacher.id}`); }} className="cursor-pointer hover:bg-zinc-800 text-xs">
                                <Eye className="mr-2 h-3.5 w-3.5" /> Профиль
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditPermissions(teacher); }} className="cursor-pointer hover:bg-zinc-800 text-xs">
                                <Lock className="mr-2 h-3.5 w-3.5" /> Права доступа
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-zinc-800" />
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleAction('archive', teacher.id); }} className="text-zinc-500 cursor-pointer hover:bg-zinc-800 text-xs">
                                <Archive className="mr-2 h-3.5 w-3.5" /> В архив
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Role Badge Top Left (if not select mode) */}
                {!controlMode && (
                    <div className="absolute top-2 left-2 z-20">
                        <div className={`h-1.5 w-1.5 rounded-full shadow-[0_0_5px_currentColor] 
                            ${teacher.status === 'ACTIVE' ? 'bg-emerald-500 text-emerald-500' :
                                teacher.status === 'SUSPENDED' ? 'bg-rose-500 text-rose-500' :
                                    'bg-amber-500 text-amber-500'}`}
                        />
                    </div>
                )}
            </div>

            {/* Avatar & Name Section */}
            <div className="-mt-9 px-1 flex flex-col items-center z-10">
                <Avatar className="h-14 w-14 border-[3px] border-zinc-900 ring-1 ring-white/10 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.firstName}${teacher.lastName}`} />
                    <AvatarFallback className="bg-zinc-950 text-indigo-400 font-black text-[10px]">
                        {teacher.firstName[0]}{teacher.lastName[0]}
                    </AvatarFallback>
                </Avatar>

                <div className="mt-1.5 text-center w-full px-1 overflow-hidden">
                    <h3 className="text-[11px] font-black text-white truncate leading-tight tracking-tight drop-shadow-md" title={`${teacher.firstName} ${teacher.lastName}`}>
                        {teacher.firstName}
                    </h3>
                    <p className="text-[9px] font-bold text-zinc-500 truncate leading-tight uppercase tracking-tighter opacity-80 mb-1">
                        {teacher.lastName}
                    </p>
                    <div className="flex items-center justify-center gap-1 opacity-60">
                        <Briefcase className="h-2 w-2 text-zinc-500" />
                        <span className="text-[8px] font-bold text-zinc-500 truncate max-w-[80%] uppercase">
                            {teacher.specialization || "Учитель"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Bottom Information (Glassmorphism Section) */}
            <div className="mt-auto bg-zinc-950/80 backdrop-blur-md border-t border-zinc-800/50 p-1.5 group-hover:bg-zinc-950 transition-colors">
                <div className="flex justify-between items-center gap-1 mb-1 opacity-90">
                    <div className="flex items-center gap-0.5 bg-indigo-500/10 px-1 py-0 rounded border border-indigo-500/20">
                        <Users className="h-2 w-2 text-indigo-400" />
                        <span className="text-[7px] font-black text-indigo-300 uppercase">
                            {groupsCount} ГР.
                        </span>
                    </div>
                    <div className="scale-75 origin-right translate-x-1">
                        <TeacherStatusBadge status={teacher.status} />
                    </div>
                </div>

                <div className="flex items-center justify-between mt-1">
                    <div className="scale-75 origin-left">
                        <TeacherRoleBadge role={teacher.role} />
                    </div>
                    <div className="flex gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        {teacher.permissions.canGradeStudents && <GraduationCap className="h-2.5 w-2.5 text-zinc-400" />}
                        {teacher.permissions.canMarkAttendance && <Users className="h-2.5 w-2.5 text-zinc-400" />}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
