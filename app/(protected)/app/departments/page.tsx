'use client';

import { useState, useEffect } from "react";
import { useOrganization } from "@/hooks/use-organization";
import { DepartmentFilters } from "@/components/departments/department-filters";
import { DepartmentsTable } from "@/components/departments/departments-table";
import { AddDepartmentModal } from "@/components/departments/add-department-modal";
import { EditDepartmentModal } from "@/components/departments/edit-department-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Landmark, CheckCircle2, XCircle, Archive } from "lucide-react";
import { Department } from "@/lib/types/department";
import { ModuleGuard } from "@/components/system/module-guard";

export default function DepartmentsPage() {
    const { currentOrganizationId } = useOrganization();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);

    const loadDepartments = (orgId: string) => {
        setLoading(true);
        import("@/lib/data/departments.repo").then(({ departmentsRepo }) => {
            departmentsRepo.getAll(orgId).then(data => {
                setDepartments(data);
                setLoading(false);
            }).catch(err => {
                console.error("Departments load error:", err);
                setLoading(false);
                // Simple alert for now as this page uses a table layout
                alert("Ошибка при загрузке кафедр");
            });
        }).catch(err => {
            console.error("Repo import error:", err);
            setLoading(false);
        });
    };

    useEffect(() => {
        if (currentOrganizationId) {
            loadDepartments(currentOrganizationId);
        }
    }, [currentOrganizationId]);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [facultyFilter, setFacultyFilter] = useState("all");

    // Edit Modal State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

    // Filter Logic
    const filteredDepartments = departments.filter(d => {
        const matchesSearch =
            d.name.toLowerCase().includes(search.toLowerCase()) ||
            d.code.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
        const matchesFaculty = facultyFilter === 'all' || d.facultyId === facultyFilter;

        return matchesSearch && matchesStatus && matchesFaculty;
    });

    // Stats
    const total = departments.length;
    const active = departments.filter(s => s.status === 'ACTIVE').length;
    const inactive = departments.filter(s => s.status === 'INACTIVE').length;
    const archived = departments.filter(s => s.status === 'ARCHIVED').length;

    const handleEdit = (department: Department) => {
        setSelectedDepartment(department);
        setEditModalOpen(true);
    };

    const handleSaveUpdate = async (id: string, updates: Partial<Department>) => {
        if (!currentOrganizationId) return;
        try {
            const { departmentsRepo } = await import("@/lib/data/departments.repo");
            const dept = departments.find(d => d.id === id);
            if (!dept) return;
            await departmentsRepo.update(currentOrganizationId, dept.id, updates);
            setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
        } catch (error) {
            console.error(error);
            alert("Ошибка при обновлении кафедры");
        }
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
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 space-y-4">
                            <div className="h-8 w-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                            <p className="text-sm font-medium">Загрузка...</p>
                        </div>
                    )}
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
