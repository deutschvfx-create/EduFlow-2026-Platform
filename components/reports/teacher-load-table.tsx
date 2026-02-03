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
        return <div className="text-zinc-600 text-center py-8 text-xs font-bold uppercase tracking-widest">No matching capacity data</div>
    }

    return (
        <div className="bg-zinc-950/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl mt-6">
            <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Teacher Resource Load</span>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                </div>
            </div>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-[9px] uppercase font-black tracking-widest text-zinc-500 h-8">Instructor</TableHead>
                            <TableHead className="text-[9px] uppercase font-black tracking-widest text-zinc-500 text-center h-8">Groups</TableHead>
                            <TableHead className="text-[9px] uppercase font-black tracking-widest text-zinc-500 text-center h-8">Courses</TableHead>
                            <TableHead className="text-[9px] uppercase font-black tracking-widest text-indigo-500 text-right h-8 pr-6">Weekly Hours</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row) => (
                            <TableRow key={row.teacher.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                                <TableCell className="py-2 text-[11px] font-bold text-zinc-300 group-hover:text-white transition-colors">
                                    <div className="flex flex-col">
                                        <span>{row.teacher.lastName} {row.teacher.firstName}</span>
                                        <span className="text-[8px] text-zinc-600 uppercase font-black">Staff ID: {row.teacher.id.slice(0, 8)}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-2 text-center text-zinc-500 text-[10px] font-black">{row.groupsCount}</TableCell>
                                <TableCell className="py-2 text-center text-zinc-500 text-[10px] font-black">{row.coursesCount}</TableCell>
                                <TableCell className="py-2 text-right pr-6">
                                    <span className="text-[11px] font-black text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10">
                                        {row.hoursPerWeek} HR
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
