'use client';

import { useState } from "react";
import { MOCK_DEPARTMENTS } from "@/lib/mock/departments";
import { DepartmentFilters } from "@/components/departments/department-filters";
import { DepartmentsTable } from "@/components/departments/departments-table";
import { AddDepartmentModal } from "@/components/departments/add-department-modal";
import { EditDepartmentModal } from "@/components/departments/edit-department-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Landmark, CheckCircle2, XCircle, Archive } from "lucide-react";
import { Department } from "@/lib/types/department";
import { ModuleGuard } from "@/components/system/module-guard";

export default function DepartmentsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [facultyFilter, setFacultyFilter] = useState("all");

    // Edit Modal State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

    // Filter Logic
    const filteredDepartments = MOCK_DEPARTMENTS.filter(d => {
        const matchesSearch =
            d.name.toLowerCase().includes(search.toLowerCase()) ||
            d.code.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
        const matchesFaculty = facultyFilter === 'all' || d.facultyId === facultyFilter;

        return matchesSearch && matchesStatus && matchesFaculty;
    });

    // Stats
    const total = MOCK_DEPARTMENTS.length;
    const active = MOCK_DEPARTMENTS.filter(s => s.status === 'ACTIVE').length;
    const inactive = MOCK_DEPARTMENTS.filter(s => s.status === 'INACTIVE').length;
    const archived = MOCK_DEPARTMENTS.filter(s => s.status === 'ARCHIVED').length;

    const handleEdit = (department: Department) => {
        setSelectedDepartment(department);
        setEditModalOpen(true);
    };

    const handleSaveUpdate = (id: string, updates: Partial<Department>) => {
        // Mock save logic
        alert(`Кафедра ${updates.code || id} обновлена`);
    };

    return (
        <ModuleGuard module="departments">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="hidden laptop:block">
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Кафедры</h1>
                        <p className="text-zinc-400">Управление кафедрами и структурой факультетов</p>
                    </div>
                    <div className="flex gap-2">
                        <AddDepartmentModal />
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 laptop:grid-cols-4">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-400">Всего кафедр</CardTitle>
                            <Landmark className="h-4 w-4 text-zinc-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{total}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-400">Активные</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{active}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-amber-400">Неактивные</CardTitle>
                            <XCircle className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{inactive}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-500">Архив</CardTitle>
                            <Archive className="h-4 w-4 text-zinc-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-zinc-500">{archived}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="bg-zinc-950/50 p-1">
                    <DepartmentFilters
                        search={search}
                        onSearchChange={setSearch}
                        statusFilter={statusFilter}
                        onStatusChange={setStatusFilter}
                        facultyFilter={facultyFilter}
                        onFacultyChange={setFacultyFilter}
                    />

                    <DepartmentsTable
                        departments={filteredDepartments}
                        onEdit={handleEdit}
                    />
                </div>

                <EditDepartmentModal
                    department={selectedDepartment}
                    open={editModalOpen}
                    onOpenChange={setEditModalOpen}
                    onSave={handleSaveUpdate}
                />
            </div>
        </ModuleGuard>
    );
}
