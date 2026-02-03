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
        <div className="space-y-4">
            {/* Desktop Table View (≥1025px) */}
            <div className="hidden laptop:block bg-zinc-950/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl">
                <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Attendance Telemetry</span>
                    <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" />
                    </div>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-[9px] uppercase font-black tracking-widest text-zinc-500 h-10">Student</TableHead>
                            <TableHead className="text-[9px] uppercase font-black tracking-widest text-zinc-500 text-center h-10">Presence</TableHead>
                            <TableHead className="text-[9px] uppercase font-black tracking-widest text-red-500/80 text-center h-10">Abs</TableHead>
                            <TableHead className="text-[9px] uppercase font-black tracking-widest text-amber-500/80 text-center h-10">Late</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row) => (
                            <TableRow key={row.student.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                                <TableCell className="py-3 text-[11px] font-bold text-zinc-300 group-hover:text-white transition-colors">
                                    <div className="flex flex-col">
                                        <span>{row.student.lastName} {row.student.firstName}</span>
                                        <span className="text-[8px] text-zinc-600 uppercase font-black">ID: {row.student.id.slice(0, 8)}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-3 text-center">
                                    <div className="inline-flex items-center gap-2">
                                        <div className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden">
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
                                <TableCell className="py-3 text-center text-zinc-400 text-[10px] font-bold">{row.absentCount}</TableCell>
                                <TableCell className="py-3 text-center text-zinc-400 text-[10px] font-bold">{row.lateCount}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Tablet & Mobile Card View (<1025px) */}
            <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4 laptop:hidden">
                {data.map((row) => (
                    <div
                        key={row.student.id}
                        className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 backdrop-blur-xl active:scale-[0.98] transition-all"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-white">{row.student.lastName} {row.student.firstName}</span>
                                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">#{row.student.id.slice(0, 8)}</span>
                            </div>
                            <span className={cn("text-[13px] font-black", row.presentPercentage > 80 ? "text-emerald-400" : "text-red-400")}>
                                {row.presentPercentage}%
                            </span>
                        </div>

                        <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden mb-5">
                            <div
                                className={cn("h-full transition-all duration-700", row.presentPercentage > 80 ? "bg-emerald-500" : "bg-red-500")}
                                style={{ width: `${row.presentPercentage}%` }}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-zinc-950/50 p-2 rounded-lg border border-white/5 text-center">
                                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-tighter">Absent</p>
                                <p className="text-sm font-black text-red-400">{row.absentCount}</p>
                            </div>
                            <div className="bg-zinc-950/50 p-2 rounded-lg border border-white/5 text-center">
                                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-tighter">Late</p>
                                <p className="text-sm font-black text-amber-400">{row.lateCount}</p>
                            </div>
                            <div className="bg-zinc-950/50 p-2 rounded-lg border border-white/5 text-center">
                                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-tighter">Excused</p>
                                <p className="text-sm font-black text-indigo-400">{row.excusedCount}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
