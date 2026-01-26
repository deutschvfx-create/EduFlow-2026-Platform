'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Student } from "@/lib/types/student";

interface AttendanceReportRow {
    student: Student;
    presentPercentage: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
}

interface AttendanceReportTableProps {
    data: AttendanceReportRow[];
}

export function AttendanceReportTable({ data }: AttendanceReportTableProps) {
    if (data.length === 0) {
        return <div className="text-zinc-500 text-center py-8">Нет данных для отображения</div>
    }

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-3 border-b border-zinc-800 bg-zinc-900/50 font-medium text-zinc-300">
                Посещаемость по студентам
            </div>
            <Table>
                <TableHeader className="bg-zinc-950/50">
                    <TableRow className="border-zinc-800 text-xs uppercase">
                        <TableHead>Студент</TableHead>
                        <TableHead className="text-center">Присутствие %</TableHead>
                        <TableHead className="text-center text-red-400">Пропуски</TableHead>
                        <TableHead className="text-center text-amber-400">Опоздания</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((row) => (
                        <TableRow key={row.student.id} className="border-zinc-800 hover:bg-zinc-800/50">
                            <TableCell className="font-medium text-zinc-200">
                                {row.student.lastName} {row.student.firstName}
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge variant={row.presentPercentage > 80 ? "outline" : "destructive"} className={row.presentPercentage > 80 ? "text-green-500 border-green-500/20" : "text-red-500 border-red-500/20"}>
                                    {row.presentPercentage}%
                                </Badge>
                            </TableCell>
                            <TableCell className="text-center text-zinc-300">{row.absentCount}</TableCell>
                            <TableCell className="text-center text-zinc-300">{row.lateCount}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
