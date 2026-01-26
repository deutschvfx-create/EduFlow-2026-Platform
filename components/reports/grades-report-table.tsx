'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Student } from "@/lib/types/student";

interface GradesReportRow {
    student: Student;
    averageScore: number;
    lastGradeDate: string | null;
    gradesCount: number;
}

interface GradesReportTableProps {
    data: GradesReportRow[];
}

export function GradesReportTable({ data }: GradesReportTableProps) {
    if (data.length === 0) {
        return <div className="text-zinc-500 text-center py-8">Нет данных для отображения</div>
    }

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-3 border-b border-zinc-800 bg-zinc-900/50 font-medium text-zinc-300">
                Успеваемость по студентам
            </div>
            <Table>
                <TableHeader className="bg-zinc-950/50">
                    <TableRow className="border-zinc-800 text-xs uppercase">
                        <TableHead>Студент</TableHead>
                        <TableHead className="text-center">Средний балл</TableHead>
                        <TableHead className="text-center">Кол-во оценок</TableHead>
                        <TableHead className="text-right">Последняя оценка</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((row) => (
                        <TableRow key={row.student.id} className="border-zinc-800 hover:bg-zinc-800/50">
                            <TableCell className="font-medium text-zinc-200">
                                {row.student.lastName} {row.student.firstName}
                            </TableCell>
                            <TableCell className="text-center">
                                <span className={`font-bold ${row.averageScore >= 80 ? 'text-green-400' : row.averageScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                                    {row.averageScore}
                                </span>
                            </TableCell>
                            <TableCell className="text-center text-zinc-400">{row.gradesCount}</TableCell>
                            <TableCell className="text-right text-zinc-400 text-xs">
                                {row.lastGradeDate ? new Date(row.lastGradeDate).toLocaleDateString('ru-RU') : '-'}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
