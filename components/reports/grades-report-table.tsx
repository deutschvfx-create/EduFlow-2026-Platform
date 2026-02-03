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
        return <div className="text-zinc-600 text-center py-8 text-xs font-bold uppercase tracking-widest">No matching performance data</div>
    }

    return (
        <div className="bg-zinc-950/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl">
            <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Performance Metrics</span>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500/50" />
                </div>
            </div>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-[9px] uppercase font-black tracking-widest text-zinc-500 h-8">Student</TableHead>
                            <TableHead className="text-[9px] uppercase font-black tracking-widest text-zinc-500 text-center h-8">Avg Score</TableHead>
                            <TableHead className="text-[9px] uppercase font-black tracking-widest text-zinc-500 text-center h-8">Logs</TableHead>
                            <TableHead className="text-[9px] uppercase font-black tracking-widest text-zinc-500 text-right h-8 pr-4">Last Event</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row) => (
                            <TableRow key={row.student.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                                <TableCell className="py-2 text-[11px] font-bold text-zinc-300 group-hover:text-white transition-colors">
                                    <div className="flex flex-col">
                                        <span>{row.student.lastName} {row.student.firstName}</span>
                                        <span className="text-[8px] text-zinc-600 uppercase font-black">Record #{row.student.id.slice(0, 6)}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-2 text-center">
                                    <span className={`text-[11px] font-black px-2 py-0.5 rounded-md ${row.averageScore >= 80 ? 'text-emerald-400 bg-emerald-500/10' :
                                            row.averageScore >= 60 ? 'text-amber-400 bg-amber-500/10' :
                                                'text-red-400 bg-red-500/10'
                                        }`}>
                                        {row.averageScore}
                                    </span>
                                </TableCell>
                                <TableCell className="py-2 text-center text-zinc-500 text-[10px] font-black">{row.gradesCount}</TableCell>
                                <TableCell className="py-2 text-right text-zinc-600 text-[9px] font-black uppercase pr-4">
                                    {row.lastGradeDate ? new Date(row.lastGradeDate).toLocaleDateString('ru-RU') : 'N/A'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
