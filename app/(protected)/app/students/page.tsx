'use client';

import { useState, useEffect } from "react";
// Removed mock imports
import { StudentFilters } from "@/components/students/student-filters";
import { StudentsTable } from "@/components/students/students-table";
import { AddStudentModal } from "@/components/students/add-student-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, Clock, Search, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModuleGuard } from "@/components/system/module-guard";
import { motion } from "framer-motion";
import { useOrganization } from "@/hooks/use-organization";

export default function StudentsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [groupFilter, setGroupFilter] = useState("all");

    // Filter Logic
    const [students, setStudents] = useState<any[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const { currentOrganizationId } = useOrganization();

    useEffect(() => {
        if (currentOrganizationId) {
            loadStudents(currentOrganizationId);
        }
    }, [currentOrganizationId]);

    const loadStudents = (orgId: string) => {
        import("@/lib/data/students.repo").then(async ({ studentsRepo }) => {
            const data = await studentsRepo.getAll(orgId);
            setStudents(data);
            setIsLoaded(true);
        });
    };

    const handleAction = async (action: string, id: string) => {
        if (!currentOrganizationId) return;
        try {
            const { studentsRepo } = await import("@/lib/data/students.repo");
            if (action === 'activate') await studentsRepo.update(currentOrganizationId, id, { status: 'ACTIVE' } as any);
            if (action === 'suspend') await studentsRepo.update(currentOrganizationId, id, { status: 'SUSPENDED' } as any);
            if (action === 'archive') {
                if (confirm("Вы уверены?")) await studentsRepo.update(currentOrganizationId, id, { status: 'ARCHIVED' } as any);
                else return;
            }
            loadStudents(currentOrganizationId);
        } catch (error) {
            console.error(error);
            alert("Ошибка при выполнении действия");
        }
    };

    // Filter Logic
    const filteredStudents = students.filter(student => {
        const matchesSearch =
            student.firstName.toLowerCase().includes(search.toLowerCase()) ||
            student.lastName.toLowerCase().includes(search.toLowerCase()) ||
            student.email?.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = statusFilter === 'all' || student.status === statusFilter;

        const matchesGroup = groupFilter === 'all' || student.groupIds?.includes(groupFilter);

        return matchesSearch && matchesStatus && matchesGroup;
    });

    // Stats
    const total = students.length;
    const active = students.filter(s => s.status === 'ACTIVE').length;
    const pending = students.filter(s => s.status === 'PENDING').length;
    const suspended = students.filter(s => s.status === 'SUSPENDED').length;

    if (!isLoaded) return <div className="p-8 text-zinc-500">Загрузка данных...</div>;

    return (
        <ModuleGuard module="students">
            <div className="space-y-4 laptop:space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 laptop:gap-4" data-help-id="students-header">
                    <div className="hidden laptop:flex items-center gap-3 laptop:gap-4">
                        <div className="h-10 w-10 laptop:h-12 laptop:w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <Users className="h-5 w-5 laptop:h-6 laptop:w-6 text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl laptop:text-3xl font-black tracking-tighter text-white" accessibilityId="students-title-view">Студенты</h1>
                            <p className="text-[10px] laptop:text-xs font-bold uppercase tracking-widest text-zinc-500 hidden laptop:block">Система контроля контингента</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="hidden laptop:flex gap-2 border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl" data-help-id="students-qr-btn" accessibilityId="qr-scanner-trigger">
                            <Search className="h-4 w-4" /> Сканировать QR
                        </Button>
                        <div data-help-id="students-add-btn" accessibilityId="add-student-trigger" data-action="open-registration-form">
                            <AddStudentModal />
                        </div>
                    </div>
                </div>

                {/* High-Density Stats Cards - 2 columns on mobile */}
                <div className="grid gap-3 laptop:gap-4 grid-cols-2 laptop:grid-cols-4">
                    <KPICard
                        title="Всего студентов"
                        value={total}
                        trend="+2.4%"
                        isUp={true}
                        icon={Users}
                        color="indigo"
                    />
                    <KPICard
                        title="Активные"
                        value={active}
                        trend="+5.1%"
                        isUp={true}
                        icon={UserCheck}
                        color="emerald"
                    />
                    <KPICard
                        title="Ожидают"
                        value={pending}
                        trend="-1.2%"
                        isUp={false}
                        icon={Clock}
                        color="purple"
                    />
                    <KPICard
                        title="Заблокированы"
                        value={suspended}
                        trend="0%"
                        isUp={true}
                        icon={UserX}
                        color="cyan"
                    />
                </div>

                <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl">
                    <div className="p-4 border-b border-zinc-800/50 bg-zinc-950/20">
                        <StudentFilters
                            search={search}
                            onSearchChange={setSearch}
                            statusFilter={statusFilter}
                            onStatusChange={setStatusFilter}
                            groupFilter={groupFilter}
                            onGroupChange={setGroupFilter}
                        />
                    </div>

                    <div className="p-1">
                        <StudentsTable
                            students={filteredStudents}
                            onAction={handleAction}
                        />
                    </div>
                </div>
            </div>
        </ModuleGuard>
    );
}

function KPICard({ title, value, trend, isUp, icon: Icon, color }: any) {
    const colors: any = {
        indigo: 'from-indigo-500/10 to-transparent border-indigo-500/20 text-indigo-400 bg-indigo-500/5',
        purple: 'from-purple-500/10 to-transparent border-purple-500/20 text-purple-400 bg-purple-500/5',
        cyan: 'from-cyan-500/10 to-transparent border-cyan-500/20 text-cyan-400 bg-cyan-500/5',
        emerald: 'from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-400 bg-emerald-500/5'
    };

    return (
        <Card className={`relative overflow-hidden bg-zinc-900/60 border-zinc-800 rounded-2xl group transition-all hover:bg-zinc-900/80 hover:border-zinc-700/50 shadow-2xl ring-1 ring-white/5 h-[130px]`}>
            {/* Dynamic Background Glow */}
            <div className={`absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br ${colors[color]} blur-3xl opacity-10 group-hover:opacity-25 transition-all duration-700`} />

            <div className="relative z-10 p-4 flex flex-col h-full justify-between">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 group-hover:text-zinc-400 transition-colors">
                            {title}
                        </h3>
                        <div className="text-2xl font-black text-white tracking-tighter flex items-baseline gap-1">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </div>
                    </div>
                    <div className={`p-2 rounded-xl border border-white/5 ${colors[color]} shadow-inner`}>
                        <Icon className="h-4 w-4" />
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4 mt-auto">
                    <div className="flex flex-col gap-1">
                        <div className={`flex items-center gap-1 text-[10px] font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {trend}
                            <span className="text-[9px] text-zinc-600 font-medium ml-1">vs MoM</span>
                        </div>
                        <div className="h-1 w-24 bg-zinc-950 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: isUp ? "70%" : "30%" }}
                                className={`h-full ${isUp ? 'bg-emerald-500/40' : 'bg-rose-500/40'}`}
                            />
                        </div>
                    </div>

                    <div className="h-10 w-24 relative opacity-50 group-hover:opacity-100 transition-opacity">
                        <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                            <motion.path
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                d={isUp ? "M0,35 Q20,35 30,20 T60,15 T100,0" : "M0,5 Q20,5 30,20 T60,25 T100,40"}
                                fill="none"
                                stroke={isUp ? "#10b981" : "#f43f5e"}
                                strokeWidth="2"
                                strokeLinecap="round"
                                className="drop-shadow-[0_0_5px_currentColor]"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </Card>
    );
}
