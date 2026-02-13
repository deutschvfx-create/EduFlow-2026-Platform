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
        return <div className="text-muted-foreground text-center py-8 text-xs font-bold uppercase tracking-widest">No matching performance data</div>
    }

    return (
        <div className="space-y-4">
            {/* Desktop Table View (≥1025px) */}
            <div className="hidden laptop:block bg-background/40 border border-border rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl">
                <div className="px-4 py-3 border-b border-border bg-white/[0.02] flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Performance Metrics</span>
                    <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500/50" />
                    </div>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="text-[9px] uppercase font-black tracking-widest text-muted-foreground h-10">Student</TableHead>
                            <TableHead className="text-[9px] uppercase font-black tracking-widest text-muted-foreground text-center h-10">Avg Score</TableHead>
                            <TableHead className="text-[9px] uppercase font-black tracking-widest text-muted-foreground text-center h-10">Logs</TableHead>
                            <TableHead className="text-[9px] uppercase font-black tracking-widest text-muted-foreground text-right h-10 pr-4">Last Event</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row) => (
                            <TableRow key={row.student.id} className="border-border hover:bg-white/[0.02] transition-colors group">
                                <TableCell className="py-3 text-[11px] font-bold text-foreground group-hover:text-foreground transition-colors">
                                    <div className="flex flex-col">
                                        <span>{row.student.lastName} {row.student.firstName}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase font-black">Record #{row.student.id.slice(0, 6)}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-3 text-center">
                                    <span className={`text-[11px] font-black px-2 py-1 rounded-md ${row.averageScore >= 80 ? 'text-emerald-400 bg-emerald-500/10' :
                                        row.averageScore >= 60 ? 'text-amber-400 bg-amber-500/10' :
                                            'text-red-400 bg-red-500/10'
                                        }`}>
                                        {row.averageScore}
                                    </span>
                                </TableCell>
                                <TableCell className="py-3 text-center text-muted-foreground text-[10px] font-black">{row.gradesCount}</TableCell>
                                <TableCell className="py-3 text-right text-muted-foreground text-[9px] font-black uppercase pr-4">
                                    {row.lastGradeDate ? new Date(row.lastGradeDate).toLocaleDateString('ru-RU') : 'N/A'}
                                </TableCell>
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
                        className="bg-card/50 border border-border rounded-2xl p-5 backdrop-blur-xl active:scale-[0.98] transition-all"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-foreground">{row.student.lastName} {row.student.firstName}</span>
                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">#{row.student.id.slice(0, 8)}</span>
                            </div>
                            <Badge variant="outline" className={`text-[11px] font-black px-3 py-1 border-none ${row.averageScore >= 80 ? 'bg-emerald-500/10 text-emerald-400' :
                                    row.averageScore >= 60 ? 'bg-amber-500/10 text-amber-400' :
                                        'bg-red-500/10 text-red-400'
                                }`}>
                                {row.averageScore}%
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-background/50 p-3 rounded-xl border border-border text-center">
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter mb-1">Total Logs</p>
                                <p className="text-lg font-black text-foreground">{row.gradesCount}</p>
                            </div>
                            <div className="bg-background/50 p-3 rounded-xl border border-border text-center">
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter mb-1">Last Update</p>
                                <p className="text-[11px] font-black text-foreground">
                                    {row.lastGradeDate ? new Date(row.lastGradeDate).toLocaleDateString('ru-RU') : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
