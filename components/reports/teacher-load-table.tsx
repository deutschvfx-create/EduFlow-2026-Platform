'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Teacher } from "@/lib/types/teacher";

interface TeacherLoadRow {
    teacher: Teacher;
    groupsCount: number;
    coursesCount: number;
    hoursPerWeek: number; // Simulated
}

interface TeacherLoadTableProps {
    data: TeacherLoadRow[];
}

export function TeacherLoadTable({ data }: TeacherLoadTableProps) {
    if (data.length === 0) {
        return <div className="text-zinc-500 text-center py-8">Нет данных для отображения</div>
    }

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-3 border-b border-zinc-800 bg-zinc-900/50 font-medium text-zinc-300">
                Нагрузка преподавателей
            </div>
            <Table>
                <TableHeader className="bg-zinc-950/50">
                    <TableRow className="border-zinc-800 text-xs uppercase">
                        <TableHead>Преподаватель</TableHead>
                        <TableHead className="text-center">Группы</TableHead>
                        <TableHead className="text-center">Предметы</TableHead>
                        <TableHead className="text-center">Часы (нед)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((row) => (
                        <TableRow key={row.teacher.id} className="border-zinc-800 hover:bg-zinc-800/50">
                            <TableCell className="font-medium text-zinc-200">
                                {row.teacher.lastName} {row.teacher.firstName}
                            </TableCell>
                            <TableCell className="text-center text-zinc-300">{row.groupsCount}</TableCell>
                            <TableCell className="text-center text-zinc-300">{row.coursesCount}</TableCell>
                            <TableCell className="text-center">
                                <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20">
                                    {row.hoursPerWeek} ч
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
