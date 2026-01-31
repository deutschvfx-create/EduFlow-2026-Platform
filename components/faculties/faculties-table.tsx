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
import { MoreHorizontal, Archive, Eye, Trash2, Edit, ShieldAlert, Shield } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Faculty } from "@/lib/types/faculty";
import { FacultyStatusBadge } from "./status-badge";
import { useRouter } from "next/navigation";

interface FacultiesTableProps {
    faculties: Faculty[];
    onEdit: (faculty: Faculty) => void;
}

export function FacultiesTable({ faculties, onEdit }: FacultiesTableProps) {
    const router = useRouter();

    const handleAction = (action: string, id: string) => {
        if (action === 'archive') {
            if (!confirm("Вы уверены, что хотите архивировать этот факультет?")) return;
        }
        alert(`Action ${action} triggered for faculty ${id}`);
    };

    if (faculties.length === 0) {
        return (
            <div className="text-center py-20 bg-zinc-900/50 rounded-lg border border-zinc-800 border-dashed">
                <p className="text-zinc-500 mb-2">Факультеты не найдены</p>
                <p className="text-sm text-zinc-600">Попробуйте изменить фильтры или добавьте новый факультет</p>
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
                        <TableHead>Название</TableHead>
                        <TableHead>Код</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead className="text-center">Кафедры</TableHead>
                        <TableHead className="text-center">Группы</TableHead>
                        <TableHead className="text-center">Студенты</TableHead>
                        <TableHead className="text-center">Препод.</TableHead>
                        <TableHead>Руководитель</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {faculties.map((faculty) => (
                        <TableRow
                            key={faculty.id}
                            className="hover:bg-zinc-900/50 border-zinc-800 cursor-pointer group"
                            onClick={() => router.push(`/app/faculties/${faculty.id}`)}
                        >
                            <TableCell onClick={(e) => e.stopPropagation()}>
                                <Checkbox className="border-zinc-700 data-[state=checked]:bg-indigo-600" />
                            </TableCell>
                            <TableCell className="font-medium text-zinc-200">
                                {faculty.name}
                            </TableCell>
                            <TableCell className="text-zinc-400 font-mono text-xs">
                                {faculty.code}
                            </TableCell>
                            <TableCell>
                                <FacultyStatusBadge status={faculty.status} />
                            </TableCell>
                            <TableCell className="text-center text-zinc-300">
                                {faculty.departmentsCount}
                            </TableCell>
                            <TableCell className="text-center text-zinc-300">
                                {faculty.groupsCount}
                            </TableCell>
                            <TableCell className="text-center text-zinc-300">
                                {faculty.studentsCount}
                            </TableCell>
                            <TableCell className="text-center text-zinc-300">
                                {faculty.teachersCount}
                            </TableCell>
                            <TableCell className="text-zinc-400">
                                {faculty.headTeacherId || <span className="text-zinc-600 italic">Не назначен</span>}
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
                                        <DropdownMenuItem onClick={() => router.push(`/app/faculties/${faculty.id}`)} className="cursor-pointer hover:bg-zinc-800">
                                            <Eye className="mr-2 h-4 w-4" /> Открыть
                                        </DropdownMenuItem>

                                        {faculty.status !== 'ARCHIVED' && (
                                            <DropdownMenuItem onClick={() => onEdit(faculty)} className="cursor-pointer hover:bg-zinc-800">
                                                <Edit className="mr-2 h-4 w-4" /> Редактировать
                                            </DropdownMenuItem>
                                        )}

                                        <DropdownMenuSeparator className="bg-zinc-800" />

                                        {faculty.status === 'INACTIVE' && (
                                            <DropdownMenuItem onClick={() => handleAction('activate', faculty.id)} className="text-green-400 cursor-pointer hover:bg-zinc-800 hover:text-green-300">
                                                <Shield className="mr-2 h-4 w-4" /> Активировать
                                            </DropdownMenuItem>
                                        )}

                                        {faculty.status === 'ACTIVE' && (
                                            <DropdownMenuItem onClick={() => handleAction('deactivate', faculty.id)} className="text-amber-400 cursor-pointer hover:bg-zinc-800 hover:text-amber-300">
                                                <ShieldAlert className="mr-2 h-4 w-4" /> Сделать неактивным
                                            </DropdownMenuItem>
                                        )}

                                        <DropdownMenuItem onClick={() => handleAction('archive', faculty.id)} className="text-zinc-500 cursor-pointer hover:bg-zinc-800">
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
