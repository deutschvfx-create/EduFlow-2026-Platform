'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Shield, ShieldAlert, Archive, Eye, Lock } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Teacher } from "@/lib/types/teacher";
import { TeacherStatusBadge, TeacherRoleBadge } from "./status-badge";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface TeachersTableProps {
    teachers: Teacher[];
    onEditPermissions: (teacher: Teacher) => void;
    onAction: (action: string, id: string) => void;
}

export function TeachersTable({ teachers, onEditPermissions, onAction }: TeachersTableProps) {
    const router = useRouter();

    if (teachers.length === 0) {
        return (
            <div className="text-center py-20 bg-zinc-900/50 rounded-lg border border-zinc-800 border-dashed">
                <p className="text-zinc-500 mb-2">Преподаватели не найдены</p>
                <p className="text-sm text-zinc-600">Попробуйте изменить фильтры или добавьте нового преподавателя</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border border-zinc-800 overflow-hidden">
            <Table>
                <TableHeader className="bg-zinc-900">
                    <TableRow className="hover:bg-zinc-900 border-zinc-800">
                        <TableHead className="w-[50px]">
                            <Checkbox className="border-zinc-700 data-[state=checked]:bg-indigo-600" />
                        </TableHead>
                        <TableHead>ФИО</TableHead>
                        <TableHead>Специализация</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Роль</TableHead>
                        <TableHead>Группы</TableHead>
                        <TableHead>Доступы</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {teachers.map((teacher) => (
                        <TableRow
                            key={teacher.id}
                            className="hover:bg-zinc-900/50 border-zinc-800 cursor-pointer group"
                            onClick={() => router.push(`/app/teachers/${teacher.id}`)}
                        >
                            <TableCell onClick={(e) => e.stopPropagation()}>
                                <Checkbox className="border-zinc-700 data-[state=checked]:bg-indigo-600" />
                            </TableCell>
                            <TableCell className="font-medium text-zinc-200">
                                {teacher.firstName} {teacher.lastName}
                            </TableCell>
                            <TableCell className="text-zinc-400">
                                {teacher.specialization || "—"}
                            </TableCell>
                            <TableCell>
                                <TeacherStatusBadge status={teacher.status} />
                            </TableCell>
                            <TableCell>
                                <TeacherRoleBadge role={teacher.role} />
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {(teacher.groupIds?.length || 0) > 0 ? (
                                        <span className="text-zinc-300 text-xs">
                                            {teacher.groupIds.length} {teacher.groupIds.length === 1 ? 'группа' : 'групп'}
                                        </span>
                                    ) : (
                                        <span className="text-zinc-600 text-xs italic">Нет групп</span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-1">
                                    {teacher.permissions.canGradeStudents && <Badge variant="outline" className="text-[9px] px-1 h-4 border-zinc-700 text-zinc-500" title="Оценки">G</Badge>}
                                    {teacher.permissions.canMarkAttendance && <Badge variant="outline" className="text-[9px] px-1 h-4 border-zinc-700 text-zinc-500" title="Посещаемость">A</Badge>}
                                    {teacher.permissions.canUseChat && <Badge variant="outline" className="text-[9px] px-1 h-4 border-zinc-700 text-zinc-500" title="Чат">C</Badge>}
                                </div>
                            </TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-400 group-hover:text-white">
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
                                            <DropdownMenuItem onClick={() => onAction('activate', teacher.id)} className="text-green-400 cursor-pointer hover:bg-zinc-800 hover:text-green-300">
                                                <Shield className="mr-2 h-4 w-4" /> Активировать
                                            </DropdownMenuItem>
                                        )}

                                        {teacher.status === 'ACTIVE' && (
                                            <DropdownMenuItem onClick={() => onAction('suspend', teacher.id)} className="text-amber-400 cursor-pointer hover:bg-zinc-800 hover:text-amber-300">
                                                <ShieldAlert className="mr-2 h-4 w-4" /> Заблокировать
                                            </DropdownMenuItem>
                                        )}

                                        <DropdownMenuItem onClick={() => onAction('archive', teacher.id)} className="text-zinc-500 cursor-pointer hover:bg-zinc-800">
                                            <Archive className="mr-2 h-4 w-4" /> В архив
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
