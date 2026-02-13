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
            <div className="text-center py-20 bg-card/50 rounded-lg border border-border border-dashed">
                <p className="text-muted-foreground mb-2">Преподаватели не найдены</p>
                <p className="text-sm text-muted-foreground">Попробуйте изменить фильтры или добавьте нового преподавателя</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border border-border overflow-hidden">
            <Table>
                <TableHeader className="bg-card">
                    <TableRow className="hover:bg-card border-border">
                        <TableHead className="w-[50px]">
                            <Checkbox className="border-border data-[state=checked]:bg-primary" />
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
                            className="hover:bg-card/50 border-border cursor-pointer group"
                            onClick={() => router.push(`/app/teachers/${teacher.id}`)}
                        >
                            <TableCell onClick={(e) => e.stopPropagation()}>
                                <Checkbox className="border-border data-[state=checked]:bg-primary" />
                            </TableCell>
                            <TableCell className="font-medium text-foreground">
                                {teacher.firstName} {teacher.lastName}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
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
                                        <span className="text-foreground text-xs">
                                            {teacher.groupIds.length} {teacher.groupIds.length === 1 ? 'группа' : 'групп'}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground text-xs italic">Нет групп</span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-1">
                                    {teacher.permissions.canGradeStudents && <Badge variant="outline" className="text-[9px] px-1 h-4 border-border text-muted-foreground" title="Оценки">G</Badge>}
                                    {teacher.permissions.canMarkAttendance && <Badge variant="outline" className="text-[9px] px-1 h-4 border-border text-muted-foreground" title="Посещаемость">A</Badge>}
                                    {teacher.permissions.canUseChat && <Badge variant="outline" className="text-[9px] px-1 h-4 border-border text-muted-foreground" title="Чат">C</Badge>}
                                </div>
                            </TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground group-hover:text-foreground">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-card border-border text-foreground">
                                        <DropdownMenuLabel>Действия</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => router.push(`/app/teachers/${teacher.id}`)} className="cursor-pointer hover:bg-secondary">
                                            <Eye className="mr-2 h-4 w-4" /> Профиль
                                        </DropdownMenuItem>

                                        <DropdownMenuItem onClick={() => onEditPermissions(teacher)} className="cursor-pointer hover:bg-secondary">
                                            <Lock className="mr-2 h-4 w-4" /> Права доступа
                                        </DropdownMenuItem>

                                        <DropdownMenuSeparator className="bg-secondary" />

                                        {teacher.status === 'INVITED' && (
                                            <DropdownMenuItem onClick={() => onAction('activate', teacher.id)} className="text-green-400 cursor-pointer hover:bg-secondary hover:text-green-300">
                                                <Shield className="mr-2 h-4 w-4" /> Активировать
                                            </DropdownMenuItem>
                                        )}

                                        {teacher.status === 'ACTIVE' && (
                                            <DropdownMenuItem onClick={() => onAction('suspend', teacher.id)} className="text-amber-400 cursor-pointer hover:bg-secondary hover:text-amber-300">
                                                <ShieldAlert className="mr-2 h-4 w-4" /> Заблокировать
                                            </DropdownMenuItem>
                                        )}

                                        <DropdownMenuItem onClick={() => onAction('archive', teacher.id)} className="text-muted-foreground cursor-pointer hover:bg-secondary">
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
