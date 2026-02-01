'use client';

import { Teacher } from "@/lib/types/teacher";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Shield, ShieldAlert, Archive, Eye, Lock, GraduationCap, Users, Check } from "lucide-react";
import { TeacherStatusBadge, TeacherRoleBadge } from "./status-badge";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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

    const initials = `${teacher.firstName[0]}${teacher.lastName[0]}`;

    return (
        <Card className={cn("bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors relative overflow-hidden", isSelected && controlMode && "border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.1)]")}>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex items-center gap-3">
                    {controlMode && (
                        <div
                            className={cn(
                                "h-5 w-5 rounded border border-zinc-700 flex items-center justify-center cursor-pointer transition-all",
                                isSelected ? "bg-indigo-600 border-indigo-600" : "bg-zinc-950 hover:border-zinc-500"
                            )}
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleSelect?.();
                            }}
                        >
                            {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                        </div>
                    )}
                    <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20">
                        {initials}
                    </div>
                    <div>
                        <h3 className="font-semibold text-zinc-100 text-sm leading-none">{teacher.firstName} {teacher.lastName}</h3>
                        <p className="text-xs text-zinc-500 mt-1">{teacher.specialization || "Нет специализации"}</p>
                    </div>
                </div>
                <TeacherStatusBadge status={teacher.status} />
            </CardHeader>
            <CardContent className="space-y-4 pb-2">
                <div className="flex items-center justify-between">
                    <TeacherRoleBadge role={teacher.role} />
                </div>

                <div className="space-y-2">
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Группы</p>
                    <div className="flex flex-wrap gap-1.5 h-6 overflow-hidden">
                        {(teacher.groupIds?.length || 0) > 0 ? (
                            <span className="text-zinc-300 text-xs">
                                {teacher.groupIds.length} {teacher.groupIds.length === 1 ? 'группа' : 'групп'}
                            </span>
                        ) : (
                            <span className="text-zinc-600 text-xs italic">Нет привязанных групп</span>
                        )}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="pt-2 flex items-center justify-between border-t border-zinc-800/50 mt-2">
                <div className="flex gap-1">
                    {teacher.permissions.canGradeStudents && <div className="p-1.5 rounded-md bg-zinc-800/50 text-zinc-400" title="Оценки"><GraduationCap className="h-3 w-3" /></div>}
                    {teacher.permissions.canMarkAttendance && <div className="p-1.5 rounded-md bg-zinc-800/50 text-zinc-400" title="Посещаемость"><Users className="h-3 w-3" /></div>}
                    {teacher.permissions.canUseChat && <div className="p-1.5 rounded-md bg-zinc-800/50 text-zinc-400" title="Чат"><Badge variant="outline" className="h-3 w-3 p-0 flex items-center justify-center border-none bg-transparent">C</Badge></div>}
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-white">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200">
                        <DropdownMenuLabel>Действия</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/app/teachers/${teacher.id}`)} className="cursor-pointer hover:bg-zinc-800">
                            <Eye className="mr-2 h-4 w-4" /> Профиль
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditPermissions(teacher)} className="cursor-pointer hover:bg-zinc-800">
                            <Lock className="mr-2 h-4 w-4" /> Права доступа
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        {teacher.status === 'INVITED' && (
                            <DropdownMenuItem onClick={() => handleAction('activate', teacher.id)} className="text-green-400 cursor-pointer hover:bg-zinc-800 hover:text-green-300">
                                <Shield className="mr-2 h-4 w-4" /> Активировать
                            </DropdownMenuItem>
                        )}
                        {teacher.status === 'ACTIVE' && (
                            <DropdownMenuItem onClick={() => handleAction('suspend', teacher.id)} className="text-amber-400 cursor-pointer hover:bg-zinc-800 hover:text-amber-300">
                                <ShieldAlert className="mr-2 h-4 w-4" /> Заблокировать
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleAction('archive', teacher.id)} className="text-zinc-500 cursor-pointer hover:bg-zinc-800">
                            <Archive className="mr-2 h-4 w-4" /> В архив
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardFooter>
        </Card>
    );
}
