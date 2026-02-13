"use client";

import { Student } from "@/lib/types/student";
import { Users, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentStatsDashboardProps {
    students: Student[];
}

export function StudentStatsDashboard({ students }: StudentStatsDashboardProps) {
    const total = students.length;
    const active = students.filter(s => s.status === 'ACTIVE').length;
    const pending = students.filter(s => s.status === 'PENDING').length;

    const stats = [
        { label: "Всего", value: total, icon: Users, color: "text-[#0F172A]", bg: "bg-white", border: "border-[#E5E7EB]" },
        { label: "Активны", value: active, icon: CheckCircle2, color: "text-[#22C55E]", bg: "bg-[#22C55E]/5", border: "border-[#22C55E]/10" },
        { label: "Ожидают", value: pending, icon: AlertCircle, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/5", border: "border-[#F59E0B]/10" }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat) => (
                <div key={stat.label} className={cn("p-4 rounded-[10px] border flex items-center justify-between shadow-sm", stat.bg, stat.border)}>
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-[#64748B] mb-1 font-inter">{stat.label}</p>
                        <p className={cn("text-2xl font-black font-inter", stat.color)}>{stat.value}</p>
                    </div>
                    <stat.icon className={cn("h-5 w-5 opacity-40", stat.color)} />
                </div>
            ))}
        </div>
    );
}
