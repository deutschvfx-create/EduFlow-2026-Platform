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
import { MoreHorizontal, Shield, ShieldAlert, Archive, Trash2, Eye } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Student } from "@/lib/types/student";
import { StudentStatusBadge } from "./status-badge";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface StudentsTableProps {
    students: Student[];
}

export function StudentsTable({ students }: StudentsTableProps) {
    const router = useRouter();

    const handleAction = (action: string, id: string) => {
        // Mock action
        if (action === 'delete') {
            if (!confirm("Вы уверены? Это действие нельзя отменить.")) return;
        }
        alert(`Action ${action} triggered for student ${id}`);
    };

    if (students.length === 0) {
        return (
            <div className="text-center py-20 bg-zinc-900/50 rounded-lg border border-zinc-800 border-dashed">
                <p className="text-zinc-500 mb-2">Студенты не найдены</p>
                <p className="text-sm text-zinc-600">Попробуйте изменить фильтры или добавьте нового ученика</p>
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
                        <TableHead>Дата рождения</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Группы</TableHead>
                        <TableHead>Оплата</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {students.map((student) => (
                        <TableRow
                            key={student.id}
                            className="hover:bg-zinc-900/50 border-zinc-800 cursor-pointer group"
                            onClick={() => router.push(`/app/students/${student.id}`)}
                        >
                            <TableCell onClick={(e) => e.stopPropagation()}>
                                <Checkbox className="border-zinc-700 data-[state=checked]:bg-indigo-600" />
                            </TableCell>
                            <TableCell className="font-medium text-zinc-200">
                                {student.firstName} {student.lastName}
                            </TableCell>
                            <TableCell className="text-zinc-400">
                                {new Date(student.birthDate).toLocaleDateString('ru-RU')}
                            </TableCell>
                            <TableCell>
                                <StudentStatusBadge status={student.status} />
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {(student.groups?.length || 0) > 0 ? (
                                        student.groups.map(g => (
                                            <Badge key={g.id} variant="secondary" className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-[10px] px-1 py-0 h-5">
                                                {g.name}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-zinc-600 text-xs italic">Нет групп</span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                {student.paymentStatus === 'OK' && <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/10">Оплачено</Badge>}
                                {student.paymentStatus === 'DUE' && <Badge variant="outline" className="text-amber-500 border-amber-500/20 bg-amber-500/10">Задолженность</Badge>}
                                {student.paymentStatus === 'UNKNOWN' && <Badge variant="outline" className="text-zinc-500 border-zinc-800">-</Badge>}
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
                                        <DropdownMenuItem onClick={() => router.push(`/app/students/${student.id}`)} className="cursor-pointer hover:bg-zinc-800">
                                            <Eye className="mr-2 h-4 w-4" /> Профиль
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-zinc-800" />

                                        {student.status !== 'ACTIVE' && (
                                            <DropdownMenuItem onClick={() => handleAction('activate', student.id)} className="text-green-400 cursor-pointer hover:bg-zinc-800 hover:text-green-300">
                                                <Shield className="mr-2 h-4 w-4" /> Активировать
                                            </DropdownMenuItem>
                                        )}

                                        {student.status === 'ACTIVE' && (
                                            <DropdownMenuItem onClick={() => handleAction('suspend', student.id)} className="text-amber-400 cursor-pointer hover:bg-zinc-800 hover:text-amber-300">
                                                <ShieldAlert className="mr-2 h-4 w-4" /> Заблокировать
                                            </DropdownMenuItem>
                                        )}

                                        <DropdownMenuItem onClick={() => handleAction('archive', student.id)} className="text-zinc-400 cursor-pointer hover:bg-zinc-800">
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
