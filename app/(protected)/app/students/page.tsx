'use client';

import { useState, useEffect } from "react";
// import { MOCK_STUDENTS } from "@/lib/mock/students";
import { StudentFilters } from "@/components/students/student-filters";
import { StudentsTable } from "@/components/students/students-table";
import { AddStudentModal } from "@/components/students/add-student-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModuleGuard } from "@/components/system/module-guard";

export default function StudentsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [groupFilter, setGroupFilter] = useState("all");

    // Filter Logic
    const [students, setStudents] = useState<any[]>([]); // Using any for quick transition, or specialized type
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        import("@/lib/data/students.repo").then(async ({ studentsRepo }) => {
            const data = await studentsRepo.getAll();
            setStudents(data);
            setIsLoaded(true);
        });
    }, []);

    // Filter Logic
    const filteredStudents = students.filter(student => {
        const matchesSearch =
            student.firstName.toLowerCase().includes(search.toLowerCase()) ||
            student.lastName.toLowerCase().includes(search.toLowerCase()) ||
            student.email?.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = statusFilter === 'all' || student.status === statusFilter;

        const matchesGroup = groupFilter === 'all' || student.groups.some((g: any) => g.id === groupFilter);

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
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Студенты</h1>
                        <p className="text-zinc-400">Управление студентами организации</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="gap-2 border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800" data-help-id="students-qr-btn">
                            Сканировать QR
                        </Button>
                        <div data-help-id="students-add-btn">
                            <AddStudentModal />
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">Всего студентов</CardTitle>
                            <Users className="h-4 w-4 text-zinc-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{total}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-400">Активные</CardTitle>
                            <UserCheck className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{active}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-amber-400">Ожидают</CardTitle>
                            <Clock className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{pending}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-red-400">Заблокированы</CardTitle>
                            <UserX className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{suspended}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="bg-zinc-950/50 p-1">
                    <StudentFilters
                        search={search}
                        onSearchChange={setSearch}
                        statusFilter={statusFilter}
                        onStatusChange={setStatusFilter}
                        groupFilter={groupFilter}
                        onGroupChange={setGroupFilter}
                    />

                    <StudentsTable students={filteredStudents} />
                </div>
            </div>
        </ModuleGuard>
    );
}
