'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Student } from "@/lib/types/student";
import { cn } from "@/lib/utils";

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
        return <div className="text-zinc-600 text-center py-8 text-xs font-bold uppercase tracking-widest">No matching telemetry data</div>
    }

    return (
        <div className="bg-zinc-950/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl">
            <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Attendance Telemetry</span>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" />
                </div>
            </div>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-[9px] uppercase font-black tracking-widest text-zinc-500 h-8">Student</TableHead>
                            <TableHead className="text-[9px] uppercase font-black tracking-widest text-zinc-500 text-center h-8">Presence</TableHead>
                            <TableHead className="text-[9px] uppercase font-black tracking-widest text-red-500/80 text-center h-8">Abs</TableHead>
                            <TableHead className="text-[9px] uppercase font-black tracking-widest text-amber-500/80 text-center h-8">Late</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row) => (
                            <TableRow key={row.student.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                                <TableCell className="py-2 text-[11px] font-bold text-zinc-300 group-hover:text-white transition-colors">
                                    <div className="flex flex-col">
                                        <span>{row.student.lastName} {row.student.firstName}</span>
                                        <span className="text-[8px] text-zinc-600 uppercase font-black">ID: {row.student.id.slice(0, 8)}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-2 text-center">
                                    <div className="inline-flex items-center gap-2">
                                        <div className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden hidden md:block">
                                            <div
                                                className={cn("h-full transition-all duration-1000", row.presentPercentage > 80 ? "bg-emerald-500" : "bg-red-500")}
                                                style={{ width: `${row.presentPercentage}%` }}
                                            />
                                        </div>
                                        <span className={cn("text-[10px] font-black", row.presentPercentage > 80 ? "text-emerald-400" : "text-red-400")}>
                                            {row.presentPercentage}%
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-2 text-center text-zinc-400 text-[10px] font-bold">{row.absentCount}</TableCell>
                                <TableCell className="py-2 text-center text-zinc-400 text-[10px] font-bold">{row.lateCount}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
